import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThreadList from "../components/thread/ThreadList";
import ThreadCard from "@/components/thread/ThreadCard";
import { useSelector } from "react-redux";
import CreateThread from "@/components/thread/PostThread";

export default function HomePage() {
  const context = useContext(AuthContext);
  if (!context) return null;

  const { token } = context;
  const currentUser = useSelector((state: any) => state.user.currentUser)
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchThreads();
  }, [token]);

  async function fetchThreads() {
    try {
      const response = await fetch("http://localhost:9000/api/v1/threads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setThreads(data.data);
      } else {
        setError(data.message || "Failed to fetch threads");
      }
    } catch {
      setError("An error occurred while fetching threads");
    } finally {
      setLoading(false);
    }
  }

  const handleCreatedThread = (newThread: any) => {
    const threadNew = {
      ...newThread,
      likesCount: 0,
      isLiked: false,
      full_name: newThread.user?.full_name || 'Anonymous',
      username: newThread.user?.username || 'user',
      profilePic: newThread.user?.photo_profile || null
    }
    setThreads(prev => [threadNew, ...prev])
  }

  // LIKE / UNLIKE
const toggleLike = async (threadId: number, isLiked: boolean) => {
  try {
    // cari thread yang mau di like/unlike
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    // method untuk likesnya
    const method = isLiked ? "DELETE" : "POST";

    // kirim req ke server
    await fetch(`http://localhost:9000/api/v1/${threadId}/like`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // update state lokal => langsung nambah/kurang 1 likesnya 
    setThreads(prev =>
      prev.map(t =>
        t.id === threadId
          ? {
              ...t,
              isLiked: !t.isLiked,
              likesCount: t.isLiked
                ? (t.likesCount || 1) - 1
                : (t.likesCount || 0) + 1,
            }
          : t
      )
    );
  } catch (error) {
    console.log("Error toggling like:", error);
  }
};

  // Jika belum login
  if (!token) {
    return (
      <div>
        <p className="font-semibold capitalize mb-5">log in first to access more threads</p>
        <Link to="/login"><button>Login</button></Link>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-64 mr-80 border-l border-r border-neutral-800 min-h-screen">

      {/* Header */}
      <header className="px-4 py-4 border-b border-neutral-800 sticky top-0 bg-zinc-850 backdrop-blur-md z-10">
        <h2 className="font-bold text-lg text-white">Home</h2>
      </header>

      <CreateThread
        token={token!}
        profile={currentUser?.photo_profile ? `http://localhost:9000/uploads/${currentUser.photo_profile}` : undefined}
        isOnThreadCreate={handleCreatedThread}
      />

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      ) : error ? (
        <div className="text-center text-red-400 py-10">Error: {error}</div>
      ) : threads.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No threads available.</p>
      ) : (
        // kirim toggleLike ke ThreadList
        <ThreadList threads={threads} toggleLike={toggleLike} />
      )}
    </div>
  );
}