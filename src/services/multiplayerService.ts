import {
  MultiplayerRoomState,
  MultiplayerClientEvent,
  MultiplayerServerEvent,
  RoomParticipant
} from '../types/multiplayer';
import { AuctionState } from '../types/auction';
import { Team } from '../types/team';
import { Player } from '../types/player';

type RoomListener = (room: MultiplayerRoomState) => void;
type AuctionSyncListener = (payload: { auctionState: AuctionState; teams: Team[]; players: Player[] }) => void;
type PauseListener = (payload: { reason: string; disconnectedParticipant: RoomParticipant; pauseExpiresAt: number }) => void;
type ResumeListener = (room: MultiplayerRoomState) => void;
type ErrorListener = (message: string) => void;
type ConnectionListener = (status: 'disconnected' | 'connecting' | 'connected') => void;

class MultiplayerService {
  private socket: WebSocket | null = null;
  private serverUrl: string = '';
  private currentRoom: MultiplayerRoomState | null = null;
  private myParticipantId: string = '';
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  public pingMs: number = 0;
  public connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

  private roomListeners = new Set<RoomListener>();
  private auctionSyncListeners = new Set<AuctionSyncListener>();
  private pauseListeners = new Set<PauseListener>();
  private resumeListeners = new Set<ResumeListener>();
  private errorListeners = new Set<ErrorListener>();
  private connectionListeners = new Set<ConnectionListener>();

  constructor() {
    this.serverUrl = this.resolveServerUrl();
    this.myParticipantId = this.loadOrInitPlayerId();
  }

  private resolveServerUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:5175';

    // If a custom MULTIPLAYER_WS_URL is provided in env or query param
    const urlParams = new URLSearchParams(window.location.search);
    const customWs = urlParams.get('ws');
    if (customWs) return customWs;

    const loc = window.location;
    // If running on localhost
    if (loc.hostname === 'localhost' || loc.hostname === '127.0.0.1') {
      return `ws://${loc.hostname}:5175`;
    }

    // Default to the websocket protocol on the same host or port 5175
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${loc.hostname}:5175`;
  }

  private loadOrInitPlayerId(): string {
    if (typeof localStorage === 'undefined') return `player_${Date.now()}`;
    let pid = localStorage.getItem('cric_mp_player_id');
    if (!pid) {
      pid = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('cric_mp_player_id', pid);
    }
    return pid;
  }

  public getMyParticipantId(): string {
    return this.myParticipantId;
  }

  public getCurrentRoom(): MultiplayerRoomState | null {
    return this.currentRoom;
  }

  public connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      this.setConnectionStatus('connecting');

      try {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.onopen = () => {
          this.setConnectionStatus('connected');
          this.startHeartbeat();
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          try {
            const data: MultiplayerServerEvent = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch (e) {
            console.error('Failed to parse websocket message', e);
          }
        };

        this.socket.onerror = (err) => {
          console.warn('Multiplayer WebSocket error:', err);
          this.setConnectionStatus('disconnected');
          resolve(false);
        };

        this.socket.onclose = () => {
          this.setConnectionStatus('disconnected');
          this.stopHeartbeat();
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        this.setConnectionStatus('disconnected');
        resolve(false);
      }
    });
  }

  private setConnectionStatus(status: 'disconnected' | 'connecting' | 'connected') {
    this.connectionStatus = status;
    this.connectionListeners.forEach(listener => listener(status));
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const start = Date.now();
        this.send({ type: 'HEARTBEAT', payload: { timestamp: start } });
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleServerMessage(message: MultiplayerServerEvent) {
    switch (message.type) {
      case 'ROOM_CREATED':
      case 'ROOM_JOINED':
        this.currentRoom = message.payload.room;
        this.myParticipantId = message.payload.myParticipantId;
        this.roomListeners.forEach(l => l(message.payload.room));
        break;

      case 'ROOM_UPDATED':
        this.currentRoom = message.payload.room;
        this.roomListeners.forEach(l => l(message.payload.room));
        break;

      case 'AUCTION_SYNC':
        this.auctionSyncListeners.forEach(l => l(message.payload));
        break;

      case 'ROOM_PAUSED':
        if (this.currentRoom) {
          this.currentRoom.status = 'paused';
          this.currentRoom.pauseReason = message.payload.reason;
        }
        this.pauseListeners.forEach(l => l(message.payload));
        break;

      case 'ROOM_RESUMED':
        this.currentRoom = message.payload.room;
        this.resumeListeners.forEach(l => l(message.payload.room));
        break;

      case 'ERROR':
        this.errorListeners.forEach(l => l(message.payload.message));
        break;
    }
  }

  public send(event: MultiplayerClientEvent) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      console.warn('Cannot send message: WebSocket is not open.');
    }
  }

  // Client Actions
  public async createRoom(options: {
    roomName: string;
    playerName: string;
    requiredPlayers: number;
    purseCap: number;
    roomCode?: string;
    teams?: Team[];
    players?: Player[];
  }): Promise<boolean> {
    await this.connect();
    this.send({
      type: 'CREATE_ROOM',
      payload: options as any
    });
    return true;
  }

  public async joinRoom(roomCode: string, playerName: string): Promise<boolean> {
    await this.connect();
    this.send({
      type: 'JOIN_ROOM',
      payload: {
        roomCode,
        playerName,
        playerId: this.myParticipantId
      }
    });
    return true;
  }

  public claimTeam(teamId: string) {
    this.send({
      type: 'CLAIM_TEAM',
      payload: { teamId }
    });
  }

  public toggleReady(isReady?: boolean) {
    this.send({
      type: 'TOGGLE_READY',
      payload: { isReady } as any
    });
  }

  public startAuction() {
    this.send({
      type: 'START_AUCTION',
      payload: {}
    });
  }

  public placeHumanBid(amount: number) {
    this.send({
      type: 'PLACE_HUMAN_BID',
      payload: { amount }
    });
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.currentRoom = null;
    this.setConnectionStatus('disconnected');
  }

  // Subscriptions
  public onRoomUpdate(fn: RoomListener) {
    this.roomListeners.add(fn);
    return () => this.roomListeners.delete(fn);
  }

  public onAuctionSync(fn: AuctionSyncListener) {
    this.auctionSyncListeners.add(fn);
    return () => this.auctionSyncListeners.delete(fn);
  }

  public onRoomPaused(fn: PauseListener) {
    this.pauseListeners.add(fn);
    return () => this.pauseListeners.delete(fn);
  }

  public onRoomResumed(fn: ResumeListener) {
    this.resumeListeners.add(fn);
    return () => this.resumeListeners.delete(fn);
  }

  public onError(fn: ErrorListener) {
    this.errorListeners.add(fn);
    return () => this.errorListeners.delete(fn);
  }

  public onConnectionChange(fn: ConnectionListener) {
    this.connectionListeners.add(fn);
    return () => this.connectionListeners.delete(fn);
  }
}

export const multiplayerService = new MultiplayerService();
