import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X, Check } from 'lucide-react';

export const AndroidInstallBanner: React.FC<{ onOpenAndroidModal: () => void }> = ({
  onOpenAndroidModal,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as Android app)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      onOpenAndroidModal();
    }
  };

  if (isStandalone || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white px-4 py-2.5 text-xs shadow-md sticky top-0 z-40 border-b border-rose-700/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-rose-500/20 rounded-lg border border-rose-400/30 text-rose-300">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Android App & Open Source: </span>
            <span className="text-rose-100 hidden sm:inline">
              Install AtheroTrack on your Android phone or publish to your GitHub.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-rose-900 hover:bg-rose-50 font-bold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Android App</span>
          </button>

          <button
            onClick={onOpenAndroidModal}
            className="px-2.5 py-1 bg-rose-700/60 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
          >
            GitHub Setup
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-rose-300 hover:text-white rounded transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
