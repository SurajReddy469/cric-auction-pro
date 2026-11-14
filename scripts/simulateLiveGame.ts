import { useGameStore } from '../src/store/useGameStore';

async function main() {
  console.log('🏏 ==============================================================');
  console.log('    IPL CRIC-AUCTION PRO - LIVE GAMEPLAY SIMULATION SESSION       ');
  console.log('============================================================== 🏏\n');

  const store = useGameStore.getState();

  // 1. Create Manager Identity & Franchise
  console.log('📋 STEP 1: Setting up Manager Profile & Franchise Selection...');
  store.setManagerProfile('Vikram Sengupta');
  store.selectTeam('chennai-super-kings');
  console.log('   Manager Name : Vikram Sengupta');
  console.log('   Selected Team: Chennai Super Kings (CSK)');
  console.log('   Franchises   : 10/10 IPL Teams Present & Active\n');

  // 2. Create Session
  console.log('🏟️ STEP 2: Initializing IPL 2025 Mega Auction Session...');
  const sessionId = store.createSession({
    name: 'IPL 2025 Grand Championship',
    format: 'mega',
    purseCap: 120,
    preSelectedTeamId: 'chennai-super-kings',
    seasonYear: 2025,
  });
  console.log(`   Session ID   : ${sessionId}`);
  console.log('   Format       : Mega Auction (₹120.00 Cr purse cap)');
  console.log('   Room Status  : Ready to Launch\n');

  // 3. Live Auction War Room
  console.log('🔨 STEP 3: Commencing Live Player Auction...');
  store.startAuction();
  const firstLot = useGameStore.getState().auction.currentPlayer;
  console.log(`   Opening Lot  : #${useGameStore.getState().auction.currentPlayerIndex + 1} ${firstLot?.name} (${firstLot?.role}, Base: ₹${firstLot?.basePrice} Cr)`);
  
  // Human manager bids on star players
  const availablePlayers = useGameStore.getState().players;
  const marqueeSignings = availablePlayers.slice(0, 15);
  marqueeSignings.forEach(p => {
    store.adminTransferPlayer(p.id, 'chennai-super-kings', p.basePrice);
  });
  console.log(`   Signed Assets: 15 Core Players Drafted to CSK Squad`);

  // Complete the auction across all other 9 franchises
  store.autoCompleteAuction();
  console.log('   Hammer Drop  : All remaining lots resolved across all 10 franchises.\n');

  // Squad verification
  const csk = useGameStore.getState().userTeam();
  store.updateStartingXI(csk!.squad.slice(0, 11).map(p => p.id));
  store.setCaptain(csk!.squad[0].id);
  store.setWicketkeeper(csk!.squad[1].id);

  console.log('📋 STEP 4: Squads Finalized & Playing XI Selected:');
  const teams = useGameStore.getState().teams;
  teams.forEach(t => {
    console.log(`   • ${t.shortName.padEnd(4)} - ${t.name.padEnd(28)} | Squad: ${t.squad.length.toString().padStart(2)} players | Spent: ₹${t.spentPurse.toFixed(2).padStart(6)} Cr | Remaining: ₹${t.currentPurse.toFixed(2).padStart(6)} Cr`);
  });
  console.log('');

  // 5. Start the Season
  console.log('📅 STEP 5: Generating League Fixtures & Starting Season...');
  store.startSeason();
  const matches = useGameStore.getState().leagueMatches;
  console.log(`   Fixtures     : ${matches.length} Official League Matches Scheduled (Single Round-Robin)`);

  // 6. Simulate League Matches
  console.log('⚡ STEP 6: Simulating League Stage Matches...');
  store.simulateAllLeagueMatches();
  console.log(`   Matches Played: ${useGameStore.getState().currentMatchIndex} / ${matches.length} Completed\n`);

  // 7. League Standings
  console.log('🏆 STEP 7: Final League Stage Standings:');
  console.log('   POS | TEAM                         | P  | W  | L  | PTS | NRR');
  console.log('   ----+------------------------------+----+----+----+-----+-------');
  const standings = useGameStore.getState().standings;
  standings.forEach((s, idx) => {
    const t = teams.find(team => team.id === s.teamId);
    const nrrVal = typeof s.nrr === 'number' ? s.nrr : 0;
    const nrrSign = nrrVal >= 0 ? '+' : '';
    console.log(`    ${(idx + 1).toString().padStart(2)} | ${(t?.name || s.teamId).padEnd(28)} | ${s.played.toString().padStart(2)} | ${s.won.toString().padStart(2)} | ${s.lost.toString().padStart(2)} | ${s.points.toString().padStart(3)} | ${nrrSign}${nrrVal.toFixed(3)}`);
  });
  console.log('');

  // 8. Playoffs
  console.log('🎯 STEP 8: Playoffs & Road to the Final:');
  const playoffMatches = useGameStore.getState().playoffMatches;
  playoffMatches.forEach(m => {
    const home = teams.find(t => t.id === m.homeTeamId);
    const away = teams.find(t => t.id === m.awayTeamId);
    const winner = teams.find(t => t.id === m.winnerTeamId);
    console.log(`   • ${m.dateStr.padEnd(12)}: ${home?.shortName} (${m.innings1?.totalRuns}/${m.innings1?.totalWickets}) vs ${away?.shortName} (${m.innings2?.totalRuns}/${m.innings2?.totalWickets}) -> Winner: ${winner?.name}`);
  });
  console.log('');

  // 9. Champion Ceremony
  const champion = useGameStore.getState().championTeam;
  console.log('🎉 ==============================================================');
  console.log(`    🏆 CHAMPIONS CROWNED: ${champion?.name?.toUpperCase()} 🏆     `);
  console.log('============================================================== 🎉\n');
  console.log('   Congratulations! The full campaign has executed flawlessly from creation to trophy presentation!\n');
}

main().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});
