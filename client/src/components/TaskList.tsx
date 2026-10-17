import React, { useState } from 'react';
import { Task } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sparkles,
  MailCheck,
  MailWarning,
  Check,
  Plus,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedDate: string;
  onClearDateFilter: () => void;
  onToggleComplete: (task: Task) => Promise<void>;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => Promise<void>;
  onAddNewTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedDate,
  onClearDateFilter,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Format today YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6'],
    });
  };

  // Helper for days difference
  const getDaysLeft = (targetDateStr: string) => {
    try {
      const [ty, tm, td] = targetDateStr.split('-').map(Number);
      const [ny, nm, nd] = todayStr.split('-').map(Number);
      const target = new Date(ty, tm - 1, td).getTime();
      const current = new Date(ny, nm - 1, nd).getTime();
      const diffDays = Math.round((target - current) / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = (task.description || '').toLowerCase().includes(q);
      const matchesDate = task.target_date.includes(q);
      if (!matchesTitle && !matchesDesc && !matchesDate) return false;
    }

    // Selected date from calendar filter
    if (selectedDate && task.target_date !== selectedDate) {
      return false;
    }

    // Tabs filter
    const daysLeft = getDaysLeft(task.target_date);
    if (filterTab === 'today') {
      return daysLeft === 0;
    }
    if (filterTab === 'upcoming') {
      return daysLeft > 0 && task.is_completed === 0;
    }
    if (filterTab === 'completed') {
      return task.is_completed === 1;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              কাজের তালিকা (Task List)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              {filteredTasks.length}
            </span>
          </div>

          <button
            onClick={onAddNewTask}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন কাজ যোগ করুন</span>
          </button>
        </div>

        {/* Calendar Date Filter Pill (if date selected) */}
        {selectedDate && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                ফিল্টার: <strong>{selectedDate}</strong> তারিখের কাজ
              </span>
            </div>
            <button
              onClick={onClearDateFilter}
              className="font-bold text-indigo-600 hover:text-indigo-800 underline text-[11px]"
            >
              সব তারিখ দেখুন
            </button>
          </div>
        )}

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কাজ খুঁজুন (Search tasks)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all text-slate-800"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              সবগুলো
            </button>
            <button
              onClick={() => setFilterTab('today')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'today' ? 'bg-white text-indigo-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              আজ
            </button>
            <button
              onClick={() => setFilterTab('upcoming')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'upcoming' ? 'bg-white text-amber-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              আসন্ন
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTab === 'completed' ? 'bg-white text-emerald-700 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              সম্পন্ন
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Scrollable Container */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[600px]">
        {filteredTasks.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">কোন কাজ পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              ক্যালেন্ডারের যেকোনো তারিখে ক্লিক করুন অথবা উপরে "+ নতুন কাজ যোগ করুন" বোতামে চাপুন।
            </p>
            <button
              onClick={onAddNewTask}
              className="mt-4 px-4 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
            >
              এখনই একটি কাজ তৈরি করুন
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysLeft = getDaysLeft(task.target_date);
            const isCompleted = task.is_completed === 1;

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Complete Checkbox + Title/Description */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        if (!isCompleted) triggerCelebration();
                        onToggleComplete(task);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 hover:stroke-indigo-600" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5 mb-1">
                        <span
                          className={`text-sm font-bold truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {task.category}
                        </span>
                      </div>

                      {task.description && (
                        <p
                          className={`text-xs text-slate-600 whitespace-pre-line mb-2 line-clamp-2 ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Date & Countdown Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <div className="flex items-center space-x-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{task.target_date}</span>
                        </div>

                        {task.target_time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.target_time}</span>
                          </div>
                        )}

                        {/* Countdown Pill */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            daysLeft === 0
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : daysLeft === 1
                              ? 'bg-amber-100 text-amber-800'
                              : daysLeft === 2
                              ? 'bg-indigo-100 text-indigo-800'
                              : daysLeft > 2
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {daysLeft === 0
                            ? '🎯 আজই নির্ধারিত দিন'
                            : daysLeft === 1
                            ? '⏰ আগামীকাল (১ দিন বাকি)'
                            : daysLeft === 2
                            ? '⏳ আর মাত্র ২ দিন বাকি'
                            : daysLeft > 2
                            ? `📅 আর ${daysLeft} দিন বাকি`
                            : '⚠️ পূর্বের তারিখ'}
                        </span>
                      </div>

                      {/* 3-Day Gmail Reminder Progress Indicators */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="text-slate-400 font-medium mr-1">Gmail Reminders:</span>

                        {/* T-2 indicator */}
                        <span
                          className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-semibold ${
                            task.reminder_t_minus_2_sent === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title="2 days before reminder"
                        >
                          {task.reminder_t_minus_2_sent === 1 ? '✓' : '○'} T-2 (২ দিন আগে)
                        </span>

                        {/* T-1 indicator */}
                        <span
                          className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-semibold ${
                            task.reminder_t_minus_1_sent === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title="1 day before reminder"
                        >
                          {task.reminder_t_minus_1_sent === 1 ? '✓' : '○'} T-1 (১ দিন আগে)
                        </span>

                        {/* T Target Day indicator */}
                        <span
                          className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded font-semibold ${
                            task.reminder_target_day_sent === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                          title="Target day reminder"
                        >
                          {task.reminder_target_day_sent === 1 ? '✓' : '○'} Today (নির্ধারিত দিন)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি "${task.title}" কাজটি মুছে ফেলতে চান?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
