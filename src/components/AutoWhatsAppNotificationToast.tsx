import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  X,
  Copy,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { AutomatedWhatsAppPayload } from '../utils/storage';

interface AutoWhatsAppNotificationToastProps {
  payload: AutomatedWhatsAppPayload | null;
  onClose: () => void;
}

export const AutoWhatsAppNotificationToast: React.FC<
  AutoWhatsAppNotificationToastProps
> = ({ payload, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!payload) return;
    setTimeLeft(10);
    setCopied(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [payload, onClose]);

  if (!payload) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(payload.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isApproved = payload.statusType === 'disetujui';

  return (
    <div
      id="auto-whatsapp-toast"
      className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 animate-bounce-subtle"
    >
      <div className="bg-slate-900 border-2 border-emerald-500 text-white rounded-2xl p-3.5 shadow-2xl backdrop-blur-md relative overflow-hidden ring-4 ring-emerald-500/20">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  WA Auto-Dispatch
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {payload.ticketNumber}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 flex items-center gap-1">
                <span>Pesan WhatsApp Otomatis ke Pemohon</span>
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/80 mb-2.5 space-y-1 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Penerima (Pemohon):</span>
            <span className="font-bold text-emerald-300">
              {payload.recipientName} ({payload.cleanPhone || payload.phone || '-'})
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Status Update:</span>
            <span
              className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                isApproved
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isApproved ? 'Disetujui (Driver Ditugaskan)' : 'Selesai (Operasional Berakhir)'}
            </span>
          </div>

          <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-700/50 line-clamp-2">
            "{payload.message.slice(0, 110)}..."
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <a
            id="toast-btn-open-wa"
            href={payload.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim / Buka WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-emerald-200" />
          </a>

          <button
            id="toast-btn-copy-wa"
            onClick={handleCopy}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-2.5 rounded-xl border border-slate-700 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px]">Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar dismiss */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
          <div
            className="bg-emerald-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
