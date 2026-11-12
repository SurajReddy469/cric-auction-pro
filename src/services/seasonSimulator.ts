import { Player } from '../types/player';
import { Team } from '../types/team';
import { 
  Match, 
  InningsScorecard, 
  BattingScorecardEntry, 
  BowlingScorecardEntry, 
  LeagueStanding, 
  SeasonAwards 
} from '../types/season';

export function generateLeagueSchedule(teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchCounter = 1;
  const n = teams.length;

  // Double round robin (Home & Away)
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const home = round === 0 ? teams[i] : teams[j];
        const away = round === 0 ? teams[j] : teams[i];

        matches.push({
          id: `match-${matchCounter}`,
          matchNumber: matchCounter,
          homeTeamId: home.id,
          awayTeamId: away.id,
          venue: home.stadium,
          dateStr: `Matchday ${matchCounter}`,
          isPlayed: false,
        });
        matchCounter++;
      }
    }
  }

  // Shuffle slightly so matches aren't completely predictable sequential
  return matches.sort(() => Math.random() - 0.5).map((m, idx) => ({
    ...m,
    matchNumber: idx + 1,
    dateStr: `Matchday ${idx + 1}`
  }));
}

interface ActiveBatterState {
  player: Player;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dismissal: string;
  isNotOut: boolean;
  hasBatted: boolean;
}

