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
});
