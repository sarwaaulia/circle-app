import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import ThreadList from "../components/thread/ThreadList";
import ThreadPost from "../components/thread/PostThread"
import { fetchThreads, toggleLike } from "../stores/threadSlice";
import { connect } from "../services/socket";

// Global callback for cross-page like synchronization
declare global {
  interface Window {
    likeUpdateCallback?: (data: { threadId: number; userId: number; liked: boolean; likesCount: number }) => void;
  }
}

export default function HomePage() {
  const context = useContext(AuthContext);
  if (!context) return null;

  const { token } = context;
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const { threads, loading, error } = useSelector((state: any) => state.threads);

  useEffect(() => {
    if (token) {
      dispatch(fetchThreads());
      connect(token); // Connect WebSocket for real-time updates
    }
  }, [token, dispatch]);

  // Global like update callback for cross-page synchronization
  useEffect(() => {
    const likeUpdateCallback = (data: { threadId: number; userId: number; liked: boolean; likesCount: number }) => {
      console.log("Homepage receiving like update:", data);

      // Find the existing thread to preserve its isLiked status if it's not the current user
      const existingThread = threads.find((t: any) => t.id === data.threadId);

      // Update the specific thread in our threads array
      dispatch({
        type: 'threads/updateThreadLikeStatus',
        payload: {
          id: data.threadId,
          likesCount: data.likesCount,
          // Update isLiked only for the user who triggered the action
          ...(data.userId === currentUser?.id ? { isLiked: data.liked } : { isLiked: existingThread?.isLiked ?? false })
        }
      });
    };

    // Set the global callback (other pages will trigger this)
    (window as any).likeUpdateCallback = likeUpdateCallback;

    // Clean up on unmount
    return () => {
      (window as any).likeUpdateCallback = undefined;
    };
  }, [currentUser?.id, dispatch]);

  const toggleLike = async (threadId: number, isLiked: boolean) => {
    // Find the current thread to get likesCount
    const thread = threads.find((t: any) => t.id === threadId);
    if (!thread) return;

    const currentLikesCount = thread.likesCount || 0;
    const newIsLiked = !isLiked;
    const newLikesCount = isLiked ? currentLikesCount - 1 : currentLikesCount + 1;

    // Optimistic update
    dispatch({
      type: 'threads/updateThreadLikeStatus',
      payload: {
        id: threadId,
        isLiked: newIsLiked,
        likesCount: newLikesCount
      }
    });

    try {
      await dispatch(toggleLike({ threadId, currentIsLiked: isLiked }));

      // Success - broadcast the update to other pages
      console.log("Homepage broadcasting like update:", { threadId, userId: currentUser?.id || 0, liked: newIsLiked, likesCount: newLikesCount });
      if ((window as any).likeUpdateCallback) {
        (window as any).likeUpdateCallback({ threadId, userId: currentUser?.id || 0, liked: newIsLiked, likesCount: newLikesCount });
      }
    } catch (error) {
      // Revert on error
      dispatch({
        type: 'threads/updateThreadLikeStatus',
        payload: {
          id: threadId,
          isLiked: isLiked,
          likesCount: currentLikesCount
        }
      });
      console.error('Failed to toggle like:', error);
    }
  };

  // Jika belum login
  if (!token) {
    return (
      <div>
        <p>Please log in to view threads.</p>
        <Link to="/login"><button>Login</button></Link>
      </div>
    );
  }

  return (
    <div className="border-l border-r border-neutral-800 min-h-screen w-full">

      {/* Header */}
      <header className="px-4 py-3 border-b border-neutral-800 sticky top-0 bg-blue-300/80 backdrop-blur">
        <h1 className="text-xl font-bold">Home</h1>
      </header>

      {/* ThreadPost */}
      <ThreadPost
        token={token!}
        userAvatar={currentUser?.photo_profile ? `http://localhost:3002/uploads/${currentUser.photo_profile}` : undefined}
        onThreadCreated={(newThread) => dispatch({ type: 'threads/addThread', payload: { ...newThread, likesCount: 0, isLiked: false } })}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
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