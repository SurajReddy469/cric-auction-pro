import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { soundService } from '../../services/soundService';
import {
  Users,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Play,
  CircleDollarSign,
  Crown,
  AlertCircle
} from 'lucide-react';

export const MultiplayerLobby: React.FC = () => {
  const {
    multiplayerRoom,
    myParticipantId,
    teams,
    claimMultiplayerTeam,
    toggleMultiplayerReady,
    startMultiplayerAuction,
    leaveMultiplayerRoom,
    multiplayerError,
    setMultiplayerError,
  } = useGameStore();

  const [copiedCode, setCopiedCode] = useState(false);

  if (!multiplayerRoom) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-500">Connecting to multiplayer room...</p>
          <button
            onClick={leaveMultiplayerRoom}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  }

  const { roomCode, roomName, requiredPlayers, participants } = multiplayerRoom;
  const myParticipant = participants.find(p => p.id === myParticipantId);
  const isHost = myParticipant?.isHost ?? false;
  const readyCount = participants.filter(p => p.isReady).length;
  const hasEnoughPlayers = participants.length >= requiredPlayers;
  const allReady = hasEnoughPlayers && participants.every(p => p.isReady && p.teamId);
  const playersNeeded = Math.max(requiredPlayers - participants.length, 0);
  const playersNotReady = participants.filter(p => !p.isReady || !p.teamId).length;

  const lobbyStatus = playersNeeded > 0
    ? `Waiting for ${playersNeeded} more player${playersNeeded === 1 ? '' : 's'} to join`
    : !myParticipant?.teamId
      ? 'Choose a franchise to continue'
      : !myParticipant.isReady
        ? 'Ready up when you are set'
        : !allReady
          ? `Waiting for ${playersNotReady} other player${playersNotReady === 1 ? '' : 's'} to get ready`
          : isHost
            ? 'Everyone is ready. You can launch the auction.'
            : 'Everyone is ready. Waiting for the host to launch.';
  const auctionButtonLabel = allReady
    ? 'Launch Auction'
    : playersNeeded > 0
      ? `Waiting for ${playersNeeded} more player${playersNeeded === 1 ? '' : 's'} to join`
      : `Waiting for ${playersNotReady} player${playersNotReady === 1 ? '' : 's'} to get ready`;

  const handleCopyCode = async () => {
    soundService.playClick();
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable.');
      }
      await navigator.clipboard.writeText(roomCode);
      setMultiplayerError(null);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(false);
      setMultiplayerError('Could not copy the room code. Please copy it manually.');
    }
  };

  const handleClaimTeam = (teamId: string) => {
    soundService.playClick();
    setMultiplayerError(null);
    claimMultiplayerTeam(teamId);
  };

  const handleStartAuction = () => {
    if (!allReady) return;
    soundService.playGavel();
    startMultiplayerAuction();
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-6xl flex-col gap-6 px-3 py-6 sm:px-6 lg:px-8">
      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white p-4 sm:p-5 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Leave this room and return to menu?')) {
                  leaveMultiplayerRoom();
                }
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              title="Leave Room"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
                {roomName}
              </h1>
            </div>
          </div>

          {/* Room Code Share Card */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 sm:px-3">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Room Code</div>
              <div className="text-xl font-black text-amber-300 tracking-widest">{roomCode}</div>
            </div>
            <button
              onClick={handleCopyCode}
              aria-label={copiedCode ? 'Room code copied' : 'Copy room code'}
              className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 text-slate-950 font-black hover:bg-amber-300 transition-colors shadow-sm"
              title={copiedCode ? 'Copied!' : 'Copy Room Code'}
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Requirements status bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs font-semibold">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="h-4 w-4 text-sky-400" />
              <span>Players</span>
              <strong className="text-white">{participants.length} of {requiredPlayers}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Ready</span>
              <strong className="text-white">{readyCount} of {requiredPlayers}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            {isHost && (
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <Crown className="h-3.5 w-3.5 fill-current" />
                <span>Room host</span>
              </span>
            )}
            <span className="text-slate-300">
              {lobbyStatus}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Error alert if any */}
      {multiplayerError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{multiplayerError}</span>
          </div>
          <button
            onClick={() => setMultiplayerError(null)}
            className="text-red-600 hover:text-red-900 ml-2"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Main Grid: Connected Participants & Franchise Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Human Participants (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Connected Players ({participants.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {participants.map((p) => {
              const isMe = p.id === myParticipantId;
              const claimedTeam = teams.find(t => t.id === p.teamId);

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isMe
                      ? 'border-amber-400 bg-amber-50/70 shadow-sm ring-1 ring-amber-400/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-xs">
                      {claimedTeam ? <TeamBadge teamId={claimedTeam.id} size="sm" /> : p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900 truncate">
                          {p.name} {isMe && '(You)'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500 truncate">
                        {claimedTeam ? claimedTeam.name : 'Choosing franchise...'}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* User Ready & Start Controls */}
          <div className="pt-2 space-y-3">
            <button
              onClick={() => {
                soundService.playClick();
                toggleMultiplayerReady();
              }}
              disabled={!myParticipant?.teamId}
              className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                !myParticipant?.teamId
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : myParticipant?.isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              {myParticipant?.isReady ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>You Are Ready! (Click to cancel)</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Ready Up for Auction</span>
                </>
              )}
            </button>

            {isHost && (
              <button
                onClick={handleStartAuction}
                disabled={!allReady}
                className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                  allReady
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 shadow-xl shadow-slate-950/20 hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{auctionButtonLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Claim Franchise (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Claim Your Franchise (1 player per team)
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Purse: ₹{multiplayerRoom.purseCap} Cr
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => {
              const claimedBy = participants.find(p => p.teamId === team.id);
              const isClaimedByMe = claimedBy?.id === myParticipantId;
              const isClaimedByOther = claimedBy && !isClaimedByMe;

              return (
                <button
                  key={team.id}
                  type="button"
                  disabled={Boolean(isClaimedByOther)}
                  onClick={() => handleClaimTeam(team.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[110px] ${
                    isClaimedByMe
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40 shadow-sm'
                      : isClaimedByOther
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <TeamBadge teamId={team.id} size="sm" />
                      <div>
                        <div className="font-black text-sm text-slate-900 leading-tight">
                          {team.name}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          {team.city}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      ₹{multiplayerRoom.purseCap} Cr
                    </span>

                    {isClaimedByMe ? (
                      <span className="text-emerald-700 font-black flex items-center gap-1 text-[11px]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        Your Team
                      </span>
                    ) : isClaimedByOther ? (
                      <span className="text-slate-500 font-bold text-[11px] truncate max-w-[120px]">
                        Claimed by {claimedBy.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-[11px] hover:text-slate-700">
                        Available · Claim
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
