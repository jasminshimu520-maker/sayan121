import React, { useState } from 'react';
import { User, SystemStatus } from '../types';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EmailControlPanelProps {
  user: User;
  systemStatus: SystemStatus | null;
  onSendTestEmail: () => Promise<void>;
  onTriggerSweep: () => Promise<void>;
  onOpenLogs: () => void;
  isTestingEmail: boolean;
  isTriggeringSweep: boolean;
}

export const EmailControlPanel: React.FC<EmailControlPanelProps> = ({
  user,
  systemStatus,
  onSendTestEmail,
  onTriggerSweep,
  onOpenLogs,
  isTestingEmail,
  isTriggeringSweep,
}) => {
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const isConfigured = systemStatus?.gmailConfigured ?? false;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-800/40 relative overflow-hidden">
      
      {/* Background ambient decorative shapes */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        {/* Left Side: Information & Gmail Status */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center space-x-1">
              <Mail className="w-3 h-3 text-indigo-300" />
              <span>স্বয়ংক্রিয় জিমেইল রিমাইন্ডার সেন্টার</span>
            </span>

            {isConfigured ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>SMTP Connected</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Simulated / Setup Mode</span>
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
            সংযুক্ত জিমেইল অ্যাকাউন্ট: <span className="text-indigo-300 underline decoration-indigo-400/50">{user.email}</span>
          </h3>

          <p className="text-xs text-indigo-200/80 leading-relaxed">
            যেকোনো কাজের নির্ধারিত তারিখের <strong>২ দিন আগে (T-2)</strong>, <strong>১ দিন আগে (T-1)</strong> এবং <strong>নির্ধারিত দিনে (T)</strong> স্বয়ংক্রিয়ভাবে ইমেইল বার্তা পৌঁছাবে।
          </p>

          {/* Quick instructions toggle */}
          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center space-x-1 transition-colors"
          >
            <span>{showSetupGuide ? 'গাইড বন্ধ করুন' : 'কীভাবে Gmail App Password তৈরি করবেন? (How to connect Gmail)'}</span>
            {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Test Email Now */}
          <button
            onClick={onSendTestEmail}
            disabled={isTestingEmail}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isTestingEmail ? 'animate-bounce' : ''}`} />
            <span>{isTestingEmail ? 'পাঠানো হচ্ছে...' : 'Test Email Now'}</span>
          </button>

          {/* Trigger Cron Sweep Now */}
          <button
            onClick={onTriggerSweep}
            disabled={isTriggeringSweep}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/15 transition-all disabled:opacity-50"
            title="Execute 3-day reminder scheduler sweep right now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringSweep ? 'animate-spin' : ''}`} />
            <span>{isTriggeringSweep ? 'চেক চলছে...' : 'Run Reminder Check'}</span>
          </button>

          {/* View Logs */}
          <button
            onClick={onOpenLogs}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Email Logs</span>
          </button>
        </div>

      </div>

      {/* Expandable Gmail Setup Guide */}
      {showSetupGuide && (
        <div className="mt-4 pt-4 border-t border-indigo-800/60 bg-indigo-950/60 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 rounded-b-2xl animate-in fade-in duration-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Gmail App Password সেটআপের সহজ ধাপসমূহ (১ মিনিটে):</span>
          </h4>
          <ol className="text-xs text-indigo-200/90 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>আপনার Google Account-এ গিয়ে <strong>Security</strong> ট্যাবে যান এবং <strong>2-Step Verification</strong> চালু করুন।</li>
            <li>Security পেইজের সার্চবারে <strong>"App passwords"</strong> লিখে সার্চ করুন (অথবা Security পেইজের নিচে দেখুন)।</li>
            <li>অ্যাপের নামে <strong>"Smart Task App"</strong> বা "Mail" সিলেক্ট করে Create চাপুন।</li>
            <li>একটি <strong>১৬-অক্ষরের পাসওয়ার্ড</strong> পাবেন (যেমন: <code className="bg-indigo-900/80 px-1.5 py-0.5 rounded text-amber-300 font-mono">abcd efgh ijkl mnop</code>)।</li>
            <li>এই প্রজেক্টের <code className="bg-indigo-900/80 px-1.5 py-0.5 rounded text-amber-300 font-mono">server/.env</code> ফাইলে <code className="text-white font-mono">GMAIL_USER=আপনার_জিমেইল</code> এবং <code className="text-white font-mono">GMAIL_APP_PASSWORD=১৬_অক্ষর</code> বসিয়ে দিন!</li>
          </ol>
          <div className="mt-3 p-2 bg-indigo-900/40 rounded-lg text-[11px] text-indigo-300 border border-indigo-700/40">
            💡 <em>পাসওয়ার্ড না বসালেও অ্যাপটি "Simulated Mode"-এ চলবে এবং প্রতিটি রিমাইন্ডার স্ক্রিনে ও লগ হিসেবে দেখতে পারবেন। আসল ইমেইল পেতে শুধুমাত্র ১৬ অক্ষরের App Password টি যোগ করুন।</em>
          </div>
        </div>
      )}

    </div>
  );
};
