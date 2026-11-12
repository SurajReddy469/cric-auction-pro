import { Player } from '../types/player';
import { Team } from '../types/team';

export function getNextBidIncrement(currentBid: number): number {
  if (currentBid < 5.0) {
    return 0.25;
  } else if (currentBid < 10.0) {
    return 0.50;
  } else if (currentBid < 20.0) {
    return 1.00;
  } else {
    return 2.00;
  }
}

export function getNextBidAmount(currentBid: number, basePrice: number): number {
  if (currentBid <= 0) {
    return basePrice;
  }
  const inc = getNextBidIncrement(currentBid);
  return Number((currentBid + inc).toFixed(2));
}

export interface AIEvaluationResult {
  maxWillingToPay: number;
  needScore: number;
  reason: string;
}

export function evaluatePlayerForTeam(
  team: Team,
  player: Player,
  playersRemainingInPool: Player[],
  aiAggression: 'chill' | 'balanced' | 'ruthless' = 'balanced'
): AIEvaluationResult {
  const squad = team.squad;
  const currentCount = squad.length;
  const maxSquad = 25;
  const minSquad = 18;

  // Rule: Max 25 players
  if (currentCount >= maxSquad) {
    return { maxWillingToPay: 0, needScore: 0, reason: 'Squad full (25 players reached)' };
  }

  // Rule: Max 8 Overseas players
  const overseasCount = squad.filter(p => p.isOverseas).length;
  if (player.isOverseas && overseasCount >= 8) {
    return { maxWillingToPay: 0, needScore: 0, reason: 'Overseas quota full (8/8)' };
  }

  // AI Aggression tuning (Issue 2)
  let reservePerSlot = 0.20;
  let aggressionMultiplier = 1.0;
  if (aiAggression === 'chill') {
    reservePerSlot = 0.30;
    aggressionMultiplier = 0.85;
  } else if (aiAggression === 'ruthless') {
    reservePerSlot = 0.15;
    aggressionMultiplier = 1.20;
  }

  // Budget Safety: Reserve funds for unfilled slots up to minimum squad (18)
  const remainingNeededForMin = Math.max(0, minSquad - (currentCount + 1));
  const reservedBudget = remainingNeededForMin * reservePerSlot;
  const maxSafeBid = Number(Math.max(0, team.currentPurse - reservedBudget).toFixed(2));

  // If safe purse cannot even afford base price, team cannot bid (Issue 3)
  if (maxSafeBid < player.basePrice) {
    return { maxWillingToPay: 0, needScore: 0, reason: 'Insufficient funds for minimum squad reserve' };
  }

  // Analyze Positional Needs
  const keepers = squad.filter(p => p.role === 'Wicketkeeper').length;
  const batters = squad.filter(p => p.role === 'Batter').length;
  const allrounders = squad.filter(p => p.role === 'All-rounder').length;

  let needMultiplier = 1.0;
  let needReason = 'General squad depth';

  switch (player.role) {
    case 'Wicketkeeper':
      if (keepers === 0) {
        needMultiplier = 1.6;
        needReason = 'CRITICAL: No Wicketkeeper in squad';
      } else if (keepers === 1) {
        needMultiplier = 1.15;
        needReason = 'Backup wicketkeeper needed';
      } else if (keepers >= 3) {
        needMultiplier = 0.4;
        needReason = 'Keeper quota satisfied';
      }
      break;

    case 'Batter':
      if (batters < 4) {
        needMultiplier = 1.35;
        needReason = 'Top-order batting deficiency';
      } else if (batters < 7) {
        needMultiplier = 1.05;
      } else if (batters >= 8) {
        needMultiplier = 0.5;
      }
      break;

    case 'All-rounder':
      if (allrounders < 2) {
        needMultiplier = 1.3;
        needReason = 'Need team balance and flexibility';
      } else if (allrounders < 5) {
        needMultiplier = 1.05;
      } else if (allrounders >= 6) {
        needMultiplier = 0.6;
      }
      break;

    case 'Fast Bowler': {
      const pacers = squad.filter(p => p.role === 'Fast Bowler').length;
      if (pacers < 3) {
        needMultiplier = 1.35;
        needReason = 'Pace bowling stocks depleted';
      } else if (pacers < 5) {
        needMultiplier = 1.05;
      } else if (pacers >= 6) {
        needMultiplier = 0.55;
      }
      break;
    }

    case 'Spin Bowler': {
      const spinners = squad.filter(p => p.role === 'Spin Bowler').length;
      if (spinners < 2) {
        needMultiplier = 1.35;
        needReason = 'Need specialist spin options';
      } else if (spinners < 4) {
        needMultiplier = 1.05;
      } else if (spinners >= 5) {
        needMultiplier = 0.55;
      }
      break;
    }
  }

  // Base valuation from player attributes
  let valueScore = player.estimatedValue;

  // Form adjustment
  if (player.form === 'Blazing') valueScore *= 1.15;
  else if (player.form === 'Hot') valueScore *= 1.08;
  else if (player.form === 'Cold') valueScore *= 0.88;
  else if (player.form === 'Ice Cold') valueScore *= 0.75;

  // AI Personality Multiplier
  let personalityMultiplier = 1.0;
  switch (team.personality) {
    case 'Aggressive Manager':
      personalityMultiplier = 1.25;
      if (player.overallRating >= 88) personalityMultiplier = 1.35;
      break;

    case 'Budget Manager':
      personalityMultiplier = 0.85;
      if (player.basePrice <= 0.5) personalityMultiplier = 1.15; // Loves cheap bargains
      break;

    case 'Star Hunter':
      if (player.tier === 'Marquee' || player.overallRating >= 90) {
        personalityMultiplier = 1.4;
      } else {
        personalityMultiplier = 0.85;
      }
      break;

    case 'Bowling Specialist':
      if (player.role === 'Fast Bowler' || player.role === 'Spin Bowler') {
        personalityMultiplier = 1.3;
      } else {
        personalityMultiplier = 0.9;
      }
      break;

    case 'Youth Specialist':
      if (player.age <= 23 && (player.potential >= 90 || player.tier === 'Emerging' || player.tier === 'Uncapped')) {
        personalityMultiplier = 1.45;
      } else if (player.age >= 32) {
        personalityMultiplier = 0.8;
      }
      break;

    case 'Analytics Guru': {
      const efficiency = (player.power + player.timing + player.clutch) / 3;
      personalityMultiplier = efficiency >= 90 ? 1.25 : 0.95;
      break;
    }

    case 'Balanced Manager':
    default:
      personalityMultiplier = 1.0;
      break;
  }

  // Desperation / Scarcity Multiplier
  const remainingInRole = playersRemainingInPool.filter(p => p.role === player.role).length;
  if (remainingInRole <= 2 && needMultiplier > 1.2) {
    needMultiplier *= 1.3;
  }

  // Calculate raw valuation
  let finalValuation = valueScore * needMultiplier * personalityMultiplier * aggressionMultiplier;

  // Cap at safe purse budget
  finalValuation = Math.min(finalValuation, maxSafeBid);

  // Reasonable percentage cap of total purse per player
  const maxPursePercent = (team.personality === 'Star Hunter' || team.personality === 'Aggressive Manager') ? 0.25 : 0.18;
  const purseCap = team.startingPurse * maxPursePercent * (aiAggression === 'ruthless' ? 1.15 : 1.0);
  finalValuation = Math.min(finalValuation, purseCap);

  finalValuation = Number(finalValuation.toFixed(2));

  // If final valuation is below base price, the team simply won't bid (Issue 3 fix: do NOT force to basePrice)
  if (finalValuation < player.basePrice) {
    return {
      maxWillingToPay: 0,
      needScore: needMultiplier,
      reason: `Valuation (₹${finalValuation} Cr) is below base price (₹${player.basePrice} Cr)`
    };
  }

  return {
    maxWillingToPay: finalValuation,
    needScore: needMultiplier,
    reason: needReason
  };
}

