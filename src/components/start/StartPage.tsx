import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Zap,
  Sparkles,
  X
} from 'lucide-react';
import { SessionFormat } from '../../types/session';

type SessionMode = 'singleplayer' | 'multiplayer';

export const StartPage: React.FC = () => {
  const {
    profile,
    userTeamId,
    teams,
    selectTeam,
    setManagerProfile,
    setGameMode,
    createSession,
    startAuction,
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
  const [selectedTeamId, setSelectedTeamId] = useState(userTeamId || 'chennai-super-kings');
  const [tab, setTab] = useState<'create' | 'login'>('create');
  const [sessionName, setSessionName] = useState('IPL 2025 Mega Auction');
  const [mode, setMode] = useState<SessionMode>('singleplayer');
  const [format, setFormat] = useState<SessionFormat>('mega');
  const [roomCode, setRoomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const isExistingCampaignActive = (auction.phase !== 'idle' && auction.phase !== 'completed') || leagueMatches.length > 0;
  const purseCap = format === 'mini' ? 60 : format === 'turbo' ? 90 : 120;
  const effectiveName = name.trim() || 'Vikram Sengupta';

  const saveProfileData = () => {
    const finalName = name.trim() || 'Vikram Sengupta';
    setManagerProfile(finalName);
    selectTeam(selectedTeamId);
  };

  const handleSelectTeam = (tId: string) => {
    soundService.playClick();
    setSelectedTeamId(tId);
    selectTeam(tId);
  };

  const handleSelectFormat = (fmt: SessionFormat) => {
    soundService.playClick();
    setFormat(fmt);
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
        name: sessionName.trim() || `${selectedTeam.shortName} IPL Campaign`,
        format,
        purseCap,
        preSelectedTeamId: selectedTeamId,
      });
      // Immediately start the live auction so the player lands inside the auction war room with Lot #1!
      startAuction();
      return;
    }

    setIsSubmitting(true);
    const success = await createMultiplayerRoom({
      roomName: sessionName.trim() || `${selectedTeam.shortName} Live Room`,
      playerName: finalName,
      requiredPlayers: 2,
      purseCap,
    });
    setIsSubmitting(false);
    if (!success) soundService.playBuzzer();
  };

  const handleOpenDashboard = () => {
    soundService.playClick();
    saveProfileData();
    if (mode === 'singleplayer') {
      setGameMode('singleplayer');
      createSession({
        name: sessionName.trim() || `${selectedTeam.shortName} IPL Campaign`,
        format,
        purseCap,
        preSelectedTeamId: selectedTeamId,
      });
      setScreen('menu');
    }
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
    <div className="relative isolate min-h-[calc(100vh-65px)] w-full overflow-hidden bg-[#070b14] px-3 py-4 sm:px-6 sm:py-8 text-white flex items-center justify-center">
      {/* Dynamic Stadium Floodlights & Ambient Glow reactive to Selected Team Color */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700 opacity-45"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${selectedTeam.primaryColor}55 0%, transparent 60%), radial-gradient(ellipse at 15% 100%, ${selectedTeam.secondaryColor || '#f59e0b'}33 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, #06b6d422 0%, transparent 50%)`
        }}
      />
      {/* Stadium Pitch Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_70%,transparent_100%)]" />

      {/* Main Command Card Container (Strictly 0 <section> tags) */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-white/25">
        
        {/* Dynamic Top Franchise Aura Bar */}
        <div 
          className="h-2.5 w-full transition-colors duration-500 shadow-sm"
          style={{ backgroundColor: selectedTeam.primaryColor }}
        />

        {/* Content Body */}
        <div className="p-4 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
          
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-300 shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
              <span>IPL 2025 Mega Auction War Room</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              ENTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">ARENA</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
              Accredit your manager profile, select your franchise, and claim your auction paddle.
            </p>
          </div>

          {/* Active Campaign Quick Resume Alert */}
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
                  In-progress tournament exists for <span className="text-white font-black">{teams.find(t => t.id === userTeamId)?.name || 'Your Team'}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleResume}
                className="shrink-0 rounded-xl bg-amber-400 px-3.5 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-300 flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>Resume Campaign</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </motion.div>
          )}

          {/* Manager Identity Card with Light Default Placeholder */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-3.5 sm:p-5 space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <label htmlFor="manager-name" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                <IdCard className="h-4 w-4 text-amber-400" />
                <span>Manager Identity Name</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                {name.length > 0 ? `${name.length}/32 chars` : 'Default: Vikram Sengupta'}
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <span className="text-base sm:text-lg">🏏</span>
              </div>
              <input
                id="manager-name"
                type="text"
                value={name}
                maxLength={32}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vikram Sengupta"
                className="w-full rounded-xl border-2 border-white/15 bg-slate-900/90 pl-11 pr-10 py-2.5 sm:py-3 text-base sm:text-lg font-extrabold text-white placeholder:text-slate-400/80 placeholder:font-medium outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 shadow-inner"
              />
              {name.length > 0 && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition"
                  title="Reset to default Vikram Sengupta"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>

          {/* 10 Real IPL Franchises Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Select Your Official IPL Franchise
                </span>
              </div>
              <span 
                className="text-xs font-black px-2.5 py-0.5 rounded-full border shadow-sm transition-colors duration-500"
                style={{ 
                  color: selectedTeam.primaryColor,
                  borderColor: `${selectedTeam.primaryColor}55`,
                  backgroundColor: `${selectedTeam.primaryColor}15`
                }}
              >
                {selectedTeam.name} ({selectedTeam.shortName})
              </span>
            </div>

            {/* 10 Franchise Grid - Highly Responsive (2 cols mobile, 5 cols desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {teams.map((t) => {
                const isSelected = t.id === selectedTeamId;
                return (
                  <motion.button
                    type="button"
                    key={t.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectTeam(t.id)}
                    className={`group relative flex items-center gap-2 rounded-xl border p-2 sm:p-2.5 text-left transition-all ${
                      isSelected
                        ? 'shadow-lg ring-2'
                        : 'border-white/10 bg-slate-950/70 hover:border-white/30 hover:bg-slate-950'
                    }`}
                    style={{
                      borderColor: isSelected ? t.primaryColor : undefined,
                      boxShadow: isSelected ? `0 0 16px ${t.primaryColor}33` : undefined,
                      backgroundColor: isSelected ? `${t.primaryColor}18` : undefined,
                    }}
                  >
                    <TeamBadge teamId={t.id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-xs font-black text-white">{t.shortName}</span>
                        {isSelected && (
                          <Check 
                            className="h-3 w-3 stroke-[3]" 
                            style={{ color: t.primaryColor }}
                          />
                        )}
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

            {/* Interactive Franchise War-Room Dossier */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTeam.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border p-3.5 sm:p-4 bg-slate-950/90 shadow-inner space-y-2.5"
                style={{ borderColor: `${selectedTeam.primaryColor}55` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamBadge teamId={selectedTeam.id} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="truncate text-base sm:text-lg font-black text-white">{effectiveName}</span>
                        {selectedTeam.trophies > 0 ? (
                          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-300 border border-amber-400/40 flex items-center gap-1">
                            <Trophy className="h-2.5 w-2.5 fill-current text-amber-400" />
                            {selectedTeam.trophies}x Champion
                          </span>
                        ) : (
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-blue-300 border border-blue-500/40">
                            Chasing 1st Trophy
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">
                        {selectedTeam.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Purse Allocation</div>
                      <div className="text-sm font-black font-mono text-amber-400">₹{purseCap}.0 Cr</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Squad Target</div>
                      <div className="text-sm font-black font-mono text-emerald-400">25 Slots</div>
                    </div>
                  </div>
                </div>

                {/* Team Fortress & Strategic Philosophy */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <span className="text-slate-500 font-bold shrink-0">🏟️ Fortress:</span>
                    <span className="truncate font-medium">{selectedTeam.stadium || `${selectedTeam.city} Home Ground`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <span className="text-slate-500 font-bold shrink-0">⚡ Style:</span>
                    <span className="truncate font-medium">{selectedTeam.strategicStrength || selectedTeam.personality || 'Balanced Squad'}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
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
                
                {/* Session Name & Format Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Session Name
                    </label>
                    <input 
                      value={sessionName} 
                      onChange={(e) => setSessionName(e.target.value)} 
                      maxLength={40} 
                      placeholder="Name your tournament" 
                      className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-400 transition" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                      Auction Format
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['mega', 'turbo', 'mini'] as SessionFormat[]).map((fmt) => {
                        const isSelected = format === fmt;
                        const purse = fmt === 'mega' ? '₹120 Cr' : fmt === 'turbo' ? '₹90 Cr' : '₹60 Cr';
                        return (
                          <button
                            type="button"
                            key={fmt}
                            onClick={() => handleSelectFormat(fmt)}
                            className={`rounded-xl border py-2 px-1 text-center font-black transition capitalize active:scale-95 ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400/20 text-amber-300 ring-1 ring-amber-400 shadow-sm'
                                : 'border-white/10 bg-slate-950 text-slate-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <div className="text-[11px] sm:text-xs font-black capitalize">{fmt}</div>
                            <div className="text-[9px] text-slate-400 font-mono">{purse}</div>
                          </button>
                        );
                      })}
                    </div>
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
                      className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-left transition-all active:scale-98 ${
                        mode === 'singleplayer' 
                          ? 'border-amber-400 bg-amber-400/20 text-white ring-1 ring-amber-400 shadow-sm' 
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
                      className={`flex items-center justify-center gap-2.5 rounded-xl border p-3 text-left transition-all active:scale-98 ${
                        mode === 'multiplayer' 
                          ? 'border-emerald-400 bg-emerald-400/20 text-white ring-1 ring-emerald-400 shadow-sm' 
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

                {/* Primary & Secondary Action Launch Buttons */}
                <div className="space-y-2 pt-1">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSubmitting} 
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-black text-sm sm:text-base shadow-xl transition-all disabled:opacity-60 ${
                      mode === 'multiplayer'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25'
                    }`}
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    <span>
                      {isSubmitting 
                        ? 'Launching Arena...' 
                        : mode === 'multiplayer' 
                          ? `Host Online Room as ${selectedTeam.shortName} (₹${purseCap} Cr)` 
                          : `Enter Live Auction as ${selectedTeam.shortName} (Lot #1 Kickoff)`}
                    </span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </motion.button>

                  {mode === 'singleplayer' && (
                    <button
                      type="button"
                      onClick={handleOpenDashboard}
                      className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-amber-400 transition"
                    >
                      Or open Franchise Dashboard first →
                    </button>
                  )}
                </div>
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
    </div>
  );
};
