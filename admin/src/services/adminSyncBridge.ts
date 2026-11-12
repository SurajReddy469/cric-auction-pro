/**
 * Real-time BroadcastChannel & Storage sync bridge between Commissioner Admin Website
 * and the live Cric-Auction Pro game client.
 */

export interface SyncMessage {
  type: 
    | 'INJECT_PURSE'
    | 'SET_PERSONALITY'
    | 'FORCE_SOLD'
    | 'FORCE_UNSOLD'
    | 'JUMP_LOT'
    | 'FORCE_MATCH_RESULT'
    | 'CROWN_CHAMPION'
    | 'ADD_SCOUT_TOKENS'
    | 'UNLOCK_ACHIEVEMENTS'
    | 'FULL_STATE_UPDATE'
    | 'PING';
  payload?: any;
  timestamp: number;
}

class AdminSyncBridge {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('cric_auction_sync');
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'cric_auction_remote_command' && event.newValue) {
          try {
            const data: SyncMessage = JSON.parse(event.newValue);
            this.notifyListeners(data);
          } catch (e) {
            console.error('Storage command parse error', e);
          }
        }
      });
    }
  }

  public send(type: SyncMessage['type'], payload?: any) {
    const message: SyncMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(message);
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cric_auction_remote_command', JSON.stringify(message));
      } catch {
        // quota exceeded or private mode
      }
    }
  }

  public onMessage(callback: (msg: SyncMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(msg: SyncMessage) {
    this.listeners.forEach(cb => cb(msg));
  }
}

export const adminSyncBridge = new AdminSyncBridge();
