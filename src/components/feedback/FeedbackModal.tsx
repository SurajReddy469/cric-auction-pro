import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useGameStore } from '../../store/useGameStore';
import { FeedbackCategory } from '../../types/feedback';
import { soundService } from '../../services/soundService';
import { Star, MessageSquarePlus, CheckCircle2, Bug, Lightbulb, Gamepad2, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'gameplay', label: 'Gameplay', icon: Gamepad2 },
  { id: 'general', label: 'General / Praise', icon: HeartHandshake },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good Game',
  4: 'Great & Fun!',
  5: 'Exceptional Masterpiece! ⭐',
};

export const FeedbackModal: React.FC = () => {
  const {
    isFeedbackModalOpen,
    setFeedbackModalOpen,
    submitFeedback,
    profile,
    userTeam,
    gameMode,
    currentScreen,
    settings,
    auction,
  } = useGameStore();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [name, setName] = useState<string>(profile.name || 'Cricket Manager');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const team = userTeam();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message or description for your feedback.');
      return;
    }

    submitFeedback({
      rating,
      category,
      userName: name.trim() || profile.name || 'Anonymous Manager',
      userEmail: email.trim() || undefined,
      message: message.trim(),
      context: {
        userTeamId: team?.id,
        userTeamName: team?.name,
        gameMode,
        currentScreen,
        dataset: settings.dataset,
        auctionPhase: auction.phase,
      },
    });

    setIsSubmitted(true);
    setError(null);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      setFeedbackModalOpen(false);
    }, 2200);
  };

  const handleClose = () => {
    setError(null);
    setIsSubmitted(false);
    setFeedbackModalOpen(false);
  };

  return (
    <Modal
      isOpen={isFeedbackModalOpen}
      onClose={handleClose}
      title="Player & Manager Feedback"
      subtitle="Help shape Cric-Auction Pro with your suggestions, bug reports, and ideas"
      maxWidth="xl"
    >
      {isSubmitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Feedback Transmitted!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm">
            Thank you! Your feedback has been sent directly to the tournament commissioners and recorded in the Admin Console.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Star Rating Bar */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1.5">
              Rate Your Experience
            </span>
            <div className="flex items-center gap-1.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => {
                      soundService.playClick();
                      setRating(star);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    aria-label={`Rate ${star} star`}
                    className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        active
                          ? 'text-amber-500 fill-amber-400 drop-shadow'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-black text-amber-900 dark:text-amber-200 mt-1">
              {RATING_LABELS[hoverRating !== null ? hoverRating : rating]}
            </span>
          </div>

          {/* Feedback Category Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      soundService.playClick();
                      setCategory(cat.id);
                    }}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 border-amber-600 text-slate-950 font-black shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Manager Name"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email / Discord (Optional)
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="For bug follow-up"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Feedback Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Message & Feedback Details <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {message.length} / 1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              placeholder={
                category === 'bug'
                  ? 'Describe what happened, what player/screen was involved, and what you expected...'
                  : category === 'feature'
                  ? 'Describe the new feature, rule, or enhancement you would love to see...'
                  : 'Tell us your thoughts, ideas, or review of the IPL auction simulation...'
              }
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Attached Context Pill */}
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Automatic System Context:</span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
              {team?.shortName || 'CSK'} • {gameMode === 'multiplayer' ? 'Multiplayer' : 'Solo'} • {currentScreen}
            </span>
          </div>

          {error && (
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
