import { Player } from './player';

export interface BidRecord {
  teamId: string;
  teamName: string;
  amount: number; // in Crores
  timestamp: number;
  isHuman: boolean;
}

export type AuctionPhase = 
  | 'idle' 
  | 'revealing' 
  | 'bidding' 
  | 'going_once' 
  | 'going_twice' 
  | 'sold' 
  | 'unsold' 
  | 'round_break' 
  | 'completed';

export interface AuctionSet {
  id: string;
  name: string;
  description: string;
  playerIds: string[];
}

export interface AuctionFeedMessage {
  id: string;
  text: string;
  type: 'bid' | 'warning' | 'sold' | 'unsold' | 'system' | 'scout';
  teamId?: string;
  timestamp: number;
}

export interface AuctionState {
  currentSetIndex: number;
  currentPlayerIndex: number;
  currentPlayer: Player | null;
  currentBid: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  bidHistory: BidRecord[];
  phase: AuctionPhase;
  timerSeconds: number;
  isPaused: boolean;
  totalPlayersAuctioned: number;
  feedMessages: AuctionFeedMessage[];
  auctionHistory: {
    playerId: string;
    soldToTeamId?: string;
    finalPrice: number;
    status: 'sold' | 'unsold';
  }[];
}
