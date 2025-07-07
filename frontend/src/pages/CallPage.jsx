import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  PaginatedGridLayout,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


function CallPage() {

  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { isLoading, authUser } = useAuthStore();

  const { callId: storedId, join, end } = useCallStore();


  const tokenProvider = async () => {
    try {
      const res = await axiosInstance.get("/video/token");
      console.log(res.data);
      const { token } = res.data;
      return token;
    } catch (error) {
      console.error(error);
      toast.error("unable the get the stream token");
    }
  }


  useEffect(() => {
    const initCall = async () => {
      if (!tokenProvider || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          tokenProvider,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });
        join(callId);

        toast.success("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [authUser]);

  useEffect(() => {
    async function init() {
      const callInstance = client.call("default", callId);
      await callInstance.join({ create: callId !== storedId });
      join(callId);
    }
    init();
  }, [callId]);

  if (isLoading || isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="animate-pulse rounded-full p-6 bg-indigo-800 mb-4">
          <div className="bg-indigo-700 rounded-full p-4">
            <Video className="text-white w-12 h-12" />
          </div>
        </div>
        <p className="text-white text-xl font-medium">Connecting to call...</p>
        <div className="mt-6 h-1 w-64 bg-indigo-800 rounded-full overflow-hidden">
          <div className="animate-pulse h-full w-1/2 bg-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (

    <div className="flex h-screen justify-center items-center gap-5">
      {client && call ? (
        <StreamVideo client={client} className="flex-1">
          <StreamCall call={call} className="flex-1">
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex flex-col items-center justify-center h-ful ">
          <div className="bg-red-500/20 p-6 rounded-full mb-4">
            <Phone className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Call Failed</h2>
          <p className="text-gray-400 mb-6">Could not initialize the video call</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>

  );
};

const CallContent = () => {
  const { useCallCallingState, useParticipantCount, useLocalParticipant, useRemoteParticipants, } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  // Hook to detect mobile vs. large screen
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    participantCount <= 2 ? (
      <StreamTheme>
        <MyParticipantList participants={remoteParticipants} />
        <MyFloatingLocalParticipant participant={localParticipant} />
        <div className="bg-slate-950/50 z-50 rounded-3xl w-auto px-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <CallControls />
        </div>
      </StreamTheme>
    ) : (
      <StreamTheme>
        <div className="flex flex-1">
          {isMobile
            ? <PaginatedGridLayout className="flex flex-1" />
            : <SpeakerLayout participantsBarPosition="right" className="flex flex-1" />}
        </div>

        <div className="bg-slate-950/50 rounded-3xl w-auto px-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <CallControls />
        </div>
      </StreamTheme>
    )
  );
};

export const MyParticipantList = ({ participants }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

   // Mobile: full-screen
  if (isMobile) {
    return (
      <div className="absolute m-1 inset-0 z-10">
        <ParticipantView participant={participants[0]} className="w-screen h-screen object-scale-down" />
      </div>
    );
  }

  // Desktop: centered window
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="w-[90vw] h-[85vh] rounded-2xl overflow-hidden shadow-lg">
        <ParticipantView participant={participants[0]} className="w-full h-full" />
      </div>
    </div>
  );
};


export const MyFloatingLocalParticipant = ({ participant }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (!participant) return <p>Error: No local participant</p>;

  return (
    <div
      className={`absolute rounded-lg overflow-hidden shadow-xl  bg-opacity-60 ${
        isMobile
          ? "bottom-12 right-4 w-44 h-44 rounded-4xl"
          : "top-16 left-4 w-60 h-40"
      }`}
      style={{ zIndex: 20 }}
    >
      <ParticipantView participant={participant} />
    </div>
  );
};


export default CallPage;