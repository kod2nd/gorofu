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

const RecentInsights = ({ recentStats, isFiltering }) => (
  <Paper {...elevatedCardStyles} sx={{ p: 2 , width: '100%' }}>
    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Recent Insights</Typography>
    {isFiltering ?
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}><Skeleton variant="rounded" height={80} /></Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}><Skeleton variant="rounded" height={80} /></Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}><Skeleton variant="rounded" height={80} /></Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)' }}><Skeleton variant="rounded" height={80} /></Box>
      </Box>
    : recentStats && recentStats.total_holes_played > 0 ?
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 2 }}>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 120 }}> 
          <StatCard 
            label="Avg Score" 
            value={Number(recentStats.avg_par4_score).toFixed(1)} 
            tooltip="Average score on par 4 holes." 
          /> 
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 120 }}> 
          <StatCard 
            label="Avg Putts" 
            value={recentStats.avg_putts_per_hole ? Number(recentStats.avg_putts_per_hole).toFixed(1) : '-'} 
            tooltip="Average number of putts per hole." 
          /> 
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 120 }}> 
          <StatCard 
            label="SZIR %" 
            value={recentStats.szir_percentage ? `${Number(recentStats.szir_percentage).toFixed(0)}%` : '-'} 
            tooltip="Scoring Zone in Regulation %" 
          /> 
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 120 }}> 
          <StatCard 
            label="SZ Par %" 
            value={recentStats.holeout_within_3_shots_count} 
            percentage={recentStats.szir_count > 0 ? (recentStats.holeout_within_3_shots_count / recentStats.szir_count) * 100 : 0} 
            tooltip="SZ Par Conversion %" 
          /> 
        </Box>
      </Box>
    :
      <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>No data for selected filters.</Typography>
    }
  </Paper>
);

export default RecentInsights;