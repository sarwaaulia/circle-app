import { Heart } from "lucide-react";
import type { Reply } from "@/types/Reply";

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
	return (
		<div className="">
			<div>
				<img
					src={
						reply.user?.photo_profile
							? `http://localhost:9000/uploads/${reply.user?.photo_profile}`
							: "undefined"
					}
					className="h-8 w-8 rounded-full object-cover"
					alt="profile"
				/>
			</div>

			<div className="flex-1">
				<div className="flex items-center gap-2">
					<span className="font-semibold">{reply.user?.full_name}</span>
					<span className="text-sm text-white">@{reply.user?.username}</span>
					<span className="text-xs text-gray-500">
						• {new Date(reply.created_at).toLocaleDateString()}
					</span>
				</div>

				<p className="mt-1 text-white">{reply.content}</p>

				{reply.image && (
					<img
						src={`http://localhost:9000/uploads/${reply.image}`}
						className="rounded-xl mt-3 max-h-96 object-cover"
					/>
				)}

				<div className="flex gap-6 mt-3 text-gray-400">
					<div
						className={`flex items-center gap-2 cursor-pointer transition hover:text-red-400 ${
							reply.isLiked ? "text-red-500" : "text-gray-400"
						}`}
					>
						<Heart
							size={18}
							fill={reply.isLiked ? "red" : "none"}
							strokeWidth={reply.isLiked ? 0 : 2}
						/>
						<span>{reply.likesCount || 0}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
