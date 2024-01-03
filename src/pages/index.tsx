import Head from "next/head";
import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { RouterOutputs, api } from "~/utils/api";
import LoadingSpinner from "~/components/Loading";
import { useState } from "react";
import toast from "react-hot-toast";
import PostView from "~/components/PostView";
import Layout from "~/components/Layout";
type PostWithUser = RouterOutputs["post"]["getAll"][number];

const CreatePostWizard = () => {
  const { user } = useUser();

  //update tRPC cache after update
  const ctx = api.useUtils();

  const { mutate, isLoading: isposting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later");
      }
    },
  });
  if (!user) return null;

  const [input, setInput] = useState<string>("");

  return (
    <div className="flex items-center gap-3">
      <Image
        src={user.imageUrl}
        alt="user image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        type="text"
        placeholder="Type some post text"
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isposting}
      />
      {input !== "" && (
        <button
          onClick={() => mutate({ content: input })}
          className="h-7 w-11 border-2 border-white"
          disabled={isposting}
          //allow enter with keyboard
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input !== "") {
                mutate({ content: input });
              }
            }
          }}
        >
          Post
        </button>
      )}
      {isposting && <LoadingSpinner size={20} />}
    </div>
  );
};

export default function Home() {
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const { data, isLoading: postloading } = api.post.getAll.useQuery();
  const { user, isLoaded: userloaded, isSignedIn } = useUser();

  if (!userloaded) return <div></div>;
  if (postloading)
    return (
      <div className="flex h-screen items-center justify-center ">
        <LoadingSpinner size={100} />
      </div>
    );
  if (!data) return <div>Something went wrong</div>;
  return (
    <>
      <Head>
        <title>T3 Stack App</title>
        <meta name="description" content="t3-app" />
      </Head>
      <Layout>
        <div className="flex border border-b border-slate-400 p-4">
          {!isSignedIn && (
            <SignInButton />
            // <SignIn path="/" routing="path" signUpUrl="/sign-up" />
          )}
          {!!isSignedIn && <CreatePostWizard />}
        </div>
        <div>
          {data?.map(({ post, author }: PostWithUser) => {
            return <PostView post={post} author={author} key={post.id} />;
          })}
        </div>
      </Layout>
    </>
  );
}
