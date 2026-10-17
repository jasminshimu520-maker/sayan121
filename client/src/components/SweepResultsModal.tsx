import React from 'react';
import { SweepResults } from '../types';
import { X, CheckCircle, RefreshCw, Mail, Calendar, AlertCircle } from 'lucide-react';

interface SweepResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SweepResults | null;
}

export const SweepResultsModal: React.FC<SweepResultsModalProps> = ({
  isOpen,
  onClose,
  results,
}) => {
  if (!isOpen || !results) return null;

  const totalProcessed =
    results.t_minus_2_processed + results.t_minus_1_processed + results.target_day_processed;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                রিমাইন্ডার সুইপ সম্পন্ন হয়েছে!
              </h3>
              <p className="text-xs text-slate-500">৩-দিনের স্বয়ংক্রিয় শিডিউলার ফলাফল</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-5 space-y-4">
          {/* Summary counters */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <span className="block text-xl font-black text-indigo-700">
                {results.t_minus_2_processed}
              </span>
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                T - 2 (২ দিন আগে)
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="block text-xl font-black text-amber-700">
                {results.t_minus_1_processed}
              </span>
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                T - 1 (১ দিন আগে)
              </span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="block text-xl font-black text-emerald-700">
                {results.target_day_processed}
              </span>
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                Today (আজকের দিন)
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            {totalProcessed > 0 ? (
              <p>
                🎯 সর্বমোট <strong>{totalProcessed}</strong> টি আসন্ন কাজের রিমাইন্ডার ইমেইল পাঠানো হয়েছে।
              </p>
            ) : (
              <p>
                💡 আজ কোনো কাজের T-2, T-1 বা Target Day পেন্ডিং ছিল না (সব পূর্বেই পাঠানো হয়েছে অথবা কোনো টাস্কের তারিখ আজ/আগামীকাল/পরশু নেই)।
              </p>
            )}
          </div>

          {/* Details list */}
          {results.details.length > 0 && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              <span className="text-xs font-bold text-slate-700">প্রসেসকৃত কাজসমূহ:</span>
              {results.details.map((d, i) => (
                <div
                  key={i}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-800">{d.title}</span>
                    <span className="text-[11px] text-slate-500 block">তারিখ: {d.targetDate}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase shrink-0">
                    {d.type}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Errors list if any */}
          {results.errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-rose-700 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>ত্রুটিসমূহ:</span>
              </span>
              {results.errors.map((e, i) => (
                <p key={i} className="text-[11px] text-rose-600">
                  টাস্ক #{e.taskId}: {e.error}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
          >
            ঠিক আছে (Done)
          </button>
        </div>

      </div>
    </div>
  );
};
