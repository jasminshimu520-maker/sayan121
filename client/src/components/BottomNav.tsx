import React from 'react';
import { Calendar, CheckSquare, Mail, Bell, Plus } from 'lucide-react';

export type MobileTab = 'calendar' | 'tasks' | 'email' | 'logs';

interface BottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onQuickAdd: () => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
  pendingTasksCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 safe-bottom md:hidden shadow-lg">
      <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto relative">
        
        {/* Calendar Tab */}
        <button
          onClick={() => onTabChange('calendar')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'calendar' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">ক্যালেন্ডার</span>
        </button>

        {/* Tasks Tab */}
        <button
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all ${
            activeTab === 'tasks' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 ${activeTab === 'tasks' ? 'stroke-[2.5]' : ''}`} />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingTasksCount > 9 ? '9+' : pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">টাস্ক লিস্ট</span>
        </button>

        {/* Center Floating Action Button (Add Task) */}
        <div className="relative -top-4 flex items-center justify-center px-1">
          <button
            onClick={onQuickAdd}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 active:scale-90 transition-transform"
            title="নতুন কাজ যোগ করুন"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Email Center Tab */}
        <button
          onClick={() => onTabChange('email')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'email' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Mail className={`w-5 h-5 ${activeTab === 'email' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">ইমেইল সেন্টার</span>
        </button>

        {/* Notification Logs Tab */}
        <button
          onClick={() => onTabChange('logs')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'logs' ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'
          }`}
        >
          <Bell className={`w-5 h-5 ${activeTab === 'logs' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">হিস্ট্রি</span>
        </button>

      </div>
    </div>
  );
};
