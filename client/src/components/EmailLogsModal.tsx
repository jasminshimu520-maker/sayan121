import React from 'react';
import { EmailLog } from '../types';
import { X, Mail, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Clock } from 'lucide-react';

interface EmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: EmailLog[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export const EmailLogsModal: React.FC<EmailLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  onRefresh,
  isLoading,
}) => {
  if (!isOpen) return null;

  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('bn-BD', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 't_minus_2':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">T-2 (২ দিন আগে)</span>;
      case 't_minus_1':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">T-1 (১ দিন আগে)</span>;
      case 'target_day':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Target Day (নির্ধারিত দিন)</span>;
      case 'test':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Test Email</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ইমেইল নোটিফিকেশন লগ (Email Notification History)
              </h3>
              <p className="text-xs text-slate-500">
                ৩-দিনের রিমাইন্ডার এবং টেস্ট ইমেইলের পূর্ণাঙ্গ রেকর্ড
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">এখনও কোনো ইমেইল পাঠানো হয়নি</p>
              <p className="text-[11px] text-slate-400 mt-1">
                "Test Email Now" অথবা "Run Reminder Check" চাপলে এখানে লগ যুক্ত হবে।
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    {getBadge(log.reminder_type)}
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {log.subject}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                    <span>প্রাপক: <strong>{log.recipient_email}</strong></span>
                    {log.task_title && (
                      <>
                        <span>•</span>
                        <span className="truncate">কাজ: {log.task_title}</span>
                      </>
                    )}
                  </div>

                  {log.error_message && (
                    <div className="text-[11px] text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-200">
                      ত্রুটি: {log.error_message}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 text-right">
                  <div className="flex items-center space-x-1">
                    {log.status === 'sent' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Sent (সফল)
                      </span>
                    ) : log.status === 'simulated' ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                        Simulated
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                        Failed
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{formatLogDate(log.sent_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>সর্বশেষ ৫০টি নোটিফিকেশন সংরক্ষিত</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
