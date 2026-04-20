import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
        <RefreshCw size={16} className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Update available</p>
        <p className="text-xs text-gray-500 mt-0.5">A new version of CampusCare is ready to install.</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            Update now
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Later
          </button>
        </div>
      </div>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
