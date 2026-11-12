import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 5175;

// In-memory Room Store
const rooms = new Map();

const DEFAULT_TEAMS = [
  { id: 'chennai-super-kings', name: 'Chennai Super Kings', shortName: 'CSK', city: 'Chennai', primaryColor: '#facc15', currentPurse: 120, squad: [] },
  { id: 'mumbai-indians', name: 'Mumbai Indians', shortName: 'MI', city: 'Mumbai', primaryColor: '#0284c7', currentPurse: 120, squad: [] },
  { id: 'royal-challengers-bengaluru', name: 'Royal Challengers Bengaluru', shortName: 'RCB', city: 'Bengaluru', primaryColor: '#e11d48', currentPurse: 120, squad: [] },
  { id: 'kolkata-knight-riders', name: 'Kolkata Knight Riders', shortName: 'KKR', city: 'Kolkata', primaryColor: '#7c3aed', currentPurse: 120, squad: [] },
  { id: 'delhi-capitals', name: 'Delhi Capitals', shortName: 'DC', city: 'Delhi', primaryColor: '#2563eb', currentPurse: 120, squad: [] },
  { id: 'rajasthan-royals', name: 'Rajasthan Royals', shortName: 'RR', city: 'Rajasthan', primaryColor: '#ec4899', currentPurse: 120, squad: [] },
  { id: 'sunrisers-hyderabad', name: 'Sunrisers Hyderabad', shortName: 'SRH', city: 'Hyderabad', primaryColor: '#f97316', currentPurse: 120, squad: [] },
  { id: 'gujarat-titans', name: 'Gujarat Titans', shortName: 'GT', city: 'Gujarat', primaryColor: '#1e293b', currentPurse: 120, squad: [] },
  { id: 'lucknow-super-giants', name: 'Lucknow Super Giants', shortName: 'LSG', city: 'Lucknow', primaryColor: '#06b6d4', currentPurse: 120, squad: [] },
  { id: 'punjab-kings', name: 'Punjab Kings', shortName: 'PBKS', city: 'Punjab', primaryColor: '#dc2626', currentPurse: 120, squad: [] },
];

const DEFAULT_PLAYERS = [
  { id: 'vk_18', name: 'Virat Kohli', role: 'Batsman', isOverseas: false, basePrice: 2.0, rating: 94, tier: 'Marquee' },
  { id: 'rs_45', name: 'Rohit Sharma', role: 'Batsman', isOverseas: false, basePrice: 2.0, rating: 92, tier: 'Marquee' },
  { id: 'jb_93', name: 'Jasprit Bumrah', role: 'Bowler', isOverseas: false, basePrice: 2.0, rating: 95, tier: 'Marquee' },
  { id: 'msd_07', name: 'MS Dhoni', role: 'Wicketkeeper', isOverseas: false, basePrice: 2.0, rating: 90, tier: 'Legend' },
];

