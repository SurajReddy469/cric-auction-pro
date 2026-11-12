import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { Player, PlayerRole, BattingHand, BowlingStyle, PlayerTier } from '../../types/player';
import { AIPersonality } from '../../types/team';
import { 
  Coins, 
  Search, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  UserPlus, 
  ArrowRight, 
  Check, 
  Radio, 
  Download, 
  Upload, 
  Copy, 
  ChevronDown,
  ChevronUp,
  X,
  Gavel
} from 'lucide-react';

type AdminTab = 'cheats' | 'teams' | 'players' | 'auction' | 'tournament' | 'backup';

export const AdminPanel: React.FC = () => {
  const {
    teams,
    players,
    userTeamId,
    auction,
    leagueMatches,
    currentMatchIndex,
    profile,
    achievements,
    setScreen,
    adminUpdateTeamPurse,
    adminUpdateTeamPersonality,
    adminUpdateTeamTrophies,
    adminTransferPlayer,
    adminReleasePlayer,
    adminUpdatePlayer,
    adminCreatePlayer,
    adminAddScoutTokens,
    adminUnlockAllAchievements,
    adminForceSellCurrentLot,
    adminForceUnsoldCurrentLot,
    adminJumpToLot,
    adminForceMatchResult,
    adminForceCrownChampion,
    adminExportState,
    adminImportState,
    resetAllGameData,
    autoCompleteAuction,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('cheats');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Player search & filter
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [playerRoleFilter, setPlayerRoleFilter] = useState<string>('all');
  const [playerStatusFilter, setPlayerStatusFilter] = useState<string>('all');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // New Player Form State
  const [isNewPlayerModalOpen, setIsNewPlayerModalOpen] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>('Batter');
  const [newPlayerCountry, setNewPlayerCountry] = useState<string>('India');
  const [newPlayerIsOverseas, setNewPlayerIsOverseas] = useState<boolean>(false);
  const [newPlayerBattingHand, setNewPlayerBattingHand] = useState<BattingHand>('Right Hand');
  const [newPlayerBowlingStyle, setNewPlayerBowlingStyle] = useState<BowlingStyle>('Right-arm Medium');
  const [newPlayerTier, setNewPlayerTier] = useState<PlayerTier>('Marquee');
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState<number>(2.0);
  const [newPlayerOverall, setNewPlayerOverall] = useState<number>(88);
  const [newPlayerBattingRating, setNewPlayerBattingRating] = useState<number>(88);
  const [newPlayerBowlingRating, setNewPlayerBowlingRating] = useState<number>(60);

  // Auction Hammer Force States
  const [forceSellTeamId, setForceSellTeamId] = useState<string>(teams[0]?.id || '');
  const [forceSellPrice, setForceSellPrice] = useState<number>(auction.currentPlayer?.basePrice || 2.0);

  // Selected Team Roster View
  const [selectedTeamRosterId, setSelectedTeamRosterId] = useState<string | null>(null);

  const userTeam = teams.find(t => t.id === userTeamId) || teams[0];

  const handleCopyExport = () => {
    const json = adminExportState();
    navigator.clipboard.writeText(json);
    setCopiedNotification(true);
    soundService.playClick();
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleDownloadExport = () => {
    const json = adminExportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cric-auction-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundService.playClick();
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const ok = adminImportState(importJsonText);
    if (ok) {
      soundService.playTrophyFanfare();
      setImportStatus('✅ Save file imported successfully! Game state updated.');
    } else {
      setImportStatus('❌ Error importing file. Please verify JSON format.');
    }
  };

  const handleCreateNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const newP: Player = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newPlayerName.trim(),
      age: 24,
      country: newPlayerCountry,
      isOverseas: newPlayerIsOverseas,
      role: newPlayerRole,
      battingHand: newPlayerBattingHand,
      bowlingStyle: newPlayerBowlingStyle,
      tier: newPlayerTier,
      overallRating: Number(newPlayerOverall),
      battingRating: Number(newPlayerBattingRating),
      bowlingRating: Number(newPlayerBowlingRating),
      fieldingRating: 80,
      power: Number(newPlayerBattingRating),
      timing: Number(newPlayerBattingRating),
      speed: 80,
      stamina: 85,
      clutch: 85,
      form: 'Hot',
      potential: 94,
      isScouted: true,
      injuryRisk: 'Low',
      basePrice: Number(newPlayerBasePrice),
      estimatedValue: Number((newPlayerBasePrice * 1.8).toFixed(2)),
      traits: ['Match Winner', 'Custom Creation'],
      avatarSeed: newPlayerName.toLowerCase().replace(/\s+/g, '-'),
      seasonStats: {
        matches: 0,
        runs: 0,
        highestScore: 0,
        strikeRate: 0,
        average: 0,
        hundreds: 0,
        fifties: 0,
        wickets: 0,
        bestBowling: '0/0',
        economy: 0,
        catches: 0,
      },
    };

    adminCreatePlayer(newP);
    soundService.playBidSound(true);
    setIsNewPlayerModalOpen(false);
    setNewPlayerName('');
  };

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                          p.country.toLowerCase().includes(playerSearch.toLowerCase());
    const matchesRole = playerRoleFilter === 'all' || p.role === playerRoleFilter;
    const matchesStatus = playerStatusFilter === 'all' ||
      (playerStatusFilter === 'sold' && p.isSold) ||
      (playerStatusFilter === 'unsold' && p.isUnsold) ||
      (playerStatusFilter === 'available' && !p.isSold && !p.isUnsold);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const personalitiesList: AIPersonality[] = [
    'Aggressive Manager',
    'Star Hunter',
    'Budget Manager',
    'Bowling Specialist',
    'Youth Specialist',
    'Analytics Guru',
    'Balanced Manager',
    'Human'
  ];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 min-h-[calc(100vh-65px)] flex flex-col justify-between space-y-6">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CRIC-AUCTION <span className="text-rose-600">COMMAND CENTER</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full control over team purses, player databases, live hammer overrides, match results, and instant cheats.
          </p>
        </div>

        {/* Quick Nav back to Game */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { soundService.playClick(); setScreen('menu'); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition-colors shadow-sm"
          >
            <span>Back to Game</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => { soundService.playClick(); setActiveTab('cheats'); }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'cheats'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>⚡ GOD MODE CHEATS</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setActiveTab('teams'); }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'teams'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>🏢 FRANCHISES & PURSES</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setActiveTab('players'); }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'players'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>🏏 PLAYERS & ROSTERS ({players.length})</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setActiveTab('auction'); }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'auction'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>🔨 AUCTION HAMMER OVERRIDE</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setActiveTab('tournament'); }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'tournament'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>🏆 TOURNAMENT & MATCH RIGGING</span>
        </button>

        <button
          onClick={() => { soundService.playClick(); setActiveTab('backup'); }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all flex-shrink-0 ${
            activeTab === 'backup'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>💾 SAVE / EXPORT / IMPORT</span>
        </button>
      </div>

      {/* TAB 1: GOD MODE QUICK CHEATS */}
      {activeTab === 'cheats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Boost User Purse */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase mb-1">
                  <Coins className="w-4 h-4" />
                  <span>Budget Injection</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Boost {userTeam.shortName} Purse
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Current purse: <span className="font-mono font-bold text-emerald-700">₹{userTeam.currentPurse.toFixed(2)} Cr</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    soundService.playBidSound(true);
                    adminUpdateTeamPurse(userTeam.id, userTeam.currentPurse + 10);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs transition-colors"
                >
                  +₹10.00 Cr
                </button>
                <button
                  onClick={() => {
                    soundService.playBidSound(true);
                    adminUpdateTeamPurse(userTeam.id, userTeam.currentPurse + 25);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-sm"
                >
                  +₹25.00 Cr
                </button>
                <button
                  onClick={() => {
                    soundService.playBidSound(true);
                    adminUpdateTeamPurse(userTeam.id, 150.0);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs transition-colors shadow-sm"
                >
                  Max (₹150 Cr)
                </button>
              </div>
            </div>

            {/* Scout Tokens Injection */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sky-700 font-black text-xs uppercase mb-1">
                  <Search className="w-4 h-4" />
                  <span>Scouting Intel</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Scout Tokens Booster
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Current tokens: <span className="font-mono font-bold text-sky-700">{profile.scoutTokens}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    soundService.playClick();
                    adminAddScoutTokens(5);
                  }}
                  className="px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-black text-xs transition-colors"
                >
                  +5 Tokens
                </button>
                <button
                  onClick={() => {
                    soundService.playClick();
                    adminAddScoutTokens(20);
                  }}
                  className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition-colors shadow-sm"
                >
                  +20 Tokens
                </button>
                <button
                  onClick={() => {
                    soundService.playClick();
                    adminAddScoutTokens(999);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-black text-xs transition-colors shadow-sm"
                >
                  Infinite (999)
                </button>
              </div>
            </div>

            {/* Unlock All Achievements */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase mb-1">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span>Cabinet Completion</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Unlock All Achievements
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unlocked: <span className="font-mono font-bold text-slate-900">{achievements.filter(a => a.unlocked).length} / {achievements.length}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  soundService.playTrophyFanfare();
                  adminUnlockAllAchievements();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md"
              >
                🏆 UNLOCK ALL TROPHIES & XP
              </button>
            </div>

            {/* Instant Fast Auction Complete */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase mb-1">
                  <Gavel className="w-4 h-4 text-rose-600" />
                  <span>Auction Auto-Pilot</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Instant Auto-Complete Auction
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Simulate all remaining player lots instantly using realistic AI draft bids.
                </p>
              </div>

              <button
                onClick={() => {
                  soundService.playGavel();
                  autoCompleteAuction();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 font-black text-xs transition-all shadow-md"
              >
                ⚡ SIMULATE ENTIRE AUCTION
              </button>
            </div>

            {/* Force Crown User Team */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase mb-1">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span>Victory Rigging</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Crown {userTeam.shortName} Champions
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Instantly triggers tournament celebration ceremony and awards silverware to your team.
                </p>
              </div>

              <button
                onClick={() => {
                  adminForceCrownChampion(userTeam.id);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md"
              >
                🎉 TRIGGER CHAMPIONS CEREMONY
              </button>
            </div>

            {/* Reset All Game Data */}
            <div className="rounded-3xl bg-white border border-rose-200 p-5 shadow-sm flex flex-col justify-between space-y-4 bg-rose-50/20">
              <div>
                <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase mb-1">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Master Reset</span>
                </div>
                <h3 className="text-lg font-black text-rose-950">
                  Factory Clean Slate
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Wipes all local campaign state and restores default rosters, pursed funds, and ratings.
                </p>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Reset ALL campaign data, squads, matches, and achievements back to defaults?')) {
                    resetAllGameData();
                    soundService.playClick();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-md"
              >
                ⚠️ FACTORY RESET DATA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FRANCHISES & PURSES */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Franchise Finances & AI Strategy</h2>
                <p className="text-xs text-slate-500">Edit any franchise's budget, AI aggression behavior, or career trophy count.</p>
              </div>
              <button
                onClick={() => {
                  teams.forEach(t => adminUpdateTeamPurse(t.id, 120.0));
                  soundService.playBidSound(true);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Reset All Purses to ₹120.00 Cr
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Franchise</th>
                    <th className="py-3 px-3">Purse (₹ Cr)</th>
                    <th className="py-3 px-3">Quick Adjust</th>
                    <th className="py-3 px-3">AI Personality</th>
                    <th className="py-3 px-3 text-center">Trophies</th>
                    <th className="py-3 px-3 text-center">Squad</th>
                    <th className="py-3 px-4 text-right">Roster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map(t => {
                    const isUser = t.id === userTeamId;
                    return (
                      <tr key={t.id} className={isUser ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <TeamBadge teamId={t.id} size="sm" />
                            <div>
                              <div className="flex items-center gap-1.5 font-black text-slate-900">
                                <span>{t.name}</span>
                                {isUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black text-[9px]">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{t.city}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          <input
                            type="number"
                            step="0.5"
                            value={t.currentPurse}
                            onChange={(e) => adminUpdateTeamPurse(t.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-400 outline-none"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => adminUpdateTeamPurse(t.id, t.currentPurse + 5)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px]"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => adminUpdateTeamPurse(t.id, t.currentPurse + 20)}
                              className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 font-bold text-[10px] text-amber-900"
                            >
                              +20
                            </button>
                            <button
                              onClick={() => adminUpdateTeamPurse(t.id, Math.max(0, t.currentPurse - 10))}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-rose-100 font-bold text-[10px] text-rose-700"
                            >
                              -10
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={t.personality}
                            onChange={(e) => adminUpdateTeamPersonality(t.id, e.target.value as AIPersonality)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none"
                          >
                            {personalitiesList.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => adminUpdateTeamTrophies(t.id, Math.max(0, t.trophies - 1))}
                              className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs px-1">🏆 {t.trophies}</span>
                            <button
                              onClick={() => adminUpdateTeamTrophies(t.id, t.trophies + 1)}
                              className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                          {t.squad.length}/25
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedTeamRosterId(selectedTeamRosterId === t.id ? null : t.id)}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                          >
                            {selectedTeamRosterId === t.id ? 'Hide Roster' : 'View Roster'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expanded Selected Team Squad Modal/Section */}
          {selectedTeamRosterId && (() => {
            const team = teams.find(t => t.id === selectedTeamRosterId);
            if (!team) return null;
            return (
              <div className="rounded-3xl bg-slate-900 text-white p-5 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <TeamBadge teamId={team.id} size="md" />
                    <div>
                      <h3 className="text-base font-black text-amber-400">{team.name} Full Squad</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {team.squad.length} Players Signed • Spent ₹{team.spentPurse.toFixed(2)} Cr
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTeamRosterId(null)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {team.squad.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                    No players signed to this franchise yet. Use Auction Hammer or Player Transfer to add players.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {team.squad.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>{p.name}</span>
                            {p.isOverseas && <span className="text-[10px]">✈️</span>}
                          </div>
                          <span className="text-[10px] text-amber-400 font-semibold block">{p.role} • OVR {p.overallRating}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Signed ₹{p.soldPrice?.toFixed(2) || p.basePrice} Cr</span>
                        </div>

                        <button
                          onClick={() => {
                            adminReleasePlayer(p.id);
                            soundService.playClick();
                          }}
                          className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[10px] transition-colors"
                        >
                          Release
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: PLAYER DATABASE & CREATOR */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-1 items-center gap-2 max-w-md bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search player by name, country..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={playerRoleFilter}
                onChange={(e) => setPlayerRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="all">All Roles</option>
                <option value="Batter">Batter</option>
                <option value="Fast Bowler">Fast Bowler</option>
                <option value="Spin Bowler">Spin Bowler</option>
                <option value="All-rounder">All-rounder</option>
                <option value="Wicketkeeper">Wicketkeeper</option>
              </select>

              <select
                value={playerStatusFilter}
                onChange={(e) => setPlayerStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="all">All Status</option>
                <option value="available">Available in Pool</option>
                <option value="sold">Sold</option>
                <option value="unsold">Unsold</option>
              </select>

              <button
                onClick={() => setIsNewPlayerModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Custom Player</span>
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="max-h-[550px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider z-10">
                  <tr>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Base Price</th>
                    <th className="py-3 px-3 text-center">OVR</th>
                    <th className="py-3 px-3 text-center">BAT / BOWL</th>
                    <th className="py-3 px-3">Current Team</th>
                    <th className="py-3 px-4 text-right">Quick Transfer / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlayers.map(p => {
                    const assignedTeam = teams.find(t => t.id === p.soldToTeamId);
                    const isEditing = editingPlayerId === p.id;
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              {p.isOverseas && <span className="text-[10px]" title="Overseas Player">✈️</span>}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                                {p.country}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-slate-600 font-semibold">{p.role}</td>

                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            ₹{p.basePrice.toFixed(2)} Cr
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <span className="font-mono font-black text-[11px]">
                              {p.overallRating}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center font-mono text-[10px] text-slate-500">
                            {p.battingRating} / {p.bowlingRating}
                          </td>

                          <td className="py-2.5 px-3">
                            {assignedTeam ? (
                              <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                                <TeamBadge teamId={assignedTeam.id} size="sm" />
                                <span>{assignedTeam.shortName}</span>
                              </span>
                            ) : p.isUnsold ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                                Unsold
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                                In Pool
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Direct Team Transfer Dropdown */}
                              <select
                                value={p.soldToTeamId || 'pool'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'pool') {
                                    adminReleasePlayer(p.id);
                                  } else {
                                    adminTransferPlayer(p.id, val);
                                  }
                                  soundService.playClick();
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-white"
                              >
                                <option value="pool">Pool / Free Agent</option>
                                {teams.map(t => (
                                  <option key={t.id} value={t.id}>{t.shortName}</option>
                                ))}
                              </select>

                              <button
                                onClick={() => setEditingPlayerId(isEditing ? null : p.id)}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                              >
                                {isEditing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Player Rating Editor */}
                        {isEditing && (
                          <tr className="bg-amber-50/40">
                            <td colSpan={7} className="p-4 border-t border-amber-200/50">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Overall Rating</label>
                                  <input
                                    type="number"
                                    min="40"
                                    max="99"
                                    value={p.overallRating}
                                    onChange={(e) => adminUpdatePlayer(p.id, { overallRating: Number(e.target.value) })}
                                    className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Batting Rating</label>
                                  <input
                                    type="number"
                                    min="20"
                                    max="99"
                                    value={p.battingRating}
                                    onChange={(e) => adminUpdatePlayer(p.id, { battingRating: Number(e.target.value) })}
                                    className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bowling Rating</label>
                                  <input
                                    type="number"
                                    min="20"
                                    max="99"
                                    value={p.bowlingRating}
                                    onChange={(e) => adminUpdatePlayer(p.id, { bowlingRating: Number(e.target.value) })}
                                    className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Base Price (₹ Cr)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={p.basePrice}
                                    onChange={(e) => adminUpdatePlayer(p.id, { basePrice: Number(e.target.value) })}
                                    className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono font-bold"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUCTION HAMMER OVERRIDE */}
      {activeTab === 'auction' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Lot Status Card */}
            <div className="rounded-3xl bg-slate-900 text-white p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                {auction.currentPlayer ? (
                  <div>
                    <h2 className="text-2xl font-black text-amber-400">{auction.currentPlayer.name}</h2>
                    <p className="text-xs text-slate-300 mt-1">
                      {auction.currentPlayer.role} • {auction.currentPlayer.country} • Base ₹{auction.currentPlayer.basePrice.toFixed(2)} Cr
                    </p>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Hammer Price</span>
                        <span className="text-xl font-black text-emerald-400 font-mono">
                          ₹{auction.currentBid.toFixed(2)} Cr
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Highest Bidder</span>
                        <span className="text-xs font-black text-amber-400">
                          {auction.highestBidderName || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No active player lot currently on the hammer.</p>
                )}
              </div>

              {/* Force Sell Controls */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Force Gavel Resolution</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Award To Franchise</label>
                    <select
                      value={forceSellTeamId}
                      onChange={(e) => setForceSellTeamId(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold outline-none"
                    >
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">Final Price (₹ Cr)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={forceSellPrice}
                      onChange={(e) => setForceSellPrice(parseFloat(e.target.value) || 2.0)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      adminForceSellCurrentLot(forceSellTeamId, forceSellPrice);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shadow-md"
                  >
                    🔨 FORCE SOLD TO {teams.find(t => t.id === forceSellTeamId)?.shortName}
                  </button>

                  <button
                    onClick={() => {
                      adminForceUnsoldCurrentLot();
                      soundService.playGavel();
                    }}
                    className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors shadow-md"
                  >
                    PASS / UNSOLD
                  </button>
                </div>
              </div>
            </div>

            {/* Jump to Any Lot Controller */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Jump to Any Lot in Pool</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select any player to immediately bring them to the live hammer in the auction arena.
                </p>

                <div className="mt-4 space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">Select Player Lot</label>
                  <select
                    value={auction.currentPlayerIndex}
                    onChange={(e) => adminJumpToLot(parseInt(e.target.value, 10))}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 outline-none"
                  >
                    {players.map((p, idx) => (
                      <option key={p.id} value={idx}>
                        Lot #{idx + 1}: {p.name} ({p.role}, Base ₹{p.basePrice} Cr) {p.isSold ? '• [SOLD]' : p.isUnsold ? '• [UNSOLD]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundService.playGavel();
                    setScreen('auction');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  <span>Open Live Auction Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TOURNAMENT & MATCH RIGGING */}
      {activeTab === 'tournament' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Tournament Fixtures & Standings Rigging</h2>
              <p className="text-xs text-slate-500">
                Matches Played: <span className="font-mono font-bold text-amber-800">{currentMatchIndex} / {leagueMatches.length}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  adminForceCrownChampion(userTeam.id);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
              >
                🏆 Crown {userTeam.shortName} Champions
              </button>
            </div>
          </div>

          {/* Fixtures List with Instant Force Winner */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
              {leagueMatches.map((m) => {
                const home = teams.find(t => t.id === m.homeTeamId);
                const away = teams.find(t => t.id === m.awayTeamId);
                return (
                  <div key={m.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-400 text-[10px]">#{m.matchNumber}</span>
                      <div className="flex items-center gap-2">
                        <TeamBadge teamId={m.homeTeamId} size="sm" />
                        <span className="font-extrabold text-slate-900">{home?.shortName}</span>
                        <span className="text-slate-400 font-bold">vs</span>
                        <span className="font-extrabold text-slate-900">{away?.shortName}</span>
                        <TeamBadge teamId={m.awayTeamId} size="sm" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          adminForceMatchResult(m.id, m.homeTeamId, `${home?.shortName} won by 18 runs`);
                          soundService.playClick();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-800"
                      >
                        Force {home?.shortName} Win
                      </button>

                      <button
                        onClick={() => {
                          adminForceMatchResult(m.id, m.awayTeamId, `${away?.shortName} won by 6 wickets`);
                          soundService.playClick();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-800"
                      >
                        Force {away?.shortName} Win
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BACKUP / EXPORT / IMPORT */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Save State */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase mb-1">
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>State Export</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Export Game Save JSON</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Download or copy your complete campaign state (all 10 franchises, rosters, budgets, live auction lots, fixtures, and profile).
                </p>

                <div className="mt-4">
                  <textarea
                    readOnly
                    value={adminExportState()}
                    className="w-full h-44 p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-700 resize-none outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyExport}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedNotification ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNotification ? 'COPIED TO CLIPBOARD!' : 'COPY SAVE JSON'}</span>
                </button>

                <button
                  onClick={handleDownloadExport}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors shadow-md"
                >
                  Download .json
                </button>
              </div>
            </div>

            {/* Import Save State */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sky-700 font-black text-xs uppercase mb-1">
                  <Upload className="w-4 h-4 text-sky-600" />
                  <span>State Restore</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Import Game Save JSON</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Paste a previously exported campaign JSON to restore your exact custom game state.
                </p>

                <div className="mt-4">
                  <textarea
                    placeholder="Paste JSON here..."
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="w-full h-44 p-3 rounded-2xl bg-white border border-slate-200 font-mono text-[10px] text-slate-900 resize-none outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {importStatus && (
                  <p className="text-xs font-bold mt-2 text-slate-800">{importStatus}</p>
                )}
              </div>

              <button
                onClick={handleImportSubmit}
                disabled={!importJsonText.trim()}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs shadow-md transition-all"
              >
                RESTORE CAMPAIGN STATE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOM PLAYER MODAL */}
      <AnimatePresence>
        {isNewPlayerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-xl w-full rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl my-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
                    🏏
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Create Custom Player</h3>
                </div>
                <button
                  onClick={() => setIsNewPlayerModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewPlayer} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Player Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suraj Reddy"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Role</label>
                    <select
                      value={newPlayerRole}
                      onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="Batter">Batter</option>
                      <option value="Fast Bowler">Fast Bowler</option>
                      <option value="Spin Bowler">Spin Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Country</label>
                    <input
                      type="text"
                      value={newPlayerCountry}
                      onChange={(e) => setNewPlayerCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Batting Hand</label>
                    <select
                      value={newPlayerBattingHand}
                      onChange={(e) => setNewPlayerBattingHand(e.target.value as BattingHand)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                    >
                      <option value="Right Hand">Right Hand</option>
                      <option value="Left Hand">Left Hand</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bowling Style</label>
                    <select
                      value={newPlayerBowlingStyle}
                      onChange={(e) => setNewPlayerBowlingStyle(e.target.value as BowlingStyle)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                    >
                      <option value="Right-arm Fast">Right-arm Fast</option>
                      <option value="Left-arm Fast">Left-arm Fast</option>
                      <option value="Right-arm Medium">Right-arm Medium</option>
                      <option value="Left-arm Medium">Left-arm Medium</option>
                      <option value="Right-arm Off-break">Right-arm Off-break</option>
                      <option value="Left-arm Orthodox">Left-arm Orthodox</option>
                      <option value="Right-arm Leg-break">Right-arm Leg-break</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Auction Tier</label>
                    <select
                      value={newPlayerTier}
                      onChange={(e) => setNewPlayerTier(e.target.value as PlayerTier)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                    >
                      <option value="Marquee">Marquee</option>
                      <option value="Tier 1">Tier 1</option>
                      <option value="Tier 2">Tier 2</option>
                      <option value="Emerging">Emerging</option>
                      <option value="Uncapped">Uncapped</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Overall (0-99)</label>
                    <input
                      type="number"
                      min="50"
                      max="99"
                      value={newPlayerOverall}
                      onChange={(e) => setNewPlayerOverall(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Batting Rating</label>
                    <input
                      type="number"
                      min="20"
                      max="99"
                      value={newPlayerBattingRating}
                      onChange={(e) => setNewPlayerBattingRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bowling Rating</label>
                    <input
                      type="number"
                      min="20"
                      max="99"
                      value={newPlayerBowlingRating}
                      onChange={(e) => setNewPlayerBowlingRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Base Price (₹ Cr)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="5.0"
                      value={newPlayerBasePrice}
                      onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isOverseasCheck"
                      checked={newPlayerIsOverseas}
                      onChange={(e) => setNewPlayerIsOverseas(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <label htmlFor="isOverseasCheck" className="font-bold text-slate-800">
                      Overseas Star (✈️)
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                  >
                    ADD TO AUCTION POOL
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewPlayerModalOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
