import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';

export const IPLFloatingButton: React.FC = () => {
  const { setSessionModalOpen, sessions, activeSessionId } = useGameStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleClick = () => {
    soundService.playClick();
    setSessionModalOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 flex items-center gap-3">
      {/* Session Pill Tooltip (Desktop visible / Hover expanded) */}
      <motion.button
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleClick}
        className="group hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white text-xs font-bold shadow-xl border border-amber-400/30 backdrop-blur-md transition-all hover:border-amber-400"
        title="Open IPL Session Manager"
      >
        <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-current animate-pulse" />
        <span className="text-slate-300">Room:</span>
        <span className="font-black text-amber-300 tracking-wider">#{activeSession?.roomCode || 'JDLJ77'}</span>
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
          New Session
        </span>
      </motion.button>

      {/* Small '+' Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 shadow-2xl shadow-amber-500/40 border-2 border-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        aria-label="Create new IPL session"
        title="Create New IPL Session"
      >
        <Plus className="h-7 w-7 stroke-[3] transition-transform duration-200" />

        {/* Ambient Pulsing Aura */}
        <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping -z-10 opacity-75 pointer-events-none" />

        {/* Mobile Badge indicator for sessions count */}
        {sessions.length > 1 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-black text-amber-300 border border-white">
            {sessions.length}
          </span>
        )}
      </motion.button>
    </div>
  );
};
