import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import { MOCK_BRANDS } from '../../brand-performance/mock/brand.mock';
import { MOCK_TEAMS } from '../../teams/mock/teams.mock';
import { MOCK_TASK_ROWS } from '../../tasks/mock/tasks.mock';

/** Agency Dashboard: executive summary across brands, teams, and tasks — all local mock state. */
export function AgencyDashboardPage() {
  const completed = MOCK_TASK_ROWS.filter((t) => t.status === 'completed').length;
  const delayed = MOCK_TASK_ROWS.filter((t) => t.status === 'delayed').length;
  const totalMembers = MOCK_TEAMS.reduce((s, t) => s + t.members, 0);

  const stats = [
    { label: 'Active brands', value: String(MOCK_BRANDS.length), sub: '4 retainers in scope' },
    { label: 'Team members', value: String(totalMembers), sub: `${MOCK_TEAMS.length} delivery teams` },
    { label: 'Completed tasks', value: String(completed), sub: 'Shipped in preview' },
    { label: 'Delayed tasks', value: String(delayed), sub: 'Need intervention' },
  ];

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            EXECUTIVE OVERVIEW • Agency
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Agency Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            One glance across brands, teams, and delivery health. Detail lives in each dedicated page.
          </Typography>
        </Box>
        <Chip label="Live Syncing" color="success" variant="outlined" />
      </Box>
      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.06em' }}>
                  {stat.label.toUpperCase()}
                </Typography>
                <Typography variant="h4" component="p" fontWeight={800}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">{stat.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>Top brands by health</Typography>
              {MOCK_BRANDS.slice(0, 3).map((brand) => (
                <Box key={brand.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" fontWeight={600}>{brand.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{brand.health}% • {brand.onTime} on-time</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>Largest teams</Typography>
              {[...MOCK_TEAMS].sort((a, b) => b.members - a.members).slice(0, 3).map((team) => (
                <Box key={team.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography variant="body2" fontWeight={600}>{team.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{team.members} members • {team.activeProjects} projects</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

export default AgencyDashboardPage;
