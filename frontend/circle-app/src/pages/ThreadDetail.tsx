import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchThreadReply,
	toggleReplyLike,
	addReply,
} from "../stores/replySlice";
import { toggleLike } from "../stores/threadSlice";
import ThreadCard from "../components/thread/ThreadCard";
import ReplyInput from "../components/reply/InputReply";
import ReplyList from "../components/reply/ListReplies";
import { ArrowLeft } from "lucide-react";

// Like update data interface
interface LikeUpdate {
	threadId: number;
	userId: number;
	liked: boolean;
	likesCount: number;
}

// Global callback for cross-page like synchronization
declare global {
	interface Window {
		likeUpdateCallback?: (data: LikeUpdate) => void;
	}
}

interface Thread {
	id: number;
	content: string;
	image?: string;
	number_of_replies?: number;
	createdAt: string;
	likesCount?: number;
	isLiked?: boolean;
	full_name?: string;
	username?: string;
	photo_profile?: string;
}

interface ThreadUser {
	id: number;
	full_name?: string;
	username?: string;
	photo_profile?: string;
}

export default function ThreadDetailPage() {
	const { threadId } = useParams<{ threadId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch<any>();

	const replyState = useSelector((state: any) => state.reply);
	const replies = replyState?.replies || [];
	const isRepliesLoading = replyState?.loading || false; // Bedakan namanya
	const replyError = replyState?.error || null;

	const currentUser = useSelector((state: any) => state.user.currentUser);

	const [thread, setThread] = useState<Thread | null>(null);
	const [threadLoading, setThreadLoading] = useState(true);
	const [userAva, setUserAva] = useState<string>("");

	useEffect(() => {
		if (threadId) {
			fetchThread();
			dispatch(fetchThreadReply(threadId));
		}
	}, [threadId, dispatch]);

	useEffect(() => {
		if (currentUser && currentUser.photo_profile) {
			setUserAva(`http://localhost:9000/uploads/${currentUser?.photo_profile}`);
		} else {
			setUserAva("https://ui-avatars.com/api/?name=" + currentUser?.username);
		}
	}, [currentUser]);

	// Set up callback for WebSocket like updates
	useEffect(() => {
		const likeUpdateCallback = (data: LikeUpdate) => {
			if (thread && thread.id === data.threadId) {
				setThread((prev) =>
					prev
						? {
								...prev,
								likesCount: data.likesCount,
								...(data.userId === currentUser?.id
									? { isLiked: data.liked }
									: {}),
							}
						: null,
				);
			}
		};

		// Set the global callback
		(window as any).likeUpdateCallback = likeUpdateCallback;

		// Clean up on unmount
		return () => {
			(window as any).likeUpdateCallback = undefined;
		};
	}, [thread, currentUser?.id]);

	const fetchThread = async () => {
		try {
			setThreadLoading(true);
			// Fetch thread detail
			const threadRes = await fetch(
				`http://localhost:9000/api/v1/${threadId}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				},
			);
			const threadData = await threadRes.json();
			setThread(threadData.data);
		} catch (error) {
			console.error("Error fetching thread:", error);
		} finally {
			setThreadLoading(false);
		}
	};

	const navigateToHome = () => {
		const from = location.state?.from || "home";
		console.log(`Navigating back to: ${from}`);
		navigate(from === "profile" ? "/profile" : "/");
	};

	const handleReplySubmit = async (content: string, image?: File) => {
		try {
			const formData = new FormData();
			formData.append("content", content);
			if (image) {
				formData.append("image", image);
			}

			const response = await fetch(
				`http://localhost:9000/api/v1/replies/${threadId}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: formData,
				},
			);

			if (response.ok) {
				const data = await response.json();
				// Add new reply to Redux store
				dispatch(addReply(data.data));

				// Optimistically update the thread's reply count
				setThread((prev) =>
					prev
						? {
								...prev,
								number_of_replies: (prev.number_of_replies || 0) + 1,
							}
						: null,
				);
			}
		} catch (error) {
			console.error("Error submitting reply:", error);
			throw error;
		}
	};

	const handleToggleThreadLike = async (threadId: number, isLiked: boolean) => {
		if (!thread) return;

		const newIsLiked = !isLiked;
		const newLikesCount = isLiked
			? (thread.likesCount || 0) - 1
			: (thread.likesCount || 0) + 1;

		// Optimistic update
		setThread({ ...thread, isLiked: newIsLiked, likesCount: newLikesCount });

		try {
			await dispatch(toggleLike({ threadId, currentIsLiked: isLiked }));

			// Success - broadcast the update to other pages
			console.log("Status page broadcasting like update:", {
				threadId,
				userId: currentUser?.id || 0,
				liked: newIsLiked,
				likesCount: newLikesCount,
			});
			if ((window as any).likeUpdateCallback) {
				(window as any).likeUpdateCallback({
					threadId,
					userId: currentUser?.id || 0,
					liked: newIsLiked,
					likesCount: newLikesCount,
				});
			}
		} catch (error) {
			// Revert
			setThread(thread);
			console.error("Error toggling thread like:", error);
		}
	};

	const handleToggleReplyLike = async (replyId: number, isLiked: boolean) => {
		try {
			// Dispatch Redux action to toggle like, which will also refetch replies
			await dispatch(toggleReplyLike({ replyId, currentIsLiked: isLiked }));
			// Refetch replies after toggle to get updated data
			if (threadId) {
				dispatch(fetchThreadReply(threadId));
			}
		} catch (error) {
			console.error("Error toggling reply like:", error);
		}
	};

	if (threadLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-gray-500">Loading...</div>
			</div>
		);
	}

	if (!thread) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-gray-500">Thread not found</div>
			</div>
		);
	}

	const threadUser: ThreadUser = {
		id: thread.id,
		full_name: thread.full_name,
		username: thread.username,
		photo_profile: thread.photo_profile,
	};

	return (
		<div className="h-screen border-x border-blue-850 max-w-3xl mx-auto overflow-y-auto">
			{/* Status / Thread Header */}
			<div
				className="border-b border-blue-950 py-4 px-4 font-semibold text-lg text-blue-800 flex items-center gap-2 cursor-pointer"
				onClick={navigateToHome}
			>
				<ArrowLeft size={20} />
				Thread Detail
			</div>

			{/* Thread utama */}
			<ThreadCard thread={thread} toggleLike={handleToggleThreadLike} />

			{/* Reply Input */}
			<ReplyInput
				threadId={parseInt(threadId || "0")}
				photo_profile={userAva}
				onReplySubmit={handleReplySubmit}
			/>

			{/* Reply List */}
			<ReplyList threadUser={thread.user} toggleLike={handleToggleReplyLike} />
		</div>
	);
}
