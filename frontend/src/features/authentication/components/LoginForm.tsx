import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import MailIcon from '@mui/icons-material/Mail';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import {
  validateLoginForm,
  type LoginFormErrors,
} from '../types/auth.types';

/**
 * Agency sign-in form.
 *
 * TEMPORARY demo flow (until the backend team lands real auth): a valid
 * form navigates straight to /dashboard with no session, token or user.
 * The Backend team replaces this with the real auth service (Axios →
 * /api/auth/*) during Sprint 1 integration.
 */
export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('elena.rostova@nexusagency.co');
  const [password, setPassword] = useState('preview-only-password');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const visibleErrors: LoginFormErrors = {
    email: touched.email ? errors.email : undefined,
    password: touched.password ? errors.password : undefined,
  };

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateLoginForm({ email, password, rememberMe });
    setErrors(nextErrors);
    setTouched({ email: true, password: true });
    setNotice(null);
    if (nextErrors.email ?? nextErrors.password) return;
    // TEMP bypass: simulate latency, then enter the workspace openly.
    setSubmitting(true);
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 600);
  }

  function handleSso(provider: string) {
    setNotice(`${provider} SSO is disabled in this UI preview — use Sign In to enter the demo workspace.`);
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your agency credentials to access your workspace
        </Typography>
      </Box>

      {notice ? (
        <Alert severity="info" role="status" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      ) : null}

      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }} component="label" htmlFor="login-email">
          Agency Email
        </Typography>
        <TextField
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@agency.co"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors(validateLoginForm({ email: e.target.value, password, rememberMe }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          error={Boolean(visibleErrors.email)}
          helperText={visibleErrors.email ?? ' '}
          fullWidth
          required
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip label="SSO Enabled" size="small" color="success" variant="outlined" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.75 }} component="label" htmlFor="login-password">
          Workspace Password
        </Typography>
        <TextField
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors(validateLoginForm({ email, password: e.target.value, rememberMe }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={Boolean(visibleErrors.password)}
          helperText={visibleErrors.password ?? ' '}
          fullWidth
          required
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControlLabel
          control={
            <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} id="login-remember" />
          }
          label={<Typography variant="body2">Remember me for 30 days</Typography>}
        />
        <Button variant="text" size="small" type="button" aria-label="Forgot password (disabled in preview)">
          Forgot password?
        </Button>
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        fullWidth
        endIcon={<ArrowForwardIcon />}
      >
        {submitting ? 'Signing in…' : 'Sign In to Workspace'}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 0.5 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          OR CONTINUE WITH SSO
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button variant="outlined" color="inherit" fullWidth onClick={() => handleSso('Google')} startIcon={<Typography fontWeight={800}>G</Typography>}>
          Google SSO
        </Button>
        <Button variant="outlined" color="inherit" fullWidth onClick={() => handleSso('Okta')}>
          Okta SAML
        </Button>
      </Box>
    </Box>
  );
}

export default LoginForm;
