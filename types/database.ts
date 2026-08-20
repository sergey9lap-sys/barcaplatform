export type PredictionChoice = "home" | "draw" | "away";
export type TransferPredictionChoice = "yes" | "no";
export type TransferDirection = "incoming" | "outgoing" | "loan";
export type TransferRiskLevel = "low" | "medium" | "high";
export type TransferDecision = "buy" | "sell" | "keep" | "loan" | "return" | "monitor";
export type LaMasiaTeamLevel = "La Masia" | "Barca Atletic" | "U19";
export type LaMasiaStatus = "watch" | "preseason" | "loan_candidate" | "first_team_candidate";
export type StandingZone = "ucl" | "uel" | "uecl" | "relegation" | "neutral";
export type FanDnaType = "risky" | "safe" | "tactical" | "emotional";
export type GeniusRankType = "genius" | "analyst" | "armchair";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  total_points: number;
  is_admin: boolean;
  created_at: string;
  avatar_url?: string | null;
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  competition: string;
  venue: string;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "finished";
  created_at: string;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  player_id: string | null;
  player_name: string;
  player_number: number | null;
  position: string | null;
  created_at: string;
}

export interface PlayerCatalogItem {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface MatchPlayedPlayer {
  id: string;
  match_id: string;
  match_player_id: string;
  created_at: string;
}

export interface MatchPlayerStat {
  id: string;
  match_id: string;
  match_player_id: string;
  goals: number;
  assists: number;
  created_at: string;
  updated_at: string;
}

export interface MatchPredictionRecord {
  id: string;
  user_id: string;
  match_id: string;
  result: PredictionChoice;
  score: {
    home: number | null;
    away: number | null;
  };
  points_preview: number | null;
  created_at: string;
  updated_at: string;
}

export interface LineupPredictionRecord {
  id: string;
  user_id: string;
  match_id: string;
  selected_player_ids: string[];
  player_layout: TacticalBoardPosition[];
  created_at: string;
  updated_at: string;
}

export interface TacticalBoardPosition {
  player_id: string;
  x: number;
  y: number;
}

export interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  email: string;
  total_points: number;
}

export interface TransferRumor {
  id: string;
  player_name: string;
  current_club: string;
  target_club: string;
  direction: TransferDirection;
  position?: string | null;
  age?: number | null;
  estimated_price?: string | null;
  salary_risk?: string | null;
  barca_fit_score?: number | null;
  coach_system_fit_score?: number | null;
  risk_level?: TransferRiskLevel | null;
  decision?: TransferDecision | null;
  short_reason?: string | null;
  community_votes?: number | null;
  window_label: string;
  status: "active" | "resolved" | "archived";
  resolved_outcome: boolean | null;
  probability_score: number | null;
  usefulness_score: number | null;
  recommendation: boolean | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
}

export interface LoanPlayerRecord {
  id: string;
  name: string;
  position: string;
  loan_club: string;
  loan_ends_at: string;
  status: string;
  coach_system_fit_score: number;
  barca_fit_score: number;
  community_decision: "Вернуть" | "Продать" | "Оставить в аренде" | "Дать шанс на сборах";
}

export interface LaMasiaPlayerRecord {
  id: string;
  name: string;
  age: number;
  position: string;
  team_level: LaMasiaTeamLevel;
  potential_score: number;
  first_team_chance: number;
  coach_system_fit_score: number;
  barca_fit_score: number;
  status: LaMasiaStatus;
  short_description: string;
}

export interface AnalyticsPlayerRecord {
  id: string;
  name: string;
  role: "first_team" | "transfer_target" | "la_masia" | "loan";
  position: string;
  source_label: string;
  technique: number;
  pressure_play: number;
  pressing: number;
  positional_discipline: number;
  intelligence: number;
  mentality: number;
  coach_compatibility: number;
  barca_compatibility: number;
  conclusion: string;
}

export type ReputationType = "analyst" | "scout" | "transfer" | "tactical" | "prediction";
export type CommunityTargetType = "transfer" | "la_masia" | "analytics" | "lineup" | "match";
export type ChallengeType = "Transfer Battle" | "La Masia Pick" | "Tactical Question" | "Season Prediction" | "Coach System Fit" | "Barca DNA Debate";

export interface CommunityUserRecord {
  id: string;
  username: string;
  avatar: string;
  favorite_player: string;
  favorite_era: string;
  favorite_coach: string;
  favorite_formation: string;
  short_bio: string;
  xp: number;
  points: number;
  current_streak: number;
  max_streak: number;
  analyst_reputation: number;
  scout_reputation: number;
  transfer_reputation: number;
  prediction_accuracy: number;
  tactical_reputation: number;
  total_predictions: number;
  correct_predictions: number;
  submitted_lineups: number;
  submitted_analytics: number;
  transfer_votes: number;
  la_masia_follows: number;
  comments_count: number;
  badges: string[];
}

export interface CommunityOpinionRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  targetType: CommunityTargetType;
  targetId: string;
  text: string;
  likes: number;
  createdAt: string;
  isPinnedByAdmin: boolean;
  adminReply?: string;
}

export interface CommunityConsensusOption {
  label: string;
  votes: number;
}

export interface DailyChallengeRecord {
  id: string;
  title: string;
  type: ChallengeType;
  description: string;
  options: CommunityConsensusOption[];
  rewardXP: number;
  rewardPoints: number;
  expiresAt: string;
}

export type ChallengeDayMode = "ordinary" | "matchday" | "any";
export type ChallengePhase = "daily" | "pre_match" | "post_match";
export type ChallengeCadence = "daily" | "weekly" | "monthly";
export type ChallengeResponseType = "single_choice" | "multiple_choice" | "text" | "scale" | "score" | "action";
export type ChallengeVerificationType = "participation" | "correct_answer" | "match_result" | "manual";
export type ChallengeStatus = "draft" | "published" | "archived";
export type ChallengeSubmissionStatus = "submitted" | "pending" | "verified" | "rejected";

