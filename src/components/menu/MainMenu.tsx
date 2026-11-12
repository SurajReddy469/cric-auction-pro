import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import { IPLFloatingButton } from '../session/IPLFloatingButton';
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Flame,
  Gauge,
  Play,
  Plus,
  Settings2,
  Shield,
  Sparkles,
  Trophy,
  Timer,
  Users,
  Radio,
  UserCheck
} from 'lucide-react';

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export const MainMenu: React.FC = () => {
  const {
    setScreen,
    userTeam,
    profile,
    setSettingsOpen,
    auction,
    updateSettings,
    teams,
    players,
    leagueMatches,
    currentMatchIndex,
    sessions,
    activeSessionId,
    setSessionModalOpen,
    gameMode,
    multiplayerRoom,
    setMultiplayerModalOpen,
  } = useGameStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const team = userTeam();
  const isAuctionActive = auction.phase !== 'idle' && auction.phase !== 'completed';
  const isAuctionFinished = auction.phase === 'completed';
  const hasDraftedPlayers = (team?.squad.length ?? 0) > 0;
  const isSeasonReady = leagueMatches.length > 0;
  const totalAuctionLots = auction.auctionHistory.length;
  const botCount = Math.max(teams.length - 1, 0);

  const openAuction = () => {
    soundService.playClick();
    if (isAuctionActive) setScreen('auction');
    else if (isAuctionFinished) setScreen('squad');
    else setScreen('teams');
  };

  const openSquad = () => {
    soundService.playClick();
    if (!hasDraftedPlayers) {
      setScreen(isAuctionActive ? 'auction' : 'teams');
      return;
    }
    setScreen('squad');
  };

  const openSeason = () => {
    soundService.playClick();
    if (!isSeasonReady) {
      setScreen(hasDraftedPlayers ? 'squad' : isAuctionActive ? 'auction' : 'teams');
      return;
    }
    setScreen('season');
  };

  const openBlitz = () => {
    soundService.playClick();
    updateSettings({ timerSpeed: 'fast', aiAggression: 'ruthless' });
    openAuction();
  };

  const openMultiplayer = () => {
    soundService.playClick();
    if (multiplayerRoom) {
      setScreen('multiplayer_lobby');
    } else {
      setMultiplayerModalOpen(true);
    }
  };

  const primaryLabel = isAuctionActive
    ? 'Resume Solo Auction'
    : isAuctionFinished
      ? 'Manage Solo Squad'
      : 'Play Single-Player (vs AI)';

  const statusLabel = isAuctionActive
    ? 'Auction in progress'
    : isAuctionFinished
      ? 'Auction complete'
      : isSeasonReady
        ? 'Season underway'
        : 'Ready for a new season';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-7xl flex-col gap-5 px-3 py-5 sm:gap-7 sm:px-6 sm:py-8 lg:px-8">
      <motion.section
        {...cardMotion}
        className="relative isolate overflow-hidden rounded-[2rem] bg-[#101b30] text-white shadow-2xl shadow-slate-900/15"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_10%,rgba(245,158,11,0.26),transparent_40%),radial-gradient(ellipse_at_5%_100%,rgba(14,165,233,0.2),transparent_42%)]" />
        <div className="pointer-events-none absolute -right-14 -top-16 -z-10 hidden opacity-30 lg:block" aria-hidden="true">
          <svg width="470" height="470" viewBox="0 0 470 470" fill="none">
            <circle cx="245" cy="235" r="206" stroke="white" strokeOpacity=".17" />
            <circle cx="245" cy="235" r="174" stroke="white" strokeOpacity=".12" />
            <ellipse cx="245" cy="235" rx="75" ry="156" stroke="#fbbf24" strokeOpacity=".48" strokeWidth="2" />
            <path d="M170 235h150M245 80v310" stroke="white" strokeOpacity=".2" strokeDasharray="5 8" />
            <path d="M222 206h46v58h-46z" fill="#d4a65d" fillOpacity=".28" stroke="#fbbf24" strokeOpacity=".55" />
            <path d="M228 211v48m34-48v48" stroke="white" strokeOpacity=".6" strokeWidth="2" />
            <circle cx="245" cy="235" r="7" fill="#fbbf24" />
          </svg>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:p-11">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200 sm:text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>
                The franchise owner’s desk
              </div>

              {/* Game Mode Badge */}
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
                gameMode === 'multiplayer'
                  ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                  : 'border border-sky-400/30 bg-sky-500/10 text-sky-300'
              }`}>
                {gameMode === 'multiplayer' ? (
                  <>
                    <UserCheck className="h-3 w-3 text-emerald-400" />
                    <span>Multiplayer (Humans Only)</span>
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3 text-sky-400" />
                    <span>Single-Player (vs AI Bots)</span>
                  </>
                )}
              </div>

              {/* Active IPL Session Badge */}
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setSessionModalOpen(true);
                }}
                className="group inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-slate-900/80 hover:bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300 transition-all hover:border-amber-300"
                title="Manage IPL sessions"
              >
                <Sparkles className="h-3 w-3 fill-current text-amber-400" />
                <span className="text-slate-400">Session:</span>
                <span className="truncate max-w-[120px] sm:max-w-[180px] text-white">
                  {activeSession?.name || 'IPL 2025 Mega'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px]">
                  #{activeSession?.roomCode || 'JDLJ77'}
                </span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black group-hover:rotate-90 transition-transform">
                  <Plus className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              </button>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Welcome back, {profile.name || 'Manager'}
              </p>
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setScreen('start');
                }}
                className="text-[10px] font-black text-amber-300 hover:text-amber-200 uppercase tracking-wider underline underline-offset-2"
                title="Change Manager Name & Franchise on Start Page"
              >
                (Change Name / Team)
              </button>
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
              Build your team.<br />
              <span className="text-amber-400">Own the season.</span>
            </h1>
            
            {/* Primary Action Buttons: Online Multiplayer vs Single Player */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {/* Online Multiplayer (Humans Only) Button */}
              <button
                onClick={openMultiplayer}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <Radio className="h-4 w-4 animate-pulse text-slate-950" />
                {multiplayerRoom ? `Resume Room #${multiplayerRoom.roomCode}` : 'Online Multiplayer (Humans Only)'}
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </button>

              {/* Single-Player (vs AI Bots) Button */}
              <button
                onClick={openAuction}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                <Play className="h-4 w-4 fill-current" />
                {primaryLabel}
              </button>

              {/* Game Settings */}
              <button
                onClick={() => { soundService.playClick(); setSettingsOpen(true); }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Settings2 className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 p-4 shadow-xl backdrop-blur-md sm:p-5">
            {team && <div className="absolute inset-x-0 top-0 h-1 opacity-90" style={{ backgroundColor: team.primaryColor }} />}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                {gameMode === 'multiplayer' ? 'Multiplayer Lobby' : 'Single-Player Campaign'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {gameMode === 'multiplayer' && multiplayerRoom ? `Room ${multiplayerRoom.roomCode}` : statusLabel}
              </span>
            </div>
            {team ? (
              <div className="mt-5 flex items-center gap-3">
                <TeamBadge teamId={team.id} size="lg" />
                <div className="min-w-0">
                  <div className="truncate text-lg font-black text-white">{team.name}</div>
                  <div className="text-xs font-semibold text-slate-400">
                    {team.city} <span className="px-1 text-slate-600">/</span> {gameMode === 'multiplayer' ? 'Human Managed' : team.personality}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><Shield className="h-6 w-6 text-amber-300" /></div>
                <div className="font-black">Choose your franchise</div>
              </div>
            )}
            <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-4">
              <div className="px-2 first:pl-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Purse left</div>
                <div className="mt-1 text-sm font-black tabular-nums text-amber-300">₹{(team?.currentPurse ?? 120).toFixed(1)} Cr</div>
              </div>
              <div className="px-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Squad</div>
                <div className="mt-1 text-sm font-black tabular-nums text-white">{team?.squad.length ?? 0}<span className="font-semibold text-slate-500"> / 25</span></div>
              </div>
              <div className="px-3 last:pr-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {gameMode === 'multiplayer' ? 'Human Slots' : 'Teams'}
                </div>
                <div className="mt-1 text-sm font-black tabular-nums text-white">
                  {gameMode === 'multiplayer' && multiplayerRoom ? (
                    `${multiplayerRoom.participants.length} / ${multiplayerRoom.maxParticipants} Humans`
                  ) : (
                    <>{teams.length}<span className="font-semibold text-slate-500"> · {botCount} bots</span></>
                  )}
                </div>
              </div>
            </div>
            {isAuctionActive && auction.currentPlayer && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.07] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Timer className="h-4 w-4 shrink-0 text-amber-300" />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-black text-white">{auction.currentPlayer.name}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{auction.currentPlayer.tier} lot · live now</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-black tabular-nums text-amber-300">₹{auction.currentBid.toFixed(2)} Cr</div>
                  <div className="text-[10px] text-slate-400">{auction.timerSeconds}s left</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Online Multiplayer Banner */}
      <section className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Online Multiplayer (Humans Only)</span>
                <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300 tracking-wider">
                  Zero Bots Guaranteed
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={openMultiplayer}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-3 text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            {multiplayerRoom ? `Open Room (${multiplayerRoom.roomCode})` : 'Host or Join Room'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Campaign overview">
        <StatCard icon={<CircleDollarSign className="h-4 w-4" />} label="Auction activity" value={`${totalAuctionLots} / ${players.length}`} detail="player lots completed" tint="amber" progress={players.length ? totalAuctionLots / players.length : 0} />
        <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Season progress" value={isSeasonReady ? `${currentMatchIndex} / ${leagueMatches.length}` : 'Not started'} detail={isSeasonReady ? 'matches played' : 'finish your auction to begin'} tint="sky" progress={leagueMatches.length ? currentMatchIndex / leagueMatches.length : 0} />
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Career honours" value={`${team?.trophies ?? profile.trophies ?? 0}`} detail="trophies won" tint="violet" />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Your control room</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Pick up where you left off</h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <ActionCard
            icon={<Flame className="h-5 w-5" />}
            eyebrow="Single-Player Auction"
            title={isAuctionActive ? 'Live auction' : isAuctionFinished ? 'Auction review' : 'Mega auction'}
            description=""
            action={isAuctionActive ? 'Resume bidding' : isAuctionFinished ? 'Review squad' : 'Choose a team'}
            tone="amber"
            onClick={openAuction}
          />
          <ActionCard
            icon={<Users className="h-5 w-5" />}
            eyebrow="Squad room"
            title="Your lineup"
            description=""
            action={hasDraftedPlayers ? 'Manage squad' : 'Go to auction'}
            tone="sky"
            onClick={openSquad}
          />
          <ActionCard
            icon={<Crown className="h-5 w-5" />}
            eyebrow="The big stage"
            title="Championship"
            description=""
            action={isSeasonReady ? 'Open season' : 'Prepare squad'}
            tone="emerald"
            onClick={openSeason}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400"><Gauge className="h-5 w-5" /></div>
            <div>
              <div className="text-sm font-black text-slate-900">Want a faster auction?</div>
            </div>
          </div>
          <button onClick={openBlitz} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500">
            Try blitz mode <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 px-1 pt-4 text-[11px] text-slate-500 sm:flex-row">
        <button onClick={() => { soundService.playClick(); setSettingsOpen(true); }} className="font-bold text-slate-600 transition hover:text-amber-800">Audio, appearance & game settings</button>
      </footer>

      {/* Floating '+' Action Button for creating IPL sessions */}
      <IPLFloatingButton />
    </div>
  );
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tint: 'amber' | 'sky' | 'violet';
  progress?: number;
};

