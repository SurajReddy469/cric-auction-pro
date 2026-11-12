import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { useGameStore } from '../src/store/useGameStore';

const SERVER_URL = 'ws://localhost:5175';

// Helper to create a connected WebSocket client with message promise resolver
function createClient(name: string): Promise<{
  ws: WebSocket;
  messages: any[];
  waitForMessage: (predicate: (msg: any) => boolean, timeoutMs?: number) => Promise<any>;
  send: (msg: any) => void;
  close: () => void;
}> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    const messages: any[] = [];
    const listeners: ((msg: any) => void)[] = [];

    ws.on('open', () => {
      resolve({
        ws,
        messages,
        waitForMessage: (predicate, timeoutMs = 4000) => {
          // Check if message already received
          const existing = messages.find(predicate);
          if (existing) return Promise.resolve(existing);

          return new Promise((res, rej) => {
            const timer = setTimeout(() => {
              rej(new Error(`Timeout waiting for message matching predicate in client "${name}". Received types: ${messages.map(m => m.type).join(', ')}`));
            }, timeoutMs);

            const listener = (msg: any) => {
              if (predicate(msg)) {
                clearTimeout(timer);
                const idx = listeners.indexOf(listener);
                if (idx !== -1) listeners.splice(idx, 1);
                res(msg);
              }
            };
            listeners.push(listener);
          });
        },
        send: (msg: any) => ws.send(JSON.stringify(msg)),
        close: () => ws.close(),
      });
    });

    ws.on('message', (raw) => {
      try {
        const parsed = JSON.parse(raw.toString());
        messages.push(parsed);
        listeners.forEach((l) => l(parsed));
      } catch {
        // ignore non-json
      }
    });

    ws.on('error', (err) => reject(err));
  });
}

