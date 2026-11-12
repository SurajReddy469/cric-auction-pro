export interface ManagerProfile {
  name: string;
  avatar: string;
  reputation: number; // 1-100
  totalSeasons: number;
  trophies: number;
  matchesPlayed: number;
  matchesWon: number;
  auctionWins: number;
  totalSpent: number; // in Crores
  winRate: number; // percentage
  scoutTokens: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Auction' | 'Squad' | 'Season' | 'Playoffs' | 'Career';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    max: number;
  };
}
