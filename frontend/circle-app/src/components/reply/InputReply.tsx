import { useState } from "react";
import { Image, Send } from "lucide-react";
import { useSelector } from "react-redux";

interface ReplyInputProps {
	threadId: number;
	photo_profile?: string;
	onReplySubmit: (content: string, image?: File) => Promise<void>;
}

export default function ReplyInput({
	threadId,
	photo_profile,
	onReplySubmit,
}: ReplyInputProps) {
	const [content, setContent] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const currentUser = useSelector((state: any) => state.user.currentUser);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async () => {
		if (!content.trim() && !image) return;
		setIsSubmitting(true);
		
		try {
			await onReplySubmit(content, image || undefined);
			setContent("");
			setImage(null);
			setImagePreview(null);
		} catch (error) {
			console.error("Error submitting reply:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const removeImage = () => {
		setImage(null);
		setImagePreview(null);
	};

	console.log("Redux currentUser:", currentUser);
	console.log("photo_profile:", currentUser?.photo_profile);
	return (
		<div className="border-b border-blue-950 py-4 px-2 flex gap-4">
			<div>
				<img
					src={
						currentUser?.photo_profile
							? `http://localhost:9000/uploads/${currentUser?.photo_profile}`
							: "undefined"
					}
					className="h-8 w-8 rounded-full object-cover"
					alt="profile"
				/>
			</div>

			<div className="flex-1">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Type your reply!"
					className="w-full bg-transparent border-none outline-none resize-none text-white placeholder-gray-500"
					rows={3}
				/>

				{imagePreview && (
					<div className="relative mt-2 inline-block">
						<img
							src={imagePreview}
							alt="Preview"
							className="rounded-lg max-h-40 object-cover"
						/>
						<button
							onClick={removeImage}
							className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
						>
							×
						</button>
					</div>
				)}

				<div className="flex items-center gap-3 mt-3">
					<label className="cursor-pointer text-blue-500 hover:text-blue-600">
						<Image size={20} />
						<input
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="hidden"
						/>
					</label>

					<button
						onClick={handleSubmit}
						disabled={(!content.trim() && !image) || isSubmitting}
						className="ml-auto px-6 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{isSubmitting ? "Sending..." : "Reply"}
						<Send size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}
