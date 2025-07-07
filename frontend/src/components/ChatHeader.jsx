import { MessageCircleX, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from "react-hot-toast";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChat, sendMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const { onlineUsers } = useAuthStore();
  const [open, setOpen] = useState(false);
  
  const { join } = useCallStore();

  const handleClearChat = async () => {
    try {
      await clearChat(selectedUser._id, authUser._id);
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
    finally {
      setOpen(false);
    }
  }

  const handleVideoCall = async() => {
    const callId = uuidv4();
    const callUrl = `${window.location.origin}/call/${callId}`;
     // Send video call link as a message
      await sendMessage({
        text: `📹 Video Call Invitation from ${authUser.fullName}:- ${callUrl}`,
        image: null,
        audio: null,
      });
     join(callId);
      toast.success("Video call created! Link sent to chat.");
  };

  return (
    <div className=" p-2.5  border-b border-base-300 fixed w-full top-2 z-40 backdrop-blur-3xl md:w-auto md:relative md:top-0 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex flex-row gap-8 lg:gap-18 items-center">

          <button onClick={handleVideoCall} className="tooltip tooltip-left hover:cursor-pointer" data-tip="Video call" type="button">
            <Video />
          </button>

          <button className="tooltip tooltip-left hover:cursor-pointer" data-tip="Clear chat" type="button">
            <MessageCircleX onClick={() => setOpen(true)} />
          </button>
          {open && (
            <div className="fixed top-32 right-3 md:left-0 flex items-center justify-center  backdrop-blur-sm z-5">
              <div className="bg-base-200 rounded-2xl shadow-3xl p-6 space-y-4 max-w-sm text-center animate-fade-in">
                <h4 className="text-lg font-semibold">Clear chat?</h4>
                <p className="text-sm text-base-content/70">
                  Are you sure you want to clear the chat?
                </p>
                <p className="text-sm text-base-content/70">
                  This action cannot be undone. Data will be deleted permanently.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    className="btn btn-active btn-primary px-6"
                    onClick={handleClearChat}
                  >
                    Yes
                  </button>
                  <button
                    className="btn btn-secondary px-6"
                    onClick={() => setOpen(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setSelectedUser(null)}>
            <X className="hover:cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
