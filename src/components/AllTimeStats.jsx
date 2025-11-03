import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { elevatedCardStyles } from '../styles/commonStyles';
import StreakBox from './StreakBox';

const StatCard = ({ label, value, percentage, tooltip }) => (
  <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, minHeight: '2.4em' }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 0.5 }}>
      {value ?? '-'}
    </Typography>
    {percentage != null && percentage > 0 ? (
      <Typography variant="body2" color="text.secondary">
        ({percentage.toFixed(0)}%)
      </Typography>
    ) : (
      <Box sx={{ height: '1.25rem' }} />
    )}
  </Paper>
);

const AllTimeStats = ({ cumulativeStats, szirStreak, szParStreak }) => (
  <Paper {...elevatedCardStyles} sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>All-Time Stats</Typography>
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12} sm={4} md={3}>
        <Box sx={{ textAlign: 'center' }}>
          <StreakBox streak={szirStreak} type="szir" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>SZIR Streak</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <Box sx={{ textAlign: 'center' }}>
          <StreakBox streak={szParStreak} type="szpar" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>SZ Par Streak</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={6}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item xs={6} sm={4}> <StatCard label="Total Rounds" value={cumulativeStats?.total_rounds_played} /> </Grid>
          <Grid item xs={6} sm={4}> <StatCard label="Eligible Rounds" value={cumulativeStats?.eligible_rounds_count} /> </Grid>
          <Grid item xs={12} sm={4}> <StatCard label="Total Holes" value={cumulativeStats?.total_holes_played} /> </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Paper>
);

export default AllTimeStats;