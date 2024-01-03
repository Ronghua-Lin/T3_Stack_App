import React from "react";
import Image from "next/image";
import { RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profilePicture}
        alt={`@${author.username}'s profile pic`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <Link href={`/@${author.username}`}>{author.username}</Link>

          <span className="font-thin">{` · ${dayjs(
            post.createdAt,
          ).fromNow()}`}</span>
        </div>
        <Link href={`/post/${post.id}`}>
          <span>{post.content}</span>
        </Link>
      </div>
    </div>
  );
};

export default PostView;
