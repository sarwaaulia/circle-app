import ThreadCard from "./ThreadCard";
import type { Thread } from "./ThreadCard";

export default function ThreadList({
  threads,
  toggleLike
}: {
  threads: Thread[];
  toggleLike?: (threadId: number, hasLiked: boolean) => Promise<void>;
}) {
  return (
    <div className="">
      {threads.map(thread => (
        <ThreadCard key={thread.id ?? `${thread.createdAt}-${thread.content}`} thread={thread} toggleLike={toggleLike} />
      ))}
    </div>
  );
}