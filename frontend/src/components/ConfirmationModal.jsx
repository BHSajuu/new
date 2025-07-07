import toast from "react-hot-toast";

export default function ConfirmationModal({ isOpen, link, onClose, onJoin }) {
  if (!isOpen) return null;

  return (
    <div className=" fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-gray-800/30">
      <div className="bg-slate-600 rounded-lg shadow-lg p-6 space-y-4 max-w-sm relative">
        <h4 className="text-lg font-semibold">Join video call?</h4>
        <div className="flex justify-between gap-5">
          <button
            className="btn btn-outline text-green-300 hover:cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied!");
            }}
          >
            Copy link
          </button>
          <button className="btn btn-primary hover:cursor-pointer" onClick={onJoin}>
            Join call
          </button>
        </div>
        <button
          className="absolute top-2 right-2 text-black hover:cursor-pointer"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
