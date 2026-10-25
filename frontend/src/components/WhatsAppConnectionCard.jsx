import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  QrCode, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function WhatsAppConnectionCard({ 
  whatsAppStatus, 
  onRefreshStatus,
  onOpenModal 
}) {
  const [showInlineQr, setShowInlineQr] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedMobileNum, setSelectedMobileNum] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from Remaindr!');

  const isConnected = whatsAppStatus?.ready === true;

  // Fetch QR data when inline QR is requested or if disconnected
  const fetchQr = async () => {
    try {
      setQrLoading(true);
      const data = await api.getWhatsAppQrData();
      setQrData(data);
      if (data?.ready && onRefreshStatus) {
        onRefreshStatus();
      }
    } catch (err) {
      console.error('Error fetching QR data:', err);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    if (showInlineQr && !isConnected) {
      fetchQr();
      const interval = setInterval(fetchQr, 2500);
      return () => clearInterval(interval);
    }
  }, [showInlineQr, isConnected]);

  // Handle Connect or Redirect Click
  const handlePrimaryAction = () => {
    if (isConnected) {
      // If connected: "else redirect" -> Redirects to WhatsApp Web
      window.open('https://web.whatsapp.com', '_blank', 'noopener,noreferrer');
    } else {
      // If disconnected: show QR code right here on the same webpage
      setShowInlineQr(prev => !prev);
    }
  };

  // Direct mobile redirect generator
  const getDirectRedirectUrl = (phone, text) => {
    const clean = (phone || '').replace(/\D/g, '');
    const num = clean.length === 10 ? `91${clean}` : clean;
    return `https://wa.me/${num}?text=${encodeURIComponent(text || '')}`;
  };

  return (
    <div className="mb-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      
      {/* Top Banner / Header */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Left: Title & Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                WhatsApp Delivery Hub
              </h2>
              {/* WhatsApp Status Pill */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose between automated WhatsApp Web delivery or instant mobile app redirection.
            </p>
          </div>
        </div>

        {/* Right: Primary Action Button (Connect or Redirect) */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {isConnected ? (
            /* ELSE REDIRECT: When connected, give redirect buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrimaryAction}
                title="Redirect to WhatsApp Web"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Redirect to WhatsApp Web</span>
              </button>
              <button
                onClick={() => {
                  window.open('https://api.whatsapp.com/send', '_blank', 'noopener,noreferrer');
                }}
                title="Redirect to Mobile WhatsApp"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile App</span>
              </button>
            </div>
          ) : (
            /* IF DISCONNECTED: Give button to Connect (shows QR code on the same webpage) */
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>{showInlineQr ? 'Hide QR Code' : 'Connect (Show QR Code)'}</span>
                {showInlineQr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onOpenModal}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open in Fullscreen Modal"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Inline QR Code Section (Appears right on the same webpage when 'Connect' is clicked) */}
      {!isConnected && showInlineQr && (
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-200">
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-6">
            
            {/* Visual QR Box */}
            <div className="shrink-0 p-3 bg-white rounded-2xl border border-slate-200 shadow-md text-center">
              {qrLoading && !qrData?.dataUrl ? (
                <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
                  <span className="text-xs font-medium">Generating QR...</span>
                </div>
              ) : qrData?.dataUrl ? (
                <div>
                  <img 
                    src={qrData.dataUrl} 
                    alt="WhatsApp QR Code" 
                    className="w-52 h-52 object-contain mx-auto" 
                  />
                  <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-200">
                    Scan with your phone's WhatsApp
                  </div>
                </div>
              ) : (
                <div className="w-52 h-52 flex flex-col items-center justify-center text-rose-500 p-3">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <span className="text-xs font-semibold">Gateway Initializing</span>
                  <button 
                    onClick={fetchQr}
                    className="mt-2 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>

            {/* Instructions & Instant Mobile Fallback */}
            <div className="flex-1 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Link Phone in 3 Simple Steps:</span>
              </div>
              <ol className="space-y-1.5 list-decimal list-inside text-slate-600 dark:text-slate-300">
                <li>Open <b>WhatsApp</b> on your phone.</li>
                <li>Tap <b>Linked Devices</b> (Settings or ⋮ menu).</li>
                <li>Tap <b>Link a Device</b> and point camera at the QR code.</li>
              </ol>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                Once linked, your session is saved locally. Automated reminders will be delivered directly from your phone number without re-scanning!
              </p>
              
              {/* Option 2 Direct Redirect link */}
              <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Using mobile directly?</span>
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Redirect to WhatsApp directly without scanning</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Two Delivery Options Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">
        
        {/* Option 1: WhatsApp Web Automation */}
        <div className="p-5 sm:p-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Option 1: WhatsApp Web
              </span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {isConnected ? 'Ready & Linked' : 'Requires Scan'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Delivers scheduled reminders automatically in the background through your linked WhatsApp Web session. No manual clicking needed at delivery time.
          </p>

          <div className="pt-1 flex items-center gap-2">
            {isConnected ? (
              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open WhatsApp Web Session</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowInlineQr(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR Code to link phone</span>
              </button>
            )}
          </div>
        </div>

        {/* Option 2: Mobile Direct Redirect */}
        <div className="p-5 sm:p-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Option 2: Mobile Direct Redirect
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Always Ready
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            When viewed on mobile, tapping the reminder's redirect button opens the WhatsApp app directly with your recipient number and reminder message pre-filled.
          </p>

          <div className="pt-1">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Redirect to WhatsApp Directly (wa.me)</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
