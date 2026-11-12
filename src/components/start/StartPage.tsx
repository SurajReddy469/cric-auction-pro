import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { 
  Trophy, 
  Play, 
  Radio, 
  Check, 
  MapPin, 
  ArrowRight,
  Briefcase,
  IdCard,
  Sparkles
} from 'lucide-react';

const MANAGER_AVATARS = [
  { id: 'tactician', label: 'The Tactician', icon: '👔', desc: 'Calculated, patient & master strategist' },
  { id: 'skipper', label: 'The Skipper', icon: '🧢', desc: 'Inspiring leader & players’ favorite' },
  { id: 'mogul', label: 'Franchise Mogul', icon: '💼', desc: 'Aggressive bidder & big spender' },
  { id: 'quant', label: 'Moneyball Quant', icon: '💻', desc: 'Data-driven value seeker' },
  { id: 'legend', label: 'Cricket Legend', icon: '🌟', desc: 'Immense respect & champion mindset' },
  { id: 'strategist', label: 'War Room Boss', icon: '🦁', desc: 'Ruthless paddle raiser in crunch lots' },
];

export const StartPage: React.FC = () => {
  const { 
    teams, 
    userTeamId, 
    profile, 
    setManagerProfile,
    selectTeamAndResetCampaign,
    startAuction, 
    setScreen,
    setMultiplayerModalOpen,
    auction,
    leagueMatches
  } = useGameStore();

  const [managerName, setManagerName] = useState<string>(profile.name || 'Vikram Sengupta');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar || 'tactician');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeamId || 'chennai-super-kings');

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const activeAvatar = MANAGER_AVATARS.find(a => a.id === selectedAvatar) || MANAGER_AVATARS[0];
  const isExistingCampaignActive = (auction.phase !== 'idle' && auction.phase !== 'completed') || leagueMatches.length > 0;

  const handleSelectTeam = (id: string) => {
    soundService.playClick();
    setSelectedTeamId(id);
  };

  const handleSelectAvatar = (id: string) => {
    soundService.playClick();
    setSelectedAvatar(id);
  };

  const saveProfileData = () => {
    const finalName = managerName.trim() || 'Manager';
    setManagerProfile(finalName, selectedAvatar);
  };

  const handleStartSinglePlayer = () => {
    soundService.playGavel();
    saveProfileData();
    selectTeamAndResetCampaign(selectedTeamId);
    startAuction();
  };

  const handleStartMultiplayer = () => {
    soundService.playClick();
    saveProfileData();
    selectTeamAndResetCampaign(selectedTeamId);
    setMultiplayerModalOpen(true);
  };

  const handleGoToDashboard = () => {
    soundService.playClick();
    saveProfileData();
    selectTeamAndResetCampaign(selectedTeamId);
    setScreen('menu');
  };

  const handleResumeActiveCampaign = () => {
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
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-white relative isolate overflow-hidden flex flex-col justify-between">
      {/* Background Stadium Glow & Grid Elements */}
      <div 
        className="absolute inset-0 -z-10 opacity-35 transition-colors duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 10%, ${selectedTeam.primaryColor}33, transparent 60%), radial-gradient(ellipse at 90% 90%, #0ea5e922, transparent 50%), radial-gradient(ellipse at 10% 90%, #f59e0b22, transparent 50%)`
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-3 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
        
        {/* Top Resume Bar if existing campaign exists */}
        {isExistingCampaignActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:px-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 shadow-lg shadow-amber-950/40 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
              <div>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">Active Campaign In Progress:</span>
                <span className="ml-2 text-sm font-bold text-white">
                  Managing {teams.find(t => t.id === userTeamId)?.name || 'Franchise'}
                </span>
              </div>
            </div>
            <button
              onClick={handleResumeActiveCampaign}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105"
            >
              <span>Resume Active Campaign</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </motion.div>
        )}

        {/* Hero Title & Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 fill-current text-amber-400 animate-spin" />
            <span>TATA IPL 2025 · OFFICIAL MEGA AUCTION GAME</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95]">
            ENTER THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">ARENA</span>
          </h1>
          
        </div>

        {/* STEP 1: Manager Name & Identity Accreditation Card */}
        <section className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black">1</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
              Enter Your Manager Name & Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6 items-center">
            {/* Input & Persona Selector */}
            <div className="space-y-5">
              <div>
                <label htmlFor="manager-name" className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Manager / Franchise Owner Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="text-lg">🏏</span>
                  </div>
                  <input
                    id="manager-name"
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Enter your name (e.g. Captain Rohit, Vikram, Suraj)..."
                    maxLength={32}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/90 border-2 border-white/15 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 text-white placeholder-slate-500 text-base sm:text-lg font-extrabold outline-none transition-all shadow-inner"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-mono text-slate-500">
                    {managerName.length}/32
                  </div>
                </div>
              </div>

              {/* Avatar / Persona Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2.5">
                  Select Manager Persona Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {MANAGER_AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => handleSelectAvatar(av.id)}
                        className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-400/15 border-amber-400 shadow-md ring-1 ring-amber-400/40 text-white'
                            : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{av.icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-black leading-tight truncate">{av.label}</div>
                          <div className="text-[10px] text-slate-400 truncate hidden xs:block">{av.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Accreditation Badge Preview */}
            <div className="flex flex-col items-center justify-center">
              <div 
                className="w-full max-w-sm rounded-2xl p-5 border-2 shadow-2xl relative overflow-hidden transition-all duration-500"
                style={{
                  backgroundColor: '#0a101f',
                  borderColor: selectedTeam.primaryColor || '#fbbf24'
                }}
              >
                {/* Team Top Ribbon */}
                <div 
                  className="absolute top-0 inset-x-0 h-2 opacity-90"
                  style={{ backgroundColor: selectedTeam.primaryColor }}
                />

                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      OFFICIAL ACCREDITATION
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300 uppercase tracking-wider">
                    VERIFIED OWNER
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                      {activeAvatar.icon}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full bg-amber-400 items-center justify-center text-[10px] text-slate-950 font-black">
                      ✓
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-black text-white truncate tracking-tight">
                      {managerName.trim() || 'Your Name Here'}
                    </div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {activeAvatar.label}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                      Head of Cricket Operations
                    </div>
                  </div>
                </div>

                {/* Team Details Inside Badge */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge teamId={selectedTeam.id} size="sm" />
                    <div>
                      <div className="text-xs font-black text-white leading-tight">{selectedTeam.name}</div>
                      <div className="text-[10px] text-slate-400">{selectedTeam.city}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Purse</div>
                    <div className="text-xs font-black text-amber-400 font-mono">₹120.0 Cr</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: Franchise Selection (10 Official Teams) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black">2</span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                Select Your Respective Franchise
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-bold">
              Selected: <span className="text-amber-400 font-extrabold">{selectedTeam.name} ({selectedTeam.shortName})</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {teams.map((t) => {
              const isSelected = t.id === selectedTeamId;
              return (
                <motion.div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${t.name}`}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTeam(t.id);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTeam(t.id)}
                  className={`cursor-pointer rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 transition-all relative border overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400'
                      : 'bg-slate-900/80 border-white/10 hover:border-amber-400/50 hover:bg-slate-900'
                  }`}
                >
                  {/* Team Accent Glow */}
                  <div 
                    className="absolute -top-8 -right-8 h-20 w-20 rounded-full blur-xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: t.primaryColor }}
                  />

                  {/* Header: Badge & Trophies */}
                  <div className="flex items-start justify-between gap-2">
                    <TeamBadge teamId={t.id} size="md" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-amber-300 font-mono tracking-wider flex items-center gap-0.5">
                        <Trophy className="w-3 h-3 fill-current text-amber-400" />
                        <span>{t.trophies}</span>
                      </span>
                      {isSelected && (
                        <span className="mt-1 flex h-4 w-4 rounded-full bg-amber-400 items-center justify-center text-[10px] text-slate-950 font-black">
                          <Check className="w-2.5 h-2.5 stroke-[4]" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Names & City */}
                  <div className="mt-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t.shortName}
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                      {t.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{t.city}</span>
                    </div>
                  </div>

                  {/* Footer Pill: Purse & Style */}
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold truncate max-w-[80px]">
                      {t.personality}
                    </span>
                    <span className="text-amber-400 font-black font-mono">
                      ₹{t.currentPurse.toFixed(0)} Cr
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* STEP 3: Launch Hub & Gameplay Modes */}
        <section className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 text-xs font-black">3</span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
              Choose How You Want To Play
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Single-Player Live Auction */}
            <motion.button
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartSinglePlayer}
              className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-400 text-slate-950 text-left shadow-xl shadow-amber-500/20 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-amber-400 shadow-md">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-950/15 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    Solo Campaign
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight leading-snug">
                  Start Single-Player Auction
                </h3>
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-950/20 text-xs font-black">
                <span>Lock in & Start Bidding</span>
                <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Action 2: Online Multiplayer (Humans Only) */}
            <motion.button
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartMultiplayer}
              className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 text-left shadow-xl shadow-emerald-500/20 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-emerald-400 shadow-md">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-950/15 text-[10px] font-black uppercase tracking-wider text-slate-950">
                    Humans Only · 0 Bots
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight leading-snug">
                  Play Online Multiplayer
                </h3>
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-950/20 text-xs font-black">
                <span>Host or Join Room</span>
                <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Action 3: Go to Main Menu / Dashboard */}
            <motion.button
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToDashboard}
              className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/50 text-white text-left shadow-lg transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-slate-300 border border-white/10">
                    <Briefcase className="w-5 h-5" />
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-wider text-slate-300">
                    Control Room
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight leading-snug">
                  Enter Manager Dashboard
                </h3>
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-black text-slate-300 group-hover:text-amber-400 transition-colors">
                <span>Open Franchise Desk</span>
                <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <span>Cric-Auction Pro 2025 · Official Cricket Auction & Franchise Management Simulation. All rights reserved.</span>
      </footer>
    </div>
  );
};
