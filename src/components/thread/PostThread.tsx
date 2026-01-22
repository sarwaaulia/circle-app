import PostModal from "./PostModal";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface CreadThreads {
	token: string;
	isOnThreadCreate: (newThread: any) => void;
	profile?: string;
}

export default function CreateThread({
	token,
	isOnThreadCreate,
	profile,
}: CreadThreads) {
	const [content, setContent] = useState("");
	const [openModalProps, setOpenModalProps] = useState(false);
	const [images, setImages] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	const handleChangeImages = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setImages(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		const form = new FormData();
		form.append("content", content);
		if (profile) form.append("profile", profile);

		const res = await fetch("http://localhost:9000/api/v1/threads", {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: form,
		});

		const data = await res.json();
		if (res.ok) {
			(isOnThreadCreate(data.data), setContent(""));
			setImages(null);
			setOpenModalProps(false);
		}
	};

	return (
		<>
			<PostModal open={openModalProps} isClose={() => setOpenModalProps(false)}>
				<form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 ">
					<div className="flex gap-2">
						<img
							src={
								profile ||
								"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
							}
							className="w-10 h-10 reounded-full objec-cover"
							alt=""
						/>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="what's happening?"
							className="flex-1 bg-transparent text-blue-950 text-lg outline-none resize-none  placeholder-blue-950"
							autoFocus
						/>
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
							disabled={loading || !content.trim()}
							className="bg-blue-600 font-semibold text-white rounded-full cursor-pointer hover:bg-blue-500 px-4 py-2"
						>
							{loading ? "posting..." : "post"}
						</button>
					</div>
				</form>
			</PostModal>

			<div className="flex-1 flex flex-col">
				<div className="flex items-start gap-2">
					<textarea
						placeholder="What is happening?!"
						className="flex-1 bg-transparent placeholder-gray-500 border-none outline-none resize-none min-h-[60px]"
						readOnly
						onClick={() => setOpenModalProps(true)} // >>> buka modal
					/>
					<div className="flex items-center gap-2 pointer-events-none">
						<label className="p-2 rounded-full">
							
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="30"
								height="25"
								fill="none"
								stroke="#0857C7"
								strokeWidth="2"
							>
								<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
								<circle cx="9" cy="9" r="2" />
								<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
							</svg>
						</label>

						<label className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-full">
							Post
						</label>
					</div>
				</div>
				<img
					src={
						profile ||
						"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
					}
					className="w-10 h-10 reounded-full objec-cover"
					alt=""
				/>
			</div>
		</>
	);
}
