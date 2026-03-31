import { useEffect } from 'react';
import {
  StreamVideo,
  StreamCall,
  useCallStateHooks,
  useCall,
  ParticipantView,
  ParticipantsAudio,
  type StreamVideoClient,
  type Call,
  CallingState,
} from '@stream-io/video-react-sdk';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { useRingtone } from './useRingtone';

// ── Call controls & layout ────────────────────────────────────────────────────

interface CallUIProps {
  mode: 'incoming' | 'outgoing';
  partnerName: string;
  partnerAvatar: string;
  onClose: () => void;
}

function CallUI({ mode, partnerName, partnerAvatar, onClose }: CallUIProps) {
  const {
    useCallCallingState,
    useRemoteParticipants,
    useLocalParticipant,
    useCameraState,
    useMicrophoneState,
  } = useCallStateHooks();

  const callingState     = useCallCallingState();
  const remoteParticipants = useRemoteParticipants();
  const localParticipant = useLocalParticipant();
  const { camera, isMute: camMuted }       = useCameraState();
  const { microphone, isMute: micMuted }   = useMicrophoneState();

  const call = useCall();

  const handleToggleMic = () => microphone.toggle().catch(() => {});
  const handleToggleCam = () => camera.toggle().catch(() => {});

  const handleEnd = async () => {
    try {
      await call?.leave();
    } finally {
      onClose();
    }
  };

  const isCalling  = mode === 'outgoing' && callingState === CallingState.RINGING;
  const isRinging  = mode === 'incoming' && callingState === CallingState.RINGING;
  const isJoining  = callingState === CallingState.JOINING;
  const isIdle     = callingState === CallingState.IDLE || callingState === CallingState.LEFT;

  // Auto-close if call has ended
  useEffect(() => {
    if (isIdle) onClose();
  }, [isIdle, onClose]);

  // Play ringback tone while the outgoing call is waiting to be answered
  useRingtone(isCalling, 'outgoing');

  const isPending = isCalling || isRinging || isJoining;

  return (
    <div className="flex flex-col h-full">
      {/* Render audio for all remote participants — ParticipantsAudio handles
          this correctly using the SDK's subscription system. */}
      <ParticipantsAudio participants={remoteParticipants} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/80 backdrop-blur-sm shrink-0">
        <Avatar src={partnerAvatar} name={partnerName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{partnerName}</p>
          <p className="text-xs text-gray-400">
            {isCalling  && 'Calling…'}
            {isRinging  && 'Incoming call…'}
            {isJoining  && 'Connecting…'}
            {!isPending && 'In call'}
          </p>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative flex flex-col gap-2 p-3 min-h-0">
        {isPending ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white">
            <div className="relative">
              <Avatar src={partnerAvatar} name={partnerName} size="lg" />
              <span className="absolute -inset-2 rounded-full border-4 border-white/20 animate-ping" />
            </div>
            <p className="text-sm text-gray-300">
              {isCalling ? `Calling ${partnerName}…` : isRinging ? `${partnerName} is calling` : 'Connecting…'}
            </p>
            <Loader2 size={20} className="animate-spin text-gray-400" />
            <button
              onClick={handleEnd}
              className="mt-2 rounded-full border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
            >
              Cancel Call
            </button>
          </div>
        ) : remoteParticipants.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white">
            <Avatar src={partnerAvatar} name={partnerName} size="lg" />
            <p className="text-sm text-gray-300">Waiting for {partnerName}…</p>
            <Loader2 size={18} className="animate-spin text-gray-400" />
            <button
              onClick={handleEnd}
              className="mt-2 rounded-full border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
            >
              Cancel Call
            </button>
          </div>
        ) : (
          <>
            {/* Remote participant — large. ParticipantView handles all track
                subscriptions, dynascale, and rendering internally. */}
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden">
              <ParticipantView
                participant={remoteParticipants[0]}
                className="w-full h-full"
                ParticipantViewUI={null}
              />
            </div>

            {/* Local pip — small overlay */}
            {localParticipant && (
              <div className="absolute bottom-16 right-5 w-28 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700 z-10">
                <ParticipantView
                  participant={localParticipant}
                  className="w-full h-full"
                  ParticipantViewUI={null}
                  muteAudio
                />
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
            !micMuted ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
          title={!micMuted ? 'Mute microphone' : 'Unmute microphone'}
        >
          {!micMuted ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={handleEnd}
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white flex items-center justify-center transition-colors shadow-lg"
          title={isPending ? 'Cancel call' : 'End call'}
        >
          <PhoneOff size={22} />
        </button>

        <button
          onClick={handleToggleCam}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            !camMuted ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
          title={!camMuted ? 'Turn off camera' : 'Turn on camera'}
        >
          {!camMuted ? <VideoIcon size={20} /> : <VideoOff size={20} />}
        </button>
      </div>

      <div className="bg-gray-900/80 px-4 pb-4 text-center shrink-0">
        <button
          onClick={handleEnd}
          className="text-sm font-medium text-red-300 transition-colors hover:text-red-200"
        >
          {isPending ? 'Cancel Call' : 'End Call'}
        </button>
      </div>
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

interface VideoCallModalProps {
  videoClient: StreamVideoClient;
  call: Call;
  mode: 'incoming' | 'outgoing';
  partnerName: string;
  partnerAvatar: string;
  onClose: () => void;
}

export default function VideoCallModal({
  videoClient,
  call,
  mode,
  partnerName,
  partnerAvatar,
  onClose,
}: VideoCallModalProps) {
  return (
    // Backdrop
    <div className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center">
      {/* Modal card */}
      <div
        className="relative w-full max-w-lg h-[85vh] max-h-175 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <StreamVideo client={videoClient}>
          <StreamCall call={call}>
            <CallUI
              mode={mode}
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
