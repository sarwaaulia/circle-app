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
	from?: "home" | "profile";
}) {
	const navigate = useNavigate();
	if (!thread) return null;
	return (
		<div className="flex gap-4 p-4 border-b border-gray-800 hover:bg-gray-900 transition cursor-pointer">
			{/* Avatar */}
			<div className="flex-shrink-0">
				<img
					src={
						thread.photo_profile
							? `http://localhost:9002/uploads/${thread.photo_profile}`
							: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
					}
					className="w-10 h-10 rounded-full object-cover"
					onClick={(e) => {
						e.stopPropagation();
						thread.userId && navigate(`/profile/${thread.userId}`);
					}}
				/>
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span
						className="font-semibold text-white hover:text-blue-400 cursor-pointer truncate"
						onClick={(e) => {
							e.stopPropagation();
							thread.userId && navigate(`/profile/${thread.userId}`);
						}}
					>
						{thread.full_name}
					</span>
					<span
						className="text-xs text-gray-400 hover:text-blue-400 cursor-pointer truncate"
						onClick={(e) => {
							e.stopPropagation();
							thread.userId && navigate(`/profile/${thread.userId}`);
						}}
					>
						@{thread.username || "user"}
					</span>
					<span className="text-xs text-gray-500">
						• {new Date(thread.createdAt).toLocaleDateString()}
					</span>
				</div>

				<p className="text-sm text-white leading-relaxed mb-3">
					{thread.content}
				</p>

				{Array.isArray(thread.image) && thread.image.length > 0 && (
					<div
						className={`mt-2 mb-3 grid gap-2 ${thread.image.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
					>
						{thread.image.map((img, idx) => (
							<img
								key={idx}
								src={`http://localhost:9002/uploads/${img}`}
								className="rounded-xl max-h-60 w-full object-cover border border-gray-800"
								onError={(e) => (e.currentTarget.style.display = "none")}
							/>
						))}
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-6 text-gray-400">
					{/* Like Button */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							toggleLike?.(thread.id, thread.isLiked ?? false);
						}}
						className="flex items-center gap-2 cursor-pointer transition hover:text-red-400"
					>
						<Heart
							size={18}
							fill={thread.isLiked ? "red" : "none"}
							strokeWidth={thread.isLiked ? 0 : 2}
						/>
						<span className={thread.isLiked ? "text-red-500" : ""}>
							{thread.likesCount || 0}
						</span>
					</button>

					<button
						onClick={(e) => {
							e.stopPropagation();
							if (onReplyClick) {
								console.log("ThreadCard using custom onReplyClick");
								onReplyClick(thread.userId || 0);
							} else {
								console.log("ThreadCard navigating to thread:", thread.id);
								navigate(`/threads/${thread.id}`, { state: { from } });
							}
						}}
						className="flex items-center gap-2 cursor-pointer transition hover:text-blue-400"
					>
						<MessageCircle size={18} />
						<span>{thread.number_of_replies || 0}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
