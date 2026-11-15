export type FeedbackCategory = 'bug' | 'feature' | 'gameplay' | 'general';
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved';

export interface FeedbackContext {
  userTeamId?: string;
  userTeamName?: string;
  gameMode?: string;
  currentScreen?: string;
  dataset?: string;
  auctionPhase?: string;
}

export interface FeedbackItem {
  id: string;
  rating: number; // 1 to 5 stars
  category: FeedbackCategory;
  title?: string;
  message: string;
  userName?: string;
  userEmail?: string;
  timestamp: number;
  status: FeedbackStatus;
  context?: FeedbackContext;
}
