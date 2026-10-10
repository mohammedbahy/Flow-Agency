// Users / Access Control feature barrel (Sprint 1 UI preview).
export { UsersPage } from './pages/UsersPage';
export { AddUserPage } from './pages/AddUserPage';
export { RolesPage } from './pages/RolesPage';
export { MembersTable } from './components/MembersTable';
export { UserDialog } from './components/UserDialog';
export { ClientUsersPanel, RolesPanel, AuditPanel } from './components/DirectoryPanels';
export { MOCK_USERS, MOCK_CLIENT_USERS, MOCK_ROLES, MOCK_AUDIT } from './mock/users.mock';
export { validateUserForm, usersToCsv, USER_ROLES, USER_TEAMS, USER_STATUS_LABEL } from './types/users.types';
export type {
  MockUser,
  ClientUser,
  RoleEntry,
  AuditEntry,
  UsersTab,
  UserStatus,
  UserFormValues,
  UserFormErrors,
} from './types/users.types';
