import { Avatar, Box, Typography } from '@mui/material';

export interface ActivityItem {
  id: string;
  actor: string;
  text: string;
  time: string;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

/** Recent workspace activity derived from live records. */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent activity yet.
      </Typography>
    );
  }
  return (
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
  );
}

export default ActivityFeed;
