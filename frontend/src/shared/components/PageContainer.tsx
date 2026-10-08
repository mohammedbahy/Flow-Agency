import type { ReactNode } from 'react';
import { Box } from '@mui/material';

interface PageContainerProps {
  children: ReactNode;
}

/** Reusable page wrapper for future feature pages. */
export function PageContainer({ children }: PageContainerProps) {
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>;
}

export default PageContainer;
