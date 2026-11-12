import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundService } from '../../services/soundService';
import { Radio, MessageSquare } from 'lucide-react';

export const AuctionFeed: React.FC = () => {
  const { auction, userTeam } = useGameStore();

  const handleSendBanter = (reaction: string) => {
    soundService.playBidSound(false);
    useGameStore.setState(s => ({
      auction: {
        ...s.auction,
        feedMessages: [
          {
            id: `banter-${Date.now()}`,
            text: `💬 ${userTeam()?.shortName || 'Manager'}: "${reaction}"`,
            type: 'system',
            timestamp: Date.now(),
          },
          ...s.auction.feedMessages.slice(0, 30),
        ],
      },
    }));
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>LIVE COMMENTARY TICKER</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">FEED</span>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto pr-1 text-xs">
          {auction.feedMessages.slice(0, 15).map((msg) => {
            let badgeColor = 'text-slate-700';
            if (msg.type === 'bid') badgeColor = 'text-amber-800 font-bold';
            else if (msg.type === 'warning') badgeColor = 'text-rose-700 font-bold';
            else if (msg.type === 'sold') badgeColor = 'text-emerald-700 font-black';
            else if (msg.type === 'unsold') badgeColor = 'text-slate-500 italic';

            return (
              <div key={msg.id} className="flex items-start gap-2 py-0.5 border-b border-slate-100 last:border-none">
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 mt-0.5 font-bold">
                  {new Date(msg.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}
                </span>
                <p className={`leading-relaxed ${badgeColor}`}>
                  {msg.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Manager Banter Reactions (playauctiongame.com feature) */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <MessageSquare className="w-3 h-3 text-slate-400 flex-shrink-0" />
        {['🔥 War!', '💰 Overpriced!', '🏏 Match Winner!', '🎯 Steal!', '🤫 Silence!'].map(reaction => (
          <button
            key={reaction}
            type="button"
            onClick={() => handleSendBanter(reaction)}
            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-[10px] font-bold text-slate-700 hover:text-amber-900 transition-colors flex-shrink-0"
          >
            {reaction}
          </button>
        ))}
      </div>
    </div>
  );
};
