interface ImagePopupProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
}

export default function ImagePopup({
	isOpen,
	onClose,
	imageUrl,
}: ImagePopupProps) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
			onClick={onClose}
		>
			<button
				className="absolute top-5 left-5 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[10000] cursor-pointer"
				onClick={onClose}
				aria-label="Close"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
			<div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
				<img
					src={imageUrl}
					alt="Full size preview"
					className="max-w-full max-h-full object-contain select-none shadow-2xl rounded-sm"
					onClick={(e) => e.stopPropagation()} 
				/>
			</div>
		</div>
	);
}