// Helper to generate 6-character room codes
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// HTTP Server for health checks and diagnostics
const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      uptime: process.uptime(),
      activeRooms: rooms.size,
      version: '1.0.0-human-only'
    }));
    return;
  }

  if (req.url === '/rooms') {
    const list = Array.from(rooms.values()).map(r => ({
      roomCode: r.roomCode,
      roomName: r.roomName,
      status: r.status,
      playerCount: r.participants.length,
      requiredPlayers: r.requiredPlayers,
      isHumanOnly: true,
      hasBots: false
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// WebSocket Server attached to HTTP server
const wss = new WebSocketServer({ server });

function broadcastToRoom(roomCode, message, excludeSocket = null) {
  const data = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.roomCode === roomCode && client !== excludeSocket) {
      client.send(data);
    }
  });
}

// Room timer management
const roomTimers = new Map();

function stopRoomAuctionTimer(roomCode) {
  if (roomTimers.has(roomCode)) {
    clearInterval(roomTimers.get(roomCode));
    roomTimers.delete(roomCode);
  }
}

function startRoomAuctionTimer(room) {
  stopRoomAuctionTimer(room.roomCode);

  if (room.status !== 'auction' || !room.auctionState || room.auctionState.isPaused) {
    return;
  }

  const interval = setInterval(() => {
    const currentRoom = rooms.get(room.roomCode);
    if (!currentRoom || currentRoom.status !== 'auction' || currentRoom.auctionState?.isPaused) {
      stopRoomAuctionTimer(room.roomCode);
      return;
    }

    const auction = currentRoom.auctionState;
    if (auction.timerSeconds > 0) {
      auction.timerSeconds -= 1;
      broadcastToRoom(room.roomCode, {
        type: 'AUCTION_SYNC',
        payload: {
          auctionState: auction,
          teams: currentRoom.teams,
          players: currentRoom.players
        }
      });
    } else {
      // Hammer falls!
      resolveCurrentLot(currentRoom);
    }
  }, 1000);

  roomTimers.set(room.roomCode, interval);
}

function resolveCurrentLot(room) {
  const auction = room.auctionState;
  const currentLot = auction.currentPlayer;
  if (!currentLot) return;

  if (auction.highestBidderId && auction.currentBid > 0) {
    // Sold to human player's franchise
    currentLot.isSold = true;
    currentLot.soldPrice = auction.currentBid;
    currentLot.currentTeamId = auction.highestBidderId;

    const buyerTeam = room.teams.find(t => t.id === auction.highestBidderId);
    if (buyerTeam) {
      buyerTeam.currentPurse -= auction.currentBid;
      buyerTeam.squad.push(currentLot);
    }

    auction.auctionHistory.unshift({
      player: currentLot,
      soldToTeamId: auction.highestBidderId,
      soldToTeamName: buyerTeam?.name || 'Franchise',
      price: auction.currentBid,
      timestamp: Date.now(),
      status: 'sold'
    });

    auction.feedMessages.unshift({
      id: `feed_${Date.now()}`,
      timestamp: Date.now(),
      text: `🔨 SOLD! ${currentLot.name} sold to ${buyerTeam?.name} for ₹${auction.currentBid.toFixed(2)} Cr!`,
      type: 'sold'
    });
  } else {
    // Unsold
    currentLot.isUnsold = true;
    auction.auctionHistory.unshift({
      player: currentLot,
      soldToTeamId: null,
      soldToTeamName: 'UNSOLD',
      price: 0,
      timestamp: Date.now(),
      status: 'unsold'
    });

    auction.feedMessages.unshift({
      id: `feed_${Date.now()}`,
      timestamp: Date.now(),
      text: `❌ UNSOLD! ${currentLot.name} passes without bids.`,
      type: 'unsold'
    });
  }

  // Advance to next lot
  auction.currentPlayerIndex += 1;
  const nextPlayer = room.players[auction.currentPlayerIndex];

  if (nextPlayer) {
    auction.currentPlayer = nextPlayer;
    auction.currentBid = nextPlayer.basePrice;
    auction.highestBidderId = null;
    auction.highestBidderName = null;
    auction.bidHistory = [];
    auction.timerSeconds = 10;
    auction.totalPlayersAuctioned += 1;

    broadcastToRoom(room.roomCode, {
      type: 'AUCTION_SYNC',
      payload: {
        auctionState: auction,
        teams: room.teams,
        players: room.players
      }
    });

    startRoomAuctionTimer(room);
  } else {
    // Auction Completed!
    auction.phase = 'completed';
    room.status = 'squad';
    stopRoomAuctionTimer(room.roomCode);

    broadcastToRoom(room.roomCode, {
      type: 'ROOM_UPDATED',
      payload: { room }
    });
    broadcastToRoom(room.roomCode, {
      type: 'AUCTION_SYNC',
      payload: {
        auctionState: auction,
        teams: room.teams,
        players: room.players
      }
    });
  }
}

// WebSocket Connection Handlers
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (messageBuffer) => {
    try {
      const message = JSON.parse(messageBuffer.toString());
      const { type, payload } = message;

      switch (type) {
        case 'CREATE_ROOM': {
          const roomCode = (payload.roomCode || generateRoomCode()).toUpperCase();
          const participantId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          
          const hostParticipant = {
            id: participantId,
            name: payload.playerName || 'Host Manager',
            teamId: null,
            isHost: true,
            isReady: false,
            isConnected: true,
            joinedAt: Date.now(),
            lastHeartbeat: Date.now()
          };

          const newRoom = {
            roomCode,
            roomName: payload.roomName || `IPL Room ${roomCode}`,
            hostId: participantId,
            status: 'lobby',
            isHumanOnly: true,
            hasBots: false,
            requiredPlayers: Math.max(2, Math.min(10, payload.requiredPlayers || 2)),
            purseCap: payload.purseCap || 120,
            participants: [hostParticipant],
            teams: (payload.teams && payload.teams.length > 0) ? payload.teams : JSON.parse(JSON.stringify(DEFAULT_TEAMS)),
            players: (payload.players && payload.players.length > 0) ? payload.players : JSON.parse(JSON.stringify(DEFAULT_PLAYERS)),
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          rooms.set(roomCode, newRoom);
          ws.roomCode = roomCode;
          ws.participantId = participantId;

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            payload: { room: newRoom, myParticipantId: participantId }
          }));
          break;
        }

        case 'JOIN_ROOM': {
          const code = (payload.roomCode || '').toUpperCase().trim();
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Room #${code} not found. Check the code and try again.` }
            }));
            return;
          }

          // Check if this is a reconnecting player
          const existingParticipant = payload.playerId 
            ? room.participants.find(p => p.id === payload.playerId)
            : null;

          let participantId = existingParticipant ? existingParticipant.id : `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          if (existingParticipant) {
            // Reconnecting!
            existingParticipant.isConnected = true;
            existingParticipant.lastHeartbeat = Date.now();

            ws.roomCode = code;
            ws.participantId = participantId;

            // If room was paused waiting for this participant, unpause it!
            if (room.status === 'paused' && room.disconnectedParticipant?.id === existingParticipant.id) {
              room.status = 'auction';
              room.pauseReason = undefined;
              room.disconnectedParticipant = undefined;
              room.pauseExpiresAt = undefined;
              if (room.auctionState) room.auctionState.isPaused = false;

              broadcastToRoom(code, {
                type: 'ROOM_RESUMED',
                payload: { room }
              });

              startRoomAuctionTimer(room);
            }

            ws.send(JSON.stringify({
              type: 'ROOM_JOINED',
              payload: { room, myParticipantId: participantId }
            }));

            broadcastToRoom(code, { type: 'ROOM_UPDATED', payload: { room } });
            return;
          }

          // New player joining
          if (room.participants.length >= 10) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Room #${code} is full (max 10 human managers).` }
            }));
            return;
          }

          if (room.status !== 'lobby') {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Auction has already started in room #${code}.` }
            }));
            return;
          }

          const newParticipant = {
            id: participantId,
            name: payload.playerName || `Manager ${room.participants.length + 1}`,
            teamId: null,
            isHost: false,
            isReady: false,
            isConnected: true,
            joinedAt: Date.now(),
            lastHeartbeat: Date.now()
          };

          room.participants.push(newParticipant);
          room.updatedAt = Date.now();

          ws.roomCode = code;
          ws.participantId = participantId;

          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            payload: { room, myParticipantId: participantId }
          }));

          broadcastToRoom(code, {
            type: 'ROOM_UPDATED',
            payload: { room }
          });
          break;
        }

        case 'CLAIM_TEAM': {
          const room = rooms.get(ws.roomCode);
          if (!room || room.status !== 'lobby') return;

          const { teamId } = payload;
          const participant = room.participants.find(p => p.id === ws.participantId);
          if (!participant) return;

          // Verify no other human has claimed this team
          const alreadyClaimed = room.participants.find(p => p.teamId === teamId && p.id !== ws.participantId);
          if (alreadyClaimed) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Franchise already claimed by ${alreadyClaimed.name}!` }
            }));
            return;
          }

          participant.teamId = teamId;
          participant.isReady = false; // reset ready on team change
          room.updatedAt = Date.now();

          broadcastToRoom(ws.roomCode, {
            type: 'ROOM_UPDATED',
            payload: { room }
          });
          break;
        }

        case 'TOGGLE_READY': {
          const room = rooms.get(ws.roomCode);
          if (!room || room.status !== 'lobby') return;

          const participant = room.participants.find(p => p.id === ws.participantId);
          if (!participant || !participant.teamId) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'You must select a franchise before getting ready.' }
            }));
            return;
          }

          participant.isReady = typeof payload?.isReady === 'boolean' ? payload.isReady : !participant.isReady;
          room.updatedAt = Date.now();

          broadcastToRoom(ws.roomCode, {
            type: 'ROOM_UPDATED',
            payload: { room }
          });
          break;
        }

        case 'START_AUCTION': {
          const room = rooms.get(ws.roomCode);
          if (!room || room.status !== 'lobby') return;

          const participant = room.participants.find(p => p.id === ws.participantId);
          if (!participant?.isHost) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'Only the room host can start the auction.' }
            }));
            return;
          }

          // Enforce Human-Only Requirements
          if (room.participants.length < room.requiredPlayers) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Cannot start: Need at least ${room.requiredPlayers} human managers. Currently have ${room.participants.length}.` }
            }));
            return;
          }

          // Verify every participant has claimed a team and is ready
          const unready = room.participants.find(p => !p.isReady || !p.teamId);
          if (unready) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Cannot start: ${unready.name} has not selected a franchise or is not ready.` }
            }));
            return;
          }

          // STRICT HUMAN-ONLY: Filter active teams strictly to human claimed franchises
          const humanTeamIds = new Set(room.participants.map(p => p.teamId));
          room.teams = (room.teams || []).filter(t => humanTeamIds.has(t.id));

          // Reset starting purses to room.purseCap
          room.teams.forEach(t => {
            t.startingPurse = room.purseCap;
            t.currentPurse = room.purseCap;
            t.squad = [];
          });

          // Initialize auction state
          const firstPlayer = room.players && room.players[0] ? room.players[0] : null;
          room.auctionState = {
            currentSetIndex: 0,
            currentPlayerIndex: 0,
            currentPlayer: firstPlayer,
            currentBid: firstPlayer ? firstPlayer.basePrice : 2.0,
            highestBidderId: null,
            highestBidderName: null,
            bidHistory: [],
            phase: 'live',
            timerSeconds: 10,
            isPaused: false,
            totalPlayersAuctioned: 0,
            feedMessages: [
              {
                id: `feed_start`,
                timestamp: Date.now(),
                text: `🏏 Human-Only Auction started! ${room.participants.length} human managers competing. Strictly zero bots.`,
                type: 'system'
              }
            ],
            auctionHistory: []
          };

          room.status = 'auction';
          room.updatedAt = Date.now();

          broadcastToRoom(ws.roomCode, {
            type: 'ROOM_UPDATED',
            payload: { room }
          });

          broadcastToRoom(ws.roomCode, {
            type: 'AUCTION_SYNC',
            payload: {
              auctionState: room.auctionState,
              teams: room.teams,
              players: room.players
            }
          });

          startRoomAuctionTimer(room);
          break;
        }

        case 'PLACE_HUMAN_BID': {
          const room = rooms.get(ws.roomCode);
          if (!room || room.status !== 'auction' || room.auctionState?.isPaused) return;

          const participant = room.participants.find(p => p.id === ws.participantId);
          if (!participant || !participant.teamId) return;

          const team = room.teams.find(t => t.id === participant.teamId);
          if (!team) return;

          const amount = payload.amount;
          const auction = room.auctionState;

          // Bid validation
          if (amount <= auction.currentBid) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Bid must exceed current bid of ₹${auction.currentBid.toFixed(2)} Cr` }
            }));
            return;
          }

          if (amount > team.currentPurse) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Insufficient purse! ₹${team.currentPurse.toFixed(2)} Cr remaining.` }
            }));
            return;
          }

          if (auction.highestBidderId === team.id) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'You already hold the highest bid!' }
            }));
            return;
          }

          // Register human bid
          auction.currentBid = amount;
          auction.highestBidderId = team.id;
          auction.highestBidderName = team.name;
          auction.timerSeconds = 10; // Reset countdown on new bid!

          auction.bidHistory.unshift({
            teamId: team.id,
            teamName: team.name,
            amount,
            timestamp: Date.now()
          });

          auction.feedMessages.unshift({
            id: `bid_${Date.now()}`,
            timestamp: Date.now(),
            text: `💰 ${participant.name} (${team.name}) bids ₹${amount.toFixed(2)} Cr!`,
            type: 'bid'
          });

          broadcastToRoom(ws.roomCode, {
            type: 'AUCTION_SYNC',
            payload: {
              auctionState: auction,
              teams: room.teams,
              players: room.players
            }
          });

          // Restart timer with fresh 10s
          startRoomAuctionTimer(room);
          break;
        }

        case 'HEARTBEAT': {
          const room = rooms.get(ws.roomCode);
          if (room) {
            const p = room.participants.find(x => x.id === ws.participantId);
            if (p) p.lastHeartbeat = Date.now();
          }
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  // Handle Client Disconnect
  ws.on('close', () => {
    if (!ws.roomCode) return;
    const room = rooms.get(ws.roomCode);
    if (!room) return;

    const participant = room.participants.find(p => p.id === ws.participantId);
    if (!participant) return;

    participant.isConnected = false;

    // STRICT HUMAN REQUIREMENT: If in active auction or match, PAUSE immediately!
    if (room.status === 'auction' || room.status === 'match') {
      stopRoomAuctionTimer(room.roomCode);
      room.status = 'paused';
      room.pauseReason = `Waiting for ${participant.name} to reconnect...`;
      room.disconnectedParticipant = participant;
      room.pauseExpiresAt = Date.now() + 60000; // 60s reconnection window

      if (room.auctionState) {
        room.auctionState.isPaused = true;
      }

      broadcastToRoom(ws.roomCode, {
        type: 'ROOM_PAUSED',
        payload: {
          reason: room.pauseReason,
          disconnectedParticipant: participant,
          pauseExpiresAt: room.pauseExpiresAt
        }
      });
    } else if (room.status === 'lobby') {
      // In lobby, if player was host and left, reassign host or clean up
      if (participant.isHost) {
        const nextHost = room.participants.find(p => p.id !== participant.id && p.isConnected);
        if (nextHost) {
          nextHost.isHost = true;
          room.hostId = nextHost.id;
        }
      }

      // Remove from lobby
      room.participants = room.participants.filter(p => p.id !== participant.id);

      if (room.participants.length === 0) {
        rooms.delete(ws.roomCode);
      } else {
        broadcastToRoom(ws.roomCode, {
          type: 'ROOM_UPDATED',
          payload: { room }
        });
      }
    }
  });
});

// Periodic heartbeat sweep
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, roomCode) => {
    // Check for paused rooms that expired
    if (room.status === 'paused' && room.pauseExpiresAt && now > room.pauseExpiresAt) {
      // Pause window expired
      room.status = 'lobby';
      room.pauseReason = 'Match abandoned due to player timeout.';
      if (room.auctionState) room.auctionState.phase = 'idle';

      broadcastToRoom(roomCode, {
        type: 'ROOM_UPDATED',
        payload: { room }
      });
    }
  });
}, 5000);

server.listen(PORT, () => {
  console.log(`🏏 Cric-Auction Pro Multiplayer WebSocket Server running on port ${PORT}`);
  console.log(`🛡️ Human-Only Mode Enforced: No bot bidding or AI substitutions permitted.`);
});
