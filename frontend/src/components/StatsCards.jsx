import React from 'react';
import { Calendar, Bell, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export default function StatsCards({ stats, onFilterSelect }) {
  const cards = [
    {
      title: "Today's Schedule",
      value: stats?.totalToday ?? 0,
      description: 'Reminders set for today',
      icon: Calendar,
      color: 'indigo',
      badge: 'Today',
      filterChannel: 'ALL',
      bgColor: 'from-indigo-500/10 to-blue-500/10',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      borderColor: 'border-indigo-100 dark:border-indigo-950/60',
    },
    {
      title: 'Active Alarms',
      value: stats?.activeAlarms ?? 0,
      description: stats?.activeAlarms > 0 ? 'Alarm is ringing now!' : 'No active alarms',
      icon: Bell,
      color: 'rose',
      badge: stats?.activeAlarms > 0 ? 'Ringing Now' : 'Quiet',
      filterChannel: 'ALARMS',
      bgColor: 'from-rose-500/10 to-orange-500/10',
      iconColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-100 dark:border-rose-950/60',
      alert: (stats?.activeAlarms ?? 0) > 0,
    },
    {
      title: 'WhatsApp Sent',
      value: stats?.deliveredMessages ?? 0,
      description: 'WhatsApp messages delivered',
      icon: MessageSquare,
      color: 'emerald',
      badge: 'Delivered',
      filterChannel: 'WHATSAPP',
      bgColor: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-100 dark:border-emerald-950/60',
    },
    {
      title: 'Upcoming Reminders',
      value: stats?.pendingTasks ?? 0,
      description: 'Scheduled and ready to alert you',
      icon: Clock,
      color: 'purple',
      badge: 'Scheduled',
      filterChannel: 'ALL',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-100 dark:border-purple-950/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            onClick={() => onFilterSelect && onFilterSelect(card.filterChannel)}
            className={`cursor-pointer group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
          >
            {/* Top gradient glow */}
            <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${card.bgColor} blur-2xl group-hover:scale-125 transition-transform`} />

            <div className="relative flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center ${card.iconColor} border border-slate-200/50 dark:border-slate-700/50`}>
                <Icon className={`w-5 h-5 ${card.alert ? 'animate-bounce' : ''}`} />
              </div>
              <span className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                card.alert 
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {card.badge}
              </span>
            </div>

            <div className="relative">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
                {card.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
