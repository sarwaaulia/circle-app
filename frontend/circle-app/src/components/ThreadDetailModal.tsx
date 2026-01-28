import { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleReplyLike, addReply } from "@/stores/replySlice";
import { fetchThreadReply } from "@/stores/replySlice";
import ReplyCard from "@/components/reply/CardReply";
import UserProfileHeader from "./UserProfileHeader";
import AppDispatch from "@/stores/replySlice";

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
	created_at: string;
	images?: string[];
	likesCount?: number;
	repliesCount?: number;
	isLiked?: boolean;
}

interface ThreadDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	thread: Thread | null;
	profileUser: UserProfile | null;
	token: string;
	currentUser: any;
	onToggleImagePopup: () => void;
	onToggleLike: (threadId: number, hasLiked: boolean) => Promise<void>;
}

export default function ThreadDetailModal({
	isOpen,
	onClose,
	thread,
	profileUser,
	token,
	currentUser,
	onToggleImagePopup,
	onToggleLike,
}: ThreadDetailModalProps) {
	const dispatch = useDispatch<any>();
	const { replies } = useSelector((state: any) => state.replies);
	const [replyContent, setReplyContent] = useState("");
	const [replySubmitting, setReplySubmitting] = useState(false);

	const BASE_URL = "http://localhost:9002/uploads/";

	useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen])

	if (!isOpen || !thread || !profileUser) return null;

	const handleToggleThreadLike = async (
		threadId: number,
		hasLiked: boolean,
	) => {
		console.log("Toggling like for thread:", threadId, "hasLiked:", hasLiked);

		try {
			await onToggleLike(threadId, hasLiked);
		} catch (error) {
			console.error("Error toggling thread like:", error);
		}
	};

	const handleToggleReplyLike = async (replyId: number) => {
		try {
			const currentReply = replies.find((r: any) => r.id === replyId);

			if (currentReply && thread) {
				await dispatch(
					toggleReplyLike({
						replyId: replyId,
						currentIsLiked:
							currentReply.isLiked || currentReply.is_liked || false,
					}),
				);

				if (currentUser) {
					const newLiked = !currentReply.is_liked;
					// metrigger global reply update jika ada
					if ((window as any).replyLikeUpdateCallback) {
						(window as any).replyLikeUpdateCallback({
							replyId,
							userId: currentUser.id,
							liked: newLiked,
							likesCount: currentReply.likes_count
								? currentReply.likes_count + (newLiked ? 1 : -1)
								: 1,
						});
					}
				}

				// 3. JANGAN gunakan .toString(), kirim number asli
				dispatch(fetchThreadReply(thread.id));
			}
		} catch (error) {
			console.error("Error toggling reply like:", error);
		}
	};

	const handleReplySubmit = async (content: string, image?: File) => {
		if (!content.trim() && !image) return;

		setReplySubmitting(true);
		try {
			const formData = new FormData();
			formData.append("content", content);
			if (image) formData.append("image", image);

			const response = await fetch(
				`http://localhost:9002/api/replies/${thread.id}`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				},
			);

			if (response.ok) {
				const data = await response.json();
				dispatch(addReply(data.data));
				setReplyContent("");
				dispatch(fetchThreadReply(thread.id));
			}
		} catch (error) {
			console.error("Error submitting reply:", error);
		} finally {
			setReplySubmitting(false);
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
			onClick={onClose}
		>
			<div
				className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex shadow-2xl relative"
				onClick={(e) => e.stopPropagation()}
			>
				{/* CLOSE BUTTON */}
				<button
					className="absolute right-4 top-4 z-20 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
					onClick={onClose}
				>
					✕
				</button>

				{/* LEFT SIDE — IMAGE */}
				<div className="hidden md:flex md:w-3/5 bg-neutral-950 items-center justify-center border-r">
                    <img
                        src={`${BASE_URL}${thread.images?.[0]}`}
                        alt="Thread"
                        className="max-w-full max-h-full object-contain cursor-zoom-in"
                        onClick={onToggleImagePopup}
                    />
                </div>

				{/* RIGHT SIDE — DETAILS + COMMENTS */}
				<div className="w-full md:w-2/5 flex flex-col h-full bg-white text-slate-900">
                    {/* HEADER */}
                    <div className="p-4 border-b flex items-center gap-3">
                        <img
                            src={profileUser.photo_profile ? `${BASE_URL}${profileUser.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-100"
                            alt={profileUser.username}
                        />
                        <div>
                            <p className="font-bold text-sm leading-tight">{profileUser.full_name}</p>
                            <p className="text-xs text-gray-500">@{profileUser.username}</p>
                        </div>
                    </div>

                    {/* SCROLLABLE AREA */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Konten Utama Thread */}
                        <div className="p-4 border-b bg-slate-50/50">
                            <p className="text-[15px] leading-normal mb-3 whitespace-pre-wrap">
                                {thread.content}
                            </p>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                {new Date(thread.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(thread.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* List Komentar */}
                        <div className="divide-y divide-gray-50">
                            {replies.length > 0 ? (
                                replies.map((reply: any) => (
                                    <ReplyCard
                                        key={reply.id}
                                        reply={reply}
                                        threadUser={{
                                            id: profileUser.id, // FIX: Gunakan profileUser.id, bukan thread.id
                                            full_name: profileUser.full_name,
                                            username: profileUser.username,
                                            photo_profile: profileUser.photo_profile || undefined,
                                        }}
                                        toggleLike={handleToggleReplyLike}
                                    />
                                ))
                            ) : (
                                <div className="p-10 text-center text-gray-400 text-sm italic">
                                    No replies yet. Be the first to reply!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FOOTER: ACTION & INPUT */}
                    <div className="p-4 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center gap-5 mb-4 px-1">
                            <button 
                                onClick={() => onToggleLike(thread.id, thread.isLiked || false)}
                                className={`flex items-center gap-1.5 transition ${thread.isLiked ? "text-rose-500" : "text-gray-500 hover:text-rose-500"}`}
                            >
                                <Heart size={20} className={thread.isLiked ? "fill-current" : ""} />
                                <span className="text-sm font-semibold">{thread.likesCount || 0}</span>
                            </button>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <MessageCircle size={20} />
                                <span className="text-sm font-semibold">{thread.repliesCount || 0}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 items-end">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Post your reply"
                                className="flex-1 bg-gray-100 focus:bg-white border-none focus:ring-2 focus:ring-blue-500 rounded-2xl px-4 py-2 text-sm outline-none resize-none min-h-[40px] max-h-[120px] transition-all"
                                rows={1}
                            />
                            <button
                                onClick={() => handleReplySubmit(replyContent)}
                                disabled={replySubmitting || !replyContent.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-5 py-2 rounded-full text-sm font-bold transition-all transform active:scale-95"
                            >
                                {replySubmitting ? "..." : "Reply"}
                            </button>
                        </div>
                    </div>	
				</div>
			</div>
		</div>
	);
}
