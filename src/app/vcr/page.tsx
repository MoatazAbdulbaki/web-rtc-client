"use client";
import { useVCR, VCRBody, VCRHeader } from "@/components";
import VCRFooter from "@/components/vcr/vcr-footer";
import VCRSidebar from "@/components/vcr/vcr-sidebar";

const VCRContainer = () => {
  const {
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
  } = useVCR();

  return (
    <div className="text-red h-screen w-screen bg-[#2B3F56] flex">
      <div className="mx-auto pt-[3vh] flex flex-col justify-between items-between">
        <VCRHeader />
        <VCRBody
          videos={Object.entries(videosSrc).map(([key, value]) => ({
            isMyVideo: key === MY_CUSTOM_KEY.current,
            source: value,
          }))}
        />
        <VCRFooter
          handleCamControl={toggleCamera}
          handleMicControl={toggleMicrophone}
          handleChatControl={handleChatControl}
          handleParticipantsControl={handleParticipantsControl}
          handleScreenShare={async () => {
            await shareScreen();
          }}
          handleOpenSetting={() => {}}
          handleLeave={() => {}}
          handleRaiseHand={() => {}}
          isMuted={isMicrophoneMuted}
          isCamOff={!isCameraOn}
          isShareScreen={isShareScreen}
          isChatFocus={isChat}
          isParticipantsFocus={isParticipants}
          isRaiseHand={isRaiseHand}
        />
      </div>
      <VCRSidebar
        isOpen={isSideOpen}
        setIsOpen={setIsSideOpen}
        isChat={isChat}
      />
    </div>
  );
};

export default VCRContainer;
