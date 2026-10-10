import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import FolderIcon from '@mui/icons-material/Folder';
import ChecklistIcon from '@mui/icons-material/Checklist';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LoginForm from '../components/LoginForm';
import { PRODUCT_NAME } from '../../../shared/components/workspace';

type PreviewState = 'default' | 'loading' | 'error';

const PIPELINE_STEPS = [
  { icon: <FolderIcon />, title: 'Organize', sub: 'Intake' },
  { icon: <ChecklistIcon />, title: 'Execute', sub: 'Sprint' },
  { icon: <RateReviewIcon />, title: 'Review', sub: 'Internal' },
  { icon: <CheckCircleIcon />, title: 'Approve', sub: 'Client' },
  { icon: <AnalyticsIcon />, title: 'Analyze', sub: 'Margins' },
];

const PANEL_BG = 'linear-gradient(160deg, #141843 0%, #0C0F2E 55%, #1B0F3B 100%)';

function BrandPanel() {
  return (
    <Box
      sx={{
        flex: { md: '0 0 44%' },
        background: PANEL_BG,
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 3,
        px: { xs: 3, md: 6 },
        py: { xs: 5, md: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.45) 0%, rgba(79,70,229,0) 70%)',
          top: -120,
          right: -120,
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
        <Avatar sx={{ bgcolor: '#FFFFFF', borderRadius: 2, fontWeight: 800 }} variant="rounded" aria-hidden src="/neurteq-icon.svg" alt="Neurteq">
          N
        </Avatar>
        <Typography variant="h6" fontWeight={800}>
          {PRODUCT_NAME}
        </Typography>
        <Chip
          label="v4.18 CORE"
          size="small"
          sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.14)', color: '#FFFFFF', fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.14em', color: '#A5B4FC' }}>
          NEXT-GEN WORK ORCHESTRATION
        </Typography>
        <Typography variant="h3" component="p" fontWeight={800} sx={{ mt: 1, lineHeight: 1.15 }}>
          The Operational Engine for Elite Digital Agencies.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5, color: '#C7D2FE', maxWidth: 440 }}>
          Unify resource capacity, client retainers, Gantt delivery, and financial margins in real-time.
        </Typography>
      </Box>

      <Chip
        icon={<CheckCircleIcon sx={{ color: '#A7F3D0 !important' }} />}
        label="Client, brand, team, task and review workflows in one place"
        sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', position: 'relative' }}
      />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', position: 'relative' }} aria-label="Delivery pipeline">
        {PIPELINE_STEPS.map((step) => (
          <Box
            key={step.title}
            sx={{
              flex: '1 1 0',
              minWidth: 72,
              textAlign: 'center',
              bgcolor: 'rgba(255,255,255,0.07)',
              borderRadius: 2,
              py: 1.25,
              px: 0.5,
            }}
          >
            <Box sx={{ color: '#A5B4FC' }}>{step.icon}</Box>
            <Typography variant="caption" fontWeight={700} display="block">
              {step.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#A5B4FC' }} display="block">
              {step.sub}
            </Typography>
          </Box>
        ))}
      </Box>

      <Card sx={{ bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', position: 'relative' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#A5B4FC' }}>
              Workspace Overview
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon fontSize="small" sx={{ color: '#34D399' }} /> Track delivery, reviews and throughput live
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', position: 'relative' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: '#E0E7FF' }}>
            One workspace for clients, brands, teams, tasks and reviews — backed by live backend data.
          </Typography>
          <Typography variant="caption" sx={{ color: '#A5B4FC' }}>
            Sign in to see your workspace figures update in real time.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

/** Login screen: AgencyOS brand panel + sign-in form. Standalone route. */
export function LoginPage() {
  const [preview, setPreview] = useState<PreviewState>('default');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, bgcolor: 'background.default' }}>
      <BrandPanel />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, sm: 4 },
          py: 3,
          minWidth: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', borderRadius: 2, px: 1.5, py: 0.75, border: '1px solid #E6E8F5' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Interactive UX Preview:
            </Typography>
            <ToggleButtonGroup
              value={preview}
              exclusive
              size="small"
              onChange={(_, value: PreviewState | null) => {
                if (value) setPreview(value);
              }}
              aria-label="Form preview state"
            >
              <ToggleButton value="default">Default View</ToggleButton>
              <ToggleButton value="loading">Loading State</ToggleButton>
              <ToggleButton value="error">Error State</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 460 }}>
            {preview === 'loading' ? (
              <Box aria-label="Loading sign-in form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="text" width="55%" height={40} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={48} />
              </Box>
            ) : preview === 'error' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="error" role="alert">
                  Workspace unreachable — the sign-in service did not respond. Check your connection and try again.
                </Alert>
                <Button variant="contained" onClick={() => setPreview('default')}>
                  Try again
                </Button>
              </Box>
            ) : (
              <LoginForm />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
            justifyContent: 'center',
            pt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <LockIcon fontSize="inherit" /> SSL 256-bit SOC-2 Type II Certified
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Privacy Policy • Need help? Contact Agency IT Admin
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
