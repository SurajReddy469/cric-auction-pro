import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/store/useGameStore';

describe('End-to-End Single-Player Game Lifecycle', () => {
  beforeEach(() => {
    // Reset game state to clean initial values
    useGameStore.getState().resetAllGameData();
  });

  it('plays through an entire IPL campaign: Session Creation -> Auction Draft -> League Matches -> Playoffs -> Champion Crowned', () => {
    const store = useGameStore.getState();

    // 1. Setup Manager Identity & Select Franchise
    store.setManagerProfile('Vikram Sengupta');
    store.selectTeam('chennai-super-kings');

    expect(useGameStore.getState().profile.name).toBe('Vikram Sengupta');
    expect(useGameStore.getState().userTeamId).toBe('chennai-super-kings');
    expect(useGameStore.getState().teams).toHaveLength(10);

    // 2. Create a Mega Auction Session
    const sessionId = store.createSession({
      name: 'IPL 2025 Grand Championship',
      format: 'mega',
      purseCap: 120,
      preSelectedTeamId: 'chennai-super-kings',
      seasonYear: 2025,
    });

    expect(sessionId).toBeDefined();
    expect(useGameStore.getState().activeSessionId).toBe(sessionId);
    expect(useGameStore.getState().teams).toHaveLength(10);
    expect(useGameStore.getState().teams.every(t => t.startingPurse === 120)).toBe(true);

    // 3. Start Live Auction
    store.startAuction();
    const auctionAfterStart = useGameStore.getState().auction;
    expect(auctionAfterStart.phase).toBe('bidding');
    expect(auctionAfterStart.currentPlayer).toBeDefined();

    // 4. Draft players for the human manager team (15 players for CSK)
    const availablePool = useGameStore.getState().players;
    const cskDraftTargets = availablePool.slice(0, 15);
    cskDraftTargets.forEach(p => {
      store.adminTransferPlayer(p.id, 'chennai-super-kings', p.basePrice);
    });

    // Set starting XI of 11 players
    const cskSquad = useGameStore.getState().userTeam()?.squad || [];
    expect(cskSquad.length).toBeGreaterThanOrEqual(15);
    store.updateStartingXI(cskSquad.slice(0, 11).map(p => p.id));
    store.setCaptain(cskSquad[0].id);
    store.setWicketkeeper(cskSquad[1].id);

    // Complete the remaining auction for all other 9 franchises
    store.autoCompleteAuction();
    const auctionCompleted = useGameStore.getState().auction;
    expect(auctionCompleted.phase).toBe('completed');

    // 5. Verify Squad & Starting XI
    const userTeam = useGameStore.getState().userTeam();
    expect(userTeam).toBeDefined();
    expect(userTeam!.squad.length).toBeGreaterThanOrEqual(11);
    expect(userTeam!.startingXI.length).toBe(11);

    // Verify all 10 teams have squads and playing XIs
    const allTeams = useGameStore.getState().teams;
    expect(allTeams).toHaveLength(10);
    allTeams.forEach(team => {
      expect(team.squad.length).toBeGreaterThanOrEqual(11);
      expect(team.startingXI.length).toBe(11);
    });

    // 6. Start the Season
    store.startSeason();
    const seasonState = useGameStore.getState();
    expect(seasonState.currentScreen).toBe('season');
    expect(seasonState.leagueMatches.length).toBeGreaterThan(0);
    expect(seasonState.standings).toHaveLength(10);
    expect(seasonState.playoffStage).toBe('not_started');

    // 7. Simulate All League Matches
    store.simulateAllLeagueMatches();
    const postLeagueState = useGameStore.getState();
    expect(postLeagueState.currentMatchIndex).toBe(postLeagueState.leagueMatches.length);
    expect(postLeagueState.leagueMatches.every(m => m.isPlayed)).toBe(true);

    // Verify Standings Table
    const standings = postLeagueState.standings;
    expect(standings).toHaveLength(10);
    expect(standings[0].points).toBeGreaterThanOrEqual(standings[9].points);

    // 8. Verify Playoffs Progression
    const playoffMatches = useGameStore.getState().playoffMatches;
    expect(playoffMatches.length).toBeGreaterThanOrEqual(4); // Q1, Eliminator, Q2, Final
    expect(useGameStore.getState().playoffStage).toBe('completed');

    // 9. Crown Champion
    const champion = useGameStore.getState().championTeam;
    expect(champion).toBeDefined();
    expect(champion?.id).toBeDefined();

    // Verify final matches played has winner
    const finalMatch = playoffMatches.find(m => m.id === 'playoff-final');
    expect(finalMatch).toBeDefined();
    expect(finalMatch!.isPlayed).toBe(true);
    expect(finalMatch!.winnerTeamId).toBe(champion!.id);
  });

  it('preserves user currentScreen when navigating away from auction (no 1-second snapping loop)', () => {
    const store = useGameStore.getState();
    store.setScreen('auction');
    expect(useGameStore.getState().currentScreen).toBe('auction');

    // User navigates to room lobby
    store.setScreen('multiplayer_lobby');
    expect(useGameStore.getState().currentScreen).toBe('multiplayer_lobby');

    // Simulate store receiving auction clock sync in background
    useGameStore.setState({
      auction: {
        ...useGameStore.getState().auction,
        timerSeconds: 7,
        currentBid: 2.5,
      },
    });

    // Screen must remain on lobby
    expect(useGameStore.getState().currentScreen).toBe('multiplayer_lobby');

    // User navigates to squad
    store.setScreen('squad');
    expect(useGameStore.getState().currentScreen).toBe('squad');

    // Another timer tick arrives
    useGameStore.setState({
      auction: {
        ...useGameStore.getState().auction,
        timerSeconds: 6,
        currentBid: 3.0,
      },
    });

    // Screen must remain on squad
    expect(useGameStore.getState().currentScreen).toBe('squad');

    // User explicitly returns to live auction
    store.setScreen('auction');
    expect(useGameStore.getState().currentScreen).toBe('auction');
  });

  it('Feedback System: submits feedback, persists to storage, updates status, and deletes', () => {
    const store = useGameStore.getState();
    store.clearAllFeedback();
    expect(useGameStore.getState().feedbackList).toHaveLength(0);

    // 1. Submit feedback
    store.submitFeedback({
      rating: 5,
      category: 'feature',
      userName: 'CricketFan99',
      userEmail: 'fan@cricket.org',
      message: 'Great auction simulation! Please add custom team jersey colors.',
      context: {
        userTeamName: 'Chennai Super Kings',
        gameMode: 'singleplayer',
        currentScreen: 'auction',
      },
    });

    const listAfterSubmit = useGameStore.getState().feedbackList;
    expect(listAfterSubmit).toHaveLength(1);
    const fb = listAfterSubmit[0];
    expect(fb.rating).toBe(5);
    expect(fb.category).toBe('feature');
    expect(fb.userName).toBe('CricketFan99');
    expect(fb.status).toBe('new');

    // 2. Update status to reviewed and resolved
    store.updateFeedbackStatus(fb.id, 'reviewed');
    expect(useGameStore.getState().feedbackList[0].status).toBe('reviewed');

    store.updateFeedbackStatus(fb.id, 'resolved');
    expect(useGameStore.getState().feedbackList[0].status).toBe('resolved');

    // 3. Delete feedback
    store.deleteFeedback(fb.id);
    expect(useGameStore.getState().feedbackList).toHaveLength(0);
  });

  it('Sold Lot & Winning Bid: hammer falling triggers sold phase with buyer franchise and price', () => {
    const store = useGameStore.getState();
    store.startAuction();

    const currentLot = useGameStore.getState().auction.currentPlayer;
    expect(currentLot).toBeDefined();

    // Place a bid by CSK
    useGameStore.setState({
      auction: {
        ...useGameStore.getState().auction,
        currentBid: 5.0,
        highestBidderId: 'chennai-super-kings',
        highestBidderName: 'Chennai Super Kings',
        timerSeconds: 1,
        phase: 'bidding',
      },
    });

    // Tick the timer to 0 (hammer falls)
    store.tickAuctionTimer();

    const soldState = useGameStore.getState().auction;
    expect(soldState.phase).toBe('sold');
    expect(soldState.highestBidderId).toBe('chennai-super-kings');
    expect(soldState.currentBid).toBe(5.0);
    expect(soldState.currentPlayer?.isSold).toBe(true);
    expect(soldState.currentPlayer?.soldToTeamId).toBe('chennai-super-kings');

    // Verify buyer team squad acquired the player
    const cskTeam = useGameStore.getState().teams.find(t => t.id === 'chennai-super-kings');
    expect(cskTeam?.squad.some(p => p.id === currentLot!.id)).toBe(true);
  });

  it('Standing User Rule: strictly zero <section> JSX/HTML tags anywhere in codebase', () => {
    const fs = require('fs');
    const path = require('path');

    function scanFiles(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
          files.push(...scanFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const componentFiles = [...scanFiles(path.resolve(__dirname, '../src')), ...scanFiles(path.resolve(__dirname, '../admin'))];
    const violations: string[] = [];

    const sectionRegex = /<\s*section[\s>]/i;
    for (const f of componentFiles) {
      const content = fs.readFileSync(f, 'utf-8');
      if (sectionRegex.test(content)) {
        violations.push(f);
      }
    }

    expect(violations).toEqual([]);
  });
});
