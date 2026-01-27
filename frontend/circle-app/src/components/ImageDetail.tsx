interface ImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export default function ImagePopup({ isOpen, onClose, imageUrl }: ImagePopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]" onClick={onClose}>
      <button
        className="absolute top-4 right-4 border text-white bg-black/50 w-8 h-8 rounded-full flex items-center justify-center text-xl cursor-pointer hover:bg-black/70 transition"
        onClick={onClose}
      >
        ✕
      </button>
  <img
    src={imageUrl}
    alt="Full size"
    className="max-w-[90vw] max-h-[90vh] object-contain"
    onClick={(e) => e.stopPropagation()}
  />
    </div>
  );
}