export function simulateInnings(
  battingTeam: Team,
  bowlingTeam: Team,
  target?: number
): InningsScorecard {
  const batters: Player[] = battingTeam.startingXI.length === 11
    ? battingTeam.startingXI.map(id => battingTeam.squad.find(p => p.id === id)!).filter(Boolean)
    : battingTeam.squad.slice(0, 11);

  const bowlers: Player[] = bowlingTeam.startingXI.length === 11
    ? bowlingTeam.startingXI.map(id => bowlingTeam.squad.find(p => p.id === id)!).filter(Boolean)
    : bowlingTeam.squad.slice(0, 11);

  // Fallback if squad is smaller
  const activeBatters = batters.length > 0 ? batters : battingTeam.squad.slice(0, 11);
  const activeBowlers = bowlers.filter(p => p.role !== 'Wicketkeeper').slice(0, 5);

  let totalRuns = 0;
  let extras = 0;
  let wickets = 0;
  let legalBallsBowled = 0;
  const maxOvers = 20;

  const bowlingEntries: Map<string, BowlingScorecardEntry> = new Map();

  // Initialize bowlers
  activeBowlers.forEach(b => {
    bowlingEntries.set(b.id, {
      playerId: b.id,
      playerName: b.name,
      overs: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      economy: 0,
      dots: 0,
    });
  });

  // Track each batter individually (Fixes Issue 7)
  const batterTrackers: ActiveBatterState[] = activeBatters.map(p => ({
    player: p,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    dismissal: 'not out',
    isNotOut: true,
    hasBatted: false,
  }));

  let strikerIdx = 0;
  let nonStrikerIdx = 1;
  let nextBatterIdx = 2;

  if (batterTrackers[strikerIdx]) batterTrackers[strikerIdx].hasBatted = true;
  if (batterTrackers[nonStrikerIdx]) batterTrackers[nonStrikerIdx].hasBatted = true;

  const fallOfWickets: string[] = [];

  // Over by over simulation
  for (let over = 0; over < maxOvers; over++) {
    if (wickets >= 10) break;
    if (target && totalRuns >= target) break;

    const currentBowler = activeBowlers[over % activeBowlers.length] || activeBowlers[0];
    const bowlerEntry = bowlingEntries.get(currentBowler.id);
    let overRuns = 0;

    for (let ball = 0; ball < 6; ball++) {
      if (wickets >= 10) break;
      if (target && totalRuns >= target) break;

      legalBallsBowled++;
      const currentStriker = batterTrackers[strikerIdx];
      if (!currentStriker) break;

      currentStriker.balls++;

      // Batting strength vs Bowling strength calculation
      const batRating = currentStriker.player.battingRating;
      const bowlRating = currentBowler ? currentBowler.bowlingRating : 75;
      const delta = (batRating - bowlRating) / 100;

      // Normalized Event Probabilities (Fixes Issue 8: dotChance used, sums to 1.0)
      const rawWicket = Math.max(0.025, 0.055 - delta * 0.035);
      const rawSix = Math.max(0.035, 0.085 + delta * 0.045 + (currentStriker.player.power / 450));
      const rawFour = Math.max(0.075, 0.140 + delta * 0.045 + (currentStriker.player.timing / 400));
      const rawTwo = 0.090;
      const rawSingle = 0.350;
      const rawDot = Math.max(0.180, 0.280 - delta * 0.08);

      const totalProb = rawWicket + rawSix + rawFour + rawTwo + rawSingle + rawDot;
      const pWicket = rawWicket / totalProb;
      const pSix = rawSix / totalProb;
      const pFour = rawFour / totalProb;
      const pTwo = rawTwo / totalProb;
      const pSingle = rawSingle / totalProb;

      const roll = Math.random();

      // Check for realistic extras (wide/no-ball ~4% of balls)
      if (Math.random() < 0.04) {
        extras += 1;
        totalRuns += 1;
        overRuns += 1;
        if (bowlerEntry) bowlerEntry.runs += 1;
      }

      if (roll < pWicket) {
        // Wicket fallen
        wickets++;
        const dismissal = Math.random() > 0.45 
          ? `c & b ${currentBowler.name}` 
          : `b ${currentBowler.name}`;

        currentStriker.dismissal = dismissal;
        currentStriker.isNotOut = false;

        const ovStr = `${Math.floor(legalBallsBowled / 6)}.${legalBallsBowled % 6}`;
        fallOfWickets.push(`${totalRuns}/${wickets} (${currentStriker.player.name}, ${ovStr} ov)`);

        if (bowlerEntry) {
          bowlerEntry.wickets++;
        }

        // New batter walks in
        if (nextBatterIdx < batterTrackers.length) {
          strikerIdx = nextBatterIdx++;
          batterTrackers[strikerIdx].hasBatted = true;
        }
      } else if (roll < pWicket + pSix) {
        totalRuns += 6;
        overRuns += 6;
        currentStriker.runs += 6;
        currentStriker.sixes++;
        if (bowlerEntry) bowlerEntry.runs += 6;
      } else if (roll < pWicket + pSix + pFour) {
        totalRuns += 4;
        overRuns += 4;
        currentStriker.runs += 4;
        currentStriker.fours++;
        if (bowlerEntry) bowlerEntry.runs += 4;
      } else if (roll < pWicket + pSix + pFour + pTwo) {
        totalRuns += 2;
        overRuns += 2;
        currentStriker.runs += 2;
        if (bowlerEntry) bowlerEntry.runs += 2;
      } else if (roll < pWicket + pSix + pFour + pTwo + pSingle) {
        totalRuns += 1;
        overRuns += 1;
        currentStriker.runs += 1;
        if (bowlerEntry) bowlerEntry.runs += 1;

        // Odd run: swap striker and non-striker
        const temp = strikerIdx;
        strikerIdx = nonStrikerIdx;
        nonStrikerIdx = temp;
      } else {
        // Dot ball
        if (bowlerEntry) bowlerEntry.dots++;
      }
    }

    if (bowlerEntry) {
      bowlerEntry.overs += 1;
      if (overRuns === 0) bowlerEntry.maidens++;
      bowlerEntry.economy = Number((bowlerEntry.runs / bowlerEntry.overs).toFixed(2));
    }

    // End of over: swap striker and non-striker
    const temp = strikerIdx;
    strikerIdx = nonStrikerIdx;
    nonStrikerIdx = temp;
  }

  // Compile batting entries for all players who came to the crease (Fixes Issue 7)
  const battingEntries: BattingScorecardEntry[] = batterTrackers
    .filter(b => b.hasBatted)
    .map(b => ({
      playerId: b.player.id,
      playerName: b.player.name,
      runs: b.runs,
      balls: b.balls,
      fours: b.fours,
      sixes: b.sixes,
      strikeRate: b.balls > 0 ? Number(((b.runs / b.balls) * 100).toFixed(1)) : 0,
      dismissal: b.dismissal,
      isNotOut: b.isNotOut,
    }));

  const completedOvers = Number((Math.floor(legalBallsBowled / 6) + (legalBallsBowled % 6) / 10).toFixed(1));

  return {
    teamId: battingTeam.id,
    teamName: battingTeam.name,
    totalRuns,
    totalWickets: wickets,
    totalOvers: completedOvers,
    extras,
    batting: battingEntries,
    bowling: Array.from(bowlingEntries.values()),
    fallOfWickets,
  };
}

