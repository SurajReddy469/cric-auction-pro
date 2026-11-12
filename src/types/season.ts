export interface BattingScorecardEntry {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal: string; // e.g., "c Sharma b Khan" or "not out"
  isNotOut: boolean;
}

export interface BowlingScorecardEntry {
  playerId: string;
  playerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

export interface InningsScorecard {
  teamId: string;
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  extras: number;
  batting: BattingScorecardEntry[];
  bowling: BowlingScorecardEntry[];
  fallOfWickets: string[];
}

export interface Match {
  id: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  dateStr: string;
  isPlayed: boolean;
  innings1?: InningsScorecard;
  innings2?: InningsScorecard;
  winnerTeamId?: string;
  margin?: string; // e.g. "Won by 14 runs" or "Won by 6 wickets"
  playerOfTheMatch?: {
    playerId: string;
    playerName: string;
    teamId: string;
    performance: string;
  };
  isPlayoff?: boolean;
  playoffStage?: 'Qualifier 1' | 'Eliminator' | 'Qualifier 2' | 'Final';
}

export type PlayoffStage = 'not_started' | 'qualifier_1' | 'eliminator' | 'qualifier_2' | 'final' | 'completed';

export interface LeagueStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  nrr: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  form: ('W' | 'L' | 'T')[];
}

export interface SeasonAwards {
  orangeCap: {
    playerId: string;
    playerName: string;
    teamName: string;
    runs: number;
    strikeRate: number;
  };
  purpleCap: {
    playerId: string;
    playerName: string;
    teamName: string;
    wickets: number;
    economy: number;
  };
  mvp: {
    playerId: string;
    playerName: string;
    teamName: string;
    points: number;
  };
  emergingPlayer: {
    playerId: string;
    playerName: string;
    teamName: string;
    age: number;
    performance: string;
  };
}
