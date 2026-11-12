import React from 'react';
import { Modal } from '../common/Modal';
import { useGameStore } from '../../store/useGameStore';
import { TeamBadge } from '../common/TeamBadge';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { ArrowRight, Award } from 'lucide-react';

export const AuctionSummaryModal: React.FC = () => {
  const { isAuctionSummaryOpen, setAuctionSummaryOpen, userTeam, setScreen } = useGameStore();
  const team = userTeam();

  if (!team) return null;

  const squad = team.squad;
  const topPurchase = [...squad].sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0];

  // Grade calculation
  let grade = 'B';
  if (squad.length >= 18 && team.currentPurse >= 10.0) grade = 'A+';
  else if (squad.length >= 18) grade = 'A';
  else if (squad.length >= 15) grade = 'B+';

  const handleProceed = () => {
    setAuctionSummaryOpen(false);
    setScreen('squad');
  };

  return (
    <Modal
      isOpen={isAuctionSummaryOpen}
      onClose={() => setAuctionSummaryOpen(false)}
      title="Auction Campaign Concluded"
      subtitle="Comprehensive Franchise Recruitment Review"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Banner with Grade */}
        <div className="rounded-3xl bg-amber-50/70 border border-amber-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TeamBadge teamId={team.id} size="lg" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Squad Acquisition Report
              </span>
              <h3 className="text-2xl font-black text-slate-900">{team.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Completed the mega auction with {squad.length} players signed.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-amber-300 min-w-[100px] shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AUCTION GRADE</span>
            <span className="text-4xl font-black text-amber-600 font-mono my-0.5">{grade}</span>
            <span className="text-[10px] text-emerald-700 font-bold">Campaign Success</span>
          </div>
        </div>

        {/* Financial & Squad Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">Total Spent</span>
            <span className="text-xl font-black text-slate-900 font-mono">₹{team.spentPurse.toFixed(2)} Cr</span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">Purse Left</span>
            <span className="text-xl font-black text-amber-700 font-mono">₹{team.currentPurse.toFixed(2)} Cr</span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">Squad Size</span>
            <span className="text-xl font-black text-slate-900 font-mono">{squad.length}/25</span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <span className="text-slate-500 uppercase tracking-wider font-bold block mb-1">Overseas Signed</span>
            <span className="text-xl font-black text-sky-700 font-mono">
              {squad.filter(p => p.isOverseas).length}/8
            </span>
          </div>
        </div>

        {/* Marquee Purchase Spotlight */}
        {topPurchase && (
          <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Award className="w-4 h-4 text-amber-600" />
              RECORD MARQUEE SIGNING
            </span>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <PlayerAvatar
                  name={topPurchase.name}
                  role={topPurchase.role}
                  country={topPurchase.country}
                  isOverseas={topPurchase.isOverseas}
                  form={topPurchase.form}
                  size="md"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{topPurchase.name}</h4>
                  <span className="text-xs text-slate-500">{topPurchase.role} • OVR {topPurchase.overallRating}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase block font-semibold">Hammer Price</span>
                <span className="text-2xl font-black text-amber-700 font-mono">
                  ₹{topPurchase.soldPrice?.toFixed(2)} Cr
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleProceed}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 font-black text-slate-950 text-base shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 transition-all"
        >
          <span>CONFIGURE STARTING XI & SQUAD</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </Modal>
  );
};
