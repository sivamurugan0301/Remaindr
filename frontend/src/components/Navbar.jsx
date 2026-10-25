import React, { useState, useEffect } from 'react';
import { Clock, Plus, Sun, Moon, Bell, Volume2, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function Navbar({ 
  onOpenCreateModal, 
  isDark, 
  onToggleDark, 
  activeAlarmsCount,
  whatsAppStatus,
  onOpenWhatsAppModal 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  
  const formattedDate = currentTime.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const handleTestAudio = () => {
    soundService.playTone('CHIME');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Remaindr
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Everyday Reminders & Alerts
            </p>
          </div>
        </div>

        {/* Live Clock & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs font-mono font-semibold">
              <span>{formattedTime}</span>
              <span className="ml-2 text-slate-400 dark:text-slate-500 font-normal">{formattedDate}</span>
            </div>
          </div>

          {/* WhatsApp Live Status Pill & Action */}
          <button
            onClick={onOpenWhatsAppModal}
            title={whatsAppStatus?.ready ? "WhatsApp is connected. Click to open or redirect." : "WhatsApp is disconnected. Click to view QR code and link phone."}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
              whatsAppStatus?.ready
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/70 dark:text-emerald-300 dark:hover:text-emerald-100 dark:border-emerald-700/80'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:hover:bg-amber-900/70 dark:text-amber-300 dark:hover:text-amber-100 dark:border-amber-700/80'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${whatsAppStatus?.ready ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
            <span className="hidden sm:inline">WhatsApp:</span>
            <span>{whatsAppStatus?.ready ? 'Connected' : 'Connect QR'}</span>
          </button>

          {/* Quick Sound Test */}
          <button
            onClick={handleTestAudio}
            title="Click to test alarm sound"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Test Sound</span>
          </button>

          {/* Active Alarms Indicator */}
          {activeAlarmsCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-bounce">
              <Bell className="w-3.5 h-3.5 fill-current" />
              <span>{activeAlarmsCount} Ringing</span>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

      </div>
    </header>
  );
}
