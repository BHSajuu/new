import { useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useTranslationStore } from "../store/useTranslationStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Check, Pencil, Trash2, X, Languages } from "lucide-react";
import CustomAudioPlayer from "./CustomAudioPlayer";
import Linkify from "react-linkify";
import ConfirmationModal from "./ConfirmationModal";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    editMessageText,
    updateReceiverText, // New function to update receiver text
  } = useChatStore();
  const { authUser } = useAuthStore();
  
  // Translation store
  const { 
    translationEnabled, 
    preferredLanguage,
  } = useTranslationStore();
  
  const messageEndRef = useRef(null);

  const [hover, setHover] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState("");
  
  // Track which messages are being translated
  const [translatingMessages, setTranslatingMessages] = useState(new Set());

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-translate new incoming messages for receiver
  useEffect(() => {
    if (translationEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only translate messages from other users (not from current user) and only if it's a new message
      if (lastMessage.senderId !== authUser._id && 
          lastMessage.commonText && 
          !lastMessage.receiverText &&
          !translatingMessages.has(lastMessage._id)) {
        
        // Check if this is a new message (created within last 5 seconds)
        const messageTime = new Date(lastMessage.createdAt);
        const now = new Date();
        const timeDiff = (now - messageTime) / 1000; // difference in seconds
        
        if (timeDiff <= 5) { // Consider it a new message if created within 5 seconds
          handleTranslateForReceiver(lastMessage._id);
        }
      }
    }
  }, [messages, translationEnabled, authUser._id]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleEditMessage = async (messageId, text) => {
    try {
      await editMessageText(messageId, text);
      setEditingMessageId(null);
      setEditedText("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  // Handle translation for receiver (update receiverText in database)
  const handleTranslateForReceiver = async (messageId) => {
    if (translatingMessages.has(messageId)) return;
    
    setTranslatingMessages(prev => new Set([...prev, messageId]));
    
    try {
      await updateReceiverText(messageId, authUser._id);
      // Refresh messages to get updated receiverText
      await getMessages(selectedUser._id);
    } catch (error) {
      console.error("Failed to translate message for receiver:", error);
    } finally {
      setTranslatingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const openJoinModal = (link) => {
    setCurrentLink(link);
    setModalOpen(true);
  };

  const handleJoin = () => {
    window.open(currentLink, "_blank");
    setModalOpen(false);
  };

  // Function to determine which text to display for a message
  const getDisplayText = (message) => {
    const isCurrentUserSender = message.senderId === authUser._id;
    
    if (isCurrentUserSender) {
      // Current user is the sender
      if (translationEnabled && message.senderText) {
        return message.senderText; // Display translated text in sender's preferred language
      }
      return message.commonText; // Display original text
    } else {
      // Current user is the receiver
      if (!translationEnabled) {
        return message.commonText; // Display original text if translation is off
      }
      
      if (message.receiverText) {
        return message.receiverText; // Display translated text in receiver's preferred language
      }
      
      // If translation is on but receiverText doesn't exist, show original text
      return message.commonText;
    }
  };

  // Function to check if translation indicator should be shown
  const shouldShowTranslationIndicator = (message) => {
    const isCurrentUserSender = message.senderId === authUser._id;
    
    if (isCurrentUserSender) {
      return translationEnabled && message.senderText && message.senderText !== message.commonText;
    } else {
      return translationEnabled && message.receiverText && message.receiverText !== message.commonText;
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
 
    // —— Dedupe here ——
  const uniqueMessages = messages.filter(
    (m, i, a) => a.findIndex(x => x._id === m._id) === i
  );


  return (
    <div className="flex-1 flex flex-col overflow-auto md:my-0">
      <ChatHeader />
      <div className="flex-1 overflow-y-scroll pt-8 pb-20 md:mb-0 px-4 md:p-4 space-y-4 md:relative">
        {uniqueMessages.map((message, idx) => (
          <div
            key={`${message._id}-${idx}`}
            onMouseEnter={() => setHover(message._id)}
            onMouseLeave={() => setHover(false)}
            className={`relative chat hover:cursor-pointer ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            {hover === message._id && (
              <div
                className={`absolute ${
                  message.senderId === authUser._id
                    ? "right-0 top-1"
                    : "left-0"
                } flex items-center`}
              >
                <div className="flex gap-2">
                  {/* Translation button - only show for old messages from other users that don't have receiverText */}
                  {message.senderId !== authUser._id && 
                   message.commonText && 
                   translationEnabled && 
                   !message.receiverText && (
                    <Languages
                      className={`w-5 h-5 cursor-pointer hover:scale-110 transition-transform text-blue-500 ${
                        translatingMessages.has(message._id) ? 'animate-spin' : ''
                      }`}
                      onClick={() => handleTranslateForReceiver(message._id)}
                      title="Translate message"
                    />
                  )}
                  
                  {message.senderId === authUser._id && (
                    <Pencil
                      className="w-5 h-5 text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        setEditingMessageId(message._id);
                        setEditedText(message.commonText); // Edit the original text
                      }}
                    />
                  )}
                  <Trash2
                    className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => handleDeleteMessage(message._id)}
                  />
                </div>
              </div>
            )}

            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble w-[220px] lg:w-auto flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="lg:w-auto sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.audio && (
                <div className="mt-2 mr-3 w-full max-w-[300px]">
                  <CustomAudioPlayer src={message.audio} />
                </div>
              )}

              {editingMessageId === message._id ? (
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="input input-bordered rounded-lg px-2 py-1 w-full"
                  />
                  <div className="flex gap-12">
                    <Check
                      onClick={() =>
                        handleEditMessage(message._id, editedText)
                      }
                      className="text-blue-500 hover:scale-120 transform-transition ease-in-out"
                    />
                    <X
                      onClick={() => {
                        setEditingMessageId(null);
                        setEditedText("");
                      }}
                      className="text-red-500 hover:scale-120 transform-transition ease-in-out"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {/* Display the appropriate text based on translation settings */}
                  <Linkify
                    componentDecorator={(href, text, key) => {
                      const isCallLink = href.includes("/call/");
                      return isCallLink ? (
                        <button
                          key={key}
                          className="text-blue-500 hover:cursor-pointer btn-link p-0 m-0 bg-transparent"
                          onClick={(e) => {
                            e.preventDefault();
                            openJoinModal(href);
                          }}
                        >
                          click to join
                        </button>
                      ) : (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:cursor-pointer"
                        >
                          {text}
                        </a>
                      );
                    }}
                  >
                    <p>
                      {getDisplayText(message)}
                    </p>
                  </Linkify>
                  
                  {/* Show translation indicator */}
                  {shouldShowTranslationIndicator(message) && (
                    <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      <Languages className="w-3 h-3" />
                      <span>
                        {message.senderId === authUser._id 
                          ? `Translated to ${preferredLanguage}`
                          : `Translated to ${preferredLanguage}`
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Show translation loading indicator */}
                  {translatingMessages.has(message._id) && (
                    <div className="text-xs opacity-60 mt-1 flex items-center gap-1">
                      <Languages className="w-3 h-3 animate-spin" />
                      <span>Translating...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />

      <ConfirmationModal
        isOpen={modalOpen}
        link={currentLink}
        onClose={() => setModalOpen(false)}
        onJoin={handleJoin}
      />
    </div>
  );
};

export default ChatContainer;