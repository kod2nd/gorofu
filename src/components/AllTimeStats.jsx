import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import StreakBox from './StreakBox';

const StatCard = ({ label, value, tooltip }) => (
  <Paper 
    elevation={3}
    sx={{ 
      p: 2, 
      textAlign: 'center', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      // Solid white with strong shadow for visibility
      background: 'white',
      borderRadius: 2,
      border: '2px solid rgba(255, 255, 255, 0.4)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
        borderColor: 'white',
      }
    }}
  >
    <Tooltip title={tooltip || ''} arrow placement="top">
      <Box>
        <Typography 
          variant="caption" 
          display="block" 
          sx={{ 
            lineHeight: 1.2, 
            minHeight: '2.4em', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          {label}
        </Typography>
        <Typography 
          variant="h5" 
          component="div"
          sx={{ 
            fontWeight: 'bold', 
            my: 0.5, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            color: 'primary.main'
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