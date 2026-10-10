import type { BackendRole, BackendUserStatus } from '../services/users.service';

export type UserStatus = BackendUserStatus;
export type UsersTab = 'members' | 'roles';

/** Directory row: live API user enriched with team names. */
export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  status: UserStatus;
  teams: string[];
  joinedAt: string;
  mustChangePassword: boolean;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: BackendRole;
  password: string;
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const BACKEND_ROLES: { value: BackendRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'employee', label: 'Employee' },
];

/** Roles an admin may assign at creation (backend forbids creating admins). */
export const CREATABLE_ROLES: BackendRole[] = ['account_manager', 'employee'];

export const BACKEND_ROLE_LABEL: Record<BackendRole, string> = {
  admin: 'Admin',
  account_manager: 'Account Manager',
  employee: 'Employee',
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export function validateUserForm(values: UserFormValues, requirePassword: boolean): UserFormErrors {
  const errors: UserFormErrors = {};
  if (!values.name.trim()) errors.name = 'Full name is required.';
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (requirePassword) {
    const passwordError = validateStrongPassword(values.password);
    if (passwordError) errors.password = passwordError;
  }
  return errors;
}

/** Mirrors the backend password policy (min 8, upper + lower + digit + special). */
export function validateStrongPassword(password: string): string | undefined {
  if (!password) return 'Temporary password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/\d/.test(password)) return 'Password must contain a digit.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character.';
  return undefined;
}

export function usersToCsv(users: DirectoryUser[]): string {
  const header = 'Name,Email,Role,Teams,Joined,Status';
  const rows = users.map((u) =>
    [u.name, u.email, BACKEND_ROLE_LABEL[u.role], u.teams.join('; '), u.joinedAt, u.status]
      .map((cell) => `"${cell.replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}
