import React, { useState, useEffect } from 'react';
import { User, Task, EmailLog, SystemStatus, SweepResults, Priority, Category } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { EmailControlPanel } from './components/EmailControlPanel';
import { EmailLogsModal } from './components/EmailLogsModal';
import { SweepResultsModal } from './components/SweepResultsModal';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav, MobileTab } from './components/BottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isInitializing, setIsInitializing] = useState(true);

  // Core Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Modals & Popups
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalDate, setModalDate] = useState<string>('');

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
  const [sweepResults, setSweepResults] = useState<SweepResults | null>(null);

  // Operation States
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTriggeringSweep, setIsTriggeringSweep] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Mobile View Tab
  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar');

  // PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('ধন্যবাদ! অ্যাপটি ইনস্টল সম্পন্ন হয়েছে।', 'success');
      setInstallPrompt(null);
    }
  };

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const res = await api.auth.me();
        setUser(res.user);
        setToken(savedToken);
      } catch (err) {
        console.warn('Auth token expired or invalid:', err);
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch tasks and status when user is logged in
  useEffect(() => {
    if (!user) return;
    fetchTasks();
    fetchSystemStatus();
    fetchEmailLogs();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await api.tasks.getAll();
      setTasks(res.tasks || []);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await api.system.getStatus();
      setSystemStatus(res);
    } catch (err) {
      // ignore
    }
  };

  const fetchEmailLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await api.email.getLogs();
      setEmailLogs(res.logs || []);
    } catch (err) {
      // ignore
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Auth Success
  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    showToast(`স্বাগতম ${authUser.name}! সফলভাবে লগইন হয়েছে।`, 'success');
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    setTasks([]);
    showToast('লগআউট সম্পন্ন হয়েছে', 'info');
  };

  // Task creation or update
  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    target_date: string;
    target_time?: string;
    priority: Priority;
    category: Category;
  }) => {
    if (taskToEdit) {
      await api.tasks.update(taskToEdit.id, taskData);
      showToast('কাজ সফলভাবে আপডেট করা হয়েছে!', 'success');
    } else {
      await api.tasks.create(taskData);
      showToast('নতুন কাজ সফলভাবে নির্ধারিত হয়েছে! ৩-দিনের রিমাইন্ডার স্বয়ংক্রিয়ভাবে একটিভ হয়েছে।', 'success');
    }
    fetchTasks();
  };

  // Task completion toggle
  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.is_completed === 1 ? 0 : 1;
    try {
      await api.tasks.update(task.id, { is_completed: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_completed: newStatus } : t))
      );
      if (newStatus === 1) {
        showToast('অভিনন্দন! কাজ সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে। 🎉', 'success');
      }
    } catch (err: any) {
      showToast('আপডেট করতে ব্যর্থ হয়েছে', 'error');
    }
  };

  // Task deletion
  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.tasks.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('কাজ মুছে ফেলা হয়েছে', 'info');
    } catch (err: any) {
      showToast('কাজ মুছে ফেলতে সমস্যা হয়েছে', 'error');
    }
  };

  // Test Email Now
  const handleSendTestEmail = async () => {
    if (!user) return;
    try {
      setIsTestingEmail(true);
      const res = await api.email.sendTest();
      showToast(res.message, res.details?.simulated ? 'info' : 'success');
      fetchEmailLogs();
    } catch (err: any) {
      showToast(err.message || 'টেস্ট ইমেইল পাঠাতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Trigger automated reminder sweep immediately
  const handleTriggerSweep = async () => {
    try {
      setIsTriggeringSweep(true);
      const res = await api.email.triggerSweep();
      setSweepResults(res.results);
      setIsSweepModalOpen(true);
      fetchTasks();
      fetchEmailLogs();
    } catch (err: any) {
      showToast('রিমাইন্ডার সুইপ চালাতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsTriggeringSweep(false);
    }
  };

  // Calendar Day Click -> Filter tasks for that day
  const handleSelectDate = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate('');
    } else {
      setSelectedDate(dateStr);
    }
  };

  // Open modal for a specific day
  const handleScheduleForDate = (dateStr: string) => {
    setTaskToEdit(null);
    setModalDate(dateStr);
    setIsTaskModalOpen(true);
  };

  // Quick Add new task button
  const handleAddNewTask = () => {
    setTaskToEdit(null);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;
    setModalDate(selectedDate || todayStr);
    setIsTaskModalOpen(true);
  };

  // Edit task
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setModalDate(task.target_date);
    setIsTaskModalOpen(true);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Smart Task Reminder লোড হচ্ছে...</p>
      </div>
    );
  }

  // If not logged in, show Auth Screen
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const pendingTasksCount = tasks.filter((t) => t.is_completed === 0).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-20 md:pb-8">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenTestEmail={handleSendTestEmail}
        onOpenLogs={() => setIsLogsModalOpen(true)}
        onTriggerSweep={handleTriggerSweep}
        installPrompt={installPrompt}
        onInstallApp={handleInstallApp}
        isTestingEmail={isTestingEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* PWA Install Banner (if prompt available) */}
        {installPrompt && showInstallBanner && (
          <PWAInstallBanner
            onInstall={handleInstallApp}
            onDismiss={() => setShowInstallBanner(false)}
          />
        )}

        {/* 3-Day Automated Gmail Reminder Header Control Panel */}
        <EmailControlPanel
          user={user}
          systemStatus={systemStatus}
          onSendTestEmail={handleSendTestEmail}
          onTriggerSweep={handleTriggerSweep}
          onOpenLogs={() => setIsLogsModalOpen(true)}
          isTestingEmail={isTestingEmail}
          isTriggeringSweep={isTriggeringSweep}
        />

        {/* ======================================================== */}
        {/* DESKTOP VIEW: Split-Screen Dashboard (Calendar + Task List) */}
        {/* ======================================================== */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Interactive Month Calendar */}
          <div className="md:col-span-6 lg:col-span-6 space-y-4">
            <CalendarView
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onScheduleForDate={handleScheduleForDate}
            />
          </div>

          {/* Right Column: Task List */}
          <div className="md:col-span-6 lg:col-span-6 space-y-4">
            <TaskList
              tasks={tasks}
              selectedDate={selectedDate}
              onClearDateFilter={() => setSelectedDate('')}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddNewTask={handleAddNewTask}
            />
          </div>

        </div>

        {/* ======================================================== */}
        {/* MOBILE VIEW: Tabbed Native Experience                    */}
        {/* ======================================================== */}
        <div className="md:hidden space-y-4">
          {mobileTab === 'calendar' && (
            <div className="space-y-4">
              <CalendarView
                tasks={tasks}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onScheduleForDate={handleScheduleForDate}
              />
              <TaskList
                tasks={tasks}
                selectedDate={selectedDate}
                onClearDateFilter={() => setSelectedDate('')}
                onToggleComplete={handleToggleComplete}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddNewTask={handleAddNewTask}
              />
            </div>
          )}

          {mobileTab === 'tasks' && (
            <TaskList
              tasks={tasks}
              selectedDate={selectedDate}
              onClearDateFilter={() => setSelectedDate('')}
              onToggleComplete={handleToggleComplete}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddNewTask={handleAddNewTask}
            />
          )}

          {mobileTab === 'email' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Gmail অটোমেশন সেটিংস
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  আপনার সব নির্ধারিত কাজের নোটিফিকেশন স্বয়ংক্রিয়ভাবে পাঠানো হবে।
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleSendTestEmail}
                    disabled={isTestingEmail}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs"
                  >
                    {isTestingEmail ? 'পাঠানো হচ্ছে...' : '⚡ Test Email Now'}
                  </button>
                  <button
                    onClick={handleTriggerSweep}
                    disabled={isTriggeringSweep}
                    className="w-full py-3 bg-slate-100 text-slate-800 rounded-xl font-bold text-xs border border-slate-200"
                  >
                    {isTriggeringSweep ? 'চেক চলছে...' : '🔄 Run 3-Day Reminder Check Now'}
                  </button>
                  <button
                    onClick={() => setIsLogsModalOpen(true)}
                    className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-semibold text-xs border border-slate-200"
                  >
                    📜 ইমেইল লগ ও ইতিহাস দেখুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {mobileTab === 'logs' && (
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">ইমেইল ইতিহাস</h3>
                <button
                  onClick={fetchEmailLogs}
                  className="text-xs text-indigo-600 font-bold"
                >
                  রিফ্রেশ
                </button>
              </div>
              <div className="space-y-2">
                {emailLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">কোনো লগ নেই</p>
                ) : (
                  emailLogs.slice(0, 15).map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800">{log.subject}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {log.reminder_type} • {log.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        onQuickAdd={handleAddNewTask}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialDate={modalDate}
        taskToEdit={taskToEdit}
        user={user}
      />

      {/* Email History Logs Modal */}
      <EmailLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={emailLogs}
        onRefresh={fetchEmailLogs}
        isLoading={isLoadingLogs}
      />

      {/* Sweep Results Modal */}
      <SweepResultsModal
        isOpen={isSweepModalOpen}
        onClose={() => setIsSweepModalOpen(false)}
        results={sweepResults}
      />

      {/* Toast Notification Pill */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom duration-300 max-w-sm">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center space-x-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-rose-100 border-rose-700'
                : 'bg-slate-900/95 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
