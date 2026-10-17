import React, { useState, useEffect } from 'react';
import { Task, Priority, Category, User } from '../types';
import { X, Calendar, Clock, Tag, AlertCircle, Mail, Sparkles, Trash2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    target_date: string;
    target_time?: string;
    priority: Priority;
    category: Category;
  }) => Promise<void>;
  onDelete?: (taskId: number) => Promise<void>;
  initialDate?: string;
  taskToEdit?: Task | null;
  user: User;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  taskToEdit,
  user,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('project');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setTargetDate(taskToEdit.target_date);
      setTargetTime(taskToEdit.target_time || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
    } else {
      const now = new Date();
      const defaultDate =
        initialDate ||
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
          now.getDate()
        ).padStart(2, '0')}`;
      setTargetDate(defaultDate);
      setTitle('');
      setDescription('');
      setTargetTime('');
      setPriority('medium');
      setCategory('project');
    }
    setError('');
  }, [taskToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  // Calculate reminder preview dates
  let tMinus2DateStr = '';
  let tMinus1DateStr = '';
  if (targetDate) {
    try {
      const [y, m, d] = targetDate.split('-').map(Number);
      const target = new Date(y, m - 1, d);

      const dMinus2 = new Date(target);
      dMinus2.setDate(target.getDate() - 2);
      tMinus2DateStr = `${dMinus2.getDate()}/${dMinus2.getMonth() + 1}/${dMinus2.getFullYear()}`;

      const dMinus1 = new Date(target);
      dMinus1.setDate(target.getDate() - 1);
      tMinus1DateStr = `${dMinus1.getDate()}/${dMinus1.getMonth() + 1}/${dMinus1.getFullYear()}`;
    } catch (e) {
      // ignore
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('অনুগ্রহ করে কাজের শিরোনাম (Task Title) লিখুন');
      return;
    }
    if (!targetDate) {
      setError('অনুগ্রহ করে নির্ধারিত তারিখ (Target Date) নির্বাচন করুন');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate,
        target_time: targetTime || undefined,
        priority,
        category,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'কাজের তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { key: Category; label: string }[] = [
    { key: 'project', label: '🚀 Project' },
    { key: 'work', label: '💼 Work' },
    { key: 'personal', label: '👤 Personal' },
    { key: 'study', label: '📚 Study' },
    { key: 'general', label: '📌 General' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {taskToEdit ? 'কাজ সম্পাদনা করুন (Edit Task)' : 'নতুন কাজ ও রিমাইন্ডার নির্ধারণ করুন'}
              </h3>
              <p className="text-xs text-slate-500">
                নির্ধারিত তারিখে স্বয়ংক্রিয় ৩-দিনের জিমেইল নোটিফিকেশন সিস্টেম
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              কাজের শিরোনাম (Task Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Build a project on the 30th"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-900"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              বিস্তারিত বিবরণ (Task Details & Notes)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Complete Capacitor setup, test on mobile device, deploy backend."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-900 resize-none"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                নির্ধারিত তারিখ (Target Date) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                সময় (Optional Time)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ক্যাটাগরি (Category)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    category === c.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              অগ্রাধিকার (Priority)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  priority === 'low'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🟢 Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  priority === 'medium'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🟡 Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  priority === 'high'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🔴 High
              </button>
            </div>
          </div>

          {/* Automated 3-Day Gmail Notification Preview Box */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-violet-50/70 rounded-xl p-3.5 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-950">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>স্বয়ংক্রিয় ৩-দিনের জিমেইল রিমাইন্ডার শিডিউল</span>
              </div>
              <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-semibold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              ইমেইল পাঠানো হবে আপনার নিবন্ধিত জিমেইল ঠিকানায়: <strong className="text-indigo-800">{user.email}</strong>
            </p>

            <div className="text-[11px] text-slate-700 space-y-1 bg-white/70 p-2.5 rounded-lg border border-indigo-50">
              <div className="flex items-start space-x-1.5">
                <span className="font-bold text-indigo-600 shrink-0">1. T-2 ({tMinus2DateStr || '২ দিন আগে'}):</span>
                <span>"রিমাইন্ডার: আর মাত্র ২ দিন বাকি!"</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="font-bold text-amber-600 shrink-0">2. T-1 ({tMinus1DateStr || '১ দিন আগে'}):</span>
                <span>"রিমাইন্ডার: আগামীকাল নির্ধারিত তারিখ!"</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="font-bold text-emerald-600 shrink-0">3. Target Day ({targetDate || 'নির্ধারিত দিনে'}):</span>
                <span>"আজকের কাজ: আজ নির্ধারিত কাজ করার দিন!"</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {taskToEdit && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('আপনি কি এই কাজটি মুছে ফেলতে চান? (Delete task)')) {
                    await onDelete(taskToEdit.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>সংরক্ষণ হচ্ছে...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{taskToEdit ? 'আপডেট করুন' : 'কাজ সংরক্ষণ করুন'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
