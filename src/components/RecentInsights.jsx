import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { elevatedCardStyles } from '../styles/commonStyles';

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
      borderColor: 'primary.light',
      transform: 'translateY(-2px)',
      boxShadow: 4
    }
  }}>
    <Tooltip title={tooltip || ''} arrow placement="top">
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, minHeight: '2.4em', textTransform: 'uppercase' }}>
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
      </Box>
    </Tooltip>
  </Paper>
);

const RecentInsights = ({ recentStats, isFiltering }) => {
  const statsConfig = [
    { key: 'avg_par3_score', label: 'Avg Par 3 Score', tooltip: 'Average score on par 3 holes.', format: (v) => Number(v).toFixed(1) },
    { key: 'avg_par4_score', label: 'Avg Par 4 Score', tooltip: 'Average score on par 4 holes.', format: (v) => Number(v).toFixed(1) },
    { key: 'avg_par5_score', label: 'Avg Par 5 Score', tooltip: 'Average score on par 5 holes.', format: (v) => Number(v).toFixed(1) },
    { key: 'avg_putts_per_hole', label: 'Avg Putts', tooltip: 'Average number of putts per hole.', format: (v) => Number(v).toFixed(1) },
    { key: 'szir_count', label: 'SZIR %', tooltip: 'Scoring Zone in Regulation %', format: (v, stats) => `${v} / ${stats.total_holes_played}`, percentageKey: 'szir_percentage' },
    { key: 'holeout_within_3_shots_count', label: 'SZ Par %', tooltip: 'SZ Par Conversion %', format: (v, stats) => `${v} / ${stats.total_holes_played}`, percentageKey: 'sz_par_percentage' }
  ];

  // Pre-calculate sz_par_percentage if needed
  if (recentStats) {
    recentStats.sz_par_percentage = recentStats.total_holes_played > 0 ? (recentStats.holeout_within_3_shots_count / recentStats.total_holes_played) * 100 : 0;
  }

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 2, width: '100%', borderRadius: 3 }}>
      <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Recent Insights</Typography>
      {isFiltering ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Box key={index} sx={{ flex: '1 1 calc(50% - 8px)' }}><Skeleton variant="rounded" height={80} /></Box>
          ))}
        </Box>
      ) : recentStats && recentStats.total_holes_played > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
          {statsConfig.map((stat) => (
            <Box key={stat.key} sx={{ flex: '1 1 calc(50% - 8px)' }}>
              <StatCard
                label={stat.label}
                value={stat.format(recentStats[stat.key], recentStats)}
                percentage={stat.percentageKey ? recentStats[stat.percentageKey] : null}
                tooltip={stat.tooltip}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>No data for selected filters.</Typography>
      )}
    </Paper>
  );
};

export default RecentInsights;