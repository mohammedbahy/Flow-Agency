import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Standard page head: eyebrow, title, subtitle, action buttons. */
export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: eyebrow ? 0.5 : 0 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>
      ) : null}
    </Box>
  );
}

export default PageHeader;
