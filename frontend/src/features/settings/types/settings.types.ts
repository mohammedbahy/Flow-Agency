export interface AgencySettings {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
}

export interface AgencySettingsErrors {
  name?: string;
  email?: string;
}

export interface ProfileForm {
  name: string;
  email: string;
}

export interface ProfileFormErrors {
  name?: string;
  email?: string;
}

export interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

export interface PasswordFormErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

export type DeadlineAppliesTo = 'reviews' | 'tasks' | 'deliverables';
export type DeadlineUnit = 'hours' | 'days';

export interface DeadlineRule {
  id: string;
  name: string;
  appliesTo: DeadlineAppliesTo;
  limit: number;
  unit: DeadlineUnit;
  action: string;
  enabled: boolean;
}

export interface DeadlineRuleForm {
  name: string;
  appliesTo: DeadlineAppliesTo;
  limit: string;
  unit: DeadlineUnit;
  action: string;
  enabled: boolean;
}

export interface DeadlineRuleErrors {
  name?: string;
  limit?: string;
}

export const DEADLINE_APPLIES_LABEL: Record<DeadlineAppliesTo, string> = {
  reviews: 'Content reviews',
  tasks: 'Tasks',
  deliverables: 'Deliverables',
};

export function validateAgencySettings(values: AgencySettings): AgencySettingsErrors {
  const errors: AgencySettingsErrors = {};
  if (!values.name.trim()) errors.name = 'Agency name is required.';
  if (!values.email.trim()) {
    errors.email = 'Contact email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

export function validateProfileForm(values: ProfileForm): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (!values.name.trim()) errors.name = 'Full name is required.';
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}

export function validatePasswordForm(values: PasswordForm): PasswordFormErrors {
  const errors: PasswordFormErrors = {};
  if (!values.current) errors.current = 'Enter your current password.';
  if (!values.next) {
    errors.next = 'Enter a new password.';
  } else if (values.next.length < 8) {
    errors.next = 'New password must be at least 8 characters.';
  }
  if (values.confirm !== values.next) errors.confirm = 'Passwords do not match.';
  return errors;
}

export function validateDeadlineRule(values: DeadlineRuleForm): DeadlineRuleErrors {
  const errors: DeadlineRuleErrors = {};
  if (!values.name.trim()) errors.name = 'Rule name is required.';
  const limit = Number(values.limit);
  if (!values.limit.trim()) {
    errors.limit = 'Time limit is required.';
  } else if (!Number.isFinite(limit) || limit <= 0) {
    errors.limit = 'Enter a positive number.';
  }
  return errors;
}
