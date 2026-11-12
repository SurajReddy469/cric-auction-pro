import { Player } from '../types/player';
import { Team } from '../types/team';

export interface ScoutReport {
  player: Player;
  revealedPotential: number;
  potentialCategory: 'Generational Superstar' | 'Elite International' | 'Solid Franchise Regular' | 'Role Specialist' | 'Limited Ceiling';
  injuryRiskDetails: string;
  expectedBidRange: { min: number; max: number };
  scoutVerdict: string;
  keyStrengths: string[];
  watchOuts: string[];
}

export function generateScoutReport(player: Player): ScoutReport {
  let potentialCategory: ScoutReport['potentialCategory'] = 'Solid Franchise Regular';
  if (player.potential >= 94) potentialCategory = 'Generational Superstar';
  else if (player.potential >= 89) potentialCategory = 'Elite International';
  else if (player.potential >= 83) potentialCategory = 'Solid Franchise Regular';
  else if (player.potential >= 78) potentialCategory = 'Role Specialist';
  else potentialCategory = 'Limited Ceiling';

  let injuryRiskDetails = 'Pristine fitness record. High endurance and durability through congested schedules.';
  if (player.injuryRisk === 'Medium') {
    injuryRiskDetails = 'Occasional minor muscle tightness. Manage workload in back-to-back night games.';
  } else if (player.injuryRisk === 'High') {
    injuryRiskDetails = 'History of stress fractures or calf issues. High risk in high-intensity death overs.';
  }

  const minExpected = Number(Math.max(player.basePrice, player.estimatedValue * 0.75).toFixed(1));
  const maxExpected = Number((player.estimatedValue * 1.35).toFixed(1));

  let scoutVerdict = 'Dependable squad option with clear role clarity.';
  if (player.potential >= 93 && player.age <= 23) {
    scoutVerdict = '🌟 MUST-BUY WONDERKID: Future cornerstone of your franchise. Worth pushing budget limits.';
  } else if (player.tier === 'Marquee') {
    scoutVerdict = '👑 MARQUEE MATCHWINNER: Guaranteed crowd-puller and clutch performer in pressure playoffs.';
  } else if (player.basePrice <= 0.5 && player.potential >= 88) {
    scoutVerdict = '💎 MONEYBALL STEAL: Severely undervalued by the broader market. Perfect budget building block.';
  } else if (player.injuryRisk === 'High') {
    scoutVerdict = '⚠️ HIGH RISK / HIGH REWARD: Prodigious raw talent, but have a trusted backup ready.';
  }

  return {
    player,
    revealedPotential: player.potential,
    potentialCategory,
    injuryRiskDetails,
    expectedBidRange: { min: minExpected, max: maxExpected },
    scoutVerdict,
    keyStrengths: [
      `${player.role} with ${player.power >= 90 ? 'Tremendous Power' : 'Superb Technical Timing'}`,
      `${player.form} form coming into this auction cycle`,
      ...player.traits,
    ],
    watchOuts: [
      player.age >= 33 ? 'Age decline watch over multi-season career' : 'Still honing temperament under intense crowd pressure',
      player.isOverseas ? 'Occupies 1 of only 4 available Overseas Playing XI slots' : 'Domestic asset frees up foreign marquee balance'
    ]
  };
}

export interface ChemistryBreakdown {
  score: number; // 0 - 100
  tier: 'Elite (90-100)' | 'Strong (80-89)' | 'Average (65-79)' | 'Imbalanced (<65)';
  synergies: { name: string; bonus: string; active: boolean }[];
  compositionWarnings: string[];
}

