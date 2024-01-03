import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUserName: publicProcedure
    // .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {


      if (!ctx.userId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      const [user] = await clerkClient.users.getUserList({
        userId:[ctx.userId]
      });


      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
     
      return filterUserForClient(user);
    }),

 
});
