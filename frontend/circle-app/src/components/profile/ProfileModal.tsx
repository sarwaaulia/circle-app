import ReactDOM from 'react-dom';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ProfileModal({ open, onClose, children }: ProfileModalProps) {
  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24">
      <div className="bg-blue-700 rounded-xl p-4 w-full max-w-lg relative">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center
             border rounded-full text-blue-950 hover:text-black
             transition cursor-pointer"
        >
          ✕
        </button>

        {children}

      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}