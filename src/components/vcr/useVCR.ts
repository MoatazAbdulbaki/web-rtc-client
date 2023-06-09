import { useCallback, useEffect, useState, useRef } from "react";
import { MediaConnection } from "peerjs";
import { v4 as uuidv4 } from "uuid";
import { socket } from "@/socket";
import { peer } from "@/peer";


const triggerVideos: { [key: string]: MediaStream } = {};

export const useVCR = () => {
  const [isSideOpen, setIsSideOpen] = useState(false);
  const [isChat, setIsChat] = useState(false);
  const [isParticipants, setIsParticipants] = useState(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isShareScreen, setIsShareScreen] = useState(false);
  const [isRaiseHand, setIsRaiseHand] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videosSrc, setVideosSrc] = useState<{ [key: string]: MediaStream }>(
    {}
  );

  const peers = useRef<{ [key: string]: MediaConnection }>({});
  const screenStream = useRef<MediaStream | null>(null);
  const MY_CUSTOM_KEY = useRef(uuidv4());

  const addVideoStream = useCallback(
    (userId: string, stream: MediaStream) => {
      if (
        !videosSrc[userId] &&
        !Object.values(videosSrc).find((_stream) => _stream.id === stream.id) &&
        !Object.values(triggerVideos).find(
          (_stream) => _stream.id === stream.id
        )
      ) {
        setVideosSrc((pre) => ({ ...pre, [userId]: stream }));
      }
      triggerVideos[userId] = stream;
    },
    [videosSrc]
  );
  const connectToNewUser = useCallback(
    (userId: string, stream: MediaStream) => {
      const call = peer.call(userId, stream);
      call.on("stream", (userVideoStream) => {
        addVideoStream(userId, userVideoStream);
      });
      call.on("close", () => {
        if (peers.current[userId]) {
          delete peers.current[userId];
          delete triggerVideos[userId];
          setVideosSrc(triggerVideos);
        }
      });

      // Add event listeners for mute microphone and toggle camera for the new user
      call.on("stream", (userVideoStream) => {
        const audioTracks = userVideoStream.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = !isMicrophoneMuted;
        });

        const videoTracks = userVideoStream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = isCameraOn;
        });
      });

      peers.current[userId] = call;
    },
    [isMicrophoneMuted, isCameraOn, addVideoStream]
  );

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        addVideoStream(MY_CUSTOM_KEY.current, stream);
        setStream(stream);
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            addVideoStream(call.peer, userVideoStream);
          });
        });
        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });
      });

    socket.on("user-disconnected", (userId) => {
      if (peers.current[userId]) peers.current[userId].close();
    });

    peer.on("open", (id) => {
      socket.emit("join-room", 123123, id);
    });

    return () => {
      setVideosSrc({});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleMicrophone() {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks) {
        audioTracks.forEach((track) => {
          track.enabled = !isMicrophoneMuted;
        });
        setIsMicrophoneMuted((prev) => !prev);
      }
    }
  }
  function toggleCamera() {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks) {
        videoTracks.forEach((track) => {
          track.enabled = !isCameraOn;
        });
        setIsCameraOn((prev) => !prev);
      }
    }
  }
  async function shareScreen() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStream.current = stream;
      setVideosSrc((prevVideosSrc) => ({
        ...prevVideosSrc,
        [MY_CUSTOM_KEY.current]: stream,
      }));
      setIsShareScreen(true);
      setStream(stream);
      Object.keys(peers.current).forEach((userId) => {
        const call = peer.call(userId, stream);
        call.on("stream", (userVideoStream) => {
          addVideoStream(userId, userVideoStream);
        });
      });
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  }
  function handleChatControl() {
    if (!isChat) {
      setIsChat(true);
      setIsSideOpen(true);
    } else {
      setIsSideOpen((pre) => !pre);
    }
  }
  function handleParticipantsControl() {
    if (isChat) {
      setIsChat(false);
      setIsSideOpen(true);
    } else {
      setIsSideOpen((pre) => !pre);
    }
  }
  return {
    shareScreen,
    toggleCamera,
    toggleMicrophone,
    MY_CUSTOM_KEY,
    handleChatControl,
    handleParticipantsControl,
    videosSrc,
    isChat,
    isParticipants,
    isMicrophoneMuted,
    isCameraOn,
    isShareScreen,
    isRaiseHand,
    isSideOpen,
    setIsSideOpen,
  };
};
