import { Team } from './team';
import { Player } from './player';
import { AuctionState } from './auction';

export type RoomStatus = 'lobby' | 'auction' | 'squad' | 'match' | 'paused' | 'completed';

export interface RoomParticipant {
  id: string; // unique persistent playerId
  name: string; // human player display name
  teamId: string | null; // claimed franchise ID
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  joinedAt: number;
  lastHeartbeat: number;
}

export interface MultiplayerRoomState {
  roomCode: string;
  roomName: string;
  hostId: string;
  status: RoomStatus;
  pauseReason?: string;
  disconnectedParticipant?: RoomParticipant;
  pauseExpiresAt?: number;
  requiredPlayers: number; // min human players needed to start
  maxParticipants?: number;
  participants: RoomParticipant[];
  purseCap: number; // Starting purse in Cr
  auctionState?: AuctionState;
  teams?: Team[];
  players?: Player[];
  createdAt: number;
  updatedAt: number;
}

export type MultiplayerClientEvent =
  | { type: 'CREATE_ROOM'; payload: { roomName: string; playerName: string; requiredPlayers: number; purseCap: number; roomCode?: string } }
  | { type: 'JOIN_ROOM'; payload: { roomCode: string; playerName: string; playerId?: string } }
  | { type: 'CLAIM_TEAM'; payload: { teamId: string } }
  | { type: 'TOGGLE_READY'; payload: { isReady?: boolean } }
  | { type: 'START_AUCTION'; payload?: Record<string, never> }
  | { type: 'PLACE_HUMAN_BID'; payload: { amount: number } }
  | { type: 'PASS_HUMAN_BID'; payload?: Record<string, never> }
  | { type: 'NEXT_LOT'; payload?: Record<string, never> }
  | { type: 'HEARTBEAT'; payload?: { timestamp: number } }
  | { type: 'RESUME_ROOM'; payload?: Record<string, never> };

export type MultiplayerServerEvent =
  | { type: 'ROOM_CREATED'; payload: { room: MultiplayerRoomState; myParticipantId: string } }
  | { type: 'ROOM_JOINED'; payload: { room: MultiplayerRoomState; myParticipantId: string } }
  | { type: 'ROOM_UPDATED'; payload: { room: MultiplayerRoomState } }
  | { type: 'AUCTION_SYNC'; payload: { auctionState: AuctionState; teams: Team[]; players: Player[] } }
  | { type: 'ROOM_PAUSED'; payload: { reason: string; disconnectedParticipant: RoomParticipant; pauseExpiresAt: number } }
  | { type: 'ROOM_RESUMED'; payload: { room: MultiplayerRoomState } }
  | { type: 'ERROR'; payload: { message: string } };
