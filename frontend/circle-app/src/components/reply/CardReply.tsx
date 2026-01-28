import { Heart } from "lucide-react";
import type { Reply } from "@/types/Reply";
import { toggleReplyLike } from "@/stores/replySlice";
import { useDispatch } from "react-redux";

interface ThreadUser {
	id: number;
	full_name?: string;
	username?: string;
	photo_profile?: string;
}

export default function ReplyCard({
	reply,
	threadUser,
}: {
	reply: Reply;
	threadUser: ThreadUser;
}) {
	const dispatch = useDispatch<any>();
	const handleLike = (e: React.MouseEvent) => {
		// agar ketika user klik like, form nya tidak ke trigger
		e.stopPropagation();

		dispatch(
			toggleReplyLike({
				replyId: Number(reply.id),
				currentIsLiked: !!reply.isLiked,
			}),
		);
	};
	return (
		<div className="flex gap-4 p-4 border-b border-gray-800">
			<div className="flex-shrink-0">
				<img
					src={
						reply.user?.photo_profile
							? `http://localhost:9002/uploads/${reply.user?.photo_profile}`
							: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
					}
					className="w-10 h-10 rounded-full object-cover"
					alt="profile"
				/>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="font-semibold text-white">
						{reply.user?.full_name}
					</span>
					<span className="text-xs text-gray-400">@{reply.user?.username}</span>
					<span className="text-xs text-gray-500">
						• {new Date(reply.created_at).toLocaleDateString()}
					</span>
				</div>

				<p className="text-sm text-white leading-relaxed mb-3">
					{reply.content}
				</p>

				{reply.image && (
					<img
						src={`http://localhost:9002/uploads/${reply.image}`}
						className="rounded-xl mt-2 mb-3 max-h-96 w-full object-cover"
					/>
				)}

				<div className="flex gap-6 text-gray-400">
					<div
						onClick={handleLike}
						className="flex items-center gap-2 cursor-pointer transition hover:text-red-400"
					>
						<Heart
							size={18}
							fill={reply.isLiked ? "red" : "none"}
							strokeWidth={reply.isLiked ? 0 : 2}
						/>
						<span className={reply.isLiked ? "text-red-500" : ""}>
							{reply.likesCount}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
