// Settings feature barrel — live backend (agency/profile/deadline-rules).
export { SettingsPage } from './pages/SettingsPage';
export { AgencySettingsPage } from './pages/AgencySettingsPage';
export { ProfileSettingsPage } from './pages/ProfileSettingsPage';
export { DeadlineRulesPage } from './pages/DeadlineRulesPage';
export { RuleDialog } from './components/RuleDialog';
export { deadlineRulesService } from './services/deadline-rules.service';
export {
  validateAgencySettings,
  validateProfileForm,
  validatePasswordForm,
  validateDeadlineRule,
  TASK_TYPE_LABEL,
  DIRECTION_LABEL,
  describeRule,
} from './types/settings.types';
export type {
  ApiDeadlineRule,
  DeadlineRuleBody,
  DeadlineTaskType,
  DeadlineUnit,
  DeadlineDirection,
} from './services/deadline-rules.service';
export type {
  AgencySettings,
  ProfileForm,
  PasswordForm,
  DeadlineRuleForm,
} from './types/settings.types';