export function simulateSingleMatch(
  match: Match,
  teams: Team[]
): Match {
  const homeTeam = teams.find(t => t.id === match.homeTeamId)!;
  const awayTeam = teams.find(t => t.id === match.awayTeamId)!;

  // Toss: Coin flip decides who bats first
  const homeBatFirst = Math.random() > 0.5;
  const firstBattingTeam = homeBatFirst ? homeTeam : awayTeam;
  const secondBattingTeam = homeBatFirst ? awayTeam : homeTeam;

  // Innings 1
  const innings1 = simulateInnings(firstBattingTeam, secondBattingTeam);
  const target = innings1.totalRuns + 1;

  // Innings 2
  const innings2 = simulateInnings(secondBattingTeam, firstBattingTeam, target);

  let winnerId: string;
  let margin: string;

  if (innings2.totalRuns >= target) {
    winnerId = secondBattingTeam.id;
    const remainingWickets = Math.max(1, 10 - innings2.totalWickets);
    margin = `won by ${remainingWickets} ${remainingWickets === 1 ? 'wicket' : 'wickets'}`;
  } else if (innings2.totalRuns < innings1.totalRuns) {
    winnerId = firstBattingTeam.id;
    const runDiff = innings1.totalRuns - innings2.totalRuns;
    margin = `won by ${runDiff} ${runDiff === 1 ? 'run' : 'runs'}`;
  } else {
    // Tie - Super Over simulator
    winnerId = Math.random() > 0.5 ? firstBattingTeam.id : secondBattingTeam.id;
    margin = 'won via Super Over';
  }

  // Player of the match determination
  let potm = {
    playerId: '',
    playerName: '',
    teamId: winnerId,
    performance: '',
    score: -1
  };

  const checkCandidates = (inn: InningsScorecard, isWinner: boolean) => {
    const mult = isWinner ? 1.25 : 1.0;
    inn.batting.forEach(b => {
      const batScore = (b.runs * 1.0 + b.sixes * 2.5 + b.fours * 1.5) * mult;
      if (batScore > potm.score) {
        potm = {
          playerId: b.playerId,
          playerName: b.playerName,
          teamId: inn.teamId,
          performance: `${b.runs} (${b.balls})`,
          score: batScore
        };
      }
    });

    inn.bowling.forEach(bw => {
      const bowlScore = (bw.wickets * 28 + (bw.overs * 6 - bw.runs) * 1.2 + bw.maidens * 15) * mult;
      if (bowlScore > potm.score) {
        potm = {
          playerId: bw.playerId,
          playerName: bw.playerName,
          teamId: inn.teamId === homeTeam.id ? awayTeam.id : homeTeam.id,
          performance: `${bw.wickets}/${bw.runs} (${bw.overs} ov)`,
          score: bowlScore
        };
      }
    });
  };

  checkCandidates(innings1, winnerId === firstBattingTeam.id);
  checkCandidates(innings2, winnerId === secondBattingTeam.id);

  return {
    ...match,
    isPlayed: true,
    innings1,
    innings2,
    winnerTeamId: winnerId,
    margin,
    playerOfTheMatch: {
      playerId: potm.playerId,
      playerName: potm.playerName,
      teamId: potm.teamId,
      performance: potm.performance,
    },
  };
}

// Convert cricket overs notation (e.g. 19.4) to actual decimal overs (19 + 4/6)
function cricketOversToBalls(oversNotation: number): number {
  const fullOvers = Math.floor(oversNotation);
  const balls = Math.round((oversNotation - fullOvers) * 10);
  return fullOvers * 6 + balls;
}

export function calculateStandings(teams: Team[], matches: Match[]): LeagueStanding[] {
  const map = new Map<string, {
    standing: LeagueStanding;
    totalBallsFaced: number;
    totalBallsBowled: number;
  }>();

  teams.forEach(t => {
    map.set(t.id, {
      standing: {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        points: 0,
        nrr: 0.0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        form: [],
      },
      totalBallsFaced: 0,
      totalBallsBowled: 0,
    });
  });

  matches.filter(m => m.isPlayed && !m.isPlayoff).forEach(m => {
    if (!m.innings1 || !m.innings2) return;

    const data1 = map.get(m.innings1.teamId);
    const data2 = map.get(m.innings2.teamId);
    if (!data1 || !data2) return;

    data1.standing.played++;
    data2.standing.played++;

    // Standard Cricket Rule: If all out, count full 20 overs (120 balls) for NRR
    const ballsFaced1 = m.innings1.totalWickets >= 10 ? 120 : cricketOversToBalls(m.innings1.totalOvers);
    const ballsFaced2 = m.innings2.totalWickets >= 10 ? 120 : cricketOversToBalls(m.innings2.totalOvers);

    data1.standing.runsScored += m.innings1.totalRuns;
    data1.totalBallsFaced += ballsFaced1;
    data1.standing.runsConceded += m.innings2.totalRuns;
    data1.totalBallsBowled += ballsFaced2;

    data2.standing.runsScored += m.innings2.totalRuns;
    data2.totalBallsFaced += ballsFaced2;
    data2.standing.runsConceded += m.innings1.totalRuns;
    data2.totalBallsBowled += ballsFaced1;

    if (m.winnerTeamId === data1.standing.teamId) {
      data1.standing.won++;
      data1.standing.points += 2;
      data1.standing.form.push('W');
      data2.standing.lost++;
      data2.standing.form.push('L');
    } else if (m.winnerTeamId === data2.standing.teamId) {
      data2.standing.won++;
      data2.standing.points += 2;
      data2.standing.form.push('W');
      data1.standing.lost++;
      data1.standing.form.push('L');
    } else {
      data1.standing.tied++;
      data1.standing.points += 1;
      data1.standing.form.push('T');
      data2.standing.tied++;
      data2.standing.points += 1;
      data2.standing.form.push('T');
    }
  });

  // Calculate mathematically accurate NRR: (Runs / Decimal Overs) - (Runs / Decimal Overs)
  const standings = Array.from(map.values()).map(({ standing, totalBallsFaced, totalBallsBowled }) => {
    const decimalOversFaced = totalBallsFaced / 6;
    const decimalOversBowled = totalBallsBowled / 6;

    const batRate = decimalOversFaced > 0 ? standing.runsScored / decimalOversFaced : 0;
    const bowlRate = decimalOversBowled > 0 ? standing.runsConceded / decimalOversBowled : 0;
    const nrr = Number((batRate - bowlRate).toFixed(3));

    return {
      ...standing,
      oversFaced: Number((Math.floor(totalBallsFaced / 6) + (totalBallsFaced % 6) / 10).toFixed(1)),
      oversBowled: Number((Math.floor(totalBallsBowled / 6) + (totalBallsBowled % 6) / 10).toFixed(1)),
      nrr,
    };
  });

  // Sort by Points descending, then NRR descending
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.nrr - a.nrr;
  });
}

