export type PlayerRole = 'Wicketkeeper' | 'Batter' | 'All-rounder' | 'Fast Bowler' | 'Spin Bowler';
export type BattingHand = 'Right Hand' | 'Left Hand';
export type BowlingStyle = 
  | 'Right-arm Fast' 
  | 'Left-arm Fast' 
  | 'Right-arm Medium' 
  | 'Left-arm Medium'
  | 'Right-arm Off-break' 
  | 'Left-arm Orthodox' 
  | 'Right-arm Leg-break'
  | 'Left-arm Unorthodox'
  | 'None';

export type PlayerForm = 'Ice Cold' | 'Cold' | 'Steady' | 'In Form' | 'Hot' | 'Blazing';

export type PlayerTier = 'Marquee' | 'Tier 1' | 'Tier 2' | 'Emerging' | 'Uncapped';

export interface PlayerStats {
  matches: number;
  runs: number;
  highestScore: number;
  strikeRate: number;
  average: number;
  hundreds: number;
  fifties: number;
  wickets: number;
  bestBowling: string;
  economy: number;
  catches: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  country: string;
  isOverseas: boolean;
  role: PlayerRole;
  battingHand: BattingHand;
  bowlingStyle: BowlingStyle;
  tier: PlayerTier;
  
  // Core Ratings (0-99)
  overallRating: number;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  
  // Detailed Attributes (0-99)
  power: number;
  timing: number;
  speed: number;
  stamina: number;
  clutch: number;
  
  // Form and Potential
  form: PlayerForm;
  potential: number; // Hidden until scouted
  isScouted?: boolean;
  injuryRisk: 'Low' | 'Medium' | 'High';
  
  // Auction specific
  basePrice: number; // in Crores, e.g. 2.0, 1.5, 1.0, 0.5, 0.2
  estimatedValue: number; // in Crores
  soldPrice?: number;
  soldToTeamId?: string;
  isSold?: boolean;
  isUnsold?: boolean;
  
  traits: string[];
  avatarSeed: string; // for consistent stylized avatar generation
  
  // Season Stats
  seasonStats: PlayerStats;
  careerHistory?: {
    seasonsPlayed: number;
    totalRuns: number;
    totalWickets: number;
    trophies: number;
  };
}
