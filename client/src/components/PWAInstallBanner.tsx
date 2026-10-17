import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface PWAInstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onInstall,
  onDismiss,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3 sm:p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold truncate">
            Install as Mobile / Desktop App
          </h4>
          <p className="text-[11px] text-emerald-100 line-clamp-1">
            Install on your Android, iOS, or PC for a smooth native app experience.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={onInstall}
          className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-extrabold hover:bg-emerald-50 active:scale-95 shadow-sm transition-all flex items-center space-x-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Now</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
