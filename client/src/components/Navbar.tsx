import React from 'react';
import { User } from '../types';
import { CheckCircle2, Mail, Bell, LogOut, Download, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenTestEmail: () => void;
  onOpenLogs: () => void;
  onTriggerSweep: () => void;
  installPrompt: any;
  onInstallApp: () => void;
  isTestingEmail?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenTestEmail,
  onOpenLogs,
  onTriggerSweep,
  installPrompt,
  onInstallApp,
  isTestingEmail = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Smart Task</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gmail Reminders
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Automated 3-Day Notification System</p>
            </div>
          </div>

          {/* Action Buttons & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Install PWA Button (Visible if prompt available) */}
            {installPrompt && (
              <button
                onClick={onInstallApp}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                title="Install application on your device"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Test Email Now Button */}
            <button
              onClick={onOpenTestEmail}
              disabled={isTestingEmail}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all disabled:opacity-50"
              title="Test Gmail sending immediately"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Test Email</span>
            </button>

            {/* Trigger Sweep Button */}
            <button
              onClick={onTriggerSweep}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all"
              title="Manually trigger 3-Day reminder check sweep"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Trigger Sweep</span>
            </button>

            {/* Email History Logs Button */}
            <button
              onClick={onOpenLogs}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="View sent email history"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[11px] font-medium text-slate-500 max-w-[150px] truncate" title={user.email}>
                  {user.email}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-800 font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
