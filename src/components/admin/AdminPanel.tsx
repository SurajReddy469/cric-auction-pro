import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { Player, PlayerRole, BattingHand, BowlingStyle, PlayerTier } from '../../types/player';
import { AIPersonality } from '../../types/team';
import type { GameScreen } from '../../store/useGameStore';
import type { SessionFormat } from '../../types/session';
import { 
  Coins, 
  Search, 
  Trophy, 
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
  Gavel,
  Home,
  Building2,
  Users,
  CalendarDays,
  Database,
  Activity,
  Bell,
  UserCircle2,
  ChevronRight,
  ShieldCheck,
  Settings2,
  Gamepad2,
  Layers,
  Medal,
  Play,
  Pause,
  SkipForward,
  Plus,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';

type AdminTab = 'cheats' | 'controls' | 'sessions' | 'teams' | 'players' | 'auction' | 'tournament' | 'career' | 'backup';

interface AdminPanelProps {
  standalone?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ standalone = false }) => {
  const {
    teams,
    players,
    userTeamId,
    auction,
    leagueMatches,
    currentMatchIndex,
    championTeam,
    profile,
    achievements,
    settings,
    gameMode,
    currentScreen,
    sessions,
    activeSessionId,
    multiplayerRoom,
    setScreen,
    setGameMode,
    updateSettings,
    setDataset,
    selectTeam,
    createSession,
    switchSession,
    deleteSession,
    duplicateSession,
    startAuction,
    nextAuctionPlayer,
    adminToggleAuctionPause,
    adminUpdateAuction,
    startSeason,
    simulateNextMatch,
    simulateAllLeagueMatches,
    progressPlayoffs,
    startNextSeason,
    leaveMultiplayerRoom,
    adminUpdateTeamPurse,
    adminUpdateTeamPersonality,
    adminUpdateTeamTrophies,
    adminTransferPlayer,
    adminReleasePlayer,
    adminUpdatePlayer,
    adminCreatePlayer,
    adminAddScoutTokens,
    adminUnlockAllAchievements,
    adminUpdateProfile,
    adminUpdateAchievement,
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

  const [activeTab, setActiveTab] = useState<AdminTab>('teams');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Player search & filter
  const [playerSearch, setPlayerSearch] = useState<string>('');
  const [teamSearch, setTeamSearch] = useState<string>('');
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
  const [selectedTeamRosterId, setSelectedTeamRosterId] = useState<string | null>(teams[0]?.id || null);
  const [isEditingSelectedTeam, setIsEditingSelectedTeam] = useState(false);
  const [isSelectedSquadExpanded, setIsSelectedSquadExpanded] = useState(false);
  const [sessionName, setSessionName] = useState('Commissioner Session');
  const [sessionFormat, setSessionFormat] = useState<SessionFormat>('mega');
  const [sessionPurse, setSessionPurse] = useState(120);
  const [sessionYear, setSessionYear] = useState(2026);

  const userTeam = teams.find(t => t.id === userTeamId) || teams[0];
  const selectedTeam = teams.find(t => t.id === selectedTeamRosterId) || teams[0];

  const pageCopy: Record<AdminTab, { title: string; description: string }> = {
    cheats: {
      title: 'Commissioner Overview',
      description: 'Campaign health, quick controls, and commissioner actions.'
    },
    controls: {
      title: 'Game Controls',
      description: 'Manage game settings, navigation, game mode, and the active campaign.'
    },
    sessions: {
      title: 'Session Management',
      description: 'Create, switch, duplicate, and remove complete game campaigns.'
    },
    teams: {
      title: 'Franchise Operations',
      description: 'Manage franchise budgets, squads, and AI strategy from one workspace.'
    },
    players: {
      title: 'Player Database',
      description: 'Search, review, edit, and add players to the auction pool.'
    },
    auction: {
      title: 'Live Auction Control',
      description: 'Monitor the active lot and resolve the auction when needed.'
    },
    tournament: {
      title: 'Tournament Operations',
      description: 'Review fixtures and apply commissioner match controls.'
    },
    career: {
      title: 'Career & Achievements',
      description: 'Edit manager records, reputation, scouting resources, and achievement progress.'
    },
    backup: {
      title: 'Data & Backups',
      description: 'Export a campaign snapshot or restore a saved state.'
    }
  };

  const navGroups: { label: string; items: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
    { label: 'WORKSPACE', items: [{ id: 'cheats', label: 'Overview', icon: Home }] },
    { label: 'GAME CONTROL', items: [{ id: 'controls', label: 'Game Controls', icon: Settings2 }, { id: 'sessions', label: 'Sessions', icon: Layers }] },
    {
      label: 'MANAGEMENT',
      items: [
        { id: 'teams', label: 'Franchises', icon: Building2 },
        { id: 'players', label: 'Player Database', icon: Users },
        { id: 'auction', label: 'Live Auction', icon: Gavel },
        { id: 'tournament', label: 'Tournament', icon: CalendarDays }
      ]
    },
    { label: 'CAREER', items: [{ id: 'career', label: 'Career & Achievements', icon: Medal }] },
    { label: 'SYSTEM', items: [{ id: 'backup', label: 'Data & Backups', icon: Database }] }
  ];

  const liveAuction = auction.phase !== 'idle' && auction.phase !== 'completed';
  const availablePlayerCount = players.filter(player => !player.isSold && !player.isUnsold).length;
  const totalPurse = teams.reduce((sum, team) => sum + team.currentPurse, 0);
  const seasonProgress = leagueMatches.length
    ? Math.min(100, Math.round((currentMatchIndex / leagueMatches.length) * 100))
    : 0;
  const visibleTeams = teams.filter(team =>
    `${team.name} ${team.shortName} ${team.personality}`.toLowerCase().includes(teamSearch.toLowerCase())
  );

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
    <div className="mx-auto grid min-h-[calc(100vh-122px)] w-full max-w-[1680px] grid-cols-1 gap-5 px-3 py-4 sm:px-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:px-7 lg:py-6">
      <aside className="admin-sidebar h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
        <div className="mb-4 px-3 pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Commissioner</p>
          <p className="mt-1 text-sm font-black text-slate-900">Control Center</p>
        </div>

        <nav aria-label="Admin workspaces" className="space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[9px] font-extrabold tracking-[0.16em] text-slate-400">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        soundService.playClick();
                        setActiveTab(item.id);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-amber-100 text-amber-950 shadow-sm ring-1 ring-amber-200'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-800' : 'text-slate-400'}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-wide">Admin access</span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-emerald-700">Commissioner controls are enabled for this campaign.</p>
        </div>
      </aside>

      <main className="min-w-0 space-y-5">
        <div className="admin-workspace-toolbar flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
          {(activeTab === 'teams' || activeTab === 'players') ? (
            <label className="relative block w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={activeTab === 'teams' ? teamSearch : playerSearch}
                onChange={(event) => activeTab === 'teams' ? setTeamSearch(event.target.value) : setPlayerSearch(event.target.value)}
                placeholder={activeTab === 'teams' ? 'Search franchises...' : 'Search players by name or country...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </label>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Commissioner workspace</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wide ${liveAuction ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              <span className={`h-2 w-2 rounded-full ${liveAuction ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
              {liveAuction ? 'Auction Live' : 'Auction Standby'}
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 sm:flex">
              <Bell className="h-3.5 w-3.5 text-amber-600" />
              <span>{auction.feedMessages.length} updates</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <UserCircle2 className="h-4 w-4 text-slate-500" />
              <span className="max-w-32 truncate text-[10px] font-bold text-slate-700">{profile.name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{pageCopy[activeTab].title}</h1>
            <p className="mt-1 text-xs text-slate-500">{pageCopy[activeTab].description}</p>
          </div>
          {!standalone && (
            <button
              type="button"
              onClick={() => { soundService.playClick(); setScreen('menu'); }}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 sm:self-auto"
            >
              <span>Back to Game</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-6">
      
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

      {activeTab === 'controls' && (
        <div className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-amber-700" />
                <h2 className="text-sm font-black text-slate-900">Live game state</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Game mode
                  <select value={gameMode} onChange={event => {
                    const nextMode = event.target.value as 'singleplayer' | 'multiplayer';
                    if (nextMode === 'singleplayer' || multiplayerRoom) setGameMode(nextMode);
                  }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    <option value="singleplayer">Single-player with AI</option>
                    <option value="multiplayer" disabled={!multiplayerRoom && gameMode !== 'multiplayer'}>Multiplayer room</option>
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Game screen
                  <select value={currentScreen} onChange={event => setScreen(event.target.value as GameScreen)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    {(['start', 'menu', 'teams', 'auction', 'squad', 'season', 'admin', 'multiplayer_lobby'] as GameScreen[]).map(screen => <option key={screen} value={screen}>{screen.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:col-span-2">Managed franchise
                  <select value={userTeamId} onChange={event => selectTeam(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setScreen('auction')} className="rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950">Open auction</button>
                <button type="button" onClick={() => setScreen('season')} className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700">Open season</button>
                {multiplayerRoom && <button type="button" onClick={() => { if (window.confirm('Leave the current multiplayer room?')) leaveMultiplayerRoom(); }} className="rounded-xl bg-rose-100 px-3 py-2 text-[10px] font-black text-rose-800">Leave multiplayer room</button>}
              </div>
              <p className="mt-3 text-[10px] text-slate-500">{multiplayerRoom ? `Room ${multiplayerRoom.roomCode} is connected; its auction clock and bids are managed by the room server.` : 'No multiplayer room is connected.'}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-700" />
                <h2 className="text-sm font-black text-slate-900">Game settings</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Color mode
                  <select value={settings.theme} onChange={event => updateSettings({ theme: event.target.value as 'day' | 'night' })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    <option value="day">Day mode</option><option value="night">Night mode</option>
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Auction timer speed
                  <select value={settings.timerSpeed} onChange={event => updateSettings({ timerSpeed: event.target.value as 'slow' | 'standard' | 'fast' })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    <option value="slow">Slow</option><option value="standard">Standard</option><option value="fast">Fast</option>
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">AI aggression
                  <select value={settings.aiAggression} onChange={event => updateSettings({ aiAggression: event.target.value as 'balanced' | 'ruthless' | 'chill' })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    <option value="chill">Chill</option><option value="balanced">Balanced</option><option value="ruthless">Ruthless</option>
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Starting purse (Cr)
                  <input type="number" min="0" step="0.5" value={settings.startingPurse} onChange={event => updateSettings({ startingPurse: Math.max(0, Number(event.target.value)) })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800" />
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Player and team dataset
                  <select value={settings.dataset} onChange={event => {
                    const dataset = event.target.value as 'real' | 'fictional';
                    if (dataset !== settings.dataset && window.confirm('Changing the dataset replaces the current teams, players, and auction state. Continue?')) setDataset(dataset);
                  }} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-800">
                    <option value="real">Real IPL</option><option value="fictional">Fictional</option>
                  </select>
                </label>
                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600">Sound effects
                  <input type="checkbox" checked={settings.soundEnabled} onChange={event => updateSettings({ soundEnabled: event.target.checked })} className="h-4 w-4 accent-amber-500" />
                </label>
              </div>
              <p className="mt-3 text-[10px] text-slate-500">Starting purse applies to newly created sessions. Existing franchise purses are edited under Franchises.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><Settings2 className="h-4 w-4 text-amber-700" /><h2 className="text-sm font-black text-slate-900">Auction runtime</h2></div>
            <div className="flex flex-wrap items-end gap-2">
              {auction.phase === 'idle' || auction.phase === 'completed' ? (
                <button type="button" onClick={() => startAuction()} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white"><Play className="h-3.5 w-3.5" />Start auction</button>
              ) : (
                <>
                  <button type="button" onClick={adminToggleAuctionPause} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-[10px] font-black text-amber-900">{auction.isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}{auction.isPaused ? 'Resume clock' : 'Pause clock'}</button>
                  <button type="button" onClick={() => nextAuctionPlayer()} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-800"><SkipForward className="h-3.5 w-3.5" />Next lot</button>
                  <label className="text-[10px] font-bold text-slate-500">Clock seconds
                    <input type="number" min="0" max="99" value={auction.timerSeconds} onChange={event => adminUpdateAuction({ timerSeconds: Math.max(0, Number(event.target.value)) })} className="ml-2 w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900" />
                  </label>
                </>
              )}
              <button type="button" onClick={() => { if (window.confirm('Simulate every remaining auction lot?')) autoCompleteAuction(); }} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-white">Auto-complete auction</button>
              <span className="ml-auto text-[10px] font-bold uppercase text-slate-500">{auction.phase.replace('_', ' ')}{auction.currentPlayer ? ` · ${auction.currentPlayer.name}` : ''}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-5">
            <div><h2 className="text-sm font-black text-rose-950">Reset game data</h2><p className="mt-1 text-[10px] text-rose-800">Clear saved teams, players, sessions, settings, and career progress on this browser.</p></div>
            <button type="button" onClick={() => { if (window.confirm('Permanently reset all saved game data in this browser?')) resetAllGameData(); }} className="rounded-xl bg-rose-700 px-4 py-2.5 text-[10px] font-black text-white">Reset all data</button>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-5">
          <form onSubmit={event => {
            event.preventDefault();
            if (!sessionName.trim()) return;
            createSession({ name: sessionName.trim(), format: sessionFormat, purseCap: sessionPurse, seasonYear: sessionYear, aiAggression: settings.aiAggression, timerSpeed: settings.timerSpeed, preSelectedTeamId: userTeamId });
            setSessionName(`Commissioner Session ${sessions.length + 1}`);
          }} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-[10px] font-bold uppercase text-slate-500 xl:col-span-2">Session name<input required value={sessionName} onChange={event => setSessionName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold normal-case text-slate-900" /></label>
            <label className="text-[10px] font-bold uppercase text-slate-500">Format<select value={sessionFormat} onChange={event => setSessionFormat(event.target.value as SessionFormat)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold normal-case text-slate-900"><option value="mega">Mega</option><option value="mini">Mini</option><option value="turbo">Turbo</option><option value="custom">Custom</option></select></label>
            <label className="text-[10px] font-bold uppercase text-slate-500">Purse cap (Cr)<input type="number" min="1" value={sessionPurse} onChange={event => setSessionPurse(Math.max(1, Number(event.target.value)))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold normal-case text-slate-900" /></label>
            <label className="text-[10px] font-bold uppercase text-slate-500">Season year<input type="number" min="2000" max="2100" value={sessionYear} onChange={event => setSessionYear(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold normal-case text-slate-900" /></label>
            <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-[10px] font-black text-slate-950 sm:col-span-2 xl:col-span-5"><Plus className="h-3.5 w-3.5" />Create campaign session</button>
          </form>

          <div className="grid gap-3 xl:grid-cols-2">
            {sessions.map(session => (
              <article key={session.id} className={`rounded-3xl border bg-white p-5 shadow-sm ${session.id === activeSessionId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><div className="flex items-center gap-2"><h2 className="text-sm font-black text-slate-900">{session.name}</h2>{session.id === activeSessionId && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black uppercase text-emerald-800">Active</span>}</div><p className="mt-1 text-[10px] text-slate-500">{session.seasonYear} · {session.format} · ₹{session.purseCap} Cr · Room {session.roomCode}</p><p className="mt-1 text-[10px] text-slate-500">{session.teams.length} franchises · {session.players.length} players · {session.currentMatchIndex}/{session.leagueMatches.length} matches played</p></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.id !== activeSessionId && <button type="button" onClick={() => switchSession(session.id)} className="rounded-lg bg-amber-100 px-3 py-2 text-[9px] font-black text-amber-900">Switch to session</button>}
                    <button type="button" onClick={() => duplicateSession(session.id)} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-[9px] font-black text-slate-700"><Copy className="h-3 w-3" />Duplicate</button>
                    {sessions.length > 1 && <button type="button" onClick={() => { if (window.confirm(`Delete “${session.name}” and its saved campaign?`)) deleteSession(session.id); }} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-[9px] font-black text-rose-800"><Trash2 className="h-3 w-3" />Delete</button>}
                  </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FRANCHISES & PURSES */}
      {activeTab === 'teams' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>Total Purse Left</span><Coins className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-3 text-xl font-black text-slate-900">₹{totalPurse.toFixed(2)} Cr</p>
              <p className="mt-1 text-[10px] text-slate-500">Across {teams.length} franchises</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>Players in Pool</span><Users className="h-4 w-4 text-amber-700" />
              </div>
              <p className="mt-3 text-xl font-black text-slate-900">{availablePlayerCount}</p>
              <p className="mt-1 text-[10px] text-slate-500">Available to be drafted</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>Current Lot</span><Gavel className="h-4 w-4 text-amber-700" />
              </div>
              <p className="mt-3 truncate text-lg font-black text-slate-900">{auction.currentPlayer?.name || 'No active lot'}</p>
              <p className="mt-1 text-[10px] text-slate-500">{auction.currentPlayer ? `Lot ${auction.currentPlayerIndex + 1}` : 'Waiting for auction'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>Season Progress</span><Trophy className="h-4 w-4 text-amber-700" />
              </div>
              <p className="mt-3 text-xl font-black text-slate-900">{seasonProgress}%</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${seasonProgress}%` }} />
                </div>
                <span className="text-[9px] font-bold text-slate-500">{currentMatchIndex}/{leagueMatches.length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-emerald-900 px-4 py-3 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-2 font-black"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />{liveAuction ? 'AUCTION LIVE' : 'AUCTION MONITOR'}</span>
              <span className="hidden h-4 w-px bg-white/25 sm:block" />
              <span className="font-semibold text-emerald-50">{auction.currentPlayer?.name || 'No player is currently on the hammer'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-emerald-50">
              <span>Current bid <strong className="ml-1 text-white">₹{auction.currentBid.toFixed(2)} Cr</strong></span>
              <span>Leading <strong className="ml-1 text-white">{auction.highestBidderName || 'No bids yet'}</strong></span>
              {liveAuction && <span className="rounded-lg bg-white/15 px-2 py-1 font-mono">{auction.timerSeconds}s</span>}
            </div>
          </div>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Franchise Operations</h2>
                  <p className="mt-1 text-[10px] text-slate-500">Select a franchise to inspect its squad and controls.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    teams.forEach(team => adminUpdateTeamPurse(team.id, 120.0));
                    soundService.playBidSound(true);
                  }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Reset all purses
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[660px] text-left text-xs">
                  <thead className="bg-slate-50 text-[9px] font-extrabold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Franchise</th>
                      <th className="px-3 py-3">Squad</th>
                      <th className="px-3 py-3">Purse left</th>
                      <th className="px-3 py-3">Overseas</th>
                      <th className="px-3 py-3">AI strategy</th>
                      <th className="px-3 py-3" aria-label="Open details" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleTeams.map(team => {
                      const isSelected = team.id === selectedTeam?.id;
                      const overseasCount = team.squad.filter(player => player.isOverseas).length;
                      return (
                        <tr key={team.id} className={`transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                setSelectedTeamRosterId(team.id);
                                setIsEditingSelectedTeam(false);
                                setIsSelectedSquadExpanded(false);
                              }}
                              className="flex items-center gap-2.5 text-left"
                            >
                              <TeamBadge teamId={team.id} size="sm" />
                              <span>
                                <span className="block font-black text-slate-900">{team.name}</span>
                                <span className="mt-0.5 block text-[9px] text-slate-400">{team.shortName} · {team.city}{team.id === userTeamId ? ' · Your franchise' : ''}</span>
                              </span>
                            </button>
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-slate-700">{team.squad.length}/25</td>
                          <td className="px-3 py-3 font-mono font-bold text-emerald-800">₹{team.currentPurse.toFixed(2)} Cr</td>
                          <td className="px-3 py-3 font-mono text-slate-600">{overseasCount}/8</td>
                          <td className="px-3 py-3">
                            <span className="inline-flex max-w-36 items-center gap-1.5 truncate rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-800">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{team.personality}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              aria-label={`Inspect ${team.name}`}
                              onClick={() => {
                                setSelectedTeamRosterId(team.id);
                                setIsEditingSelectedTeam(false);
                                setIsSelectedSquadExpanded(false);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-100 hover:text-amber-800"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {visibleTeams.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-500">No franchises match “{teamSearch}”.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedTeam ? (
              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <TeamBadge teamId={selectedTeam.id} size="md" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Selected franchise</p>
                      <h2 className="mt-0.5 truncate text-sm font-black text-slate-900">{selectedTeam.name}</h2>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${selectedTeam.id === userTeamId ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'}`}>
                    {selectedTeam.id === userTeamId ? 'Your team' : 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-200 py-3 text-center">
                  <div><p className="text-[9px] text-slate-500">Squad</p><p className="mt-1 text-xs font-black text-slate-900">{selectedTeam.squad.length}/25</p></div>
                  <div><p className="text-[9px] text-slate-500">Purse left</p><p className="mt-1 text-xs font-black text-slate-900">₹{selectedTeam.currentPurse.toFixed(1)} Cr</p></div>
                  <div><p className="text-[9px] text-slate-500">Overseas</p><p className="mt-1 text-xs font-black text-slate-900">{selectedTeam.squad.filter(player => player.isOverseas).length}/8</p></div>
                </div>

                <div className="rounded-xl bg-emerald-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black text-emerald-900">AI Strategy</p>
                    <Activity className="h-3.5 w-3.5 text-emerald-700" />
                  </div>
                  <p className="mt-1 text-xs font-bold text-emerald-800">{selectedTeam.personality}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-emerald-800/80">{selectedTeam.strategicStrength}</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span>Squad snapshot</span><span>{selectedTeam.squad.length} players</span>
                  </div>
                  <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
                    <span className="bg-emerald-500" style={{ width: `${selectedTeam.squad.length ? ((selectedTeam.squad.length - selectedTeam.squad.filter(player => player.isOverseas).length) / selectedTeam.squad.length) * 100 : 0}%` }} />
                    <span className="bg-sky-500" style={{ width: `${selectedTeam.squad.length ? (selectedTeam.squad.filter(player => player.isOverseas).length / selectedTeam.squad.length) * 100 : 0}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-slate-500">
                    <span>Indian: {selectedTeam.squad.length - selectedTeam.squad.filter(player => player.isOverseas).length}</span>
                    <span>Overseas: {selectedTeam.squad.filter(player => player.isOverseas).length}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setIsEditingSelectedTeam(!isEditingSelectedTeam)} className="rounded-xl bg-amber-500 px-3 py-2.5 text-[10px] font-black text-slate-950 transition hover:bg-amber-400">
                    {isEditingSelectedTeam ? 'Done Editing' : 'Edit Franchise'}
                  </button>
                  <button type="button" onClick={() => setIsSelectedSquadExpanded(!isSelectedSquadExpanded)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-700 transition hover:bg-slate-50">
                    {isSelectedSquadExpanded ? 'Hide Squad' : 'Manage Squad'}
                  </button>
                </div>

                {isEditingSelectedTeam && (
                  <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <label className="block text-[9px] font-bold text-slate-600">
                      Purse left (₹ Cr)
                      <input type="number" step="0.5" min="0" value={selectedTeam.currentPurse} onChange={event => adminUpdateTeamPurse(selectedTeam.id, parseFloat(event.target.value) || 0)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                    </label>
                    <label className="block text-[9px] font-bold text-slate-600">
                      AI strategy
                      <select value={selectedTeam.personality} onChange={event => adminUpdateTeamPersonality(selectedTeam.id, event.target.value as AIPersonality)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-800 outline-none">
                        {personalitiesList.map(personality => <option key={personality} value={personality}>{personality}</option>)}
                      </select>
                    </label>
                    <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2">
                      <span className="text-[9px] font-bold text-slate-600">Career trophies</span>
                      <div className="flex items-center gap-2">
                        <button type="button" aria-label="Remove trophy" onClick={() => adminUpdateTeamTrophies(selectedTeam.id, Math.max(0, selectedTeam.trophies - 1))} className="h-6 w-6 rounded-md bg-slate-100 text-xs font-black text-slate-700">−</button>
                        <span className="min-w-5 text-center text-xs font-black text-slate-900">{selectedTeam.trophies}</span>
                        <button type="button" aria-label="Add trophy" onClick={() => adminUpdateTeamTrophies(selectedTeam.id, selectedTeam.trophies + 1)} className="h-6 w-6 rounded-md bg-slate-100 text-xs font-black text-slate-700">+</button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => adminUpdateTeamPurse(selectedTeam.id, selectedTeam.currentPurse + 5)} className="flex-1 rounded-lg bg-amber-100 py-2 text-[9px] font-bold text-amber-900">+₹5 Cr</button>
                      <button type="button" onClick={() => adminUpdateTeamPurse(selectedTeam.id, selectedTeam.currentPurse + 20)} className="flex-1 rounded-lg bg-amber-100 py-2 text-[9px] font-bold text-amber-900">+₹20 Cr</button>
                      <button type="button" onClick={() => adminUpdateTeamPurse(selectedTeam.id, selectedTeam.startingPurse)} className="flex-1 rounded-lg bg-slate-200 py-2 text-[9px] font-bold text-slate-700">Reset</button>
                    </div>
                  </div>
                )}

                {isSelectedSquadExpanded && (
                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {selectedTeam.squad.length ? selectedTeam.squad.map(player => (
                      <div key={player.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-bold text-slate-800">{player.name}</p>
                          <p className="mt-0.5 text-[9px] text-slate-500">{player.role}{player.isOverseas ? ' · Overseas' : ''}</p>
                        </div>
                        <button type="button" onClick={() => adminReleasePlayer(player.id)} className="shrink-0 rounded-lg bg-rose-50 px-2 py-1.5 text-[9px] font-bold text-rose-700 transition hover:bg-rose-100">Release</button>
                      </div>
                    )) : <p className="rounded-xl bg-slate-50 p-4 text-center text-[10px] text-slate-500">No players signed to this franchise yet.</p>}
                  </div>
                )}
              </aside>
            ) : (
              <aside className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">Select a franchise to view its details.</aside>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-amber-700" /><h2 className="text-xs font-black text-slate-900">Recent Events</h2></div>
              <span className="text-[9px] font-bold text-slate-400">Latest auction activity</span>
            </div>
            <div className="divide-y divide-slate-100">
              {auction.feedMessages.slice(0, 3).length ? auction.feedMessages.slice(0, 3).map(event => {
                const eventTime = new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                const eventTone = event.type === 'sold' ? 'bg-emerald-50 text-emerald-800' : event.type === 'warning' || event.type === 'unsold' ? 'bg-rose-50 text-rose-800' : event.type === 'bid' ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-700';
                return (
                  <div key={event.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`min-w-14 rounded-md px-2 py-1 text-center text-[8px] font-black uppercase ${eventTone}`}>{event.type}</span>
                    <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-slate-700">{event.text}</p>
                    <span className="shrink-0 text-[9px] text-slate-400">{eventTime}</span>
                  </div>
                );
              }) : <p className="px-4 py-5 text-center text-[10px] text-slate-500">No auction events yet.</p>}
            </div>
          </div>
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
            <div className="flex flex-wrap items-center gap-2">
              {leagueMatches.length === 0 ? (
                <button type="button" onClick={() => startSeason()} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white"><Play className="h-3.5 w-3.5" />Start season</button>
              ) : (
                <>
                  <button type="button" disabled={currentMatchIndex >= leagueMatches.length} onClick={() => simulateNextMatch()} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white disabled:cursor-not-allowed disabled:opacity-40"><SkipForward className="h-3.5 w-3.5" />Simulate next</button>
                  <button type="button" onClick={() => { if (window.confirm('Simulate all remaining league matches and playoffs?')) simulateAllLeagueMatches(); }} className="rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black text-white">Simulate season</button>
                  {currentMatchIndex >= leagueMatches.length && <button type="button" onClick={() => progressPlayoffs()} className="rounded-xl bg-violet-100 px-3 py-2 text-[10px] font-black text-violet-900">Resolve playoffs</button>}
                  {championTeam && <button type="button" onClick={() => { if (window.confirm('Advance the career to the next season?')) startNextSeason(); }} className="rounded-xl bg-sky-100 px-3 py-2 text-[10px] font-black text-sky-900">Start next season</button>}
                </>
              )}
              <button type="button" onClick={() => { if (window.confirm('Replace the current fixture list with a new season schedule?')) startSeason(); }} className="rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-700">Reset schedule</button>
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

      {activeTab === 'career' && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="text-sm font-black text-slate-900">Manager profile</h2><p className="mt-1 text-[10px] text-slate-500">All career counters and the manager identity can be edited directly.</p></div>
              <button type="button" onClick={() => adminAddScoutTokens(10)} className="rounded-xl bg-amber-100 px-3 py-2 text-[10px] font-black text-amber-900">Add 10 scout tokens</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-[10px] font-bold uppercase text-slate-500 xl:col-span-2">Manager name<input value={profile.name} onChange={event => adminUpdateProfile({ name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold normal-case text-slate-900" /></label>
              {([
                ['Reputation', 'reputation', 0, 100, 1],
                ['Seasons', 'totalSeasons', 0, 999, 1],
                ['Trophies', 'trophies', 0, 9999, 1],
                ['Matches played', 'matchesPlayed', 0, 99999, 1],
                ['Matches won', 'matchesWon', 0, 99999, 1],
                ['Auction wins', 'auctionWins', 0, 99999, 1],
                ['Total spent (Cr)', 'totalSpent', 0, 999999, 0.5],
                ['Win rate (%)', 'winRate', 0, 100, 0.1],
                ['Scout tokens', 'scoutTokens', 0, 99999, 1],
              ] as const).map(([label, field, min, max, step]) => (
                <label key={field} className="text-[10px] font-bold uppercase text-slate-500">{label}<input type="number" min={min} max={max} step={step} value={profile[field]} onChange={event => adminUpdateProfile({ [field]: Math.min(max, Math.max(min, Number(event.target.value))) })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold normal-case text-slate-900" /></label>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div><h2 className="text-sm font-black text-slate-900">Achievement control</h2><p className="mt-1 text-[10px] text-slate-500">Unlock or relock any achievement and edit its progress value.</p></div>
              <button type="button" onClick={() => adminUnlockAllAchievements()} className="rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-black text-slate-950">Unlock all achievements</button>
            </div>
            <div className="divide-y divide-slate-100">
              {achievements.map(achievement => (
                <div key={achievement.id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden="true">{achievement.icon}</span>
                    <div><h3 className="text-xs font-black text-slate-900">{achievement.title}</h3><p className="mt-1 text-[10px] text-slate-500">{achievement.description} · {achievement.category}</p><p className="mt-1 text-[9px] text-slate-400">{achievement.unlocked ? `Unlocked ${achievement.unlockedAt || ''}` : 'Locked'}</p></div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {achievement.progress && <>
                      <label className="text-[9px] font-bold text-slate-500">Progress <input type="number" min="0" value={achievement.progress.current} onChange={event => adminUpdateAchievement(achievement.id, { progress: { ...achievement.progress!, current: Math.max(0, Number(event.target.value)) } })} className="ml-1 w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900" /></label>
                      <span className="text-[9px] text-slate-400">of</span>
                      <input aria-label={`${achievement.title} progress target`} type="number" min="1" value={achievement.progress.max} onChange={event => adminUpdateAchievement(achievement.id, { progress: { ...achievement.progress!, max: Math.max(1, Number(event.target.value)) } })} className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900" />
                    </>}
                    <label className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-black text-slate-700"><input type="checkbox" checked={achievement.unlocked} onChange={event => adminUpdateAchievement(achievement.id, { unlocked: event.target.checked, unlockedAt: event.target.checked ? achievement.unlockedAt || new Date().toLocaleDateString() : undefined })} className="h-3.5 w-3.5 accent-amber-500" />Unlocked</label>
                  </div>
                </div>
              ))}
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
                  Download or copy the full campaign snapshot: franchises, players, auction, season results, settings, profile, achievements, and saved sessions.
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
      </main>
    </div>
  );
};
