import { Team } from './team';
import { Player } from './player';
import { AuctionState } from './auction';
import { Match, LeagueStanding, PlayoffStage } from './season';

export type SessionFormat = 'mega' | 'mini' | 'turbo' | 'custom';

export interface IPLSession {
  id: string;
  name: string;
  roomCode: string;
  format: SessionFormat;
  purseCap: number;
  createdAt: number;
  lastPlayedAt: number;
  seasonYear: number;
  aiAggression: 'chill' | 'balanced' | 'ruthless';
  timerSpeed: 'slow' | 'standard' | 'fast';
  userTeamId: string | null;
  currentScreen?: string;
  teams: Team[];
  players: Player[];
  auction: AuctionState;
  leagueMatches: Match[];
  currentMatchIndex: number;
  standings: LeagueStanding[];
  playoffMatches: Match[];
  playoffStage: PlayoffStage;
}

export interface CreateSessionInput {
  name: string;
  roomCode?: string;
  format: SessionFormat;
  purseCap?: number;
  seasonYear?: number;
  aiAggression?: 'chill' | 'balanced' | 'ruthless';
  timerSpeed?: 'slow' | 'standard' | 'fast';
  preSelectedTeamId?: string | null;
}
