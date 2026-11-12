import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';
import { TeamBadge } from '../common/TeamBadge';
import { 
  ArrowRight, 
  LogIn, 
  Plus, 
  Radio, 
  UserRound, 
  Trophy, 
  IdCard, 
  Check, 
  Flame, 
  Zap
} from 'lucide-react';
import { SessionFormat } from '../../types/session';

type SessionMode = 'singleplayer' | 'multiplayer';

const MANAGER_AVATARS = [
  { id: 'tactician', label: 'Tactician', icon: '👔', motto: 'Master Strategist' },
  { id: 'skipper', label: 'Skipper', icon: '🧢', motto: 'Player-Leader' },
  { id: 'mogul', label: 'Mogul', icon: '💼', motto: 'Big Spender' },
  { id: 'quant', label: 'Analyst', icon: '💻', motto: 'Moneyball Scout' },
  { id: 'legend', label: 'Legend', icon: '🌟', motto: 'IPL Champion' },
  { id: 'warlord', label: 'War Room Boss', icon: '🦁', motto: 'Paddle Master' },
];

export const StartPage: React.FC = () => {
  const {
    profile,
    userTeamId,
    teams,
    selectTeam,
    setManagerProfile,
    setGameMode,
    createSession,
    createMultiplayerRoom,
    joinMultiplayerRoom,
    multiplayerError,
    setMultiplayerError,
    auction,
    leagueMatches,
    setScreen,
  } = useGameStore();

  const [name, setName] = useState(
    profile.name && profile.name !== 'Vikram Sengupta' && profile.name !== 'Manager'
      ? profile.name
      : ''
  );
  const [avatarId, setAvatarId] = useState(profile.avatar || 'tactician');
  const [selectedTeamId, setSelectedTeamId] = useState(userTeamId || 'chennai-super-kings');
  const [tab, setTab] = useState<'create' | 'login'>('create');
  const [sessionName, setSessionName] = useState('IPL 2025 Mega Auction');
  const [mode, setMode] = useState<SessionMode>('singleplayer');
  const [format, setFormat] = useState<SessionFormat>('mega');
  const [roomCode, setRoomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const activeAvatar = MANAGER_AVATARS.find(a => a.id === avatarId) || MANAGER_AVATARS[0];
  const isExistingCampaignActive = (auction.phase !== 'idle' && auction.phase !== 'completed') || leagueMatches.length > 0;
  const purseCap = format === 'mini' ? 60 : format === 'turbo' ? 90 : 120;
  const effectiveName = name.trim() || 'Vikram Sengupta';

  const saveProfileData = () => {
    const finalName = name.trim() || 'Vikram Sengupta';
    setManagerProfile(finalName, avatarId);
    selectTeam(selectedTeamId);
  };

  const handleSelectTeam = (tId: string) => {
    soundService.playClick();
    setSelectedTeamId(tId);
    selectTeam(tId);
  };

  const handleSelectAvatar = (aId: string) => {
    soundService.playClick();
    setAvatarId(aId);
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    soundService.playClick();
    const finalName = name.trim() || 'Vikram Sengupta';
    saveProfileData();
    setMultiplayerError(null);

    if (mode === 'singleplayer') {
      soundService.playGavel();
      setGameMode('singleplayer');
      createSession({
        name: sessionName.trim() || 'My IPL Session',
        format,
        purseCap,
        preSelectedTeamId: selectedTeamId,
      });
      return;
    }

    setIsSubmitting(true);
    const success = await createMultiplayerRoom({
      roomName: sessionName.trim() || 'My IPL Room',
      playerName: finalName,
      requiredPlayers: 2,
      purseCap,
    });
    setIsSubmitting(false);
    if (!success) soundService.playBuzzer();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomCode.trim()) return;
    soundService.playClick();
    saveProfileData();
    setMultiplayerError(null);
    setIsSubmitting(true);
    const finalName = name.trim() || 'Vikram Sengupta';
    const success = await joinMultiplayerRoom(roomCode.trim().toUpperCase(), finalName);
    setIsSubmitting(false);
    if (!success) soundService.playBuzzer();
  };

  const switchTab = (next: 'create' | 'login') => {
    soundService.playClick();
    setTab(next);
    setMultiplayerError(null);
  };

  const handleResume = () => {
    soundService.playClick();
    if (auction.phase !== 'idle' && auction.phase !== 'completed') {
      setScreen('auction');
    } else if (leagueMatches.length > 0) {
      setScreen('season');
    } else {
      setScreen('menu');
    }
  };

  return (
    <main className="relative isolate min-h-[calc(100vh-65px)] w-full overflow-hidden bg-[#070b14] px-3 py-6 sm:px-6 sm:py-10 text-white flex items-center justify-center">
      {/* Stadium Floodlights & Ambient Glow */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700 opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${selectedTeam.primaryColor}44 0%, transparent 60%), radial-gradient(ellipse at 15% 100%, #f59e0b22 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, #06b6d422 0%, transparent 50%)`
        }}
      />
      {/* Stadium Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Main Single Card Container (NO extra sections) */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/25">
        
        {/* Dynamic Top Team Bar */}
        <div 
          className="h-2 w-full transition-colors duration-500"
          style={{ backgroundColor: selectedTeam.primaryColor }}
        />

        {/* Card Content Wrapper */}
        <div className="p-5 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              ENTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">ARENA</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
              Create your manager accreditation, select your IPL franchise, and claim your auction paddle.
            </p>
          </div>

          {/* Quick Resume Active Campaign Banner */}
          {isExistingCampaignActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 shadow-md"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="truncate text-xs font-bold text-amber-200">
                  Active campaign exists for <span className="text-white font-black">{teams.find(t => t.id === userTeamId)?.name || 'Your Team'}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleResume}
                className="shrink-0 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-300 flex items-center gap-1 shadow-sm"
              >
                <span>Resume</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </motion.div>
          )}

          {/* Manager Identity Input & Persona Selector */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="manager-name" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                <IdCard className="h-4 w-4 text-amber-400" />
                <span>Manager Identity Name</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {name.length > 0 ? `${name.length}/32` : 'Default: Vikram Sengupta'}
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <span className="text-lg">🏏</span>
              </div>
              <input
                id="manager-name"
                type="text"
                value={name}
                maxLength={32}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vikram Sengupta"
                className="w-full rounded-xl border-2 border-white/15 bg-slate-900/90 pl-11 pr-4 py-3 text-sm sm:text-base font-extrabold text-white placeholder:text-slate-400/80 placeholder:font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 shadow-inner"
              />
            </div>

            {/* Persona Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">Persona:</span>
              {MANAGER_AVATARS.map((av) => {
                const isSelected = avatarId === av.id;
                return (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => handleSelectAvatar(av.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      isSelected
                        ? 'border border-amber-400 bg-amber-400/20 text-amber-300 shadow-sm'
                        : 'border border-white/10 bg-slate-900/80 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{av.icon}</span>
                    <span>{av.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Franchise Selection Grid (All 10 Real IPL Teams) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Select Your Respective Franchise
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-400">
                {selectedTeam.name} ({selectedTeam.shortName})
              </span>
            </div>

            {/* 10 Franchise Badges (5x2 grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {teams.map((t) => {
                const isSelected = t.id === selectedTeamId;
                return (
                  <motion.button
                    type="button"
                    key={t.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectTeam(t.id)}
                    className={`group relative flex items-center gap-2.5 rounded-xl border p-2 sm:p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400'
                        : 'border-white/10 bg-slate-950/70 hover:border-white/30 hover:bg-slate-950'
                    }`}
                  >
                    <TeamBadge teamId={t.id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-black text-white">{t.shortName}</span>
                        {isSelected && <Check className="h-3 w-3 stroke-[3] text-amber-400" />}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold truncate">
                        <Trophy className="h-2.5 w-2.5 fill-current text-amber-400 shrink-0" />
                        <span>{t.trophies}</span>
                        <span className="text-slate-600">·</span>
                        <span className="truncate">{t.city}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Live Accreditation Card Preview */}
            <div 
              className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors duration-500 bg-slate-950/80 shadow-inner"
              style={{ borderColor: `${selectedTeam.primaryColor}66` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl shadow-md"
                  style={{ 
                    backgroundColor: `${selectedTeam.primaryColor}22`,
                    borderColor: selectedTeam.primaryColor 
                  }}
                >
                  {activeAvatar.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-black text-white">{effectiveName}</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-300 border border-emerald-500/40">
                      Accredited
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                    <span className="font-bold text-amber-400">{activeAvatar.motto}</span>
                    <span className="text-slate-600">/</span>
                    <span className="truncate">{selectedTeam.name}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Purse Cap</div>
                <div className="text-xs font-black font-mono text-amber-400">₹{purseCap}.0 Cr</div>
              </div>
            </div>
          </div>

          {/* Tab Controls: Create Session vs Join Room */}
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 rounded-xl bg-slate-950 p-1 border border-white/10" role="tablist" aria-label="Session action">
              <button 
                type="button" 
                role="tab" 
                aria-selected={tab === 'create'} 
                onClick={() => switchTab('create')} 
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-black transition-all ${
                  tab === 'create' 
                    ? 'bg-amber-400 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Create New Session</span>
              </button>
              <button 
                type="button" 
                role="tab" 
                aria-selected={tab === 'login'} 
                onClick={() => switchTab('login')} 
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-black transition-all ${
                  tab === 'login' 
                    ? 'bg-amber-400 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="h-4 w-4 stroke-[3]" />
                <span>Join with Code</span>
              </button>
            </div>

            {multiplayerError && (
              <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/60 px-3.5 py-2.5 text-xs font-bold text-rose-200">
                {multiplayerError}
              </p>
            )}

            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Session Name
                    </label>
                    <input 
                      value={sessionName} 
                      onChange={(e) => setSessionName(e.target.value)} 
                      required 
                      maxLength={40} 
                      placeholder="Name your session" 
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-400 transition" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Auction Format
                    </label>
                    <select 
                      value={format} 
                      onChange={(e) => setFormat(e.target.value as SessionFormat)} 
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-400 transition"
                    >
                      <option value="mega">Mega Auction · ₹120 Cr</option>
                      <option value="turbo">Turbo Auction · ₹90 Cr</option>
                      <option value="mini">Mini Auction · ₹60 Cr</option>
                    </select>
                  </div>
                </div>

                {/* Game Type Selector: Solo vs Multiplayer */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Gameplay Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      type="button" 
                      aria-pressed={mode === 'singleplayer'} 
                      onClick={() => { soundService.playClick(); setMode('singleplayer'); }} 
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-left transition-all ${
                        mode === 'singleplayer' 
                          ? 'border-amber-400 bg-amber-400/20 text-white ring-1 ring-amber-400' 
                          : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <UserRound className="h-4 w-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-black">Single-Player</div>
                        <div className="text-[10px] text-slate-400">Solo vs 9 AI Bots</div>
                      </div>
                    </button>

                    <button 
                      type="button" 
                      aria-pressed={mode === 'multiplayer'} 
                      onClick={() => { soundService.playClick(); setMode('multiplayer'); }} 
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-left transition-all ${
                        mode === 'multiplayer' 
                          ? 'border-emerald-400 bg-emerald-400/20 text-white ring-1 ring-emerald-400' 
                          : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
                      <div>
                        <div className="text-xs font-black">Multiplayer</div>
                        <div className="text-[10px] text-slate-400">Humans Only · 0 Bots</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-black text-sm shadow-xl transition-all disabled:opacity-60 ${
                    mode === 'multiplayer'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25'
                  }`}
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>
                    {isSubmitting 
                      ? 'Launching...' 
                      : mode === 'multiplayer' 
                        ? `Create Online Room & Invite Friends (₹${purseCap} Cr)` 
                        : `Enter Auction War Room as ${selectedTeam.shortName}`}
                  </span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Online Room Code
                  </label>
                  <input 
                    value={roomCode} 
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())} 
                    maxLength={8} 
                    placeholder="Enter 6-digit code (e.g. JDLJ77)" 
                    className="w-full rounded-xl border-2 border-white/15 bg-slate-950 px-4 py-3 text-center text-lg font-black font-mono tracking-widest text-amber-400 placeholder-slate-600 outline-none focus:border-amber-400 transition" 
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitting || !roomCode.trim()} 
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3.5 px-4 font-black text-sm text-slate-950 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>{isSubmitting ? 'Connecting...' : 'Join Human-Only Room'}</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </motion.button>
              </form>
            )}
          </div>

        </div>

      </div>
    </main>
  );
};
