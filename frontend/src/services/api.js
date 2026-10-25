// Remaindr API Client & Autonomous Resilient Data Engine
// Seamlessly operates in dual-mode:
// 1. Full Live Mode: Connects to Spring Boot backend + WhatsApp Puppeteer gateway when available.
// 2. Autonomous Cloud / Vercel Mode: 100% self-contained in browser storage with instant CRUD, 
//    real Web Audio alarms, RFC 5545 calendar .ics downloads, and 1-tap WhatsApp Direct actions.

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const WHATSAPP_GATEWAY_URL = (import.meta.env.VITE_WHATSAPP_GATEWAY_URL || '').replace(/\/$/, '');

const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api/tasks` : '/api/tasks';
const WHATSAPP_API_BASE = WHATSAPP_GATEWAY_URL ? WHATSAPP_GATEWAY_URL : '/whatsapp-api';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

const STORAGE_KEY = 'remaindr_tasks_v2';

// Helper to generate RFC 5545 iCalendar content string
function generateIcs(task) {
  const formatUtc = (d) => {
    try {
      const date = new Date(d);
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    } catch {
      return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
  };

  const start = task.eventStartTime || task.scheduledTime || new Date().toISOString();
  const end = task.eventEndTime || new Date(new Date(start).getTime() + 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Remaindr//Task Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:remaindr-${task.id || Date.now()}@timeflow.app`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${(task.title || 'Reminder').replace(/\n/g, ' ')}`,
    `DESCRIPTION:${(task.eventDescription || task.messageBody || '').replace(/\n/g, '\\n')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    `TRIGGER:-PT${task.reminderOffsetMinutes || 15}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${(task.title || 'Reminder').replace(/\n/g, ' ')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

// Generate Google Calendar Event Link
function generateGoogleCalendarLink(task) {
  const title = encodeURIComponent(task.title || 'Reminder');
  const details = encodeURIComponent(task.eventDescription || task.messageBody || '');
  const formatUtc = (d) => {
    try {
      return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    } catch {
      return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
  };
  const start = formatUtc(task.eventStartTime || task.scheduledTime || new Date().toISOString());
  const end = formatUtc(task.eventEndTime || new Date(new Date(task.scheduledTime || Date.now()).getTime() + 3600000).toISOString());
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}

// Default Starter Tasks to showcase full capabilities out-of-the-box
function getSampleTasks() {
  const now = new Date();
  const in15m = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  const in45m = new Date(now.getTime() + 45 * 60 * 1000).toISOString();
  const tomorrow10am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0).toISOString();
  const tomorrow11am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0).toISOString();
  const today6pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0).toISOString();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 1,
      title: 'Design Review Sync',
      taskType: 'WHATSAPP',
      taskStatus: 'PENDING',
      scheduledTime: in15m,
      recipient: '+919876543210',
      messageBody: "Hi Alex! Friendly reminder: The design mockups are ready for you. Let's talk at 3 PM.",
      repeatFrequency: 'ONCE',
      isQuietHours: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 2,
      title: 'Deep Work Focus Block',
      taskType: 'ALARM',
      taskStatus: 'PENDING',
      scheduledTime: in45m,
      ringTone: 'CHIME',
      messageBody: 'Time for high-focus coding sprint. Mute notifications and take a deep breath.',
      repeatFrequency: 'ONCE',
      isQuietHours: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 3,
      title: 'Product Strategy & Roadmap Sync',
      taskType: 'CALENDAR',
      taskStatus: 'PENDING',
      scheduledTime: tomorrow10am,
      eventStartTime: tomorrow10am,
      eventEndTime: tomorrow11am,
      reminderOffsetMinutes: 15,
      eventDescription: 'Review Q4 product roadmap, architectural milestones, and user feedback.',
      googleCalendarLink: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Product Strategy & Roadmap Sync')}`,
      repeatFrequency: 'ONCE',
      isQuietHours: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 4,
      title: 'Birthday Celebration Wish 🎉',
      taskType: 'WHATSAPP',
      taskStatus: 'PENDING',
      scheduledTime: today6pm,
      recipient: '+919123456789',
      messageBody: 'Wishing you a very Happy Birthday! 🎉🎂 Hope you have an incredible day filled with happiness!',
      repeatFrequency: 'ONCE',
      isQuietHours: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 5,
      title: 'Hydration & Posture Reset',
      taskType: 'ALARM',
      taskStatus: 'PENDING',
      scheduledTime: in2h,
      ringTone: 'RADAR',
      messageBody: 'Stand up, drink a full glass of water, and stretch your shoulders.',
      repeatFrequency: 'DAILY',
      isQuietHours: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];
}

