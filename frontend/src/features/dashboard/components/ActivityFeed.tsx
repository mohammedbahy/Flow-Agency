import { Avatar, Box, Link, Typography } from '@mui/material';
import type { ActivityItem } from '../types/dashboard.types';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

/** Live activity feed with audit-log link (decorative in preview). */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => (
          <Box component="li" key={item.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700 }} aria-hidden>
              {initials(item.actor)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2">
                <strong>{item.actor}</strong> {item.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Link href="#" onClick={(e) => e.preventDefault()} underline="hover" fontWeight={600} fontSize="0.875rem" sx={{ mt: 1.5, display: 'inline-block' }}>
        View full audit log (136 events)
      </Link>
    </Box>
  );
}

export default ActivityFeed;
