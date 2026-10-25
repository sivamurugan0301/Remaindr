import React, { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Bell, 
  Moon, 
  Clock, 
  Play, 
  Pencil,
  Trash2, 
  Download, 
  ExternalLink,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Repeat,
  QrCode,
  Smartphone
} from 'lucide-react';
import { api } from '../services/api';

export default function TaskCard({ 
  task, 
  onRefresh, 
  onTriggerNow, 
  onSnooze, 
  onDelete, 
  onStopAlarm,
  onEdit,
  whatsAppStatus,
  onOpenWhatsAppModal
}) {
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isWhatsAppConnected = whatsAppStatus?.ready === true;

  // Channel configuration (WhatsApp, Google Calendar, Sound Alarm)
  const channelConfig = {
    WHATSAPP: {
      name: 'WhatsApp',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: MessageSquare,
      iconBg: 'bg-emerald-500',
    },
    CALENDAR: {
      name: 'Calendar Event',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: Calendar,
      iconBg: 'bg-purple-500',
    },
    ALARM: {
      name: 'Sound Alarm',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Bell,
      iconBg: 'bg-amber-500',
    },
  }[task.taskType] || {
    name: task.taskType,
    badgeColor: 'bg-slate-100 text-slate-700',
    icon: Clock,
    iconBg: 'bg-slate-500',
  };

  const ChannelIcon = channelConfig.icon;

  // Status configuration
  const statusConfig = {
    PENDING: {
      label: 'Upcoming',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotClass: 'bg-amber-500',
    },
    TRIGGERED: {
      label: 'Ringing Now',
      badgeClass: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700 animate-pulse',
      dotClass: 'bg-rose-500 animate-ping',
    },
    SENT: {
      label: 'Sent',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
    },
    RUNNING: {
      label: 'Sending...',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      dotClass: 'bg-indigo-500 animate-ping',
    },
    SNOOZED: {
      label: 'Snoozed',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      dotClass: 'bg-indigo-500',
    },
    DISMISSED: {
      label: 'Completed',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    },
    FAILED: {
      label: 'Failed',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dotClass: 'bg-rose-500',
    },
  }[task.taskStatus] || {
    label: task.taskStatus,
    badgeClass: 'bg-slate-100 text-slate-600',
    dotClass: 'bg-slate-400',
  };

  // Human-friendly date and time formatter
  const formatTime = (isoString) => {
    if (!isoString) return 'Not set';
    const date = new Date(isoString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Tomorrow, ${timeStr}`;
    if (diffDays === -1) return `Yesterday, ${timeStr}`;

    const dateStr = date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr}, ${timeStr}`;
  };

  // Format calendar start and end times cleanly
  const formatEventTimes = (startIso, endIso) => {
    if (!startIso) return '';
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : null;
    const startStr = start.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    if (!end) return startStr;
    const endStr = end.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startStr} – ${endStr}`;
  };

  const handleAction = async (actionFn) => {
    try {
      setIsProcessing(true);
      await actionFn();
    } finally {
      setIsProcessing(false);
    }
  };

  const isTriggeredAlarm = task.taskType === 'ALARM' && task.taskStatus === 'TRIGGERED';
  const isPendingOrSnoozed = task.taskStatus === 'PENDING' || task.taskStatus === 'SNOOZED';

  // Computed status label (combining countdown cleanly when pending)
  const getStatusDisplay = () => {
    if (task.taskStatus === 'PENDING' && task.countdownFormatted) {
      return {
        label: `In ${task.countdownFormatted}`,
        badgeClass: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/70',
        dotClass: 'bg-indigo-500',
      };
    }
    return statusConfig;
  };

  const currentStatus = getStatusDisplay();

  return (
    <div className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 p-5 shadow-sm hover:shadow-md flex flex-col justify-between gap-3.5 ${
      isTriggeredAlarm
        ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/30'
        : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    }`}>
      
      {/* Top Section: Header & Content */}
      <div className="space-y-3">
        
        {/* Header: Channel badge (left) & Unified Status badge (right) */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Channel Badge with subtle WhatsApp indicator dot */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${channelConfig.badgeColor}`}>
            <ChannelIcon className="w-3.5 h-3.5" />
            <span>{channelConfig.name}</span>
            {task.taskType === 'WHATSAPP' && (
              <span 
                title={isWhatsAppConnected ? "WhatsApp: Connected" : "WhatsApp: Disconnected (Click to Connect QR)"}
                onClick={(e) => {
                  if (!isWhatsAppConnected && onOpenWhatsAppModal) {
                    e.stopPropagation();
                    onOpenWhatsAppModal();
                  }
                }}
                className={`w-2 h-2 rounded-full cursor-pointer ml-0.5 inline-block ${
                  isWhatsAppConnected 
                    ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' 
                    : 'bg-rose-500 animate-pulse shadow-[0_0_6px_#f43f5e]'
                }`} 
              />
            )}
          </div>

          {/* Unified Status Badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${currentStatus.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotClass}`} />
            <span>{currentStatus.label}</span>
          </div>

        </div>

        {/* Reminder Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
          {task.title}
        </h3>

        {/* Clean, Icon-Led Details (No rigid Send To/Remind At tables) */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          
          {/* Scheduled Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatTime(task.scheduledTime)}
            </span>
            {task.repeatFrequency && task.repeatFrequency !== 'ONCE' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <Repeat className="w-2.5 h-2.5" />
                <span>Repeats {task.repeatFrequency.toLowerCase()}</span>
              </span>
            )}
          </div>

          {/* Recipient for WhatsApp */}
          {task.recipient && (
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">{task.recipient}</span>
            </div>
          )}

          {/* Calendar Event Times */}
          {task.taskType === 'CALENDAR' && task.eventStartTime && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                {formatEventTimes(task.eventStartTime, task.eventEndTime)}
              </span>
              {task.reminderOffsetMinutes && (
                <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                  ({task.reminderOffsetMinutes}m alert)
                </span>
              )}
            </div>
          )}

          {/* Alarm Ringtone */}
          {task.taskType === 'ALARM' && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium capitalize">
                {task.ringTone ? task.ringTone.toLowerCase() : 'chime'} sound
              </span>
            </div>
          )}

        </div>

        {/* Message / Note Content Box */}
        {(task.messageBody || task.eventDescription) && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {task.messageBody || task.eventDescription}
          </div>
        )}

        {/* Delivery Confirmation */}
        {task.dispatchResult && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{task.dispatchResult}</span>
          </div>
        )}

      </div>

      {/* Action Toolbar Footer (Clean Single-Row Layout) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        
        {/* Left: Primary Context Actions */}
        <div className="flex items-center gap-2">
          
          {/* Active Triggered Alarm Controls */}
          {isTriggeredAlarm && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction(() => onStopAlarm(task.id))}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Turn Off
              </button>
              <button
                onClick={() => handleAction(() => onSnooze(task.id, { minutes: 10, preset: 'PLUS_10M' }))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all cursor-pointer"
              >
                Snooze 10m
              </button>
            </div>
          )}

          {/* Pending Alarm: Test Ring */}
          {!isTriggeredAlarm && task.taskType === 'ALARM' && isPendingOrSnoozed && (
            <button
              onClick={() => handleAction(() => onTriggerNow(task.id))}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200/50 dark:border-amber-800/50 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Ring Now</span>
            </button>
          )}

          {/* WhatsApp Actions */}
          {task.taskType === 'WHATSAPP' && (
            <div className="flex items-center gap-1.5">
              {!isWhatsAppConnected ? (
                <button
                  type="button"
                  onClick={() => onOpenWhatsAppModal && onOpenWhatsAppModal()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Connect QR</span>
                </button>
              ) : (
                isPendingOrSnoozed && (
                  <button
                    onClick={() => handleAction(() => onTriggerNow(task.id))}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/50 transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Send Now</span>
                  </button>
                )
              )}

              {task.recipient && (
                <a
                  href={`https://wa.me/${task.recipient.replace(/\D/g, '')}?text=${encodeURIComponent(task.messageBody || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/60 transition-all"
                  title="Open directly in WhatsApp"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          )}

          {/* Calendar Actions */}
          {task.taskType === 'CALENDAR' && (
            <div className="flex items-center gap-1.5">
              {task.googleCalendarLink && (
                <a
                  href={task.googleCalendarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/50 dark:border-purple-800/50 transition-all"
                  title="Open in Google Calendar"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Calendar</span>
                </a>
              )}

              <a
                href={api.getIcsDownloadUrl(task.id)}
                download={`reminder-event-${task.id}.ics`}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Download .ics file"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

        </div>

        {/* Right: Utility Tools (Snooze, Edit, Delete) */}
        <div className="flex items-center gap-1">
          
          {/* Snooze Dropdown */}
          {isPendingOrSnoozed && (
            <div className="relative">
              <button
                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Snooze reminder"
              >
                <span>Snooze</span>
              </button>

              {showSnoozeMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-20 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setShowSnoozeMenu(false);
                      handleAction(() => onSnooze(task.id, { minutes: 10, preset: 'PLUS_10M' }));
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    +10 Minutes
                  </button>
                  <button
                    onClick={() => {
                      setShowSnoozeMenu(false);
                      handleAction(() => onSnooze(task.id, { minutes: 60, preset: 'PLUS_1H' }));
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => {
                      setShowSnoozeMenu(false);
                      handleAction(() => onSnooze(task.id, { preset: 'TOMORROW_9AM' }));
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    Tomorrow 9 AM
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Edit Button */}
          <button
            onClick={() => onEdit && onEdit(task)}
            disabled={isProcessing}
            title="Edit reminder"
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => handleAction(() => onDelete(task.id))}
            disabled={isProcessing}
            title="Delete reminder"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </div>
  );
}
