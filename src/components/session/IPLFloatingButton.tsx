import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';

export const IPLFloatingButton: React.FC = () => {
  const { setSessionModalOpen, setMultiplayerModalOpen, setScreen, gameMode, multiplayerRoom } = useGameStore();

  const handleClick = () => {
    soundService.playClick();
    if (gameMode === 'multiplayer') {
      if (multiplayerRoom) setScreen('multiplayer_lobby');
      else setMultiplayerModalOpen(true);
    } else {
      setSessionModalOpen(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 flex items-center gap-3">
      {/* New session or room */}
      <motion.button
        whileHover={{ scale: 1.08, rotate: 90 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 shadow-2xl shadow-amber-500/40 border-2 border-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        aria-label={gameMode === 'multiplayer' ? 'Host or join a room' : 'Create new game session'}
        title={gameMode === 'multiplayer' ? 'Host or join room' : 'New session'}
      >
        <Plus className="h-7 w-7 stroke-[3] transition-transform duration-200" />

        {/* Ambient Pulsing Aura */}
        <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping -z-10 opacity-75 pointer-events-none" />

      </motion.button>
    </div>
  );
};
