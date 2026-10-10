export interface MockProfile {
  name: string;
  email: string;
  role: string;
  team: string;
  phone: string;
  location: string;
  initials: string;
  status: 'active' | 'invited' | 'suspended';
  twoFactor: boolean;
}

export interface ProfileActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}