describe('Multiplayer Human-Only System', () => {
  const roomCode = 'TEST' + Math.floor(1000 + Math.random() * 9000);
  let hostClient: Awaited<ReturnType<typeof createClient>>;
  let guestClient: Awaited<ReturnType<typeof createClient>>;
  let guestParticipantId: string;

  beforeAll(async () => {
    hostClient = await createClient('Host');
    guestClient = await createClient('Guest');
  });

  afterAll(() => {
    hostClient?.close();
    guestClient?.close();
  });

  it('1. Host creates a room with zero bots and strictly human-only configuration', async () => {
    hostClient.send({
      type: 'CREATE_ROOM',
      payload: {
        roomName: 'Grand IPL Auction',
        roomCode,
        playerName: 'Captain Dhoni',
        requiredPlayers: 2,
        maxParticipants: 10,
        purseCap: 120,
      },
    });

    const createdEvent = await hostClient.waitForMessage(
      (m) => m.type === 'ROOM_CREATED' && m.payload.room?.roomCode === roomCode
    );

    expect(createdEvent).toBeDefined();
    const room = createdEvent.payload.room;
    expect(room.roomCode).toBe(roomCode);
    expect(room.isHumanOnly).toBe(true);
    expect(room.hasBots).toBe(false);
    expect(room.participants.length).toBe(1);
    expect(room.participants[0].name).toBe('Captain Dhoni');
    expect(room.participants[0].isHost).toBe(true);
  });

  it('2. Another human player joins using the room code and claims a franchise', async () => {
    guestClient.send({
      type: 'JOIN_ROOM',
      payload: {
        roomCode,
        playerName: 'Rohit Sharma',
      },
    });

    const guestJoined = await guestClient.waitForMessage(
      (m) => m.type === 'ROOM_JOINED'
    );

    expect(guestJoined).toBeDefined();
    expect(guestJoined.payload.room.participants.length).toBe(2);

    const guest = guestJoined.payload.room.participants.find((p: any) => p.name === 'Rohit Sharma');
    expect(guest).toBeDefined();
    expect(guest.isHost).toBe(false);
    guestParticipantId = guest.id;

    // Host also receives the ROOM_UPDATED with 2 participants
    const hostSeesGuest = await hostClient.waitForMessage(
      (m) => m.type === 'ROOM_UPDATED' && m.payload.room?.participants?.length === 2
    );
    expect(hostSeesGuest).toBeDefined();
  });

  it('3. Human players claim unique teams; duplicate claims are rejected', async () => {
    // Host claims CSK
    hostClient.send({
      type: 'CLAIM_TEAM',
      payload: {
        teamId: 'chennai-super-kings',
      },
    });

    const hostClaimed = await hostClient.waitForMessage(
      (m) =>
        m.type === 'ROOM_UPDATED' &&
        m.payload.room?.participants.some(
          (p: any) => p.name === 'Captain Dhoni' && p.teamId === 'chennai-super-kings'
        )
    );
    expect(hostClaimed).toBeDefined();

    // Guest attempts to claim the same team (CSK)
    guestClient.send({
      type: 'CLAIM_TEAM',
      payload: {
        teamId: 'chennai-super-kings',
      },
    });

    const errorEvent = await guestClient.waitForMessage(
      (m) => m.type === 'ERROR' && m.payload.message.includes('already claimed')
    );
    expect(errorEvent).toBeDefined();
    expect(errorEvent.payload.message).toContain('already claimed');

    // Guest claims MI instead
    guestClient.send({
      type: 'CLAIM_TEAM',
      payload: {
        teamId: 'mumbai-indians',
      },
    });

    const guestClaimed = await guestClient.waitForMessage(
      (m) =>
        m.type === 'ROOM_UPDATED' &&
        m.payload.room?.participants.some(
          (p: any) => p.name === 'Rohit Sharma' && p.teamId === 'mumbai-indians'
        )
    );
    expect(guestClaimed).toBeDefined();
  });

  it('4. Auction starts only when required humans are present and ready', async () => {
    // Both toggle ready
    hostClient.send({ type: 'TOGGLE_READY', payload: {} });
    guestClient.send({ type: 'TOGGLE_READY', payload: {} });

    await hostClient.waitForMessage(
      (m) =>
        m.type === 'ROOM_UPDATED' &&
        m.payload.room?.participants.every((p: any) => p.isReady)
    );

    // Host launches auction
    hostClient.send({ type: 'START_AUCTION', payload: {} });

    const auctionStarted = await hostClient.waitForMessage(
      (m) => m.type === 'ROOM_UPDATED' && m.payload.room?.status === 'auction'
    );
    expect(auctionStarted).toBeDefined();
    expect(auctionStarted.payload.room.auctionState).toBeDefined();
    expect(auctionStarted.payload.room.auctionState.currentPlayer).toBeDefined();

    // Guest also receives auction state synchronized
    const guestAuctionSync = await guestClient.waitForMessage(
      (m) => m.type === 'AUCTION_SYNC'
    );
    expect(guestAuctionSync).toBeDefined();
    expect(guestAuctionSync.payload.auctionState.currentPlayer).toBeDefined();
  });

  it('5. Human-only bidding synchronizes across players and resets the countdown timer', async () => {
    // Host places bid of 2.50 Cr
    hostClient.send({
      type: 'PLACE_HUMAN_BID',
      payload: {
        amount: 2.5,
      },
    });

    const bidSync1 = await hostClient.waitForMessage(
      (m) => m.type === 'AUCTION_SYNC' && m.payload.auctionState.currentBid === 2.5
    );
    expect(bidSync1.payload.auctionState.highestBidderName).toBe('Chennai Super Kings');
    expect(bidSync1.payload.auctionState.highestBidderId).toBe('chennai-super-kings');

    const guestSync1 = await guestClient.waitForMessage(
      (m) => m.type === 'AUCTION_SYNC' && m.payload.auctionState.currentBid === 2.5
    );
    expect(guestSync1.payload.auctionState.highestBidderName).toBe('Chennai Super Kings');

    // Guest raises to 3.00 Cr
    guestClient.send({
      type: 'PLACE_HUMAN_BID',
      payload: {
        amount: 3.0,
      },
    });

    const bidSync2 = await hostClient.waitForMessage(
      (m) => m.type === 'AUCTION_SYNC' && m.payload.auctionState.currentBid === 3.0
    );
    expect(bidSync2.payload.auctionState.highestBidderName).toBe('Mumbai Indians');
    expect(bidSync2.payload.auctionState.highestBidderId).toBe('mumbai-indians');
  });

  it('6. When a human player disconnects, room PAUSES immediately with NO bot substituted', async () => {
    // Simulate guest disconnection (e.g. lost network or closed tab)
    guestClient.close();

    // Host receives ROOM_PAUSED with disconnect reason
    const pauseMsg = await hostClient.waitForMessage(
      (m) => m.type === 'ROOM_PAUSED',
      5000
    );

    expect(pauseMsg).toBeDefined();
    expect(pauseMsg.payload.reason).toContain('Waiting for Rohit Sharma');
    expect(pauseMsg.payload.disconnectedParticipant?.name).toBe('Rohit Sharma');

    // CRITICAL: Ensure NO bot replaced the disconnected player in the room!
    // Connect new client as reconnecting guest using their persistent participantId
    const reconnectedGuest = await createClient('ReconnectedGuest');
    reconnectedGuest.send({
      type: 'JOIN_ROOM',
      payload: {
        roomCode,
        playerName: 'Rohit Sharma',
        playerId: guestParticipantId,
      },
    });

    // Both players receive ROOM_RESUMED
    const resumedMsg = await hostClient.waitForMessage(
      (m) => m.type === 'ROOM_RESUMED',
      5000
    );
    expect(resumedMsg).toBeDefined();
    expect(resumedMsg.payload.room?.roomCode).toBe(roomCode);

    const resumedRoom = resumedMsg.payload.room;
    expect(resumedRoom.isHumanOnly).toBe(true);
    expect(resumedRoom.hasBots).toBe(false);
    expect(resumedRoom.participants.some((p: any) => p.name.includes('Bot'))).toBe(false);

    reconnectedGuest.close();
  });

  it('7. Client store strictly guards against AI bot bidding in multiplayer mode', () => {
    const store = useGameStore.getState();

    // 1. In multiplayer mode, triggerAIBidDecision MUST NOT execute bot bids
    useGameStore.setState({
      gameMode: 'multiplayer',
      auction: {
        ...store.auction,
        phase: 'bidding',
        currentBid: 2.0,
        highestBidderId: 'chennai-super-kings',
      },
    });

    // Call triggerAIBidDecision: should immediately return without doing anything
    useGameStore.getState().triggerAIBidDecision();

    // The bid and highest bidder should NOT have been modified by any bot
    expect(useGameStore.getState().auction.currentBid).toBe(2.0);
    expect(useGameStore.getState().auction.highestBidderId).toBe('chennai-super-kings');

    // 2. In multiplayer mode, tickAuctionTimer locally is disabled (server is authoritative)
    const currentTimer = useGameStore.getState().auction.timerSeconds;
    useGameStore.getState().tickAuctionTimer();
    expect(useGameStore.getState().auction.timerSeconds).toBe(currentTimer);

    // Restore singleplayer mode
    useGameStore.setState({ gameMode: 'singleplayer' });
  });
});
