
export type UserLevel = 'national' | 'provincial' | 'municipal';

export type EmotionType = 'positive' | 'neutral' | 'negative';

export type WarningLevel = 1 | 2 | 3;

export type WarningStatus = 'pending' | 'confirmed' | 'processing' | 'resolved' | 'dismissed';

export type EventStatus = 'active' | 'cooling' | 'resolved';

export type HeatTrend = 'rising' | 'stable' | 'falling';

export type SourceType = 'weibo' | 'wechat' | 'news' | 'forum' | 'video';

export type ApprovalStatus = 'pending_analyst' | 'pending_edu' | 'pending_propaganda' | 'approved' | 'rejected';

export type ApprovalType = 'official_response' | 'cooling_strategy' | 'rumor_refutation';

export interface Region {
  code: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  realName: string;
  avatar?: string;
  level: UserLevel;
  region: Region;
  role: Role;
  status: 'active' | 'disabled';
  lastLogin?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'data';
}

export interface OpinionItem {
  id: string;
  title: string;
  content: string;
  source: SourceType;
  sourceUrl: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    followers?: number;
  };
  publishTime: string;
  emotion: EmotionType;
  emotionScore: number;
  sensitiveWords: string[];
  region: {
    province: string;
    city?: string;
  };
  repostCount: number;
  commentCount: number;
  likeCount: number;
  heatIndex: number;
  eventId?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 1 | 2 | 3 | 4;
  status: EventStatus;
  region: {
    provinces: string[];
    cities?: string[];
  };
  startTime: string;
  peakTime?: string;
  endTime?: string;
  heatIndex: number;
  heatTrend: HeatTrend;
  emotionScore: number;
  negativeRatio: number;
  spreadSpeed: number;
  sourceCount: number;
  opinionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KeyNode {
  id: string;
  name: string;
  avatar?: string;
  source: string;
  followers: number;
  influenceIndex: number;
  repostCount: number;
  commentCount: number;
  isOpinionLeader: boolean;
}

export interface SpreadNode {
  id: string;
  name: string;
  level: number;
  children: SpreadNode[];
  influence: number;
  x?: number;
  y?: number;
}

export interface KeywordItem {
  word: string;
  count: number;
  emotion: EmotionType;
}

export interface Warning {
  id: string;
  eventId: string;
  eventTitle: string;
  level: WarningLevel;
  triggerType: 'negative_ratio' | 'heat_threshold' | 'sensitive_word';
  triggerCondition: {
    type: string;
    threshold: number;
    actualValue: number;
    duration: number;
  };
  status: WarningStatus;
  region: string;
  pushTargets: string[];
  pushTime: string;
  confirmTime?: string;
  resolveTime?: string;
  handler?: string;
  approvalFlowId?: string;
  createdAt: string;
}

export interface ApprovalFlow {
  id: string;
  warningId: string;
  eventId: string;
  eventTitle: string;
  type: ApprovalType;
  status: ApprovalStatus;
  currentStep: number;
  steps: ApprovalStep[];
  initiator: string;
  initiatorDept: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  step: number;
  role: string;
  handler?: string;
  opinion?: string;
  attachments?: string[];
  status: 'pending' | 'approved' | 'rejected';
  handleTime?: string;
}

export interface Plan {
  id: string;
  name: string;
  year: number;
  type: string;
  description: string;
  fileUrl: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  createdBy: string;
}

export interface PlanKeyNode {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface RiskPrediction {
  id: string;
  eventType: string;
  probability: number;
  riskLevel: 'high' | 'medium' | 'low';
  predictedTime: string;
  predictedRegion: string[];
  relatedHistoryEvents: string[];
  suggestions: string[];
}

export interface SpeakerRec {
  id: string;
  name: string;
  title: string;
  department: string;
  expertise: string[];
  suitabilityScore: number;
  reason: string;
}

export interface ChannelRec {
  id: string;
  channel: string;
  channelType: string;
  audienceCoverage: number;
  effectivenessScore: number;
  recommendedTime: string;
  reason: string;
}

export interface WeeklyReport {
  id: string;
  week: string;
  startDate: string;
  endDate: string;
  region: string;
  summary: ReportSummary;
  generatedAt: string;
}

export interface ReportSummary {
  totalOpinions: number;
  weekOnWeek: number;
  positiveRatio: number;
  positiveWoW: number;
  negativeRatio: number;
  negativeWoW: number;
  warningCount: number;
  warningWoW: number;
  avgResponseTime: number;
  responseTimeWoW: number;
}

export interface DailyEmotionData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface RegionRankItem {
  region: string;
  spreadSpeed: number;
  responseSpeed: number;
  efficiencyScore: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DashboardStats {
  totalOpinions: number;
  todayOpinions: number;
  negativeRatio: number;
  warningCount: number;
  activeEvents: number;
  avgResponseTime: number;
  todayChange: {
    opinions: number;
    negative: number;
    warnings: number;
    response: number;
  };
}

export interface ProvinceHeatData {
  name: string;
  value: number;
  positive: number;
  neutral: number;
  negative: number;
}
