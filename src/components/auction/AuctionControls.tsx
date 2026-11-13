import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { getNextBidAmount, getNextBidIncrement } from '../../services/aiBiddingEngine';
import { soundService } from '../../services/soundService';
import { Gavel, FastForward, Search, Sparkles } from 'lucide-react';

export const AuctionControls: React.FC = () => {
  const {
    auction,
    userTeamId,
    gameMode,
    multiplayerRoom,
    myParticipantId,
    profile,
    teams,
    placeHumanBid,
    passCurrentPlayer,
    setScoutModalOpen,
  } = useGameStore();

  // Resolve player's active franchise robustly across Singleplayer and Multiplayer
  const myMpParticipant = multiplayerRoom?.participants.find(
    p => p.id === myParticipantId || (profile?.name && p.name.trim().toLowerCase() === profile.name.trim().toLowerCase())
  );

  const activeTeamId = (gameMode === 'multiplayer' && myMpParticipant?.teamId)
    ? myMpParticipant.teamId
    : userTeamId;

  const userTeam = teams.find(t => t.id === activeTeamId)
    || teams.find(t => t.id === userTeamId)
    || teams[0];

  if (!auction.currentPlayer) return null;

  const currentBid = auction.currentBid;
  const basePrice = auction.currentPlayer.basePrice;
  const nextMinBid = getNextBidAmount(currentBid, basePrice);
  const increment = getNextBidIncrement(currentBid);

  // Jump bid (+2 increments)
  const jumpBid = Number((nextMinBid + increment).toFixed(2));

  const isUserHighestBidder = Boolean(activeTeamId && auction.highestBidderId === activeTeamId);
  const canAffordNextBid = userTeam ? userTeam.currentPurse >= nextMinBid : true;
  const canAffordJumpBid = userTeam ? userTeam.currentPurse >= jumpBid : true;

  const isBiddingActive = 
    auction.phase === 'bidding' || 
    auction.phase === 'going_once' || 
    auction.phase === 'going_twice' ||
    auction.phase === 'live' ||
    (auction.phase as string) === 'active' ||
    (gameMode === 'multiplayer' && auction.timerSeconds > 0 && auction.phase !== 'completed');

  const handleBidClick = (amount: number) => {
    if (isUserHighestBidder) {
      soundService.playClick();
      return;
    }
    if (!canAffordNextBid) {
      soundService.playBuzzer();
      alert(`Insufficient purse! Your franchise has ₹${userTeam.currentPurse.toFixed(2)} Cr remaining.`);
      return;
    }
    soundService.playBidSound(true);
    soundService.playGavel();
    placeHumanBid(amount);
  };

  const handlePassClick = () => {
    if (isUserHighestBidder) {
      soundService.playBuzzer();
      return;
    }
    soundService.playClick();
    passCurrentPlayer();
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-lg">
      
      {/* Top Intensity & Price Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              LIVE AUCTION GAVEL
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Franchise: {userTeam?.shortName || userTeam?.name}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-amber-700 font-mono tracking-tight">
              {currentBid > 0 ? `₹${currentBid.toFixed(2)} Cr` : `Base: ₹${basePrice.toFixed(2)} Cr`}
            </span>
            {currentBid > 0 && (
              <span className="text-[11px] sm:text-xs text-slate-500 font-bold">
                (+₹{increment.toFixed(2)} Cr step)
              </span>
            )}
          </div>
        </div>

        {/* Highest Bidder Display */}
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            PADDLE LEADER
          </span>
          <span className={`text-sm sm:text-base font-black ${isUserHighestBidder ? 'text-emerald-700' : 'text-slate-900'}`}>
            {auction.highestBidderName || 'Awaiting Opening Paddle'}
            {isUserHighestBidder && ' (Your Bid ✓)'}
          </span>
        </div>
      </div>

      {/* Main Action Controls Grid */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3">
        
        {/* BIG ARCADE PADDLE: Raise Minimum Bid */}
        <motion.button
          type="button"
          whileHover={canAffordNextBid && !isUserHighestBidder && isBiddingActive ? { scale: 1.02 } : {}}
          whileTap={canAffordNextBid && !isUserHighestBidder && isBiddingActive ? { scale: 0.96 } : {}}
          disabled={!isBiddingActive || (!canAffordNextBid && !isUserHighestBidder)}
          onClick={() => handleBidClick(nextMinBid)}
          className={`col-span-12 sm:col-span-6 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2.5 sm:gap-3 shadow-xl transition-all ${
            isUserHighestBidder
              ? 'bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-300 cursor-default'
              : isBiddingActive && canAffordNextBid
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-300 cursor-pointer active:scale-98'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <Gavel className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          <span className="truncate">
            {isUserHighestBidder
              ? 'YOU ARE HIGHEST BIDDER ✓'
              : !canAffordNextBid
              ? `INSUFFICIENT PURSE • ₹${nextMinBid.toFixed(2)} Cr`
              : `RAISE PADDLE • ₹${nextMinBid.toFixed(2)} Cr`}
          </span>
        </motion.button>

        {/* POWER JUMP BID */}
        <motion.button
          type="button"
          whileHover={canAffordJumpBid && !isUserHighestBidder && isBiddingActive ? { scale: 1.02 } : {}}
          whileTap={canAffordJumpBid && !isUserHighestBidder && isBiddingActive ? { scale: 0.96 } : {}}
          disabled={!isBiddingActive || isUserHighestBidder || !canAffordJumpBid}
          onClick={() => handleBidClick(jumpBid)}
          className={`col-span-6 sm:col-span-3 py-3 sm:py-4 px-2 sm:px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 border transition-all ${
            isBiddingActive && !isUserHighestBidder && canAffordJumpBid
              ? 'bg-slate-50 hover:bg-slate-100 text-amber-800 border-amber-300 shadow-sm cursor-pointer active:scale-98'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="truncate">JUMP BID ₹{jumpBid.toFixed(2)} Cr</span>
        </motion.button>

        {/* PASS / PULL OUT */}
        <motion.button
          type="button"
          whileHover={!isUserHighestBidder ? { scale: 1.02 } : {}}
          whileTap={!isUserHighestBidder ? { scale: 0.96 } : {}}
          disabled={!isBiddingActive || isUserHighestBidder}
          onClick={handlePassClick}
          className={`col-span-6 sm:col-span-3 py-3 sm:py-4 px-2 sm:px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all ${
            isBiddingActive && !isUserHighestBidder
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm cursor-pointer active:scale-98'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
        >
          <FastForward className="w-4 h-4 text-slate-500" />
          <span>PASS / WITHDRAW</span>
        </motion.button>

      </div>

      {/* Scout Intel & Quick Stats Pill */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
        <button
          type="button"
          onClick={() => { soundService.playClick(); setScoutModalOpen(true); }}
          className="flex items-center gap-1.5 text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-amber-600" />
          <span>Scout Dossier & AI Bid Range</span>
        </button>

        <span className="font-mono text-emerald-700">
          Your Available Purse: ₹{(userTeam?.currentPurse || 0).toFixed(2)} Cr
        </span>
      </div>

    </div>
  );
};
