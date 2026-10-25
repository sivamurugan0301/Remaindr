// API Client for Remaindr Backend
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const WHATSAPP_GATEWAY_URL = (import.meta.env.VITE_WHATSAPP_GATEWAY_URL || '').replace(/\/$/, '');

const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api/tasks` : '/api/tasks';
const WHATSAPP_API_BASE = WHATSAPP_GATEWAY_URL ? WHATSAPP_GATEWAY_URL : '/whatsapp-api';

export const api = {
  async getTasks(channel = 'ALL', status = 'ALL') {
    const params = new URLSearchParams();
    if (channel && channel !== 'ALL') params.append('channel', channel);
    if (status && status !== 'ALL') params.append('status', status);
    
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async getTaskById(id) {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch task');
    return res.json();
  },

  async createTask(taskData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create task');
    }
    return res.json();
  },

  async updateTask(id, taskData) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },

  async triggerTaskNow(id) {
    const res = await fetch(`${API_BASE}/${id}/trigger`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger task');
    return res.json();
  },

  async snoozeTask(id, { minutes, preset } = {}) {
    const res = await fetch(`${API_BASE}/${id}/snooze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes, preset }),
    });
    if (!res.ok) throw new Error('Failed to snooze task');
    return res.json();
  },

  async stopAlarm(id) {
    const res = await fetch(`${API_BASE}/${id}/stop-alarm`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to stop alarm');
    return res.json();
  },

  async getActiveAlarms() {
    const res = await fetch(`${API_BASE}/active-alarms`);
    if (!res.ok) return [];
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getTemplates() {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) return [];
    return res.json();
  },

  getIcsDownloadUrl(id) {
    return `${API_BASE}/${id}/calendar.ics`;
  },

  async getWhatsAppStatus() {
    try {
      const res = await fetch(`${WHATSAPP_API_BASE}/status`);
      if (!res.ok) return { ready: false, status: 'OFFLINE' };
      return res.json();
    } catch {
      return { ready: false, status: 'OFFLINE' };
    }
  },

  async getWhatsAppQrData() {
    try {
      const res = await fetch(`${WHATSAPP_API_BASE}/qr-data`);
      if (!res.ok) return { ready: false, status: 'OFFLINE' };
      return res.json();
    } catch {
      return { ready: false, status: 'OFFLINE' };
    }
  }
};
