import React from 'react';

interface TeamBadgeProps {
  teamId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({ teamId, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const getTeamIcon = () => {
    switch (teamId) {
      // Real IPL Franchises
      case 'chennai-super-kings':
      case 'csk':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="cskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M50 4 L90 20 L80 82 L50 96 L20 82 L10 20 Z" fill="url(#cskGrad)" stroke="#004BA0" strokeWidth="4" />
            {/* Roaring Lion Silhouette */}
            <path d="M50 22 Q68 28 64 48 Q72 52 68 64 Q60 62 56 68 Q52 74 48 74 Q44 74 40 68 Q36 62 28 64 Q24 52 32 48 Q28 28 50 22 Z" fill="#004BA0" />
            <path d="M42 42 L50 36 L58 42 L50 56 Z" fill="#fde047" />
            <text x="50" y="88" textAnchor="middle" fill="#004BA0" fontWeight="900" fontSize="13" fontFamily="Rajdhani, sans-serif">CSK</text>
          </svg>
        );

      case 'mumbai-indians':
      case 'mi':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="miGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0057B8" />
                <stop offset="100%" stopColor="#003875" />
              </linearGradient>
            </defs>
            <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="url(#miGrad)" stroke="#D1AB3E" strokeWidth="4" />
            {/* Sudarshan Chakra / Razor blades */}
            <circle cx="50" cy="48" r="20" fill="none" stroke="#D1AB3E" strokeWidth="3" />
            <path d="M50 28 L54 44 L50 48 L46 44 Z" fill="#D1AB3E" />
            <path d="M50 68 L46 52 L50 48 L54 52 Z" fill="#D1AB3E" />
            <path d="M30 48 L46 44 L50 48 L46 52 Z" fill="#D1AB3E" />
            <path d="M70 48 L54 52 L50 48 L54 44 Z" fill="#D1AB3E" />
            <circle cx="50" cy="48" r="6" fill="#D1AB3E" />
            <text x="50" y="88" textAnchor="middle" fill="#D1AB3E" fontWeight="900" fontSize="14" fontFamily="Rajdhani, sans-serif">MI</text>
          </svg>
        );

      case 'royal-challengers-bengaluru':
      case 'rcb':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="rcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DA1818" />
                <stop offset="100%" stopColor="#8B0000" />
              </linearGradient>
            </defs>
            <path d="M50 4 L88 20 L84 76 L50 96 L16 76 L12 20 Z" fill="url(#rcbGrad)" stroke="#C99222" strokeWidth="4" />
            {/* Rampant Golden Lion */}
            <path d="M50 20 L58 32 L54 44 L64 48 L58 60 L62 70 L50 64 L38 70 L42 60 L36 48 L46 44 L42 32 Z" fill="#C99222" />
            <circle cx="50" cy="30" r="5" fill="#ffffff" />
            <text x="50" y="88" textAnchor="middle" fill="#C99222" fontWeight="900" fontSize="13" fontFamily="Rajdhani, sans-serif">RCB</text>
          </svg>
        );

      case 'kolkata-knight-riders':
      case 'kkr':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="kkrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>
            </defs>
            <polygon points="50,4 90,24 84,76 50,96 16,76 10,24" fill="url(#kkrGrad)" stroke="#EDAC1F" strokeWidth="4" />
            {/* Golden Knight Helmet with Flame Plume */}
            <path d="M50 16 Q60 22 56 34 Q50 30 44 34 Q40 22 50 16 Z" fill="#f59e0b" />
            <path d="M36 34 H64 V58 Q64 72 50 78 Q36 72 36 58 Z" fill="#EDAC1F" />
            <rect x="40" y="44" width="20" height="5" rx="1.5" fill="#2e1065" />
            <text x="50" y="90" textAnchor="middle" fill="#EDAC1F" fontWeight="900" fontSize="13" fontFamily="Rajdhani, sans-serif">KKR</text>
          </svg>
        );

