export interface MockClient {
  id: string;
  name: string;
  contact: string;
  retainer: string;
  projects: number;
  status: 'active' | 'at-risk' | 'paused';
}
