import { Chip, type ChipProps } from '@mui/material';

export type StatusTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'default';

interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  size?: ChipProps['size'];
}

/**
 * Shared status/role indicator chip. Tone is chosen by the caller —
 * this component only renders the approved chip styling.
 */
export function StatusChip({ label, tone = 'default', size = 'small' }: StatusChipProps) {
  return <Chip label={label} color={tone} size={size} variant="filled" />;
}

export default StatusChip;
