import React, { useEffect } from 'react';
import { Bell, Volume2, Clock, CheckCircle2, Moon } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function AlarmAlertBanner({ activeAlarm, onStopAlarm, onSnoozeAlarm }) {
  if (!activeAlarm) return null;

  // Start continuous audio alarm loop when component mounts or activeAlarm changes
  useEffect(() => {
    const tone = activeAlarm.ringTone || 'CHIME';
    soundService.startAlarmLoop(tone);

    return () => {
      soundService.stopAlarmLoop();
    };
  }, [activeAlarm]);

  const handleStop = async () => {
    soundService.stopAlarmLoop();
    await onStopAlarm(activeAlarm.id);
  };

  const handleSnooze = async (minutes = 10, preset = 'PLUS_10M') => {
    soundService.stopAlarmLoop();
    await onSnoozeAlarm(activeAlarm.id, { minutes, preset });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-rose-500/80 p-6 sm:p-8 text-center overflow-hidden animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alarm-title"
      >
        
        {/* Glowing Background Radial */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsating Bell Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500/60 flex items-center justify-center mb-5 animate-pulse-ring">
          <Bell className="w-10 h-10 text-rose-600 dark:text-rose-400 animate-bell" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
          </span>
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          <span>Alarm Alert ({activeAlarm.ringTone || 'CHIME'})</span>
        </div>

        {/* Title */}
        <h2 id="alarm-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          {activeAlarm.title}
        </h2>

        {/* Note / Body */}
        {activeAlarm.messageBody && (
          <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {activeAlarm.messageBody}
          </div>
        )}

        {/* Rest hours reminder if applicable */}
        {activeAlarm.isQuietHours && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium mb-5">
            <Moon className="w-3.5 h-3.5" />
            <span>Late night reminder</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          
          {/* Turn Off Alarm */}
          <button
            onClick={handleStop}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Turn Off Alarm</span>
          </button>

          {/* Snooze 10 Mins */}
          <button
            onClick={() => handleSnooze(10, 'PLUS_10M')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Clock className="w-4 h-4" />
            <span>Snooze 10 Min</span>
          </button>

          {/* Snooze 1 Hour */}
          <button
            onClick={() => handleSnooze(60, 'PLUS_1H')}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl font-medium text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <span>+1 Hour</span>
          </button>

        </div>

      </div>
    </div>
  );
}
