import { useState, useImperativeHandle, forwardRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PostModal from "./PostModal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

interface CreateThreadProps {
	token: string;
	isOnThreadCreate: (newThread: any) => void;
	photo_profile?: string;
	showBottom?: boolean;
}

// Interface untuk mengekspos fungsi ke parent
export interface CreateThreadRef {
	openModal: () => void;
}

const CreateThread = forwardRef<CreateThreadRef, CreateThreadProps>(
	({ token, isOnThreadCreate, photo_profile, showBottom = true }, ref) => {
		// state Management
		const [content, setContent] = useState("");
		const [image, setImage] = useState<File[]>([]);
		const [previews, setPreviews] = useState<string[]>([]);
		const [loading, setLoading] = useState(false);
		const [openModal, setOpenModal] = useState(false);
		const currentUser = useSelector((state: any) => state.user.currentUser);

		const resetForm = () => {
			(setContent(""), previews.forEach((url) => URL.revokeObjectURL(url)));
			setImage([]);
			setPreviews([]);
			setOpenModal(false);
		};

		// 1. Ekspos fungsi openModal ke komponen Parent
		useImperativeHandle(ref, () => ({
			openModal: () => setOpenModal(true),
		}));

		// select image and preview
		const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				const selectedFiles = Array.from(e.target.files);
				setImage((prev) => [...prev, ...selectedFiles]);

				const newPreviews = selectedFiles.map((file) =>
					URL.createObjectURL(file),
				);
				setPreviews((prev) => [...prev, ...newPreviews]);
			}
		};

		const removeImg = (index: number) => {
			URL.revokeObjectURL(previews[index]);
			setImage(image.filter((_, i) => i !== index));
			setPreviews(previews.filter((_, i) => i !== index));
		};

		// sub
		const handleSubmit = async (e: FormEvent) => {
			e.preventDefault();
			if (!content.trim() && !image) return;

			setLoading(true);
			const form = new FormData();

			form.append("content", content);

			image.forEach((file) => {
				form.append("images", file);
			});

			try {
				const res = await fetch("http://localhost:9002/api/v1/threads", {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: form,
				});

				const result = await res.json();

				if (res.ok) {
					// toast notif
					toast.success("Thread posted successfully!");

					if (isOnThreadCreate) {
						isOnThreadCreate(result.data);
					}
					// Reset Form
					setContent("");
					setImage([]);
					setPreviews([]);
					setOpenModal(false); //close modal after submit
				}
			} catch (error) {
				console.error("Gagal mengirim postingan:", error);
				toast.error("failed to post thread.");
			} finally {
				setLoading(false);
			}
		};

		return (
			<>
				{/* MODAL FORM */}
				<PostModal open={openModal} isClose={resetForm}>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4 p-4 min-w-[450px]"
					>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="w-full bg-transparent text-white outline-none"
							placeholder="What's happening?"
						/>

						{/* Tampilan Grid Preview */}
						<div className="grid grid-cols-2 gap-2 mt-4">
							{previews.map((url, index) => (
								<div key={index} className="relative group">
									<img
										src={url}
										className="rounded-lg h-32 w-full object-cover border border-gray-700"
									/>
									<button
										type="button"
										onClick={() => removeImg(index)}
										className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
									>
										✕
									</button>
								</div>
							))}
						</div>

						 <div className="flex items-center justify-between border-t pt-3">

                            <label className="cursor-pointer hover:bg-blue-50 p-2 rounded-full transition">

                                <svg

                                    xmlns="http://www.w3.org/2000/svg"

                                    width="22"

                                    height="22"

                                    viewBox="0 0 24 24"

                                    fill="none"

                                    stroke="#0857C7"

                                    strokeWidth="2"

                                    strokeLinecap="round"

                                    strokeLinejoin="round"

                                >

                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />

                                    <circle cx="9" cy="9" r="2" />

                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />

                                </svg>

                                <input

                                    type="file"

                                    className="hidden"

                                    accept="image/*"

                                    onChange={handleChangeImage}

                                />

                            </label>
							<button
								disabled={loading}
								className="bg-blue-600 px-6 py-1.5 rounded-full text-white font-bold"
							>
								{loading ? "..." : "Post"}
							</button>
						</div>
					</form>
				</PostModal>

				{/* TRIGGER DISPLAY (Tampilan di Feed) */}
				{showBottom && (
					<div
						className="border-b p-4 flex gap-3 cursor-pointer"
						onClick={() => setOpenModal(true)}
					>
						<img
							src={
								currentUser?.photo_profile
									? `http://localhost:9002/uploads/${currentUser.photo_profile}`
									: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
							}
							className="w-10 h-10 rounded-full object-cover"
							alt="Avatar"
						/>
						<div className="flex-1 text-gray-500 text-lg py-2">
							What is happening?
						</div>
						<button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold opacity-80">
							Post
						</button>
					</div>
				)}
			</>
		);
	},
);

CreateThread.displayName = "CreateThread";
export default CreateThread;
