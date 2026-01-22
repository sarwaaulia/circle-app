import type React from "react";

export interface ModalProps {
	children: React.ReactNode;
	open: boolean;
	isClose: () => void;
}

export default function PostModal({ children, open, isClose }: ModalProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-20">
			<div className="max-w-lg relative bg-zinc-800 rounded-xl">
				<button
					onClick={isClose}
					className="top-3 right-6 absolute flex items-center justify-center rounded-full cursor-pointer text-zinc-200 transition w-7 h-7 hover:bg-zinc-700"
				>
					X
				</button>
				<div onClick={(e) => e.stopPropagation()}>{children}</div>
			</div>
		</div>
	);
}
