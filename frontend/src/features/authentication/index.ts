// Authentication feature barrel (Sprint 1 UI preview).
export { LoginPage } from './pages/LoginPage';
export { LoginForm } from './components/LoginForm';
export { mockSignIn } from './services/auth.mock';
export { validateLoginForm } from './types/auth.types';
export type {
  LoginFormValues,
  LoginFormErrors,
  MockSignInResult,
} from './types/auth.types';
