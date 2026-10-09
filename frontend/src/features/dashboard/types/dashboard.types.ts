export interface KpiStat {
  label: string;
  value: string;
  tone?: 'default' | 'warning' | 'success';
}

export interface KpiCard {
  id: string;
  eyebrow: string;
  value: string;
  caption: string;
  stats: KpiStat[];
}

export interface PendingReviewRow {
  id: string;
  client: string;
  initials: string;
  deliverable: string;
  lead: string;
  deadline: string;
  sla: string;
  slaTone: 'error' | 'warning' | 'success';
}

export interface AllocationRow {
  id: string;
  team: string;
  detail: string;
  percent: number;
  note: string;
  overCapacity?: boolean;
}

export interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  time: string;
}

export interface WorkloadWeek {
  id: string;
  label: string;
  delivered: number;
  planned: number;
}
