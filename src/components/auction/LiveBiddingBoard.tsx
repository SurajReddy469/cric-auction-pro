import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { Flame, MessageSquare } from 'lucide-react';

const AI_BANTER: Record<string, string[]> = {
  'chennai-super-kings': ['Whistle Podu! Calculated bid 🟡', 'MS Dhoni & Fleming approved 🎯', 'Spin & control locked in!'],
  'mumbai-indians': ['Paltan wants this superstar! 🔵', 'We are not backing down! 💥', 'Wankhede crowd demands it!'],
  'royal-challengers-bengaluru': ['Ee Sala Cup Namde! 🔥', 'Aggressive bid on the table! ⚡', 'Chinnaswamy six-hitter!'],
  'kolkata-knight-riders': ['Korbo Lorbo Jeetbo! 🟣', 'Knight Riders raising the hammer! ⚔️', 'Big money move!'],
  'sunrisers-hyderabad': ['Orange Army firepower! 🟠', 'High strike-rate target! 🚀', 'Bumping the bid!'],
  'delhi-capitals': ['Roar Macha! Top prospect 🔷', 'Young Indian talent priority! 🏏', 'Calculated future star!'],
  'rajasthan-royals': ['Halla Bol! Star prospect 💗', 'Pink army bidding hard! 🎯', 'Tactical signing!'],
  'gujarat-titans': ['Aava De! Match winner ⚓', 'Bowling anchor secured! 🛡️', 'Titans pride on the line!'],
  'lucknow-super-giants': ['Adab Se Harayenge! 🔵', 'Balanced squad addition 📊', 'Disciplined bid placed!'],
  'punjab-kings': ['Sadda Punjab! Going all-in! 🔴', 'We want this match winner! 🦁', 'Raising the stakes!']
};

export const LiveBiddingBoard: React.FC = () => {
  const { teams, auction, userTeamId } = useGameStore();

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-600" />
          WAR ROOM BIDDING BOARD
        </h3>
        <span className="text-[11px] text-slate-500 font-mono font-bold">
          {teams.length} TEAMS ACTIVE
        </span>
      </div>

      {/* Franchises List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {teams.map((team) => {
          const isHighestBidder = auction.highestBidderId === team.id;
          const isUser = team.id === userTeamId;
          const banterList = AI_BANTER[team.id] || ['Target locked in!'];
          const banter = banterList[auction.bidHistory.length % banterList.length];

          return (
            <div
              key={team.id}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all relative border flex flex-col justify-between gap-1.5 ${
                isHighestBidder
                  ? 'bg-amber-50/95 border-amber-400 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {/* Team Crest & Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <TeamBadge teamId={team.id} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black tracking-wide truncate ${isHighestBidder ? 'text-amber-950 font-black' : 'text-slate-900'}`}>
                        {team.shortName}
                      </span>
                      {isUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black border border-amber-400">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate font-medium">
                      Purse: ₹{team.currentPurse.toFixed(1)} Cr • {team.squad.length}/25
                    </span>
                  </div>
                </div>

                {/* Status Pill: Current Bid or Squad Count */}
                <div className="text-right flex-shrink-0">
                  {isHighestBidder ? (
                    <div className="flex flex-col items-end">
                      <span className="text-amber-700 font-black text-xs font-mono">
                        ₹{auction.currentBid.toFixed(2)} Cr
                      </span>
                      <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider mt-0.5">
                        LEADING BIDDER
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end text-slate-400 text-[10px] font-bold">
                      <span>{team.personality.split(' ')[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Banter Bubble when Leading */}
              {isHighestBidder && !isUser && (
                <div className="mt-0.5 pt-1.5 border-t border-amber-200/60 flex items-center gap-1.5 text-[10px] font-bold text-amber-900">
                  <MessageSquare className="w-3 h-3 text-amber-600 flex-shrink-0" />
                  <span className="truncate italic">"{banter}"</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