export function computeSeasonAwards(matches: Match[], teams: Team[]): SeasonAwards {
  const battingRuns = new Map<string, { name: string; team: string; runs: number; balls: number }>();
  const bowlingWickets = new Map<string, { name: string; team: string; wickets: number; runs: number; overs: number }>();

  matches.filter(m => m.isPlayed).forEach(m => {
    [m.innings1, m.innings2].forEach(inn => {
      if (!inn) return;
      const team = teams.find(t => t.id === inn.teamId)?.name || 'Franchise';

      inn.batting.forEach(b => {
        const cur = battingRuns.get(b.playerId) || { name: b.playerName, team, runs: 0, balls: 0 };
        cur.runs += b.runs;
        cur.balls += b.balls;
        battingRuns.set(b.playerId, cur);
      });

      inn.bowling.forEach(bw => {
        const cur = bowlingWickets.get(bw.playerId) || { name: bw.playerName, team, wickets: 0, runs: 0, overs: 0 };
        cur.wickets += bw.wickets;
        cur.runs += bw.runs;
        cur.overs += bw.overs;
        bowlingWickets.set(bw.playerId, cur);
      });
    });
  });

  // Orange Cap (Highest Runs) - Fix Issue 9: credit player's current team from teams roster
  let topBatter = { playerId: '', playerName: 'N/A', teamName: 'N/A', runs: 0, strikeRate: 0 };
  battingRuns.forEach((val, id) => {
    if (val.runs > topBatter.runs) {
      const currentTeam = teams.find(t => t.squad.some(p => p.id === id))?.name || val.team;
      topBatter = {
        playerId: id,
        playerName: val.name,
        teamName: currentTeam,
        runs: val.runs,
        strikeRate: val.balls > 0 ? Number(((val.runs / val.balls) * 100).toFixed(1)) : 0,
      };
    }
  });

  // Purple Cap (Most Wickets) - Fix Issue 9: credit player's current team from teams roster
  let topBowler = { playerId: '', playerName: 'N/A', teamName: 'N/A', wickets: 0, economy: 0 };
  bowlingWickets.forEach((val, id) => {
    if (val.wickets > topBowler.wickets) {
      const currentTeam = teams.find(t => t.squad.some(p => p.id === id))?.name || val.team;
      topBowler = {
        playerId: id,
        playerName: val.name,
        teamName: currentTeam,
        wickets: val.wickets,
        economy: val.overs > 0 ? Number((val.runs / val.overs).toFixed(2)) : 0,
      };
    }
  });

  return {
    orangeCap: topBatter,
    purpleCap: topBowler,
    mvp: {
      playerId: topBatter.runs > topBowler.wickets * 22 ? topBatter.playerId : topBowler.playerId,
      playerName: topBatter.runs > topBowler.wickets * 22 ? topBatter.playerName : topBowler.playerName,
      teamName: topBatter.runs > topBowler.wickets * 22 ? topBatter.teamName : topBowler.teamName,
      points: Math.round(topBatter.runs * 1.2 + topBowler.wickets * 25),
    },
    emergingPlayer: {
      playerId: topBatter.playerId,
      playerName: topBatter.playerName,
      teamName: topBatter.teamName,
      age: 23,
      performance: `${topBatter.runs} runs in tournament`,
    },
  };
}
