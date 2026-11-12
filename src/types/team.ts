import { Player } from './player';

export type AIPersonality = 
  | 'Aggressive Manager'
  | 'Budget Manager'
  | 'Star Hunter'
  | 'Bowling Specialist'
  | 'Balanced Manager'
  | 'Youth Specialist'
  | 'Analytics Guru'
  | 'Human';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  stadium: string;
  personality: AIPersonality;
  fanPopularity: number; // 1-100
  strategicStrength: string;
  description: string;
  
  // Financials
  startingPurse: number; // ₹120.00 Cr
  currentPurse: number; // Remaining
  spentPurse: number;
  
  // Squad
  squad: Player[];
  startingXI: string[]; // Player IDs (ordered 1 to 11)
  captainId?: string;
  wicketkeeperId?: string;
  
  // Season Records
  stats: {
    matchesPlayed: number;
    won: number;
    lost: number;
    tied: number;
    points: number;
    runsScored: number;
    oversFaced: number;
    runsConceded: number;
    oversBowled: number;
    netRunRate: number;
  };
  
  // Career franchise trophies
  trophies: number;
  seasonTrophies: string[];
}
