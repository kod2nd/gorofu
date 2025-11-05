import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { elevatedCardStyles } from '../styles/commonStyles';
import StreakBox from './StreakBox';

const StatCard = ({ label, value, percentage, tooltip }) => (
  <Paper sx={{ 
    p: 2, 
    textAlign: 'center', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  }}>
    <Tooltip title={tooltip || ''} arrow placement="top">
      <Box>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, minHeight: '2.4em' }}>
      {label}
    </Typography>
    <Typography 
      variant="h5" 
      component="div" // Use a div to allow for centering of child components
      sx={{ 
        fontWeight: 'bold', my: 0.5, display: 'flex', justifyContent: 'center' 
      }}
    >
      {value ?? '-'}
    </Typography>
    {percentage != null && percentage > 0 ? (
      <Typography variant="body2" color="text.secondary">
        ({percentage.toFixed(0)}%)
      </Typography>
    ) : (
      <Box sx={{ height: '1.25rem' }} />
    )}
      </Box>
    </Tooltip>
  </Paper>
);

const AllTimeStats = ({ cumulativeStats, szirStreak, szParStreak }) => (
  <Paper {...elevatedCardStyles} sx={{ p: 3, textAlign: 'center' }}>
    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>All-Time Stats</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'stretch' }}>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
        <StatCard 
          label="SZIR Streak" 
          value={<StreakBox streak={szirStreak} type="szir" />} 
          tooltip="Current consecutive holes with Scoring Zone In Regulation."
        />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
        <StatCard 
          label="SZ Par Streak" 
          value={<StreakBox streak={szParStreak} type="szpar" />} 
          tooltip="Current consecutive SZIR holes where you achieved Par or better."
        />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
        <StatCard label="Total Rounds Played" value={cumulativeStats?.total_rounds_played} sx={{ height: '100%' }} />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
        <StatCard label="Eligible Rounds Played" value={cumulativeStats?.eligible_rounds_count} sx={{ height: '100%' }} />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 12px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 18px)' } }}>
        <StatCard label="Total Holes Played" value={cumulativeStats?.total_holes_played} sx={{ height: '100%' }} />
      </Box>
    </Box>
  </Paper>
);

export default AllTimeStats;