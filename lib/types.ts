import type { WeeklyMetric } from "./scoring";

export interface Member {
  memberId: string;
  displayName: string;
  initials: string;
  role: string;
  pod: string;
}

export interface Interaction {
  weekIndex: number;
  memberA: string;
  memberB: string;
  interactionStrength: number;
  channel: string;
}

export interface TeamEvent {
  weekIndex: number;
  title: string;
  description: string;
  type: string;
}

export interface TeamMeta {
  teamId: string;
  teamName: string;
  currentWeekIndex: number;
  weekLabels: string[];
}

export interface DashboardData {
  team: TeamMeta;
  members: Member[];
  weeklyMetrics: WeeklyMetric[];
  interactions: Interaction[];
  events: TeamEvent[];
}
