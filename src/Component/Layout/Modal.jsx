import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, cardClassName = "", titleSize = "text-lg", contentPadding = "p-4" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`relative bg-card rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#E5E7EB] ${cardClassName.trim() || "max-w-lg"}`}>
        <div className={`flex items-center justify-between border-b border-[#E5E7EB] ${contentPadding}`}>
          <h3 className={`font-semibold text-gray-900 ${titleSize}`}>{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={`overflow-y-auto flex-1 ${contentPadding}`}>{children}</div>
      </div>
    </div>
  );
}
