import { useEffect, useRef, useState } from 'react';
import {
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  type StreamVideoClient,
  type Call,
  type StreamVideoParticipant,
  CallingState,
} from '@stream-io/video-react-sdk';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2, User } from 'lucide-react';
import Avatar from '../ui/Avatar';

// ── Participant tile ──────────────────────────────────────────────────────────

function ParticipantTile({
  participant,
  isLocal,
}: {
  participant: StreamVideoParticipant;
  isLocal: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideoOn = participant.publishedTracks?.includes(2); // VideoTrackType.VIDEO = 2

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const stream = participant.videoStream;
    if (stream && isVideoOn) {
      el.srcObject = stream;
    } else {
      el.srcObject = null;
    }
  }, [participant.videoStream, isVideoOn]);

  return (
    <div className="relative flex-1 min-w-0 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
      {isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center">
            <User size={28} className="text-gray-400" />
          </div>
          <span className="text-xs">{participant.name ?? participant.userId}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full truncate max-w-[70%]">
          {participant.name ?? participant.userId}
          {isLocal ? ' (You)' : ''}
        </span>
        {!participant.publishedTracks?.includes(1) && ( // AudioTrackType.AUDIO = 1
          <MicOff size={12} className="text-red-400 bg-black/50 rounded-full p-0.5" />
        )}
      </div>
    </div>
  );
}

// ── Call controls & layout ────────────────────────────────────────────────────

interface CallUIProps {
  partnerName: string;
  partnerAvatar: string;
  onClose: () => void;
}

function CallUI({ partnerName, partnerAvatar, onClose }: CallUIProps) {
  const { useCallCallingState, useParticipants, useLocalParticipant } = useCallStateHooks();

  const callingState   = useCallCallingState();
  const participants   = useParticipants();
  const localParticipant = useLocalParticipant();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const { useCall } = useCallStateHooks();
  const call = useCall();

  const handleToggleMic = async () => {
    if (!call) return;
    try {
      if (micOn) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
      setMicOn(v => !v);
    } catch {
      // ignore
    }
  };

  const handleToggleCam = async () => {
    if (!call) return;
    try {
      if (camOn) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
      setCamOn(v => !v);
    } catch {
      // ignore
    }
  };

  const handleEnd = async () => {
    try {
      await call?.leave();
    } finally {
      onClose();
    }
  };

  const remoteParticipants = participants.filter(p => p.userId !== localParticipant?.userId);

  const isCalling  = callingState === CallingState.OUTGOING;
  const isRinging  = callingState === CallingState.INCOMING;
  const isJoining  = callingState === CallingState.JOINING;
  const isIdle     = callingState === CallingState.IDLE || callingState === CallingState.LEFT;

  // Auto-close if call has ended
  useEffect(() => {
    if (isIdle) onClose();
  }, [isIdle, onClose]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-sm shrink-0">
        <Avatar src={partnerAvatar} name={partnerName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{partnerName}</p>
          <p className="text-xs text-gray-400">
            {isCalling  && 'Calling…'}
            {isRinging  && 'Incoming call…'}
            {isJoining  && 'Connecting…'}
            {!isCalling && !isRinging && !isJoining && 'In call'}
          </p>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative flex flex-col gap-2 p-3 min-h-0">
        {(isCalling || isRinging || isJoining) ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white">
            <div className="relative">
              <Avatar src={partnerAvatar} name={partnerName} size="lg" />
              <span className="absolute -inset-2 rounded-full border-4 border-white/20 animate-ping" />
            </div>
            <p className="text-sm text-gray-300">
              {isCalling ? `Calling ${partnerName}…` : isRinging ? `${partnerName} is calling` : 'Connecting…'}
            </p>
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : remoteParticipants.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white">
            <Avatar src={partnerAvatar} name={partnerName} size="lg" />
            <p className="text-sm text-gray-300">Waiting for {partnerName}…</p>
            <Loader2 size={18} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Remote participant — large */}
            <div className="flex-1 min-h-0">
              <ParticipantTile participant={remoteParticipants[0]} isLocal={false} />
            </div>

            {/* Local pip — small overlay */}
            {localParticipant && (
              <div className="absolute bottom-16 right-5 w-28 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700 z-10">
                <ParticipantTile participant={localParticipant} isLocal />
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-gray-900/80 backdrop-blur-sm shrink-0">
        <button
          onClick={handleToggleMic}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
          title={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={handleEnd}
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg"
          title="End call"
        >
          <PhoneOff size={22} />
        </button>

        <button
          onClick={handleToggleCam}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            camOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
          title={camOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {camOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
        </button>
      </div>
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

interface VideoCallModalProps {
  videoClient: StreamVideoClient;
  call: Call;
  partnerName: string;
  partnerAvatar: string;
  onClose: () => void;
}

export default function VideoCallModal({
  videoClient,
  call,
  partnerName,
  partnerAvatar,
  onClose,
}: VideoCallModalProps) {
  return (
    // Backdrop
    <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center">
      {/* Modal card */}
      <div
        className="relative w-full max-w-lg h-[85vh] max-h-[700px] bg-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <StreamVideo client={videoClient}>
          <StreamCall call={call}>
            <CallUI
              partnerName={partnerName}
              partnerAvatar={partnerAvatar}
              onClose={onClose}
            />
          </StreamCall>
        </StreamVideo>
      </div>
    </div>
  );
}
