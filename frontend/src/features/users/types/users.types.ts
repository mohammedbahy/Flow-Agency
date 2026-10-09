export type UserStatus = 'active' | 'invited' | 'suspended';
export type UsersTab = 'members' | 'clients' | 'roles' | 'audit';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  clients: string[];
  team: string;
  twoFactor: boolean;
  lastActive: string;
  status: UserStatus;
}

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  client: string;
  lastActive: string;
  status: UserStatus;
}

export interface RoleEntry {
  id: string;
  name: string;
  members: number;
  permissions: string[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  time: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: string;
  team: string;
}

export interface UserFormErrors {
  name?: string;
  email?: string;
}

export const USER_ROLES = [
  'Super Admin',
  'Account Manager',
  'Senior Designer',
  'Copywriter',
  'Client Reviewer',
] as const;

export const USER_TEAMS = [
  'Executive Team',
  'Creative & Design',
  'Content Studio',
  'Media Buying',
] as const;

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
};

export function validateUserForm(values: UserFormValues): UserFormErrors {
  const errors: UserFormErrors = {};
  if (!values.name.trim()) errors.name = 'Full name is required.';
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

export function usersToCsv(users: MockUser[]): string {
  const header = 'Name,Email,Role,Team,Clients,2FA,Last Active,Status';
  const rows = users.map((u) =>
    [
      u.name,
      u.email,
      u.role,
      u.team,
      u.clients.join('; '),
      u.twoFactor ? 'enforced' : 'off',
      u.lastActive,
      u.status,
    ]
      .map((cell) => `"${cell.replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}
