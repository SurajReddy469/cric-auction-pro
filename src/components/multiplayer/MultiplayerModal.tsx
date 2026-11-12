import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';
import {
  X,
  Users,
  Plus,
  LogIn,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const MultiplayerModal: React.FC = () => {
  const {
    isMultiplayerModalOpen,
    setMultiplayerModalOpen,
    createMultiplayerRoom,
    joinMultiplayerRoom,
    multiplayerError,
    setMultiplayerError,
    profile
  } = useGameStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState(profile.name || 'Manager');
  const [roomName, setRoomName] = useState('IPL Live War Room');
  const [requiredPlayers, setRequiredPlayers] = useState<number>(2);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isMultiplayerModalOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMultiplayerError(null);
    soundService.playClick();

    const success = await createMultiplayerRoom({
      roomName: roomName.trim() || 'IPL Multiplayer Room',
      playerName: playerName.trim() || 'Host Manager',
      requiredPlayers: Number(requiredPlayers),
      purseCap: 120,
    });

    setIsSubmitting(false);
    if (!success) {
      soundService.playBuzzer();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    setIsSubmitting(true);
    setMultiplayerError(null);
    soundService.playClick();

    const success = await joinMultiplayerRoom(
      roomCodeInput.trim().toUpperCase(),
      playerName.trim() || 'Guest Manager'
    );

    setIsSubmitting(false);
    if (!success) {
      soundService.playBuzzer();
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mp-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl text-slate-900"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
                  <Users className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 id="mp-modal-title" className="text-xl font-black text-white sm:text-2xl">
                    Online Multiplayer
                  </h2>
                </div>
              </div>

              <button
                onClick={() => {
                  soundService.playClick();
                  setMultiplayerModalOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-5 flex gap-2 border-b border-white/10 pb-0">
              <button
                onClick={() => {
                  soundService.playClick();
                  setTab('create');
                }}
                className={`flex items-center gap-2 pb-3 text-xs font-black uppercase tracking-wider transition-colors ${
                  tab === 'create' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>Host Online Room</span>
              </button>
              <button
                onClick={() => {
                  soundService.playClick();
                  setTab('join');
                }}
                className={`flex items-center gap-2 pb-3 text-xs font-black uppercase tracking-wider transition-colors ${
                  tab === 'join' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Join with Code</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Strict Human Notice Banner */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                <strong>Human-Only Verification:</strong> Empty teams are never filled with bots. Every auction bid and match decision is made by live human players.
              </div>
            </div>

            {/* Error Message */}
            {multiplayerError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{multiplayerError}</span>
              </div>
            )}

            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Room Name
                  </label>
                  <input
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. IPL Mega Auction War Room"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Required Human Players
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 4, 8, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          soundService.playClick();
                          setRequiredPlayers(num);
                        }}
                        className={`py-2 rounded-xl text-xs font-black transition-all border ${
                          requiredPlayers === num
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {num === 2 ? '2 (1v1)' : `${num} Players`}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 font-semibold">
                    The auction will unlock once all {requiredPlayers} human managers join and ready up.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isSubmitting ? 'Creating Room...' : 'Create Online Room & Invite Players'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Online Room Code
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">#</span>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. JDLJ77"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-4 py-3 text-sm font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 font-semibold">
                    Enter the 6-character room code provided by the room host.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !roomCodeInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{isSubmitting ? 'Joining Room...' : 'Join Online Room'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
