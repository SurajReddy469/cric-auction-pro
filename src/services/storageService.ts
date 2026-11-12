import { ManagerProfile, Achievement } from '../types/career';
import { Team } from '../types/team';
import { Player } from '../types/player';
import { AuctionState } from '../types/auction';
import { Match, LeagueStanding, PlayoffStage } from '../types/season';

const PROFILE_KEY = 'cric_auction_manager_profile';
const ACHIEVEMENTS_KEY = 'cric_auction_achievements';
const SETTINGS_KEY = 'cric_auction_settings';
const CAREER_KEY = 'cric_auction_career_data';
const CAMPAIGN_KEY = 'cric_auction_active_campaign';

export interface GameSettings {
  timerSpeed: 'slow' | 'standard' | 'fast';
  soundEnabled: boolean;
  aiAggression: 'balanced' | 'ruthless' | 'chill';
  startingPurse: number;
  theme: 'day' | 'night';
  dataset: 'real' | 'fictional';
}

export const DEFAULT_SETTINGS: GameSettings = {
  timerSpeed: 'standard',
  soundEnabled: true,
  aiAggression: 'balanced',
  startingPurse: 120.0,
  theme: 'day',
  dataset: 'real',
};

export const DEFAULT_PROFILE: ManagerProfile = {
  name: 'Vikram Sengupta',
  avatar: 'manager-1',
  reputation: 85,
  totalSeasons: 1,
  trophies: 0,
  matchesPlayed: 0,
  matchesWon: 0,
  auctionWins: 0,
  totalSpent: 0,
  winRate: 0,
  scoutTokens: 6,
};

export interface SavedCampaign {
  userTeamId: string;
  teams: Team[];
  players: Player[];
  auction: AuctionState;
  leagueMatches: Match[];
  currentMatchIndex: number;
  standings: LeagueStanding[];
  playoffMatches: Match[];
  playoffStage: PlayoffStage;
  currentScreen?: string;
  timestamp: number;
}

export class StorageService {
  static loadProfile(): ManagerProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load profile from localStorage', e);
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: ManagerProfile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  }

  static loadAchievements(initialAchievements: Achievement[]): Achievement[] {
    try {
      const data = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (data) {
        const stored: Achievement[] = JSON.parse(data);
        return initialAchievements.map(init => {
          const found = stored.find(s => s.id === init.id);
          return found ? { ...init, unlocked: found.unlocked, unlockedAt: found.unlockedAt } : init;
        });
      }
    } catch (e) {
      console.warn('Failed to load achievements', e);
    }
    return initialAchievements;
  }

  static saveAchievements(achievements: Achievement[]) {
    try {
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    } catch (e) {
      console.warn('Failed to save achievements', e);
    }
  }

  static loadSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  // Active Campaign Persistence (Fixes Issue 11)
  static loadCampaign(): SavedCampaign | null {
    try {
      const data = localStorage.getItem(CAMPAIGN_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.teams && parsed.players && parsed.auction) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load campaign state from localStorage', e);
    }
    return null;
  }

  static saveCampaign(campaign: SavedCampaign) {
    try {
      localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign));
    } catch (e) {
      console.warn('Failed to save campaign state', e);
    }
  }

  static clearCampaign() {
    try {
      localStorage.removeItem(CAMPAIGN_KEY);
    } catch (e) {
      console.warn('Failed to clear campaign state', e);
    }
  }

  static clearAllData() {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(CAREER_KEY);
    localStorage.removeItem(CAMPAIGN_KEY);
  }
}
