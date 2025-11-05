import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { elevatedCardStyles } from '../styles/commonStyles';
import StreakBox from './StreakBox';

const StatCard = ({ label, value, tooltip }) => (
  <Paper sx={{ 
    p: 2, 
    textAlign: 'center', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center',
    // Frosted glass / shiny badge effect
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    color: 'black',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
    }
  }}>
    <Tooltip title={tooltip || ''} arrow placement="top">
      <Box>
        <Typography variant="caption" display="block" sx={{ lineHeight: 1.2, minHeight: '2.4em', textTransform: 'uppercase', opacity: 0.9 }}>
          {label}
        </Typography>
        <Typography 
          variant="h5" 
          component="div"
          sx={{ 
            fontWeight: 'bold', my: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'black'
          }}
        >
          {value ?? '-'}
        </Typography>
      </Box>
    </Tooltip>
  </Paper>
);

const AllTimeStats = ({ cumulativeStats, szirStreak, szParStreak }) => (
  <Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
        <StatCard 
          label="SZIR Streak"
          value={<StreakBox streak={szirStreak} type="szir" />} 
          tooltip="Current consecutive holes with Scoring Zone In Regulation."
        />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
        <StatCard 
          label="SZ Par Streak"
          value={<StreakBox streak={szParStreak} type="szpar" />} 
          tooltip="Current consecutive SZIR holes where you achieved Par or better."
        />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
        <StatCard
          label="Total Rounds"
          value={cumulativeStats?.total_rounds_played}
        />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
        <StatCard
          label="Eligible Rounds"
          value={cumulativeStats?.eligible_rounds_count}
        />
      </Box>
      <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
        <StatCard
          label="Holes Played"
          value={cumulativeStats?.total_holes_played}
        />
      </Box>
    </Box>
  </Box>
);

export default AllTimeStats;
