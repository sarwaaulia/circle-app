import { useDispatch } from "react-redux";
import { fetchThreadReply } from "../../stores/replySlice";

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  header: string | null;
  bio: string | null;
}

interface Thread {
  id: number;
  content: string;
  createdAt: string;
  images?: string[];
  likesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
}

interface ProfileMediaProps {
  userThreads: Thread[];
  threadsLoading: boolean;
  isCurrentUser: boolean;
  currentUser: any;
  token: string;
  onOpenThreadModal: (thread: Thread) => void;
  BASE_URL: string;
}

export default function ProfileMedia({
  userThreads,
  threadsLoading,
  isCurrentUser,
  currentUser,
  token,
  onOpenThreadModal,
  BASE_URL
}: ProfileMediaProps) {
  const dispatch = useDispatch();

  const handleMediaClick = async (threadId: number) => {
    const thread = userThreads.find(t => t.id === threadId);
    if (!thread) return;

    let finalThread = thread;
    // For other users, fetch like status for this thread
    if (!isCurrentUser) {
      try {
        const likeStatusResponse = await fetch(`http://localhost:9000/api/v1/${thread.id}/like/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (likeStatusResponse.ok) {
          const { isLiked, likesCount } = await likeStatusResponse.json();
          finalThread = { ...thread, isLiked, likesCount };
        }
      } catch (error) {
        console.error(`Error fetching like status for thread ${thread.id}:`, error);
      }
    }
    onOpenThreadModal(finalThread);
    dispatch(fetchThreadReply(threadId.toString()));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-950 mb-4">Media</h3>
      {threadsLoading ? (
        <div className="text-center py-8">
          <div className="text-blue-950">Loading media...</div>
        </div>
      ) : (() => {
        // Extract all images from user's threads
        const allImages = userThreads
          .filter(thread => thread.images && thread.images.length > 0)
          .flatMap(thread => thread.images!.map(image => ({
            image,
            threadId: thread.id,
            createdAt: thread.createdAt
          })));

        return allImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {allImages.map((item, index) => (
              <div key={`${item.threadId}-${index}`} className="aspect-square">
                <img
                  src={`${BASE_URL}${item.image}`}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleMediaClick(item.threadId)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {isCurrentUser ? "You haven't shared any media yet." : "This user hasn't shared any media yet."}
            </div>
          </div>
        );
      })()}
    </div>
  );
}