import { Phone, PhoneOff } from 'lucide-react';
import Avatar from '../ui/Avatar';

interface Props {
  callerName: string;
  callerAvatar: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallCard({ callerName, callerAvatar, onAccept, onDecline }: Props) {
  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[60] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72 flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
      {/* Pulsing ring indicator */}
      <div className="absolute -inset-0.5 rounded-2xl bg-green-400 opacity-20 animate-ping pointer-events-none" />

      <div className="flex items-center gap-3 relative">
        <div className="relative shrink-0">
          <Avatar src={callerAvatar} name={callerName} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{callerName}</p>
          <p className="text-xs text-gray-500 mt-0.5">Incoming video call…</p>
        </div>
      </div>

      <div className="flex gap-2 relative">
        <button
          onClick={onDecline}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors text-sm font-medium"
        >
          <PhoneOff size={15} />
          Decline
        </button>
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition-colors text-sm font-medium"
        >
          <Phone size={15} />
          Accept
        </button>
      </div>
    </div>
  );
}