      case 'sunrisers-hyderabad':
      case 'srh':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="srhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>
            </defs>
            <path d="M50 4 L92 24 L82 80 L50 96 L18 80 L8 24 Z" fill="url(#srhGrad)" stroke="#fbbf24" strokeWidth="4" />
            {/* Blazing Eagle / Sun Wings */}
            <path d="M50 20 L66 36 L78 30 L70 48 L82 48 L64 62 L50 52 L36 62 L18 48 L30 48 L22 30 L34 36 Z" fill="#fbbf24" />
            <circle cx="50" cy="40" r="7" fill="#ffffff" />
            <text x="50" y="88" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="13" fontFamily="Rajdhani, sans-serif">SRH</text>
          </svg>
        );

      case 'delhi-capitals':
      case 'dc':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="dcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#004C97" />
                <stop offset="100%" stopColor="#022850" />
              </linearGradient>
            </defs>
            <polygon points="50,4 90,22 86,76 50,96 14,76 10,22" fill="url(#dcGrad)" stroke="#DC143C" strokeWidth="4" />
            {/* Roaring Tiger Head Dual Crest */}
            <circle cx="50" cy="46" r="22" fill="#DC143C" />
            <path d="M38 36 L44 48 L34 50 Z" fill="#ffffff" />
            <path d="M62 36 L56 48 L66 50 Z" fill="#ffffff" />
            <polygon points="50,44 44,56 56,56" fill="#ffffff" />
            <text x="50" y="88" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="14" fontFamily="Rajdhani, sans-serif">DC</text>
          </svg>
        );

      case 'rajasthan-royals':
      case 'rr':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="rrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>
            </defs>
            <path d="M50 4 L90 22 L82 80 L50 96 L18 80 L10 22 Z" fill="url(#rrGrad)" stroke="#254AA5" strokeWidth="4" />
            {/* Royal Crown */}
            <path d="M30 60 L32 38 L42 50 L50 32 L58 50 L68 38 L70 60 Z" fill="#fde047" stroke="#254AA5" strokeWidth="2" />
            <rect x="30" y="60" width="40" height="7" rx="2" fill="#254AA5" />
            <circle cx="50" cy="32" r="3.5" fill="#ffffff" />
            <text x="50" y="88" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="14" fontFamily="Rajdhani, sans-serif">RR</text>
          </svg>
        );

      case 'gujarat-titans':
      case 'gt':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="gtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <polygon points="50,4 92,24 80,82 50,96 20,82 8,24" fill="url(#gtGrad)" stroke="#B3995D" strokeWidth="4" />
            {/* Lightning Chevron */}
            <path d="M54 18 L34 48 L48 48 L42 74 L66 42 L52 42 Z" fill="#B3995D" stroke="#ffffff" strokeWidth="1.5" />
            <text x="50" y="88" textAnchor="middle" fill="#B3995D" fontWeight="900" fontSize="14" fontFamily="Rajdhani, sans-serif">GT</text>
          </svg>
        );

      case 'lucknow-super-giants':
      case 'lsg':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="lsgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path d="M50 4 L90 22 L84 78 L50 96 L16 78 L10 22 Z" fill="url(#lsgGrad)" stroke="#FF5A36" strokeWidth="4" />
            {/* Tricolor Wings */}
            <path d="M50 24 L68 38 L80 32 L70 52 L82 52 L62 66 L50 56 L38 66 L18 52 L30 52 L20 32 L32 38 Z" fill="#FF5A36" />
            <circle cx="50" cy="42" r="6" fill="#ffffff" />
            <text x="50" y="88" textAnchor="middle" fill="#ffffff" fontWeight="900" fontSize="13" fontFamily="Rajdhani, sans-serif">LSG</text>
          </svg>
        );

      case 'punjab-kings':
      case 'pbks':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="pbksGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
            <path d="M50 4 L90 20 L84 78 L50 96 L16 78 L10 20 Z" fill="url(#pbksGrad)" stroke="#C99222" strokeWidth="4" />
            {/* Roaring Lion Head */}
            <circle cx="50" cy="44" r="20" fill="#C99222" />
            <path d="M42 34 L48 44 L38 46 Z" fill="#991b1b" />
            <path d="M58 34 L52 44 L62 46 Z" fill="#991b1b" />
            <polygon points="50,42 45,52 55,52" fill="#991b1b" />
            <text x="50" y="88" textAnchor="middle" fill="#C99222" fontWeight="900" fontSize="13" fontFamily="Rajdhani, sans-serif">PBKS</text>
          </svg>
        );

      // Fictional Franchises
      case 'mumbai-meteors':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="meteorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="url(#meteorGrad)" stroke="#f59e0b" strokeWidth="4" />
            <circle cx="50" cy="50" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
            <path d="M36 54 L64 36 L52 64 Z" fill="#f59e0b" />
            <circle cx="64" cy="36" r="6" fill="#fbbf24" />
          </svg>
        );

      case 'chennai-chargers':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="chargerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <path d="M50 5 L88 28 L74 88 L50 96 L26 88 L12 28 Z" fill="url(#chargerGrad)" stroke="#1d4ed8" strokeWidth="4" />
            <path d="M54 22 L36 50 L48 50 L42 78 L66 44 L52 44 Z" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );

      case 'bangalore-blazers':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="blazerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="url(#blazerGrad)" stroke="#fbbf24" strokeWidth="4" />
            <path d="M50 20 C62 35 72 45 68 65 C64 78 50 82 50 82 C50 82 36 78 32 65 C28 45 38 35 50 20 Z" fill="#fbbf24" />
            <path d="M50 38 C56 48 62 55 60 68 C58 74 50 76 50 76 C50 76 42 74 40 68 C38 55 44 48 50 38 Z" fill="#ef4444" />
          </svg>
        );

      case 'hyderabad-hawks':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="hawkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            <polygon points="50,6 92,30 80,88 50,96 20,88 8,30" fill="url(#hawkGrad)" stroke="#0f172a" strokeWidth="4" />
            <path d="M25 45 Q50 28 75 45 Q50 56 25 45 Z" fill="#0f172a" />
            <polygon points="50,48 44,66 56,66" fill="#fbbf24" />
          </svg>
        );

      case 'delhi-dynamos':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="dynGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <polygon points="50,8 90,32 78,86 50,94 22,86 10,32" fill="url(#dynGrad)" stroke="#dc2626" strokeWidth="4" />
            <circle cx="50" cy="50" r="24" fill="#dc2626" />
            <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="26" fontFamily="sans-serif">D</text>
          </svg>
        );

      case 'gujarat-titansmen':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="titanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            <polygon points="50,8 88,48 50,88 12,48" fill="url(#titanGrad)" stroke="#fbbf24" strokeWidth="4" />
            <polygon points="50,22 74,48 50,74 26,48" fill="#0f172a" stroke="#14b8a6" strokeWidth="2" />
            <circle cx="50" cy="48" r="8" fill="#fbbf24" />
          </svg>
        );

      case 'rajasthan-royalsmen':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="royalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="url(#royalGrad)" stroke="#1e3a8a" strokeWidth="4" />
            {/* Crown */}
            <path d="M28 62 L32 40 L44 52 L50 34 L56 52 L68 40 L72 62 Z" fill="#fbbf24" stroke="#1e3a8a" strokeWidth="2" />
            <rect x="28" y="62" width="44" height="8" rx="2" fill="#1e3a8a" />
          </svg>
        );

      case 'kolkata-knights':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
            <defs>
              <linearGradient id="knightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            <polygon points="50,6 88,24 84,72 50,94 16,72 12,24" fill="url(#knightGrad)" stroke="#f59e0b" strokeWidth="4" />
            {/* Knight Helmet */}
            <path d="M38 35 H62 V58 Q62 70 50 76 Q38 70 38 58 Z" fill="#f59e0b" />
            <rect x="42" y="44" width="16" height="5" rx="1" fill="#0f172a" />
          </svg>
        );

      default:
        return (
          <div className="w-full h-full rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center font-bold text-amber-400">
            IPL
          </div>
        );
    }
  };

  return (
    <div className={`inline-flex items-center justify-center relative flex-shrink-0 ${sizeMap[size]} ${className}`}>
      {getTeamIcon()}
    </div>
  );
};
