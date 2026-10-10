// Users / Access Control feature barrel — live backend (`/api/v1/users`).
export { UsersPage } from './pages/UsersPage';
export { AddUserPage } from './pages/AddUserPage';
export { RolesPage } from './pages/RolesPage';
export { MembersTable } from './components/MembersTable';
export { UserDialog } from './components/UserDialog';
export { RolesPanel, type LiveRoleEntry } from './components/DirectoryPanels';
export { usersService } from './services/users.service';
export {
  validateUserForm,
  validateStrongPassword,
  usersToCsv,
  BACKEND_ROLES,
  CREATABLE_ROLES,
  BACKEND_ROLE_LABEL,
  USER_STATUS_LABEL,
} from './types/users.types';
export type {
  ApiUser,
  BackendRole,
  BackendUserStatus,
  ListUsersQuery,
  CreateUserBody,
} from './services/users.service';
export type {
  DirectoryUser,
  UsersTab,
  UserStatus,
  UserFormValues,
  UserFormErrors,
} from './types/users.types';
