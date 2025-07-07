import { useChatStore } from "../store/useChatStore";

import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  return (
    <div className="h-screen bg-base-200 ">
      <div className="flex items-center justify-center pt-20 md:px-12">
        <div className="bg-base-100 rounded-4xl shadow-cl w-full  md:max-w-8xl h-[calc(100vh-8rem)]">
          <div className="hidden md:flex  h-full rounded-4xl overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
          <div className="md:hidden h-full rounded-4xl overflow-hidden">
            {!selectedUser ? <Sidebar /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
