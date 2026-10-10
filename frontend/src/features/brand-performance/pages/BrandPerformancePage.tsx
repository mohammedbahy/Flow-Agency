import { useState } from 'react';
import {
  Box, Card, CardContent, Chip, Grid, LinearProgress, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import { MOCK_BRANDS, MOCK_TEAM_PERFORMANCE } from '../mock/brand.mock';

type BrandTab = 'brands' | 'team';

/** Brand Performance + Workflow Dashboard: brand health cards with Team Performance inside — all local mock state. */
export function BrandPerformancePage() {
  const [tab, setTab] = useState<BrandTab>('brands');

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            CLIENT PERFORMANCE • Workflow
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Brand Performance and Workflow Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Brand health, on-time delivery, and the team performance behind each account.
          </Typography>
        </Box>
        <Chip label="Sync: Realtime • 4 brands" variant="outlined" />
      </Box>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, value: BrandTab) => setTab(value)} aria-label="Brand performance views" variant="scrollable" scrollButtons="auto">
            <Tab label={`Brand Overview ${MOCK_BRANDS.length}`} value="brands" />
            <Tab label={`Team Performance ${MOCK_TEAM_PERFORMANCE.length}`} value="team" />
          </Tabs>

          {tab === 'brands' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {MOCK_BRANDS.map((brand) => (
                <Grid key={brand.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={800}>{brand.name}</Typography>
                        <Chip label={brand.retainer} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">Health {brand.health}%</Typography>
                      <LinearProgress variant="determinate" value={brand.health} aria-label={`${brand.name} health ${brand.health}%`} />
                      <Typography variant="body2" color="text.secondary">
                        On-time {brand.onTime} • Tasks {brand.tasksDone}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : null}

          {tab === 'team' ? (
            <TableContainer sx={{ mt: 2, overflowX: 'auto' }}>
              <Table aria-label="Team performance">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell>Lead</TableCell>
                    <TableCell>Completion</TableCell>
                    <TableCell>Delayed</TableCell>
                    <TableCell>Throughput</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_TEAM_PERFORMANCE.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>{row.team}</Typography></TableCell>
                      <TableCell>{row.lead}</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={row.completion} sx={{ flexGrow: 1 }} aria-label={`${row.team} completion ${row.completion}%`} />
                          <Typography variant="caption">{row.completion}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${row.delayed} delayed`} size="small" color={row.delayed > 5 ? 'error' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>{row.throughput}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default BrandPerformancePage;
