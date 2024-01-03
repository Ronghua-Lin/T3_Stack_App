import Head from "next/head";
import { api } from "~/utils/api";
import PostView from "~/components/PostView";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/Loading";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const SinglePostPage: NextPage= () => {
   const router = useRouter();

  // Get the dynamic parameter from the URL path
  const { id } = router.query;
  const psotId= String(id)
  const { data, isLoading } = api.post.getById.useQuery({
    id:psotId,
  });
  console.log("asdasd",data)
  if (isLoading) return <LoadingSpinner />;
  if (!data) return <div>User has not posted</div>;
  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <Layout>
        <PostView {...data} />
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

export default SinglePostPage;