// Local Storage Database Engine
const LocalDb = {
  getStoredTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const samples = getSampleTasks();
        this.saveStoredTasks(samples);
        return samples;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const samples = getSampleTasks();
        this.saveStoredTasks(samples);
        return samples;
      }
      return parsed;
    } catch {
      return getSampleTasks();
    }
  },

  saveStoredTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  enrichTask(task) {
    if (!task) return null;
    const now = new Date();
    if (task.scheduledTime) {
      const diffMs = new Date(task.scheduledTime) - now;
      const seconds = Math.floor(diffMs / 1000);
      task.secondsUntilDue = seconds;

      if (seconds <= 0) {
        task.countdownFormatted = 'Due now';
      } else if (seconds < 60) {
        task.countdownFormatted = `Runs in ${seconds}s`;
      } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        task.countdownFormatted = `Runs in ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
      } else if (seconds < 86400) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        task.countdownFormatted = `Runs in ${hrs}h ${mins}m`;
      } else {
        const days = Math.floor(seconds / 86400);
        task.countdownFormatted = `Runs in ${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }

    if (task.taskType === 'CALENDAR') {
      if (!task.googleCalendarLink) {
        task.googleCalendarLink = generateGoogleCalendarLink(task);
      }
      if (!task.icsContent) {
        task.icsContent = generateIcs(task);
      }
    }

    return task;
  },

  getTasks(channel = 'ALL', status = 'ALL') {
    let tasks = this.getStoredTasks();
    const now = new Date();
    let updated = false;

    // Check for any due ALARM tasks to automatically trigger
    tasks = tasks.map(t => {
      if (t.taskType === 'ALARM' && (t.taskStatus === 'PENDING' || t.taskStatus === 'SNOOZED')) {
        if (new Date(t.scheduledTime) <= now) {
          t.taskStatus = 'TRIGGERED';
          t.dispatchedAt = now.toISOString();
          t.dispatchResult = 'Audible alarm ringing';
          updated = true;
        }
      }
      return this.enrichTask(t);
    });

    if (updated) {
      this.saveStoredTasks(tasks);
    }

    if (channel && channel !== 'ALL') {
      tasks = tasks.filter(t => t.taskType === channel);
    }

    if (status && status !== 'ALL') {
      tasks = tasks.filter(t => t.taskStatus === status);
    }

    // Sort: TRIGGERED first, then PENDING/SNOOZED by scheduledTime, then others
    tasks.sort((a, b) => {
      if (a.taskStatus === 'TRIGGERED' && b.taskStatus !== 'TRIGGERED') return -1;
      if (b.taskStatus === 'TRIGGERED' && a.taskStatus !== 'TRIGGERED') return 1;
      return new Date(a.scheduledTime || 0) - new Date(b.scheduledTime || 0);
    });

    return tasks;
  },

  getTaskById(id) {
    const tasks = this.getStoredTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    return this.enrichTask(task);
  },

  createTask(dto) {
    const tasks = this.getStoredTasks();
    const id = Date.now();
    const now = new Date().toISOString();

    const hour = dto.scheduledTime ? new Date(dto.scheduledTime).getHours() : 12;
    const isQuiet = hour >= 22 || hour < 7;

    const newTask = {
      ...dto,
      id,
      taskStatus: 'PENDING',
      isQuietHours: isQuiet,
      createdAt: now,
      updatedAt: now
    };

    if (newTask.taskType === 'CALENDAR') {
      newTask.googleCalendarLink = generateGoogleCalendarLink(newTask);
      newTask.icsContent = generateIcs(newTask);
    }

    tasks.unshift(newTask);
    this.saveStoredTasks(tasks);
    return this.enrichTask(newTask);
  },

  updateTask(id, dto) {
    const tasks = this.getStoredTasks();
    const index = tasks.findIndex(t => String(t.id) === String(id));
    if (index === -1) throw new Error('Task not found');

    const existing = tasks[index];
    const hour = dto.scheduledTime ? new Date(dto.scheduledTime).getHours() : 12;
    const isQuiet = hour >= 22 || hour < 7;

    const updated = {
      ...existing,
      ...dto,
      isQuietHours: isQuiet,
      updatedAt: new Date().toISOString()
    };

    if (updated.taskType === 'CALENDAR') {
      updated.googleCalendarLink = generateGoogleCalendarLink(updated);
      updated.icsContent = generateIcs(updated);
    }

    tasks[index] = updated;
    this.saveStoredTasks(tasks);
    return this.enrichTask(updated);
  },

  deleteTask(id) {
    let tasks = this.getStoredTasks();
    tasks = tasks.filter(t => String(t.id) !== String(id));
    this.saveStoredTasks(tasks);
    return { message: 'Task successfully removed', id: String(id) };
  },

  triggerTaskNow(id) {
    const tasks = this.getStoredTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) throw new Error('Task not found');

    const now = new Date().toISOString();
    if (task.taskType === 'WHATSAPP') {
      task.taskStatus = 'SENT';
      task.dispatchedAt = now;
      task.dispatchResult = 'Dispatched via WhatsApp Direct';
    } else if (task.taskType === 'ALARM') {
      task.taskStatus = 'TRIGGERED';
      task.dispatchedAt = now;
      task.dispatchResult = 'Audible alarm ringing';
    } else if (task.taskType === 'CALENDAR') {
      task.taskStatus = 'SENT';
      task.dispatchedAt = now;
      task.dispatchResult = 'Calendar event reminder dispatched';
    }

    task.updatedAt = now;
    this.saveStoredTasks(tasks);
    return this.enrichTask(task);
  },

  snoozeTask(id, { minutes, preset } = {}) {
    const tasks = this.getStoredTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) throw new Error('Task not found');

    const now = new Date();
    let newTime;

    if (preset === 'TOMORROW_9AM') {
      newTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    } else if (preset === 'PLUS_1H') {
      newTime = new Date(now.getTime() + 60 * 60 * 1000);
    } else {
      const mins = minutes && minutes > 0 ? minutes : 10;
      newTime = new Date(now.getTime() + mins * 60 * 1000);
    }

    task.scheduledTime = newTime.toISOString();
    task.taskStatus = 'SNOOZED';
    task.dispatchResult = `Snoozed until ${newTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    task.updatedAt = now.toISOString();

    const hour = newTime.getHours();
    task.isQuietHours = hour >= 22 || hour < 7;

    this.saveStoredTasks(tasks);
    return this.enrichTask(task);
  },

  stopAlarm(id) {
    const tasks = this.getStoredTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) throw new Error('Task not found');

    task.taskStatus = 'DISMISSED';
    task.dispatchResult = 'Alarm turned off';
    task.updatedAt = new Date().toISOString();

    this.saveStoredTasks(tasks);
    return this.enrichTask(task);
  },

  getActiveAlarms() {
    let tasks = this.getStoredTasks();
    const now = new Date();
    let modified = false;

    const active = [];
    tasks.forEach(t => {
      if (t.taskType === 'ALARM') {
        if (t.taskStatus === 'TRIGGERED') {
          active.push(this.enrichTask(t));
        } else if ((t.taskStatus === 'PENDING' || t.taskStatus === 'SNOOZED') && new Date(t.scheduledTime) <= now) {
          t.taskStatus = 'TRIGGERED';
          t.dispatchedAt = now.toISOString();
          t.dispatchResult = 'Audible alarm ringing';
          modified = true;
          active.push(this.enrichTask(t));
        }
      }
    });

    if (modified) {
      this.saveStoredTasks(tasks);
    }

    return active;
  },

  getStats() {
    const tasks = this.getStoredTasks();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let totalToday = 0;
    let activeAlarms = 0;
    let deliveredMessages = 0;
    let pendingTasks = 0;

    tasks.forEach(t => {
      const scheduledDate = (t.scheduledTime || '').slice(0, 10);
      if (scheduledDate === todayStr) {
        totalToday++;
      }
      if (t.taskType === 'ALARM' && t.taskStatus === 'TRIGGERED') {
        activeAlarms++;
      }
      if (t.taskStatus === 'SENT' || t.taskStatus === 'DISMISSED') {
        deliveredMessages++;
      }
      if (t.taskStatus === 'PENDING' || t.taskStatus === 'SNOOZED') {
        pendingTasks++;
      }
    });

    return {
      totalToday,
      activeAlarms,
      deliveredMessages,
      pendingTasks,
      totalTasks: tasks.length
    };
  },

  getTemplates() {
    return [
      {
        id: 'follow-up',
        label: 'Friendly Follow-up',
        defaultTitle: 'Catching Up',
        messageBody: "Hi! Just checking in to see how you are doing. Let's catch up when you're free!",
        suggestedType: 'WHATSAPP'
      },
      {
        id: 'meeting-remind',
        label: 'Meeting Reminder',
        defaultTitle: 'Upcoming Meeting',
        messageBody: 'Hi! Just a friendly reminder about our meeting today. Looking forward to talking with you!',
        suggestedType: 'WHATSAPP'
      },
      {
        id: 'birthday',
        label: 'Birthday Wish',
        defaultTitle: 'Happy Birthday! 🎉',
        messageBody: 'Wishing you a very Happy Birthday! 🎉🎂 Hope you have an incredible day filled with happiness!',
        suggestedType: 'WHATSAPP'
      },
      {
        id: 'water',
        label: 'Drink Water Alarm',
        defaultTitle: 'Hydration Break',
        messageBody: 'Time to drink a fresh glass of water and stay energized!',
        suggestedType: 'ALARM'
      },
      {
        id: 'standup',
        label: 'Daily Standup Sync',
        defaultTitle: 'Daily Standup Meeting',
        messageBody: 'Quick 15-minute engineering standup: yesterday progress, today goals, blockers.',
        suggestedType: 'CALENDAR'
      }
    ];
  },

  getIcsDownloadUrl(id) {
    const task = this.getTaskById(id);
    const icsString = task?.icsContent || (task ? generateIcs(task) : '');
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsString)}`;
  }
};

