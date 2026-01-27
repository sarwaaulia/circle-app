import ThreadCard from "../thread/ThreadCard";
import { useSelector } from "react-redux";

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

interface ProfilePostsProps {
  userThreads: Thread[];
  threadsLoading: boolean;
  isCurrentUser: boolean;
  profileUser: UserProfile;
  onToggleLike: (threadId: number, hasLiked: boolean) => Promise<void>;
};

export default function ProfilePosts({
  userThreads,
  threadsLoading,
  isCurrentUser,
  profileUser,
  onToggleLike
}: ProfilePostsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-blue-950 mb-4">All Posts</h3>
      {threadsLoading ? (
        <div className="text-center py-8">
          <div className="text-blue-950">Loading posts...</div>
        </div>
      ) : userThreads && userThreads.length > 0 ? (
        <div>
          {userThreads.map(thread => {
            // Transform thread data to match ThreadCard interface
            const threadCardData = {
              id: thread.id,
              content: thread.content,
              image: thread.images?.[0] || undefined, // first image/default
              number_of_replies: thread.repliesCount || 0, // tamabh ke api
              createdAt: thread.createdAt,
              likesCount: thread.likesCount || 0, // tambah ke api
              isLiked: thread.isLiked || false,
              full_name: profileUser.full_name,
              username: profileUser.username,
              avatar: profileUser.photo_profile || undefined
            };

            return (
              <ThreadCard
                key={thread.id}
                thread={threadCardData}
                toggleLike={onToggleLike}
                from="profile"
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500">
            {isCurrentUser ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
          </div>
        </div>
      )}
    </div>
  );
}