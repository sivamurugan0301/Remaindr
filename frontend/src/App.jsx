import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';
import AlarmAlertBanner from './components/AlarmAlertBanner';
import WhatsAppConnectModal from './components/WhatsAppConnectModal';
import { api } from './services/api';
import { 
  Clock, 
  Calendar, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  RefreshCw,
  Bell,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('remaindr_theme') === 'dark' ||
      (!('remaindr_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('remaindr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('remaindr_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  // Core Data State
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    activeAlarms: 0,
    deliveredMessages: 0,
    pendingTasks: 0,
    totalTasks: 0,
  });
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Alarm
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState({ ready: false, status: 'CHECKING' });

  // Toasts
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch tasks and stats from backend
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [tasksData, statsData, templatesData, activeAlarmsData, waStatusData] = await Promise.all([
        api.getTasks(selectedChannel, selectedStatus),
        api.getStats(),
        api.getTemplates(),
        api.getActiveAlarms(),
        api.getWhatsAppStatus(),
      ]);

      setTasks(tasksData);
      setStats(statsData);
      setTemplates(templatesData);
      setWhatsAppStatus(waStatusData);

      // Check for active ringing alarms
      if (activeAlarmsData && activeAlarmsData.length > 0) {
        setActiveAlarm(activeAlarmsData[0]);
      } else {
        setActiveAlarm(null);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError('Unable to load reminders right now. Please check if the service is running.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel, selectedStatus]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling every 3 seconds for background updates and active alarms
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const [activeAlarmsData, statsData] = await Promise.all([
          api.getActiveAlarms(),
          api.getStats(),
        ]);

        setStats(statsData);

        if (activeAlarmsData && activeAlarmsData.length > 0) {
          setActiveAlarm(activeAlarmsData[0]);
        } else {
          setActiveAlarm(null);
        }

        // Silent refresh of tasks & WhatsApp status
        const [freshTasks, freshWaStatus] = await Promise.all([
          api.getTasks(selectedChannel, selectedStatus),
          api.getWhatsAppStatus(),
        ]);
        setTasks(freshTasks);
        setWhatsAppStatus(freshWaStatus);
      } catch (err) {
        // Silent catch during background poll
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedChannel, selectedStatus]);

  // Live countdown clock ticker (updates every second for real-time countdown badges)
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(t => {
          if (!t.scheduledTime || (t.taskStatus !== 'PENDING' && t.taskStatus !== 'SNOOZED')) {
            return t;
          }
          const diffMs = new Date(t.scheduledTime) - new Date();
          const seconds = Math.floor(diffMs / 1000);

          let countdownFormatted = 'Due now';
          if (seconds <= 0) {
            countdownFormatted = 'Due now';
          } else if (seconds < 60) {
            countdownFormatted = `In ${seconds}s`;
          } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            countdownFormatted = `In ${mins} ${mins === 1 ? 'min' : 'mins'}`;
          } else if (seconds < 86400) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            countdownFormatted = `In ${hrs}h ${mins}m`;
          } else {
            const days = Math.floor(seconds / 86400);
            countdownFormatted = `In ${days} ${days === 1 ? 'day' : 'days'}`;
          }

          return { ...t, secondsUntilDue: seconds, countdownFormatted };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsCreateModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreateModalOpen(true);
  };

  const handleSaveTask = async (taskPayload, taskId) => {
    if (taskId) {
      const updated = await api.updateTask(taskId, taskPayload);
      showToast(`Reminder "${updated.title}" updated successfully!`, 'success');
    } else {
      const created = await api.createTask(taskPayload);
      showToast(`Reminder "${created.title}" scheduled!`, 'success');
    }
    await fetchData();
  };

  const handleTriggerNow = async (id) => {
    try {
      const updated = await api.triggerTaskNow(id);
      showToast(`Reminder "${updated.title}" activated!`, 'success');

      // If it's a WhatsApp task with a recipient, open WhatsApp directly
      if (updated.taskType === 'WHATSAPP' && updated.recipient) {
        const cleanNumber = updated.recipient.replace(/\D/g, '');
        const text = encodeURIComponent(updated.messageBody || '');
        const waUrl = `https://wa.me/${cleanNumber}?text=${text}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }

      await fetchData();
    } catch (err) {
      showToast('Could not start reminder', 'error');
    }
  };

  const handleSnooze = async (id, { minutes, preset }) => {
    try {
      await api.snoozeTask(id, { minutes, preset });
      showToast(`Reminder snoozed for ${minutes ? minutes + ' minutes' : 'later'}!`, 'info');
      await fetchData();
    } catch (err) {
      showToast('Could not snooze reminder', 'error');
    }
  };

  const handleStopAlarm = async (id) => {
    try {
      await api.stopAlarm(id);
      setActiveAlarm(null);
      showToast('Alarm turned off.', 'success');
      await fetchData();
    } catch (err) {
      showToast('Could not stop alarm', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await api.deleteTask(id);
      showToast('Reminder deleted.', 'info');
      await fetchData();
    } catch (err) {
      showToast('Could not delete reminder', 'error');
    }
  };

  // Filter tasks by client search query and arrange upcoming first according to time
  const filteredTasks = tasks
    .filter(task => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (task.title && task.title.toLowerCase().includes(q)) ||
        (task.recipient && task.recipient.toLowerCase().includes(q)) ||
        (task.messageBody && task.messageBody.toLowerCase().includes(q)) ||
        (task.eventDescription && task.eventDescription.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const aTriggered = a.taskStatus === 'TRIGGERED';
      const bTriggered = b.taskStatus === 'TRIGGERED';
      if (aTriggered && !bTriggered) return -1;
      if (bTriggered && !aTriggered) return 1;

      const aUpcoming = a.taskStatus === 'PENDING' || a.taskStatus === 'SNOOZED';
      const bUpcoming = b.taskStatus === 'PENDING' || b.taskStatus === 'SNOOZED';
      if (aUpcoming && !bUpcoming) return -1;
      if (bUpcoming && !aUpcoming) return 1;

      const aTime = a.scheduledTime ? new Date(a.scheduledTime).getTime() : 0;
      const bTime = b.scheduledTime ? new Date(b.scheduledTime).getTime() : 0;

      if (aUpcoming && bUpcoming) {
        return aTime - bTime; // Upcoming arranged first according to time
      }
      return bTime - aTime; // Completed/past arranged most recent first
    });

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        onOpenCreateModal={handleOpenCreateModal}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        activeAlarmsCount={stats.activeAlarms}
        whatsAppStatus={whatsAppStatus}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Friendly Banner Announcement */}
        <div className="relative mb-8 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-500/15 overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Your Personal Reminder Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Never Miss What Matters Most
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 mt-2.5 leading-relaxed max-w-2xl">
              Easily manage WhatsApp messages, Google Calendar events, and loud alarms — all in one simple, beautiful place.
            </p>
            <div className="mt-5">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-indigo-700 hover:bg-indigo-50 shadow-md shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create New Reminder</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium text-white border ${
              toast.type === 'error'
                ? 'bg-rose-600 border-rose-500 shadow-rose-600/30'
                : toast.type === 'info'
                ? 'bg-indigo-600 border-indigo-500 shadow-indigo-600/30'
                : 'bg-emerald-600 border-emerald-500 shadow-emerald-600/30'
            }`}>
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Friendly Error Warning */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-semibold">Connection Notice</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Dashboard Cards */}
        <StatsCards 
          stats={stats} 
          onFilterSelect={(channel) => {
            setSelectedChannel(channel);
          }} 
        />

        {/* Filter and Search Bar */}
        <FilterBar
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={fetchData}
          isLoading={isLoading}
          totalTasksCount={filteredTasks.length}
        />

        {/* Reminder Cards Grid */}
        {isLoading && tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-medium">Loading your reminders...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              No reminders found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery
                ? 'No reminders match your search. Try typing something else or clearing the search.'
                : 'Your schedule is clear! Create a message reminder, calendar event, or alarm.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedChannel('ALL');
                setSelectedStatus('ALL');
                handleOpenCreateModal();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Reminder</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onRefresh={fetchData}
                onTriggerNow={handleTriggerNow}
                onSnooze={handleSnooze}
                onDelete={handleDelete}
                onStopAlarm={handleStopAlarm}
                onEdit={handleEditTask}
                whatsAppStatus={whatsAppStatus}
                onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Remaindr</span>
            <span>&bull;</span>
            <span>Simple, Smart Reminders for Everyday Life</span>
          </div>
          <div className="font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
            All Rights Reserved
          </div>
        </div>
      </footer>

      {/* Reminder Creation & Edit Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onCreateTask={handleSaveTask}
        initialTask={editingTask}
        templates={templates}
        whatsAppStatus={whatsAppStatus}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
      />

      {/* Active Audible Alarm Screen Overlay Banner */}
      <AlarmAlertBanner
        activeAlarm={activeAlarm}
        onStopAlarm={handleStopAlarm}
        onSnoozeAlarm={handleSnooze}
      />

      {/* WhatsApp QR Connection Modal */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onConnected={() => {
          fetchData();
        }}
      />

    </div>
  );
}

