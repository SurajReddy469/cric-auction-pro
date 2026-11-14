import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { useGameStore } from '../src/store/useGameStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_URL = `ws://localhost:${process.env.TEST_MULTIPLAYER_PORT || 5175}`;
let serverProcess: ChildProcess | null = null;

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
  let additionalClients: Awaited<ReturnType<typeof createClient>>[] = [];
  let guestParticipantId: string;

  beforeAll(async () => {
    const isRunning = await new Promise<boolean>((resolve) => {
      const probe = new WebSocket(SERVER_URL);
      probe.on('open', () => { probe.close(); resolve(true); });
      probe.on('error', () => { resolve(false); });
    });

    if (!isRunning) {
      serverProcess = spawn('node', [path.resolve(__dirname, '../server/multiplayerServer.js')], {
        stdio: 'ignore',
        env: { ...process.env, PORT: '5175' }
      });
      await new Promise(r => setTimeout(r, 700));
    }

    hostClient = await createClient('Host');
    guestClient = await createClient('Guest');
    additionalClients = await Promise.all(
      Array.from({ length: 8 }, (_, index) => createClient(`Guest ${index + 2}`))
    );
  });

  afterAll(() => {
    hostClient?.close();
    guestClient?.close();
    additionalClients.forEach((client) => client.close());
    if (serverProcess) {
      serverProcess.kill();
    }
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
    expect(room.requiredPlayers).toBe(10);
    expect(room.participants.length).toBe(1);
    expect(room.participants[0].name).toBe('Captain Dhoni');
    expect(room.participants[0].isHost).toBe(true);
  });

  it('2. Nine more human players join using the room code', async () => {
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

    for (const [index, client] of additionalClients.entries()) {
      client.send({
        type: 'JOIN_ROOM',
        payload: { roomCode, playerName: `Manager ${index + 3}` },
      });
      const joined = await client.waitForMessage((m) => m.type === 'ROOM_JOINED');
      expect(joined.payload.room.participants.length).toBe(index + 3);
    }

    expect(guestJoined.payload.room.requiredPlayers).toBe(10);
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

    const remainingTeams = [
      'kolkata-knight-riders',
      'delhi-capitals',
      'rajasthan-royals',
      'sunrisers-hyderabad',
      'gujarat-titans',
      'lucknow-super-giants',
      'punjab-kings',
      'royal-challengers-bengaluru',
    ];
    for (const [index, client] of additionalClients.entries()) {
      const teamId = remainingTeams[index];
      client.send({ type: 'CLAIM_TEAM', payload: { teamId } });
      const claimed = await client.waitForMessage(
        (m) =>
          m.type === 'ROOM_UPDATED' &&
          m.payload.room?.participants.some(
            (p: any) => p.name === `Manager ${index + 3}` && p.teamId === teamId
          )
      );
      expect(claimed).toBeDefined();
    }
  });

  it('4. Auction starts only when required humans are present and ready', async () => {
    const clients = [hostClient, guestClient, ...additionalClients];
    clients.forEach((client) => client.send({ type: 'TOGGLE_READY', payload: {} }));

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

    // Other players also receive auction state synchronized
    const guestAuctionSync = await guestClient.waitForMessage(
      (m) => m.type === 'AUCTION_SYNC'
    );
    expect(guestAuctionSync).toBeDefined();
    expect(guestAuctionSync.payload.auctionState.currentPlayer).toBeDefined();
  });

  it('keeps all franchises visible when only two humans participate', async () => {
    const displayRoomCode = `T${Math.floor(100000 + Math.random() * 900000)}`;
    const [twoPlayerHost, twoPlayerGuest] = await Promise.all([
      createClient('Two-player host'),
      createClient('Two-player guest'),
    ]);

    try {
      twoPlayerHost.send({
        type: 'CREATE_ROOM',
        payload: {
          roomName: 'Two-player display test',
          roomCode: displayRoomCode,
          playerName: 'MI Manager',
          hostTeamId: 'mumbai-indians',
          requiredPlayers: 2,
          maxParticipants: 2,
          purseCap: 120,
        },
      });

      await twoPlayerHost.waitForMessage(
        (message) => message.type === 'ROOM_CREATED' && message.payload.room?.roomCode === displayRoomCode
      );

      twoPlayerGuest.send({
        type: 'JOIN_ROOM',
        payload: {
          roomCode: displayRoomCode,
          playerName: 'SRH Manager',
          teamId: 'sunrisers-hyderabad',
        },
      });
      await twoPlayerGuest.waitForMessage((message) => message.type === 'ROOM_JOINED');

      twoPlayerHost.send({ type: 'TOGGLE_READY', payload: {} });
      twoPlayerGuest.send({ type: 'TOGGLE_READY', payload: {} });
      await twoPlayerHost.waitForMessage(
        (message) => message.type === 'ROOM_UPDATED' && message.payload.room?.participants.every(
          (participant: any) => participant.isReady && participant.teamId
        )
      );

      twoPlayerHost.send({ type: 'START_AUCTION', payload: {} });
      const auctionSync = await twoPlayerHost.waitForMessage(
        (message) => message.type === 'AUCTION_SYNC' && message.payload.teams?.length === 10
      );

      expect(auctionSync.payload.teams.map((team: any) => team.id)).toContain('chennai-super-kings');
      expect(auctionSync.payload.teams.map((team: any) => team.id)).toContain('mumbai-indians');
      expect(auctionSync.payload.teams.map((team: any) => team.id)).toContain('sunrisers-hyderabad');
      expect(auctionSync.payload.teams).toHaveLength(10);
    } finally {
      twoPlayerHost.close();
      twoPlayerGuest.close();
    }
  });

  it('notifies joining participant if requested franchise is already claimed and leaves team unassigned', async () => {
    const conflictRoomCode = `C${Math.floor(100000 + Math.random() * 900000)}`;
    const [conflictHost, conflictGuest] = await Promise.all([
      createClient('Conflict Host'),
      createClient('Conflict Guest'),
    ]);

    try {
      conflictHost.send({
        type: 'CREATE_ROOM',
        payload: {
          roomName: 'Conflict Test Room',
          roomCode: conflictRoomCode,
          playerName: 'Alpha Manager',
          hostTeamId: 'mumbai-indians',
          requiredPlayers: 2,
          maxParticipants: 4,
          purseCap: 120,
        },
      });

      await conflictHost.waitForMessage(
        (m) => m.type === 'ROOM_CREATED' && m.payload.room?.roomCode === conflictRoomCode
      );

      // Guest attempts to join with mumbai-indians which is already taken by Alpha Manager
      conflictGuest.send({
        type: 'JOIN_ROOM',
        payload: {
          roomCode: conflictRoomCode,
          playerName: 'Beta Manager',
          teamId: 'mumbai-indians',
        },
      });

      const joinedMsg = await conflictGuest.waitForMessage(
        (m) => m.type === 'ROOM_JOINED'
      );

      expect(joinedMsg.payload.teamConflictNotice).toBeDefined();
      expect(joinedMsg.payload.teamConflictNotice.requestedTeamId).toBe('mumbai-indians');
      expect(joinedMsg.payload.teamConflictNotice.claimedByName).toBe('Alpha Manager');

      // The guest participant's teamId must be null (unallocated)
      const myParticipant = joinedMsg.payload.room.participants.find(
        (p: any) => p.id === joinedMsg.payload.myParticipantId
      );
      expect(myParticipant.teamId).toBeNull();

      // Guest can now claim an available franchise
      conflictGuest.send({
        type: 'CLAIM_TEAM',
        payload: {
          teamId: 'royal-challengers-bengaluru',
        },
      });

      const updatedMsg = await conflictGuest.waitForMessage(
        (m) => m.type === 'ROOM_UPDATED' && m.payload.room.participants.some(
          (p: any) => p.id === joinedMsg.payload.myParticipantId && p.teamId === 'royal-challengers-bengaluru'
        )
      );
      expect(updatedMsg).toBeDefined();
    } finally {
      conflictHost.close();
      conflictGuest.close();
    }
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
