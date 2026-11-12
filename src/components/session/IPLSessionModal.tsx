import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { SessionFormat, CreateSessionInput } from '../../types/session';
import { soundService } from '../../services/soundService';
import {
  X,
  Plus,
  Layers,
  Sparkles,
  Zap,
  Target,
  Wrench,
  Trash2,
  Calendar,
  CircleDollarSign,
  Users,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const generateRandomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const IPLSessionModal: React.FC = () => {
  const {
    isSessionModalOpen,
    setSessionModalOpen,
    sessions,
    activeSessionId,
    userTeamId,
    createSession,
    switchSession,
    deleteSession,
    duplicateSession,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  // Form State
  const [name, setName] = useState('IPL 2025 Mega Auction');
  const [format, setFormat] = useState<SessionFormat>('mega');
  const [customPurse, setCustomPurse] = useState(120);
  const [timerSpeed, setTimerSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');

  if (!isSessionModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playGavel();

    const input: CreateSessionInput = {
      name: name.trim() || 'IPL Auction Session',
      roomCode: generateRandomCode(),
      format,
      preSelectedTeamId: userTeamId,
      purseCap: format === 'custom' ? customPurse : format === 'mini' ? 60 : format === 'turbo' ? 90 : 120,
      seasonYear: 2025,
      timerSpeed,
    };

    createSession(input);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl text-slate-900"
        >
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
                  <Sparkles className="h-6 w-6 fill-current" />
                </div>
                <div>
                  <h2 id="session-modal-title" className="text-xl font-black tracking-tight text-white sm:text-2xl">
                    Game Sessions
                  </h2>
                </div>
              </div>

              <button
                onClick={() => {
                  soundService.playClick();
                  setSessionModalOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-5 flex gap-2 border-b border-white/10 pb-0">
              <button
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('create');
                }}
                className={`relative flex items-center gap-2 pb-3 text-xs font-black uppercase tracking-wider transition-colors ${
                  activeTab === 'create' ? 'text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>New Session</span>
                {activeTab === 'create' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
                  />
                )}
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  setActiveTab('saved');
                }}
                className={`relative flex items-center gap-2 pb-3 text-xs font-black uppercase tracking-wider transition-colors ${
                  activeTab === 'saved' ? 'text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Saved Sessions ({sessions.length})</span>
                {activeTab === 'saved' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-7">
            {activeTab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Session Name & Random Suggester */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Session Title
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. IPL 2025 Mega Auction"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                {/* Session Format Selection */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                    Game Type
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <FormatOption
                      active={format === 'mega'}
                      onClick={() => {
                        soundService.playClick();
                        setFormat('mega');
                        setTimerSpeed('standard');
                      }}
                      icon={<Sparkles className="h-5 w-5 text-amber-600" />}
                      title="Mega Auction"
                      purse="₹120 Cr"
                    />
                    <FormatOption
                      active={format === 'turbo'}
                      onClick={() => {
                        soundService.playClick();
                        setFormat('turbo');
                        setTimerSpeed('fast');
                      }}
                      icon={<Zap className="h-5 w-5 text-sky-600" />}
                      title="Turbo Blitz"
                      purse="₹90 Cr"
                    />
                    <FormatOption
                      active={format === 'mini'}
                      onClick={() => {
                        soundService.playClick();
                        setFormat('mini');
                        setTimerSpeed('standard');
                      }}
                      icon={<Target className="h-5 w-5 text-emerald-600" />}
                      title="Mini Auction"
                      purse="₹60 Cr"
                    />
                    <FormatOption
                      active={format === 'custom'}
                      onClick={() => {
                        soundService.playClick();
                        setFormat('custom');
                      }}
                      icon={<Wrench className="h-5 w-5 text-violet-600" />}
                      title="Custom Room"
                      purse={`₹${customPurse} Cr`}
                    />
                  </div>

                  {/* Custom Purse Slider if format === 'custom' */}
                  {format === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">Starting Purse Budget:</span>
                        <span className="text-sm font-black text-amber-600 tabular-nums">₹{customPurse} Cr</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="200"
                        step="5"
                        value={customPurse}
                        onChange={(e) => setCustomPurse(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>Create and play</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Saved Sessions View */
              <div className="space-y-3">
                {sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  const draftedCount = sess.teams.reduce((acc, t) => acc + (t.squad?.length || 0), 0);

                  return (
                    <div
                      key={sess.id}
                      className={`relative rounded-2xl border p-4 sm:p-5 transition-all ${
                        isActive
                          ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-slate-900 truncate">
                              {sess.name}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                            <span className="flex items-center gap-1">
                              <CircleDollarSign className="h-3.5 w-3.5 text-amber-600" />
                              ₹{sess.purseCap} Cr Purse
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-sky-600" />
                              {draftedCount} Signed
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {new Date(sess.lastPlayedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => {
                              soundService.playClick();
                              duplicateSession(sess.id);
                            }}
                            title="Duplicate Session"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Layers className="h-4 w-4" />
                          </button>

                          {sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete session "${sess.name}"?`)) {
                                  soundService.playClick();
                                  deleteSession(sess.id);
                                }
                              }}
                              title="Delete Session"
                              className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => {
                                soundService.playClick();
                                switchSession(sess.id);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              <span>Switch</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface FormatOptionProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  purse: string;
}

const FormatOption: React.FC<FormatOptionProps> = ({
  active,
  onClick,
  icon,
  title,
  purse,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-3.5 rounded-2xl border text-left transition-all ${
      active
        ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-400/20'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
    }`}
  >
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-black text-sm text-slate-900">{title}</span>
      </div>
      <span className="text-xs font-black text-amber-600 tabular-nums">{purse}</span>
    </div>
  </button>
);
