export type DeadlineTab = 'rules' | 'escalations';

export interface MockDeadlineRule {
  id: string;
  name: string;
  scope: string;
  threshold: string;
  action: string;
  enabled: boolean;
  updated: string;
}