export function calculateTeamChemistry(team: Team): ChemistryBreakdown {
  const xi = team.startingXI.length === 11
    ? team.startingXI.map(id => team.squad.find(p => p.id === id)!).filter(Boolean)
    : team.squad.slice(0, 11);

  if (xi.length < 11) {
    return {
      score: 50,
      tier: 'Imbalanced (<65)',
      synergies: [],
      compositionWarnings: ['Starting XI has fewer than 11 players selected.']
    };
  }

  let score = 70; // baseline
  const warnings: string[] = [];

  // 1. Wicketkeeper check
  const keepers = xi.filter(p => p.role === 'Wicketkeeper').length;
  if (keepers === 1) score += 8;
  else if (keepers === 0) {
    score -= 18;
    warnings.push('No specialist Wicketkeeper selected in Starting XI!');
  } else if (keepers > 2) {
    score -= 6;
    warnings.push('Excess wicketkeepers in XI reducing bowling utility.');
  }

  // 2. Bowling Options check (Need at least 5 bowling options)
  const bowlingOptions = xi.filter(p => p.role === 'Fast Bowler' || p.role === 'Spin Bowler' || p.role === 'All-rounder').length;
  if (bowlingOptions >= 6) score += 8;
  else if (bowlingOptions === 5) score += 5;
  else {
    score -= 15;
    warnings.push(`Only ${bowlingOptions} bowling options in XI (ICC minimum recommended is 5-6).`);
  }

  // 3. Overseas Slot Rule (Max 4 overseas in Playing XI)
  const overseasInXI = xi.filter(p => p.isOverseas).length;
  if (overseasInXI > 4) {
    score -= 30;
    warnings.push(`Illegal Lineup: ${overseasInXI} Overseas players in XI (Maximum 4 allowed by League Rules!).`);
  } else if (overseasInXI === 4) {
    score += 5;
  }

  // 4. Batting Handedness Synergy (Left & Right mix)
  const leftHanders = xi.filter(p => p.battingHand === 'Left Hand').length;
  const rightHanders = xi.filter(p => p.battingHand === 'Right Hand').length;
  const hasLeftRightSynergy = leftHanders >= 3 && rightHanders >= 3;
  if (hasLeftRightSynergy) score += 6;

  // 5. Pace & Spin Balance Synergy
  const pacers = xi.filter(p => p.role === 'Fast Bowler' || (p.role === 'All-rounder' && p.bowlingStyle.includes('Fast'))).length;
  const spinners = xi.filter(p => p.role === 'Spin Bowler' || (p.role === 'All-rounder' && (p.bowlingStyle.includes('break') || p.bowlingStyle.includes('Orthodox')))).length;
  const hasBowlingSynergy = pacers >= 2 && spinners >= 2;
  if (hasBowlingSynergy) score += 6;

  // 6. Leadership & Experience Synergy
  const veterans = xi.filter(p => p.age >= 29).length;
  const youngsters = xi.filter(p => p.age <= 23).length;
  const hasYouthVeteranBalance = veterans >= 2 && youngsters >= 2;
  if (hasYouthVeteranBalance) score += 4;

  score = Math.min(100, Math.max(35, score));

  let tier: ChemistryBreakdown['tier'] = 'Average (65-79)';
  if (score >= 90) tier = 'Elite (90-100)';
  else if (score >= 80) tier = 'Strong (80-89)';
  else if (score < 65) tier = 'Imbalanced (<65)';

  const synergies = [
    {
      name: 'Left-Right Handed Duo',
      bonus: '+8% Powerplay Boundary Exploitation against field restrictions',
      active: hasLeftRightSynergy
    },
    {
      name: 'Pace & Spin Two-Pronged Attack',
      bonus: '+10% Wicket probability across Powerplay and Middle Overs',
      active: hasBowlingSynergy
    },
    {
      name: 'Veteran Wisdom + Youth Fearlessness',
      bonus: '+12% Clutch rating in tense final 3 overs chases',
      active: hasYouthVeteranBalance
    },
    {
      name: 'Wicketkeeper Field Marshal',
      bonus: '+5% Fielding efficiency and sharp DRS stumping reviews',
      active: keepers === 1
    }
  ];

  return {
    score,
    tier,
    synergies,
    compositionWarnings: warnings
  };
}
