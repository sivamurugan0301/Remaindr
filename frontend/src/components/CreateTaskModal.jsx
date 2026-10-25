import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Moon, 
  Sparkles, 
  Volume2, 
  Clock, 
  Check, 
  AlertCircle,
  QrCode,
  Smartphone,
  Globe,
  ExternalLink
} from 'lucide-react';
import { soundService } from '../services/soundService';

export default function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onCreateTask, 
  initialTask = null, 
  templates = [],
  whatsAppStatus,
  onOpenWhatsAppModal
}) {
  if (!isOpen) return null;

  const isEditMode = Boolean(initialTask && initialTask.id);

  const [activeChannel, setActiveChannel] = useState('WHATSAPP');
  const [title, setTitle] = useState('');
  const [phone10, setPhone10] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // Date and 12-Hour Time States
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeHour, setTimeHour] = useState(10);
  const [timeMinute, setTimeMinute] = useState('00');
  const [timePeriod, setTimePeriod] = useState('AM');

  // Calendar Event End Time (12-Hour)
  const [endHour, setEndHour] = useState(11);
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('AM');

  const [reminderOffset, setReminderOffset] = useState(15);
  const [ringTone, setRingTone] = useState('CHIME');
  const [repeatFrequency, setRepeatFrequency] = useState('ONCE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Helper to convert 12-hour (h, m, period) to 24-hour "HH:MM"
  const get24HourString = (h12, mStr, period) => {
    let h = parseInt(h12, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(mStr).padStart(2, '0')}`;
  };

  // Helper to parse Date/ISO into 12-hour values
  const parseTo12Hour = (dateObj) => {
    let h = dateObj.getHours();
    const m = String(dateObj.getMinutes()).padStart(2, '0');
    const p = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: h, minute: m, period: p };
  };

  // Populate data when modal opens or initialTask changes
  useEffect(() => {
    if (initialTask && initialTask.id) {
      // Edit Mode: Pre-fill existing task details
      setTitle(initialTask.title || '');
      setActiveChannel(initialTask.taskType || 'WHATSAPP');

      // WhatsApp recipient: extract 10 digits
      if (initialTask.recipient) {
        const digits = initialTask.recipient.replace(/\D/g, '');
        setPhone10(digits.length >= 10 ? digits.slice(-10) : digits);
      } else {
        setPhone10('');
      }

      setMessageBody(initialTask.messageBody || initialTask.eventDescription || '');
      setReminderOffset(initialTask.reminderOffsetMinutes || 15);
      setRingTone(initialTask.ringTone || 'CHIME');
      setRepeatFrequency(initialTask.repeatFrequency || 'ONCE');

      // Scheduled Date and Time
      if (initialTask.scheduledTime) {
        const d = new Date(initialTask.scheduledTime);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setScheduledDate(`${yyyy}-${mm}-${dd}`);

        const { hour, minute, period } = parseTo12Hour(d);
        setTimeHour(hour);
        setTimeMinute(minute);
        setTimePeriod(period);
      }

      // Event End Time for Calendar
      if (initialTask.eventEndTime) {
        const endD = new Date(initialTask.eventEndTime);
        const { hour, minute, period } = parseTo12Hour(endD);
        setEndHour(hour);
        setEndMinute(minute);
        setEndPeriod(period);
      }
    } else {
      // Create Mode: Set defaults
      setTitle('');
      setPhone10('');
      setMessageBody('');
      setRepeatFrequency('ONCE');
      setRingTone('CHIME');
      setReminderOffset(15);

      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      setScheduledDate(`${yyyy}-${mm}-${dd}`);

      const { hour, minute, period } = parseTo12Hour(now);
      setTimeHour(hour);
      // Round to nearest 5 minutes for clean selector
      const roundedM = Math.round(parseInt(minute, 10) / 5) * 5;
      setTimeMinute(String(roundedM % 60).padStart(2, '0'));
      setTimePeriod(period);

      // End time +1 hour
      const endNow = new Date(now.getTime() + 60 * 60 * 1000);
      const endParsed = parseTo12Hour(endNow);
      setEndHour(endParsed.hour);
      setEndMinute(endParsed.minute);
      setEndPeriod(endParsed.period);
    }
    setError('');
  }, [isOpen, initialTask]);

  // Check if scheduled time falls within Rest Hours (10:00 PM to 7:00 AM)
  const isQuietHours = () => {
    let h = parseInt(timeHour, 10);
    if (timePeriod === 'PM' && h < 12) h += 12;
    if (timePeriod === 'AM' && h === 12) h = 0;
    return h >= 22 || h < 7;
  };

  // Channel tabs metadata (WhatsApp, Google Calendar, Sound Alarm)
  const channelTabs = [
    {
      id: 'WHATSAPP',
      label: 'WhatsApp',
      icon: MessageSquare,
      color: 'text-emerald-600',
      activeBg: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
      description: 'Send a scheduled WhatsApp message',
    },
    {
      id: 'CALENDAR',
      label: 'Google Calendar',
      icon: Calendar,
      color: 'text-purple-600',
      activeBg: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
      description: 'Save meeting or event to Google Calendar',
    },
    {
      id: 'ALARM',
      label: 'Sound Alarm',
      icon: Bell,
      color: 'text-amber-600',
      activeBg: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
      description: 'Audible chime on this screen with snooze',
    },
  ];

  // Quick fill template handler
  const handleApplyTemplate = (template) => {
    setTitle(template.defaultTitle || template.label);
    setMessageBody(template.messageBody || '');
    if (template.suggestedType) {
      setActiveChannel(template.suggestedType);
    }
  };

  // Test selected tone audio
  const handleTestSound = (tone) => {
    soundService.playTone(tone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please give your reminder a title.');
      return;
    }

    if (activeChannel === 'WHATSAPP') {
      if (!phone10.trim() || phone10.trim().length !== 10) {
        setError('Please enter a valid 10-digit mobile number for WhatsApp.');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const scheduledTime24 = get24HourString(timeHour, timeMinute, timePeriod);
      const scheduledIso = `${scheduledDate}T${scheduledTime24}:00`;
      
      let eventStartIso = null;
      let eventEndIso = null;

      if (activeChannel === 'CALENDAR') {
        const endTime24 = get24HourString(endHour, endMinute, endPeriod);
        eventStartIso = scheduledIso;
        eventEndIso = `${scheduledDate}T${endTime24}:00`;
      }

      const payload = {
        title: title.trim(),
        taskType: activeChannel,
        scheduledTime: scheduledIso,
        recipient: activeChannel === 'WHATSAPP' ? `+91${phone10.trim()}` : '',
        messageBody: messageBody.trim(),
        eventDescription: messageBody.trim(),
        eventStartTime: eventStartIso,
        eventEndTime: eventEndIso,
        reminderOffsetMinutes: parseInt(reminderOffset, 10),
        ringTone: ringTone,
        repeatFrequency: repeatFrequency,
      };

      await onCreateTask(payload, initialTask?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save reminder. Please double-check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // All 60 minutes one by one (00 to 59) and 12 hours
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md sm:max-w-[460px] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 text-xs sm:text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {isEditMode ? 'Edit Reminder' : 'Create New Reminder'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditMode 
                ? 'Update details for this scheduled reminder.' 
                : 'Choose your reminder type and pick a time.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestions Bar (shown in Create mode) */}
        {!isEditMode && templates.length > 0 && (
          <div className="px-4 sm:px-5 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 shrink-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-900 dark:text-indigo-200 tracking-wide uppercase">
                Quick Suggestions:
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200/90 dark:border-indigo-700/80 shadow-xs transition-all cursor-pointer"
                >
                  + {tpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-4 py-3 sm:px-5 sm:py-3.5 space-y-2.5 flex-1">

          {/* Reminder Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Reminder Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {channelTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeChannel === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveChannel(tab.id)}
                    className={`flex flex-col items-center justify-center text-center p-2 rounded-xl border text-xs font-semibold transition-all min-h-[56px] cursor-pointer ${
                      isSelected
                        ? `${tab.activeBg} ring-2 ring-indigo-500/20 shadow-xs`
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-0.5 ${isSelected ? tab.color : 'text-slate-400'}`} />
                    <span className="leading-tight text-[11px] font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rest Hours Gentle Warning */}
          {isQuietHours() && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <Moon className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold">Late Night Reminder</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  This reminder is set between 10:00 PM and 7:00 AM. Keep in mind it will alert during rest hours.
                </p>
              </div>
            </div>
          )}

          {/* Reminder Title */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reminder Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeChannel === 'ALARM' 
                  ? 'e.g. Drink water & stretch' 
                  : activeChannel === 'CALENDAR' 
                  ? 'e.g. Lunch with Sarah' 
                  : 'e.g. Follow up on project'
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* WhatsApp Phone Number with Static +91 Prefix */}
          {activeChannel === 'WHATSAPP' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-0.5">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  WhatsApp Phone Number
                </label>
                <span 
                  title={whatsAppStatus?.ready ? "WhatsApp Connected" : "WhatsApp Disconnected (Click to Connect QR)"}
                  onClick={() => {
                    if (!whatsAppStatus?.ready && onOpenWhatsAppModal) {
                      onOpenWhatsAppModal();
                    }
                  }}
                  className={`w-2 h-2 rounded-full cursor-pointer inline-block ${
                    whatsAppStatus?.ready 
                      ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' 
                      : 'bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]'
                  }`}
                />
              </div>
              <div className="flex items-center rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <span className="px-3 py-2 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-mono font-bold text-xs sm:text-sm border-r border-slate-200 dark:border-slate-700/80 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone10}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone10(digits);
                  }}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Alarm Sound Tone (for Alarms) */}
          {activeChannel === 'ALARM' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Alarm Sound
                </label>
                <button
                  type="button"
                  onClick={() => handleTestSound(ringTone)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Preview Tone</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CHIME', name: 'Chime', desc: 'Melodic & Clear' },
                  { id: 'BEEP', name: 'Beep', desc: 'Crisp & Loud' },
                  { id: 'GENTLE', name: 'Gentle', desc: 'Soft & Calming' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => {
                      setRingTone(tone.id);
                      handleTestSound(tone.id);
                    }}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      ringTone === tone.id
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tone.name}</span>
                      {ringTone === tone.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{tone.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date and 12-Hour AM/PM Time Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeChannel === 'CALENDAR' ? 'Event Date' : 'Date'}
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeChannel === 'CALENDAR' ? 'Start Time (12h)' : 'Time (12h)'}
              </label>
              
              {/* 12-Hour Selector: Hour : Minute + AM/PM toggle */}
              <div className="flex items-center gap-1 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-0.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                {/* Hour */}
                <select
                  value={timeHour}
                  onChange={(e) => setTimeHour(Number(e.target.value))}
                  style={{ colorScheme: 'light dark' }}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
                >
                  {hourOptions.map((h) => (
                    <option key={h} value={h} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>

                <span className="font-bold text-slate-500 dark:text-slate-300 select-none px-0.5">:</span>

                {/* Minute (one by one from 00 to 59) */}
                <select
                  value={timeMinute}
                  onChange={(e) => setTimeMinute(e.target.value)}
                  style={{ colorScheme: 'light dark' }}
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
                >
                  {minuteOptions.map((m) => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {m}
                    </option>
                  ))}
                </select>

                {/* AM / PM Segmented Toggle */}
                <div className="flex items-center ml-auto bg-slate-200/80 dark:bg-slate-700/80 rounded-lg p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTimePeriod('AM')}
                    className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      timePeriod === 'AM'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimePeriod('PM')}
                    className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      timePeriod === 'PM'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Calendar End Time (12-Hour) & Reminder Offset */}
          {activeChannel === 'CALENDAR' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time (12h)
                </label>
                <div className="flex items-center gap-1 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-0.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    style={{ colorScheme: 'light dark' }}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
                  >
                    {hourOptions.map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {String(h).padStart(2, '0')}
                      </option>
                    ))}
                  </select>

                  <span className="font-bold text-slate-500 dark:text-slate-300 select-none px-0.5">:</span>

                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    style={{ colorScheme: 'light dark' }}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-xs"
                  >
                    {minuteOptions.map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {m}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center ml-auto bg-slate-200/80 dark:bg-slate-700/80 rounded-lg p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEndPeriod('AM')}
                      className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        endPeriod === 'AM'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndPeriod('PM')}
                      className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                        endPeriod === 'PM'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notify Me
                </label>
                <select
                  value={reminderOffset}
                  onChange={(e) => setReminderOffset(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value={5}>5 min before</option>
                  <option value={15}>15 min before</option>
                  <option value={30}>30 min before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                </select>
              </div>
            </div>
          )}

          {/* Message / Note */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {activeChannel === 'ALARM' ? 'Alarm Screen Note' : activeChannel === 'CALENDAR' ? 'Event Description' : 'Message Text'}
            </label>
            <textarea
              rows={2}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder={
                activeChannel === 'ALARM'
                  ? 'Add a short note to show on screen when the alarm rings...'
                  : activeChannel === 'CALENDAR'
                  ? 'Add meeting notes or details...'
                  : 'Write your message text here...'
              }
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Repeat Frequency */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Repeat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ONCE', label: 'Once' },
                { id: 'DAILY', label: 'Daily' },
                { id: 'WEEKLY', label: 'Weekly' },
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setRepeatFrequency(freq.id)}
                  className={`py-1.5 px-1 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                    repeatFrequency === freq.id
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4.5 py-1.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Set Reminder')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
