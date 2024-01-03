import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters
import type { Post } from "@prisma/client";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const addUserDataToPost = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "author not found!",
      });
    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

export const postRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("iddddddddddddddddd",input.id )
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
      });

      console.log("postsss",post)

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPost([post]))[0];
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
      // where:{authorId:""}
    });
    // const users = (
    //   await clerkClient.users.getUserList({
    //     userId: posts.map((post) => post.authorId),
    //     limit: 100,
    //   })
    // ).map(filterUserForClient);

    // return posts.map((post) => {
    //   const author = users.find((user) => user.id === post.authorId);
    //   if (!author || !author.username)
    //     throw new TRPCError({
    //       code: "INTERNAL_SERVER_ERROR",
    //       message: "author not found!",
    //     });
    //   return { post, author:{
    //     ...author,
    //     username:author.username
    //   } };
    // });
    return addUserDataToPost(posts);
  }),

  getPostByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: { createdAt: "desc" },
        })
        .then(addUserDataToPost),
    ),

  create: protectedProcedure
    .input(z.object({ content: z.string().min(1).max(280) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;

      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // return ctx.db.post.create({
      //   data: {
      //     name: input.name,
      //     createdBy: { connect: { id: ctx.session.user.id } },
      //   },
      // });
    }),

  // getLatest: protectedProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
