import { useSelector } from "react-redux";
import ReplyCard from "./CardReply";
import type { Reply } from "@/types/Reply";

interface ThreadUser {
  id: number;
  full_name?: string;
  username?: string;
  photo_profile?: string;
}

export default function ReplyList({ threadUser }: { threadUser: ThreadUser }) {
  
  const replies: Reply[] = useSelector(
    (state: any) => state.replies.replies
  );
  console.log("REPLIES FROM REDUX:", replies);

  if (!replies || replies.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        No reply yet. Be the first to reply!
      </div>
    );
  }

  return (
    <div className="w-full">
      {replies.map((reply) => (
        <ReplyCard key={reply.id} reply={reply} threadUser={threadUser} />
      ))}
    </div>
  );
}
