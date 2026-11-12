import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Pause, WifiOff, ShieldCheck, Users, LogOut } from 'lucide-react';

export const DisconnectPauseOverlay: React.FC = () => {
  const { isRoomPaused, roomPauseReason, pauseExpiresAt, leaveMultiplayerRoom } = useGameStore();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  useEffect(() => {
    if (!isRoomPaused || !pauseExpiresAt) return;

    const updateTimer = () => {
      const diff = Math.max(0, Math.ceil((pauseExpiresAt - Date.now()) / 1000));
      setSecondsRemaining(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isRoomPaused, pauseExpiresAt]);

  if (!isRoomPaused) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="pause-dialog-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-[#0f172a] p-6 sm:p-8 text-white shadow-2xl shadow-amber-950/50"
      >
        {/* Ambient warning glow */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
            <Pause className="h-8 w-8 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-3">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Connection Interrupted</span>
          </div>

          <h2 id="pause-dialog-title" className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Auction Paused
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-300 font-medium">
            {roomPauseReason || 'Waiting for disconnected human player to reconnect...'}
          </p>

          {/* Reconnect Countdown Pill */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reconnection Window:</span>
            <span className="text-lg font-black text-amber-300 tabular-nums">{secondsRemaining}s</span>
          </div>

          {/* Strict Human-Only Policy Notice */}
          <div className="mt-6 w-full rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-left">
            <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Strict Human-Only Rule</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-medium">
              Bots and AI managers will <strong>never</strong> be silently substituted. Bidding and game progression are frozen until the human player reconnects.
            </p>
          </div>

          {/* Leave/Abandon button */}
          <div className="mt-7 flex w-full gap-3">
            <button
              onClick={() => {
                if (confirm('Leave multiplayer room? Your current progress in this room will be forfeit.')) {
                  leaveMultiplayerRoom();
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Room</span>
            </button>
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-semibold">
              <Users className="h-4 w-4 mr-1 text-amber-400" />
              <span>Auto-resumes on join</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
