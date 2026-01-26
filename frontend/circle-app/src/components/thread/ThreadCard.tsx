import { Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Thread {
	id: number;
	content: string;
	image?: string;
	number_of_replies: number;
	createdAt: string;
	likesCount?: number;
	isLiked?: boolean;

  userId?: number;
	full_name?: string;
	username?: string;
	photo_profile?: string;
}

// komponen unutk thread percard
export default function ThreadCard({
  thread,
  toggleLike,
  onReplyClick,
  from = "home",
}: {
  thread: Thread;
  toggleLike?: (threadId: number, hasLiked: boolean) => Promise<void>;
  onReplyClick?: (threadId: number) => void;
  from?: "home";
}) {
const navigate = useNavigate();
if(!thread) return null;
  return (
    <div className="flex gap-4 p-4 border-b border-gray-800 hover:bg-gray-900 transition cursor-pointer">

      {/* Avatar */}
      <div>
        <img
          src={thread.photo_profile ? `http://localhost:9000/uploads/${thread.photo_profile}`
              : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
          className="w-10 h-10 rounded-full object-cover"
          onClick={() => thread.userId && navigate(`/profile/${thread.userId}`)}
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white hover:text-blue-800" 
          onClick={() => thread.id && navigate(`/profile/${thread.id}`)}>{thread.full_name || "Anonymous Sender"}</span>
          <span 
          className="text-xs text-white hover:text-blue-800"
          onClick={() => thread.id && navigate(`/profile/${thread.id}`)}>@{thread.username || "user"}</span>
          <span className="text-xs text-gray-500">• {new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>

        <p className="mt-1 text-sm text-white">{thread.content}</p>

        {thread.image && (
          <img
            src={`http://localhost:9000/uploads/${thread.image}`}
            className="rounded-xl mt-3 max-h-96 object-cover"
          />
        )}

        {/* Actions */}
        <div className="flex gap-6 mt-3 text-gray-400">

          {/* Like Button */}
          <div
             onClick={() => toggleLike?.(thread.id, thread.isLiked ?? false)}
             className={`
             flex items-center gap-2 cursor-pointer transition
            hover:text-red-400
             ${thread.isLiked ? "text-red-500" : "text-gray-400"}
             `}
>
    {/* conditional rendering untuk likes */}
          <Heart
            size={18}
            fill={thread.isLiked ? "red" : "none"}
            strokeWidth={thread.isLiked ? 0 : 2}
          />
          <span>{thread.likesCount || 0}</span>
        </div>

          <div 
          onClick={(e) => {
              e.stopPropagation();
              if (onReplyClick) {
                console.log("ThreadCard using custom onReplyClick");
                onReplyClick( thread.userId || 0);
              } else {
                console.log("ThreadCard navigating to thread:", thread.id);
                navigate(`/threads/${thread.id}`, { state: { from } });
              }
            }}
           >
            <MessageCircle size={18} /> {thread.number_of_replies || 0}
          </div>

        </div>
      </div>

    </div>
  );
}