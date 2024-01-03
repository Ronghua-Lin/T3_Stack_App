"use client";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import PostView from "~/components/PostView";
import LoadingSpinner from "~/components/Loading";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingSpinner />;
  if (!data || data.length === 0) return <div>User has not posted</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage = () => {

  // const router = useRouter();

  // // Get the dynamic parameter from the URL path
  // const { dynamicParam } = router.query;

  const { data, isLoading: dataLoading } =
    api.profile.getUserByUserName.useQuery();

  if (dataLoading) return <LoadingSpinner />;
  if (!data) return <div>404</div>;
  return (
    <>
      <Head>
        <title>T3 Stack App</title>
      </Head>
      <Layout>
        <div className="relative min-h-36 border-b bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.username ?? ""}'s profile pic`}
            width={98}
            height={98}
            className="absolute bottom-4 left-[-10px] -mb-[64px] ml-4 rounded-full border-2 border-black bg-black"
          />
        </div>
        <div className="min-h-[35px]"></div>

        <div className="p-4 text-2xl font-bold">{data.username}</div>
        <div className="w-full border-b border-slate-400" >
          <ProfileFeed userId={data.id}/>
        </div>
      </Layout>
    </>
  );
};

// export const getStaticProps: GetStaticProps = async (context) => {
//   const ssg = generateSSGHelper();

//   const slug = context.params?.slug;

//   if (typeof slug !== "string") throw new Error("no slug");

//   const username = slug.replace("@", "");

//   await ssg.profile.getUserByUsername.prefetch({ username });

//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       username,
//     },
//   };
// };

// export const getStaticPaths = () => {
//   return { paths: [], fallback: "blocking" };
// };

export default ProfilePage;