const statTints = {
  amber: 'bg-amber-50 text-amber-700',
  sky: 'bg-sky-50 text-sky-700',
  violet: 'bg-violet-50 text-violet-700',
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, detail, tint, progress }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statTints[tint]}`}>{icon}</div>
    <div className="min-w-0">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-0.5 truncate text-lg font-black leading-tight text-slate-900">{value}</div>
      <div className="mt-0.5 truncate text-[11px] text-slate-500">{detail}</div>
      {progress !== undefined && <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-[width] duration-500 ${tint === 'amber' ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${Math.max(0, Math.min(progress * 100, 100))}%` }} /></div>}
    </div>
  </div>
);

type ActionCardProps = {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  tone: 'amber' | 'sky' | 'emerald';
  onClick: () => void;
};

const actionTones = {
  amber: { icon: 'bg-amber-100 text-amber-800', eyebrow: 'text-amber-800', hover: 'hover:border-amber-300 hover:shadow-amber-900/5' },
  sky: { icon: 'bg-sky-100 text-sky-800', eyebrow: 'text-sky-800', hover: 'hover:border-sky-300 hover:shadow-sky-900/5' },
  emerald: { icon: 'bg-emerald-100 text-emerald-800', eyebrow: 'text-emerald-800', hover: 'hover:border-emerald-300 hover:shadow-emerald-900/5' },
};

const ActionCard: React.FC<ActionCardProps> = ({ icon, eyebrow, title, description, action, tone, onClick }) => {
  const colors = actionTones[tone];
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`group flex min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${colors.hover}`}
    >
      <div className="flex w-full items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}>{icon}</span>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
      </div>
      <span className={`mt-4 text-[9px] font-black uppercase tracking-[0.16em] ${colors.eyebrow}`}>{eyebrow}</span>
      <span className="mt-1 text-lg font-black text-slate-900">{title}</span>
      {description && <span className="mt-1 text-xs leading-relaxed text-slate-500">{description}</span>}
      <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-black text-slate-800">{action}<ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
    </motion.button>
  );
};