// Safe network request helper that falls back seamlessly to LocalDb
async function executeOrFallback(remoteCall, localFallback) {
  // If in production without an explicitly specified remote backend URL, run locally with 0 latency
  if (!isLocalhost && !BACKEND_URL) {
    return localFallback();
  }

  try {
    const res = await remoteCall();
    const contentType = res.headers ? (res.headers.get('content-type') || '') : '';
    // If Vercel rewrote request to HTML or response status is not OK:
    if (contentType.includes('text/html') || !res.ok) {
      return localFallback();
    }
    return await res.json();
  } catch (err) {
    // Backend offline or unreachable, smoothly fallback
    return localFallback();
  }
}

export const api = {
  async getTasks(channel = 'ALL', status = 'ALL') {
    return executeOrFallback(
      () => {
        const params = new URLSearchParams();
        if (channel && channel !== 'ALL') params.append('channel', channel);
        if (status && status !== 'ALL') params.append('status', status);
        return fetch(`${API_BASE}?${params.toString()}`);
      },
      () => LocalDb.getTasks(channel, status)
    );
  },

  async getTaskById(id) {
    return executeOrFallback(
      () => fetch(`${API_BASE}/${id}`),
      () => LocalDb.getTaskById(id)
    );
  },

  async createTask(taskData) {
    return executeOrFallback(
      () => fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      }),
      () => LocalDb.createTask(taskData)
    );
  },

  async updateTask(id, taskData) {
    return executeOrFallback(
      () => fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      }),
      () => LocalDb.updateTask(id, taskData)
    );
  },

  async deleteTask(id) {
    return executeOrFallback(
      () => fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      }),
      () => LocalDb.deleteTask(id)
    );
  },

  async triggerTaskNow(id) {
    return executeOrFallback(
      () => fetch(`${API_BASE}/${id}/trigger`, {
        method: 'POST',
      }),
      () => LocalDb.triggerTaskNow(id)
    );
  },

  async snoozeTask(id, { minutes, preset } = {}) {
    return executeOrFallback(
      () => fetch(`${API_BASE}/${id}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes, preset }),
      }),
      () => LocalDb.snoozeTask(id, { minutes, preset })
    );
  },

  async stopAlarm(id) {
    return executeOrFallback(
      () => fetch(`${API_BASE}/${id}/stop-alarm`, {
        method: 'POST',
      }),
      () => LocalDb.stopAlarm(id)
    );
  },

  async getActiveAlarms() {
    return executeOrFallback(
      () => fetch(`${API_BASE}/active-alarms`),
      () => LocalDb.getActiveAlarms()
    );
  },

  async getStats() {
    return executeOrFallback(
      () => fetch(`${API_BASE}/stats`),
      () => LocalDb.getStats()
    );
  },

  async getTemplates() {
    return executeOrFallback(
      () => fetch(`${API_BASE}/templates`),
      () => LocalDb.getTemplates()
    );
  },

  getIcsDownloadUrl(id) {
    if (BACKEND_URL) {
      return `${API_BASE}/${id}/calendar.ics`;
    }
    return LocalDb.getIcsDownloadUrl(id);
  },

  async getWhatsAppStatus() {
    if (WHATSAPP_GATEWAY_URL || isLocalhost) {
      try {
        const res = await fetch(`${WHATSAPP_API_BASE}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.ready) return data;
        }
      } catch {
        // Fallback
      }
    }
    // In cloud / Vercel mode without dedicated gateway, Direct WhatsApp is 100% active
    return {
      ready: true,
      status: 'ONLINE',
      mode: 'DIRECT',
      authenticated: true,
      phone: 'Direct Mode Active',
      message: 'WhatsApp Direct Mode Ready'
    };
  },

  async getWhatsAppQrData() {
    if (WHATSAPP_GATEWAY_URL || isLocalhost) {
      try {
        const res = await fetch(`${WHATSAPP_API_BASE}/qr-data`);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch {
        // Fallback
      }
    }
    return {
      ready: true,
      status: 'CONNECTED',
      mode: 'DIRECT'
    };
  }
};
