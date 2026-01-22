import PostModal from "./PostModal";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface CreateThreads {
	token: string;
	isOnThreadCreate: (newThread: any) => void;
	profile?: string;
}

export interface CreateThreadReference {
	openModal: () => void;
}

export default function CreateThread({
	token,
	isOnThreadCreate,
	profile,
}: CreateThreads) {
	const [content, setContent] = useState("");
	const [openModalProps, setOpenModalProps] = useState(false);
	const [images, setImages] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	// Inisialisasi WebSocket
	useEffect(() => {
		const ws = new WebSocket("ws://localhost:9000/ws");

		ws.onopen = () => {
			console.log("WebSocket connected");
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log("WebSocket message received:", data);
		};

		setSocket(ws);

		return () => {
			ws.close();
		};
	}, []); // Dependency array kosong agar running sekali saat mount

	const handleChangeImages = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setImages(file);
			setPreview(URL.createObjectURL(file)); // simpan di state terpisah
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!content.trim() && !images) return;

		setLoading(true);
		try {
			const form = new FormData();
			form.append("content", content);

			// Perbaikan: Append image jika ada
			if (images) {
				form.append("image", images);
			}

			if (profile) form.append("profile", profile);

			const res = await fetch("http://localhost:9000/api/v1/threads", {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: form,
			});

			const data = await res.json();

			if (res.ok) {
				isOnThreadCreate(data.data);
				setContent("");
				setImages(null);
				setOpenModalProps(false);

				// Emit WebSocket event jika koneksi terbuka
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(
						JSON.stringify({
							type: "new_thread",
							payload: data.data,
						}),
					);
				}
			}
		} catch (error) {
			console.error("Error submitting thread:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<PostModal open={openModalProps} isClose={() => setOpenModalProps(false)}>
				<form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 w-100">
					<div className="flex gap-2 mt-3">
						<img
							src={
								profile ||
								"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
							}
							className="w-10 h-10 rounded-full object-cover"
							alt="Profile"
						/>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="what's happening?"
							className="bg-transparent text-white text-lg outline-none resize-none placeholder-zinc-300 w-full"
							autoFocus
						/>

						{/* preview */}
						{images && (
							<div className="relative mt-2">
								<button
									onClick={() => setImages(null)}
									className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black"
								>
									✕
								</button>
								<img
									src={preview}
									alt="preview"
									className="w-full max-h-60 object-cover rounded-lg"
								/>
							</div>
						)}
					</div>

					<div className="flex items-center pt-3 justify-between mt-3 border-t">
						<label className="cursor-pointer hover:bg-blue-400 transition p-2 rounded-full">
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
								onChange={handleChangeImages}
							/>
						</label>
						<button
							type="submit"
							disabled={loading || (!content.trim() && !images)}
							className={`font-semibold rounded-full px-4 py-2 transition ${
								loading || (!content.trim() && !images)
									? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
									: "bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
							}`}
						>
							{loading ? "Posting..." : "Post"}
						</button>
					</div>
				</form>
			</PostModal>

			{/* Tampilan pemicu modal */}
			<div className="flex-1 flex flex-col p-4 border-b border-zinc-800">
				<div className="flex items-start gap-2">
					<textarea
						placeholder="What is happening?"
						className="flex-1 bg-transparent placeholder-gray-500 border-none outline-none resize-none min-h-[60px] cursor-pointer"
						readOnly
						onClick={() => setOpenModalProps(true)}
					/>
					<div className="flex items-center gap-2">
						<div className="bg-blue-500 opacity-50 text-white font-bold px-5 py-2 rounded-full cursor-not-allowed">
							Post
						</div>
					</div>
				</div>
				<img
					src={
						profile ||
						"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
					}
					className="w-10 h-10 rounded-full object-cover mt-2"
					alt="Profile thumbnail"
				/>
			</div>
		</>
	);
}
