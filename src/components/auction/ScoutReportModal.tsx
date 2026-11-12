import React from 'react';
import { Modal } from '../common/Modal';
import { useGameStore } from '../../store/useGameStore';
import { generateScoutReport } from '../../services/scoutService';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { Sparkles, AlertTriangle, CheckCircle, Search } from 'lucide-react';

export const ScoutReportModal: React.FC = () => {
  const { isScoutModalOpen, setScoutModalOpen, selectedScoutPlayer, scoutPlayer, profile } = useGameStore();

  if (!selectedScoutPlayer) return null;

  const report = generateScoutReport(selectedScoutPlayer);
  const isScouted = selectedScoutPlayer.isScouted;

  const handleScoutAction = () => {
    scoutPlayer(selectedScoutPlayer);
  };

  return (
    <Modal
      isOpen={isScoutModalOpen}
      onClose={() => setScoutModalOpen(false)}
      title="Confidential Scouting Dossier"
      subtitle={`Franchise Analytics & Hidden Potential Report • ${selectedScoutPlayer.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Player Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-200">
          <PlayerAvatar
            name={selectedScoutPlayer.name}
            role={selectedScoutPlayer.role}
            country={selectedScoutPlayer.country}
            isOverseas={selectedScoutPlayer.isOverseas}
            form={selectedScoutPlayer.form}
            size="lg"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-900">{selectedScoutPlayer.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedScoutPlayer.role} • Age: {selectedScoutPlayer.age} • {selectedScoutPlayer.country}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="font-bold text-slate-600">
                OVR: <span className="text-slate-900 font-mono font-black">{selectedScoutPlayer.overallRating}</span>
              </span>
              <span className="font-bold text-slate-600">
                Base: <span className="text-amber-700 font-mono font-black">₹{selectedScoutPlayer.basePrice} Cr</span>
              </span>
              <span className="font-bold text-slate-600">
                Form: <span className="text-emerald-700 font-extrabold">{selectedScoutPlayer.form}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hidden Potential Section */}
        {isScouted ? (
          <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-300 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                TRUE HIDDEN POTENTIAL REVEALED
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                Intelligence Verified ✓
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-black text-amber-700 font-mono">
                {report.revealedPotential}
              </span>
              <div>
                <span className="text-base font-extrabold text-slate-900 block">
                  {report.potentialCategory}
                </span>
                <span className="text-xs text-slate-500">
                  Potential rating peak during career progression
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Scout Master Verdict:
              </span>
              <p className="text-xs text-amber-950 bg-amber-100/70 p-2.5 rounded-2xl border border-amber-200 leading-relaxed font-semibold">
                {report.scoutVerdict}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-50 border border-dashed border-amber-300 p-6 text-center">
            <Search className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">Potential Currently Masked</h4>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Spend 1 Scout Token to uncover this player's true ceiling, exact injury risk profile, and recommended max auction bid.
            </p>
            <div className="mt-4">
              <button
                disabled={profile.scoutTokens <= 0}
                onClick={handleScoutAction}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 font-black text-slate-950 text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all shadow-md"
              >
                Unlock Intel (Costs 1 Scout Token • {profile.scoutTokens} Remaining)
              </button>
            </div>
          </div>
        )}

        {/* Valuation & Expected Market Range */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Estimated Market Value
            </span>
            <span className="text-xl font-black text-slate-900 font-mono">
              ₹{selectedScoutPlayer.estimatedValue.toFixed(2)} Cr
            </span>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Recommended Bidding Cap
            </span>
            <span className="text-xl font-black text-amber-700 font-mono">
              ₹{report.expectedBidRange.max.toFixed(2)} Cr
            </span>
          </div>
        </div>

        {/* Key Strengths & Watchouts */}
        <div className="space-y-2 text-xs">
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
            <span className="font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Key Strengths & Traits
            </span>
            <ul className="space-y-1 text-slate-700">
              {report.keyStrengths.map((str, i) => (
                <li key={i}>• {str}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
            <span className="font-bold text-rose-800 flex items-center gap-1 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Fitness & Watch-Outs
            </span>
            <p className="text-slate-700 mb-1">{report.injuryRiskDetails}</p>
            <ul className="space-y-1 text-slate-600">
              {report.watchOuts.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => setScoutModalOpen(false)}
          className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-300 transition-colors"
        >
          Close Dossier
        </button>
      </div>
    </Modal>
  );
};
