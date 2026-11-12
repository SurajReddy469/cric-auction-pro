import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GameScreen } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { IPLFloatingButton } from '../session/IPLFloatingButton';
import { soundService } from '../../services/soundService';
import { 
  Flame, 
  Users, 
  CalendarDays, 
  Radio, 
  Trophy, 
  Coins, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  TrendingUp
} from 'lucide-react';

export const MainMenu: React.FC = () => {
  const {
    setScreen,
    userTeam,
    profile,
    auction,
    leagueMatches,
    gameMode,
    multiplayerRoom,
    setMultiplayerModalOpen,
    sessions,
    activeSessionId,
    startAuction,
  } = useGameStore();

  const team = userTeam();
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const auctionActive = auction.phase !== 'idle' && auction.phase !== 'completed';
  const auctionComplete = auction.phase === 'completed';
  const hasDraftedPlayers = (team?.squad.length || 0) > 0;
  const isSeasonReady = leagueMatches.length > 0;

  // Franchise & Squad Calculations
  const squad = team?.squad || [];
  const squadCount = squad.length;
  const overseasCount = squad.filter(p => p.isOverseas).length;
  const batsmenCount = squad.filter(p => p.role === 'Batter').length;
  const bowlersCount = squad.filter(p => p.role === 'Fast Bowler' || p.role === 'Spin Bowler').length;
  const allRoundersCount = squad.filter(p => p.role === 'All-rounder').length;
  const keepersCount = squad.filter(p => p.role === 'Wicketkeeper').length;

  const startingPurse = team?.startingPurse || 120;
  const currentPurse = team?.currentPurse ?? startingPurse;
  const spentPurse = Number((startingPurse - currentPurse).toFixed(2));
  const pursePercent = Math.max(0, Math.min(100, Math.round((currentPurse / startingPurse) * 100)));

  const primaryColor = team?.primaryColor || '#f59e0b';
  const secondaryColor = team?.secondaryColor || '#004ba0';

  const handleLaunchAuction = () => {
    soundService.playGavel();
    if (auction.phase === 'idle') {
      startAuction();
    } else {
      setScreen('auction');
    }
  };

  const openMultiplayer = () => {
    soundService.playClick();
    if (multiplayerRoom) {
      setScreen('multiplayer_lobby');
    } else {
      setMultiplayerModalOpen(true);
    }
  };

  const navigateTo = (screen: GameScreen) => {
    soundService.playClick();
    setScreen(screen);
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-65px)] w-full overflow-hidden bg-[#070b14] px-3 py-4 sm:px-6 sm:py-8 text-white">
      {/* Dynamic Stadium Floodlights reactive to Team Primary Color */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 transition-all duration-700 opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${primaryColor}44 0%, transparent 60%), radial-gradient(ellipse at 15% 100%, ${secondaryColor}22 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, #f59e0b22 0%, transparent 50%)`
        }}
      />
      {/* Stadium Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_70%,transparent_100%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-6">
        
        {/* Top Manager Accreditation & Session Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 sm:p-4 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl shadow-md transition-colors"
              style={{ backgroundColor: `${primaryColor}22`, borderColor: primaryColor }}
            >
              👔
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-white truncate">
                  {profile.name || 'Vikram Sengupta'}
                </span>
                <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-400/30">
                  Accredited Manager
                </span>
                {gameMode === 'multiplayer' ? (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Radio className="h-2.5 w-2.5 animate-pulse" />
                    Human-Only MP
                  </span>
                ) : (
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-blue-300 border border-blue-500/30">
                    Solo Campaign
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">
                Session: <span className="text-slate-200">{activeSession?.name || 'IPL 2025 Mega Auction'}</span>
                {activeSession?.roomCode && (
                  <span className="ml-2 font-mono text-amber-400 font-bold">#{activeSession.roomCode}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Manager Metrics */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Reputation</div>
                <div className="text-xs font-black font-mono text-emerald-300">{profile.reputation ?? 85}/100</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Scout Tokens</div>
                <div className="text-xs font-black font-mono text-amber-300">{profile.scoutTokens ?? 6} Available</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('start')}
              className="rounded-xl border border-white/15 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-400 hover:text-white transition shadow-sm active:scale-95"
            >
              Switch Team
            </button>
          </div>
        </div>

        {/* Franchise War-Room Hero Command Center */}
        {team && (
          <div 
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-slate-900/95 shadow-2xl backdrop-blur-2xl transition-all duration-500"
            style={{ borderColor: `${primaryColor}44` }}
          >
            {/* Top Color Accent Bar */}
            <div 
              className="h-2 w-full transition-colors duration-500"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
              
              {/* Franchise Identity & Stadium Fortress */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <TeamBadge teamId={team.id} size="lg" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight truncate">
                        {team.name}
                      </h1>
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm"
                        style={{ 
                          color: primaryColor, 
                          borderColor: `${primaryColor}55`,
                          backgroundColor: `${primaryColor}15`
                        }}
                      >
                        {team.shortName}
                      </span>
                      {team.trophies > 0 ? (
                        <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[11px] font-black uppercase text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <Trophy className="h-3 w-3 fill-current text-amber-400" />
                          {team.trophies}x Champion
                        </span>
                      ) : (
                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[11px] font-black uppercase text-blue-300 border border-blue-500/40">
                          Chasing 1st Trophy
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1 font-medium text-slate-400">
                        <span>🏟️</span>
                        <span className="truncate">{team.stadium || `${team.city} Home Fortress`}</span>
                      </span>
                      <span className="text-slate-600 hidden sm:inline">·</span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold truncate">
                        <Zap className="h-3 w-3 fill-current" />
                        <span>{team.strategicStrength || team.personality || 'Balanced Squad'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Auction Launch Button */}
                <div className="shrink-0 flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={gameMode === 'multiplayer' ? openMultiplayer : handleLaunchAuction}
                    className="w-full md:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 py-3.5 px-6 font-black text-sm text-slate-950 shadow-xl shadow-amber-500/25 transition-all"
                  >
                    <Flame className="h-4 w-4 fill-current" />
                    <span>
                      {gameMode === 'multiplayer' 
                        ? multiplayerRoom ? 'Resume Multiplayer Room' : 'Host / Join Multiplayer'
                        : auctionActive ? 'Resume Live Bidding' 
                        : auctionComplete ? 'Review Squad Draft' 
                        : 'Launch Auction War Room'}
                    </span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </motion.button>
                </div>
              </div>

              {/* Franchise Purse & Squad Capacity Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
                
                {/* Purse Status Card */}
                <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3.5 sm:p-4 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                      <Coins className="h-4 w-4 text-amber-400" />
                      <span>Franchise Purse Balance</span>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-400">
                      ₹{currentPurse.toFixed(1)} Cr / ₹{startingPurse} Cr
                    </span>
                  </div>

                  {/* Purse Progress Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{ width: `${pursePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Spent: <span className="font-mono text-white font-bold">₹{spentPurse.toFixed(1)} Cr</span></span>
                    <span>Remaining: <span className="font-mono text-emerald-400 font-bold">{pursePercent}%</span></span>
                  </div>
                </div>

                {/* Squad Composition Card */}
                <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3.5 sm:p-4 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                      <Users className="h-4 w-4 text-emerald-400" />
                      <span>Roster Capacity</span>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      {squadCount}/25 Players ({overseasCount}/8 Overseas)
                    </span>
                  </div>

                  {/* Squad Capacity Bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (squadCount / 25) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium truncate">
                    <span>🏏 Bats: <span className="font-bold text-white">{batsmenCount}</span></span>
                    <span>⚡ Bowlers: <span className="font-bold text-white">{bowlersCount}</span></span>
                    <span>🔄 All-Round: <span className="font-bold text-white">{allRoundersCount}</span></span>
                    <span>🧤 WK: <span className="font-bold text-white">{keepersCount}</span></span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Fast Action Mission Command Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* Action 1: Live Auction Stage */}
          <div 
            onClick={handleLaunchAuction}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 transition-all hover:border-amber-400/60 hover:bg-slate-900 cursor-pointer shadow-lg hover:shadow-amber-500/10 active:scale-98"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Flame className="h-5 w-5 fill-current" />
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 font-mono">
                  {auctionActive ? 'In Progress' : auctionComplete ? 'Concluded' : 'Lot #1 Ready'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                Live Auction War Room
              </h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {auctionActive 
                  ? `Active bidding underway. Currently on Lot #${auction.currentPlayerIndex + 1}.` 
                  : auctionComplete 
                    ? 'All registered players have been auctioned. View finalized contracts.' 
                    : 'Kickoff the hammer session. Bid in real-time against AI or human franchises.'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-amber-400">
              <span>{auctionActive ? 'Resume Bidding' : 'Enter War Room'}</span>
              <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 2: Starting XI & Squad Hub */}
          <div 
            onClick={() => {
              if (!hasDraftedPlayers) {
                alert('Draft your squad first! Enter the Live Auction to sign players.');
                navigateTo('auction');
              } else {
                navigateTo('squad');
              }
            }}
            className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-lg active:scale-98 ${
              hasDraftedPlayers 
                ? 'border-white/10 bg-slate-900/80 hover:border-emerald-400/60 hover:bg-slate-900 hover:shadow-emerald-500/10' 
                : 'border-white/5 bg-slate-950/50 opacity-75 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Users className="h-5 w-5" />
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300 font-mono">
                  {squadCount}/25 Drafted
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                Starting XI & Squad
              </h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {hasDraftedPlayers 
                  ? 'Configure batting orders, assign captain/wicket-keeper, and inspect depth charts.' 
                  : 'Requires signed players from auction. Lock in bids to assemble your starting lineup.'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-emerald-400">
              <span>{hasDraftedPlayers ? 'Manage Lineup' : 'Auction Required'}</span>
              <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 3: Season & Tournament Fixtures */}
          <div 
            onClick={() => {
              if (!isSeasonReady) {
                alert('Complete the auction and finalize your squad to unlock the Season fixtures & playoffs!');
                navigateTo(hasDraftedPlayers ? 'squad' : 'auction');
              } else {
                navigateTo('season');
              }
            }}
            className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-lg active:scale-98 ${
              isSeasonReady 
                ? 'border-white/10 bg-slate-900/80 hover:border-blue-400/60 hover:bg-slate-900 hover:shadow-blue-500/10' 
                : 'border-white/5 bg-slate-950/50 opacity-75 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-black uppercase text-blue-300 font-mono">
                  {isSeasonReady ? 'Fixtures Live' : 'Stage Locked'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                Season & Playoffs
              </h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {isSeasonReady 
                  ? 'Simulate matchdays, track Net Run Rate standings, and push for the IPL Trophy.' 
                  : 'Assemble your 11-man squad first to schedule the 14-match tournament calendar.'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs font-bold text-blue-400">
              <span>{isSeasonReady ? 'View Standings' : 'Locked'}</span>
              <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Live War Room Feed & Intel Briefing */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                War Room Tactical Intel
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Chepauk / Wankhede Radar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
              <div className="font-bold text-amber-300 mb-1">🎯 Marquee Strategy</div>
              <p className="text-slate-400 leading-relaxed">
                Target high-impact all-rounders in early lots to anchor both batting depth and bowling quotas.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
              <div className="font-bold text-emerald-300 mb-1">💰 Purse Discipline</div>
              <p className="text-slate-400 leading-relaxed">
                Keep at least ₹20-25 Cr reserved for fast bowlers and finisher slots in later auction rounds.
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
              <div className="font-bold text-cyan-300 mb-1">🌐 Human Multiplayer</div>
              <p className="text-slate-400 leading-relaxed">
                Host an online room to play exclusively against real friends with live bidding synchronization and zero bots.
              </p>
            </div>
          </div>
        </div>

        {/* IPL Session Floating Button */}
        <IPLFloatingButton />

      </div>
    </div>
  );
};