export interface ChallengeOptionRecord {
  id: string;
  label: string;
  votes?: number;
}

export interface ChallengeRecord {
  id: string;
  title: string;
  description: string;
  template_key: string;
  day_mode: ChallengeDayMode;
  phase: ChallengePhase;
  cadence: ChallengeCadence;
  response_type: ChallengeResponseType;
  verification_type: ChallengeVerificationType;
  skill_key: string | null;
  match_id: string | null;
  options: ChallengeOptionRecord[];
  correct_answer: unknown;
  linked_route: string | null;
  reward_coins: number;
  reward_xp: number;
  target_count: number;
  opens_at: string | null;
  closes_at: string | null;
  status: ChallengeStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeSubmissionRecord {
  id: string;
  challenge_id: string;
  user_id: string;
  answer: unknown;
  status: ChallengeSubmissionStatus;
  was_correct: boolean | null;
  coins_awarded: number;
  xp_awarded: number;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface ChallengeWalletRecord {
  user_id: string;
  coins: number;
  current_streak: number;
  longest_streak: number;
  last_claimed_date: string | null;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  type: "reply" | "like" | "prediction" | "badge" | "watchlist" | "challenge" | "pinned";
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  link: string;
}

export interface StreamPickRecord {
  id: string;
  user: string;
  type: "lineup" | "transfer" | "la_masia" | "analytics";
  title: string;
  text: string;
  status: "selected_for_stream" | "discussed" | "featured";
}

export type RewardCategory = string;
export type RewardRarity = "common" | "rare" | "epic" | "legendary" | "ultra_legendary";
export type RewardStatus = "available" | "soon" | "limited" | "sold_out";
export type PurchaseStatus = "digital activated" | "physical pending" | "stream privilege unused";

export interface RewardItemRecord {
  id: string;
  title: string;
  description: string;
  category: RewardCategory;
  pricePoints: number;
  image?: string | null;
  rarity: RewardRarity;
  status: RewardStatus;
  stock?: number | null;
  isDigital: boolean;
  isPremiumOnly?: boolean;
  season?: string;
  type?: string;
  collectionName?: string;
  artistName?: string;
  isLimited?: boolean;
  shortDescription?: string;
  tags?: string[];
  expiresLabel?: string;
}

export interface PurchaseHistoryRecord {
  id: string;
  itemId: string;
  title: string;
  category: RewardCategory;
  pricePoints: number;
  purchasedAt: string;
  status: PurchaseStatus;
}

export interface FantasyPlayerPick {
  playerId: string;
  position: string;
  isCaptain: boolean;
  predictedGoals: number;
  predictedAssists: number;
  predictedCleanSheet: boolean;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  matchId: string;
  players: FantasyPlayerPick[];
  captainId: string;
  createdAt: string;
  lockedAt: string;
  totalPoints: number;
}

export interface FantasyMatchPrediction {
  id: string;
  userId: string;
  matchId: string;
  teamId: string;
  predictedWinner: string;
  predictedScore: string;
  createdAt: string;
}

export interface FantasySeason {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface FantasyScoreRule {
  eventType: string;
  points: number;
  multiplier?: number;
}

export interface TransferPredictionRecord {
  id: string;
  user_id: string;
  rumor_id: string;
  prediction: TransferPredictionChoice;
  points_awarded: number;
  created_at: string;
  updated_at: string;
}

export interface TransferIdeaRecord {
  id: string;
  user_id: string;
  player_name: string;
  current_club: string;
  target_club: string;
  direction: TransferDirection;
  estimated_fee_millions: number | null;
  usefulness_score: number | null;
  desire_score: number | null;
  probability_score: number | null;
  notes: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DuelRecord {
  id: string;
  match_id: string;
  challenger_id: string;
  opponent_id: string;
  winner_id: string | null;
  bonus_awarded: number;
  created_at: string;
  updated_at: string;
}

export interface FanProfileInsights {
  dna: FanDnaType;
  dna_title: string;
  dna_description: string;
  rank: GeniusRankType;
  rank_title: string;
  rank_description: string;
  accuracy_percent: number;
  correct_results: number;
  exact_scores: number;
  finished_predictions: number;
  lineups_saved: number;
  transfer_calls: number;
  player_rankings_submitted: number;
}

export interface PlayerRankingRecord {
  id: string;
  user_id: string;
  match_id: string;
  match_player_id: string;
  rank_position: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerRankingSummary {
  match_player_id: string;
  average_rank_position: number;
  rankings_count: number;
}

export interface SeasonPlayerStat {
  player_id: string;
  player_name: string;
  total_points: number;
  average_rank_position: number;
  matches_ranked: number;
  first_place_count: number;
  top_three_count: number;
  last_place_count: number;
  goals: number;
  assists: number;
  matches_played: number;
  minutes_played: number;
  avatar_url: string | null;
}

export interface LeagueStanding {
  id: string;
  competition: string;
  season_label: string;
  team_name: string;
  team_short_name: string | null;
  badge_url: string | null;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  zone: StandingZone;
  created_at: string;
  updated_at: string;
}

export interface ManualPlayerSeasonStat {
  id: string;
  player_id: string;
  player_name?: string;
  season_label: string;
  goals: number;
  assists: number;
  matches_played: number;
  minutes_played: number;
  total_points_override?: number;
  average_rank_position_override?: number;
  matches_ranked_override?: number;
  first_place_count_override?: number;
  top_three_count_override?: number;
  last_place_count_override?: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
