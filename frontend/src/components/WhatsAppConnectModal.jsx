import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, QrCode, RefreshCw, ExternalLink, Smartphone, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function WhatsAppConnectModal({ isOpen, onClose, onConnected }) {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const data = await api.getWhatsAppQrData();
      setStatusData(data);
      setError(null);
      if (data?.ready && onConnected) {
        onConnected();
      }
    } catch (err) {
      setError('Could not connect to WhatsApp gateway microservice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchStatus();
    // Poll every 2.5s for live QR update and instant scan detection
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = statusData?.ready === true;
  const isWaitingScan = statusData?.status === 'WAITING_FOR_SCAN' && statusData?.dataUrl;
  const isInitializing = statusData?.status === 'INITIALIZING';
  const isOffline = statusData?.status === 'OFFLINE' || error;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden my-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isConnected 
                ? 'bg-emerald-500 text-white' 
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                WhatsApp Connection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isConnected ? 'Session Linked & Active' : 'Link phone or open directly'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 text-center">

          {/* STATE 1: Connected */}
          {isConnected && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  WhatsApp is Connected!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your phone is linked. Scheduled reminders will be delivered automatically in the background through WhatsApp Web.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-medium text-slate-400">Status:</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Ready
                  </span>
                </div>
              </div>

              {/* Redirect Action */}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open WhatsApp Web Directly</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: Waiting for QR Scan */}
          {!isConnected && isWaitingScan && (
            <div className="space-y-4">
              <div className="relative inline-block p-3 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 shadow-lg">
                <img 
                  src={statusData.dataUrl} 
                  alt="WhatsApp Web QR Code" 
                  className="w-56 h-56 mx-auto object-contain"
                />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-xs whitespace-nowrap flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Scan with WhatsApp</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-left bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>How to Link Your Phone:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  1. Open <b>WhatsApp</b> on your phone
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  2. Go to <b>Linked Devices</b> (Settings or ⋮ menu)
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  3. Tap <b>Link a Device</b> and point camera at the QR code
                </p>
              </div>

              {/* Alternative Direct Redirect for Mobile */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  On mobile? You can also open WhatsApp directly without scanning:
                </p>
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Redirect to WhatsApp App / Web</span>
                </a>
              </div>
            </div>
          )}

          {/* STATE 3: Initializing */}
          {!isConnected && isInitializing && (
            <div className="py-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Starting WhatsApp Web Bridge...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generating QR code. Please wait a moment...
              </p>
            </div>
          )}

          {/* STATE 4: Gateway Offline / Cloud Direct Mode */}
          {isOffline && (
            <div className="py-4 space-y-3.5 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  WhatsApp Direct Mode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  On web deployments like Vercel, you can send any reminder instantly with <b>1-Tap Direct WhatsApp</b> without needing any server gateway!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>How to Send Reminders:</span>
                </div>
                <p className="leading-relaxed">
                  Simply tap the green <b>WhatsApp</b> button on any reminder card. It opens your WhatsApp app or WhatsApp Web directly with the recipient and message already filled in!
                </p>
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-400">
                  <span>For background automated server delivery: Start the gateway with <code>npm start</code> in <code>whatsapp-gateway/</code></span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={fetchStatus}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Retry
                </button>
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Directly</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
