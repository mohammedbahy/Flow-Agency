import type {
  DeadlineDirection,
  DeadlineTaskType,
  DeadlineUnit,
} from '../services/deadline-rules.service';

export type { DeadlineTaskType, DeadlineUnit, DeadlineDirection };

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

export function validateAgencySettings(values: { name: string; email: string }): AgencySettingsErrors {
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

export interface DeadlineRuleForm {
  taskType: DeadlineTaskType;
  offsetValue: string;
  offsetUnit: DeadlineUnit;
  direction: DeadlineDirection;
  active: boolean;
}

export interface DeadlineRuleErrors {
  offsetValue?: string;
}

export const TASK_TYPE_LABEL: Record<DeadlineTaskType, string> = {
  design: 'Design',
  content: 'Content',
  development: 'Development',
  video: 'Video',
  seo: 'SEO',
  other: 'Other',
};

export const DIRECTION_LABEL: Record<DeadlineDirection, string> = {
  before: 'Before due date',
  after: 'After due date',
};

export function validateDeadlineRule(values: DeadlineRuleForm): DeadlineRuleErrors {
  const errors: DeadlineRuleErrors = {};
  const offset = Number(values.offsetValue);
  if (!values.offsetValue.trim()) {
    errors.offsetValue = 'Offset is required.';
  } else if (!Number.isFinite(offset) || offset <= 0) {
    errors.offsetValue = 'Enter a positive number.';
  }
  return errors;
}

export function describeRule(offsetValue: number, offsetUnit: DeadlineUnit, direction: DeadlineDirection): string {
  return `${offsetValue} ${offsetUnit} ${direction === 'before' ? 'before' : 'after'} the due date`;
}