export function getAIDecision(
  team: Team,
  player: Player,
  currentBid: number,
  highestBidderId: string | null,
  playersRemainingInPool: Player[],
  aiAggression: 'chill' | 'balanced' | 'ruthless' = 'balanced'
): { shouldBid: boolean; nextBidAmount: number; delayMs: number; reason: string } {
  // If team is already the highest bidder, do not outbid themselves
  if (highestBidderId === team.id) {
    return { shouldBid: false, nextBidAmount: 0, delayMs: 0, reason: 'Already highest bidder' };
  }

  // Check squad and overseas limits strictly
  if (team.squad.length >= 25) {
    return { shouldBid: false, nextBidAmount: 0, delayMs: 0, reason: 'Squad full (25 players reached)' };
  }
  const overseasCount = team.squad.filter(p => p.isOverseas).length;
  if (player.isOverseas && overseasCount >= 8) {
    return { shouldBid: false, nextBidAmount: 0, delayMs: 0, reason: 'Overseas quota full (8/8)' };
  }

  const nextBid = getNextBidAmount(currentBid, player.basePrice);
  const evaluation = evaluatePlayerForTeam(team, player, playersRemainingInPool, aiAggression);

  if (nextBid <= evaluation.maxWillingToPay && nextBid <= team.currentPurse) {
    // Generate realistic human-like deliberation delay
    let minDelay = 1100;
    let maxDelay = 2400;

    if (team.personality === 'Aggressive Manager') {
      minDelay = 800;
      maxDelay = 1600;
    } else if (team.personality === 'Budget Manager') {
      minDelay = 1600;
      maxDelay = 3000;
    }

    if (aiAggression === 'ruthless') {
      minDelay = Math.floor(minDelay * 0.75);
      maxDelay = Math.floor(maxDelay * 0.75);
    }

    const delayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    return {
      shouldBid: true,
      nextBidAmount: nextBid,
      delayMs,
      reason: `Willing to pay up to ₹${evaluation.maxWillingToPay} Cr (${evaluation.reason})`
    };
  }

  return {
    shouldBid: false,
    nextBidAmount: 0,
    delayMs: 0,
    reason: nextBid > team.currentPurse 
      ? `Cannot afford next bid ₹${nextBid} Cr (Purse: ₹${team.currentPurse} Cr)`
      : `Price ₹${nextBid} Cr exceeds valuation of ₹${evaluation.maxWillingToPay} Cr`
  };
}
