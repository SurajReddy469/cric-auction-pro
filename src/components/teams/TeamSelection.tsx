import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { MapPin, ArrowRight, Trophy, Flame } from 'lucide-react';

export const TeamSelection: React.FC = () => {
  const { 
    teams, 
    userTeamId, 
    selectTeam, 
    selectTeamAndResetCampaign,
    startAuction, 
    auction, 
    leagueMatches 
  } = useGameStore();
  const [selectedId, setSelectedId] = useState<string>(userTeamId);

  const selectedTeam = teams.find(t => t.id === selectedId) || teams[0];

  const handleSelectTeam = (id: string) => {
    soundService.playClick();
    setSelectedId(id);
  };

  const handleConfirm = () => {
    const isCampaignActive = auction.phase !== 'idle' || leagueMatches.length > 0 || teams.some(t => t.squad.length > 0);
    
    if (isCampaignActive) {
      const message = selectedId !== userTeamId
        ? `You have an active auction or tournament campaign. Switching to ${selectedTeam.name} will reset squads and start a fresh auction. Proceed?`
        : 'Restarting franchise draft will reset current squads and start a fresh auction. Proceed?';
      const confirmed = window.confirm(message);
      if (!confirmed) return;
      selectTeamAndResetCampaign(selectedId);
    } else {
      selectTeam(selectedId);
    }

    soundService.playGavel();
    startAuction();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 min-h-[calc(100vh-65px)] flex flex-col justify-between space-y-4 sm:space-y-6">
      
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-[11px] font-black text-amber-900 uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>FRANCHISE SELECT SCREEN</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            SELECT YOUR <span className="text-gold-gradient">IPL FRANCHISE</span>
          </h1>
        </div>

        {/* Selected Quick Lock Button */}
        <button
          onClick={handleConfirm}
          className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
        >
          <span>LOCK IN & START AUCTION</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Grid of 10 Official Franchises */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {teams.map((t) => {
          const isSelected = t.id === selectedId;
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
              className={`cursor-pointer rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all relative border overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-50/90 to-white border-amber-500 shadow-xl ring-2 ring-amber-400'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
              }`}
            >
              {/* Corner accent glow */}
              <div 
                className="absolute -top-10 -right-10 h-24 w-24 rounded-full blur-xl opacity-20 pointer-events-none"
                style={{ backgroundColor: t.primaryColor }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <TeamBadge teamId={t.id} size="md" />
                  {isSelected ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black shadow-sm text-xs">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-black text-slate-400">
                      {t.shortName}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {t.name}
                </h3>
                <span className="text-[11px] text-amber-800 font-extrabold block">
                  {t.city}
                </span>

                {/* Tactical Stats Radar/Bars */}
                <div className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2 text-[10px] font-bold">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>STRATEGY</span>
                    <span className="text-amber-800 font-black">{t.personality}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>FAN BASE</span>
                    <span className="text-slate-900 font-mono">{t.fanPopularity}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-slate-100 font-black">
                <span className="text-slate-700">
                  {t.trophies > 0 ? `🏆 ${t.trophies}` : '🏆 0'}
                </span>
                <span className="text-emerald-700 font-mono">
                  ₹{t.startingPurse} Cr
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Team Arcade Dossier */}
      <motion.div
        key={selectedTeam.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-slate-900 text-white p-4 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          <TeamBadge teamId={selectedTeam.id} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-black text-amber-400">
                {selectedTeam.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                {selectedTeam.shortName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1 font-semibold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {selectedTeam.stadium}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                {selectedTeam.trophies} IPL Trophies
              </span>
              <span>•</span>
              <span className="text-amber-400 font-bold">
                {selectedTeam.strategicStrength}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full md:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl hover:scale-105 active:scale-95 transition-all flex-shrink-0"
        >
          <span>SELECT {selectedTeam.shortName} & ENTER AUCTION</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </motion.div>

    </div>
  );
};
