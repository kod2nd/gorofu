import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { LineChart, Line, BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from 'recharts';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = ({ recentRounds, recentStats }) => {
  if (!recentRounds || recentRounds.length === 0 || !recentStats) {
    return null; // Don't render anything if there's no data
  }

  // Helper to calculate average score and putts for a specific par type in a single round
  const getParTypeStatsForRound = (round, par) => {
    const holes = round.round_holes.filter(h => h.par === par && h.hole_score != null && h.putts != null);
    if (holes.length === 0) return null;
    const totalScore = holes.reduce((sum, h) => sum + h.hole_score, 0);
    const totalPutts = holes.reduce((sum, h) => sum + h.putts, 0);
    return {
      score: totalScore / holes.length,
      putts: totalPutts / holes.length,
    };
  };

  // Prepare data for the three performance charts
  const performanceData = recentRounds.map(r => ({
    date: new Date(r.round_date).toLocaleDateString(),
    'Par 3 Avg Score': getParTypeStatsForRound(r, 3)?.score,
    'Par 3 Avg Putts': getParTypeStatsForRound(r, 3)?.putts,
    'Par 4 Avg Score': getParTypeStatsForRound(r, 4)?.score,
    'Par 4 Avg Putts': getParTypeStatsForRound(r, 4)?.putts,
    'Par 5 Avg Score': getParTypeStatsForRound(r, 5)?.score,
    'Par 5 Avg Putts': getParTypeStatsForRound(r, 5)?.putts,
  })).reverse();

  const scoreProportionData = [
    { 
      name: 'Par 3', 
      'Putts': recentStats.avg_putts_par3 ? parseFloat(recentStats.avg_putts_par3) : 0,
      'Strokes to Green': recentStats.avg_par3_score ? parseFloat(recentStats.avg_par3_score) - (recentStats.avg_putts_par3 || 0) : 0,
    },
    { 
      name: 'Par 4', 
      'Putts': recentStats.avg_putts_par4 ? parseFloat(recentStats.avg_putts_par4) : 0,
      'Strokes to Green': recentStats.avg_par4_score ? parseFloat(recentStats.avg_par4_score) - (recentStats.avg_putts_par4 || 0) : 0,
    },
    { 
      name: 'Par 5', 
      'Putts': recentStats.avg_putts_par5 ? parseFloat(recentStats.avg_putts_par5) : 0,
      'Strokes to Green': recentStats.avg_par5_score ? parseFloat(recentStats.avg_par5_score) - (recentStats.avg_putts_par5 || 0) : 0,
    },
  ].filter(d => (d['Putts'] + d['Strokes to Green']) > 0);

  const correlationData = [
    {
      name: 'Par 3',
      'Achieved SZIR': recentStats.avg_score_with_szir_par3 ? parseFloat(recentStats.avg_score_with_szir_par3).toFixed(2) : null,
      'Missed SZIR': recentStats.avg_score_without_szir_par3 ? parseFloat(recentStats.avg_score_without_szir_par3).toFixed(2) : null,
    },
    {
      name: 'Par 4',
      'Achieved SZIR': recentStats.avg_score_with_szir_par4 ? parseFloat(recentStats.avg_score_with_szir_par4).toFixed(2) : null,
      'Missed SZIR': recentStats.avg_score_without_szir_par4 ? parseFloat(recentStats.avg_score_without_szir_par4).toFixed(2) : null,
    },
    {
      name: 'Par 5',
      'Achieved SZIR': recentStats.avg_score_with_szir_par5 ? parseFloat(recentStats.avg_score_with_szir_par5).toFixed(2) : null,
      'Missed SZIR': recentStats.avg_score_without_szir_par5 ? parseFloat(recentStats.avg_score_without_szir_par5).toFixed(2) : null,
    },
  ];

  const shortGameCorrelationData = [
    {
      name: 'Par 3',
      'Achieved SZ Par': recentStats.avg_score_with_szpar_par3 ? parseFloat(recentStats.avg_score_with_szpar_par3).toFixed(2) : null,
      'Missed SZ Par': recentStats.avg_score_without_szpar_par3 ? parseFloat(recentStats.avg_score_without_szpar_par3).toFixed(2) : null,
    },
    {
      name: 'Par 4',
      'Achieved SZ Par': recentStats.avg_score_with_szpar_par4 ? parseFloat(recentStats.avg_score_with_szpar_par4).toFixed(2) : null,
      'Missed SZ Par': recentStats.avg_score_without_szpar_par4 ? parseFloat(recentStats.avg_score_without_szpar_par4).toFixed(2) : null,
    },
    {
      name: 'Par 5',
      'Achieved SZ Par': recentStats.avg_score_with_szpar_par5 ? parseFloat(recentStats.avg_score_with_szpar_par5).toFixed(2) : null,
      'Missed SZ Par': recentStats.avg_score_without_szpar_par5 ? parseFloat(recentStats.avg_score_without_szpar_par5).toFixed(2) : null,
    },
  ];

  const getDistributionPercentages = (prefix) => {
    const birdie = recentStats[`${prefix}birdie_or_better_count`] || 0;
    const par = recentStats[`${prefix}par_count`] || 0;
    const bogey = recentStats[`${prefix}bogey_count`] || 0;
    const double = recentStats[`${prefix}double_bogey_plus_count`] || 0;
    const total = birdie + par + bogey + double;
    if (total === 0) return null;
    return {
      'Birdie+': birdie,
      'Par': par,
      'Bogey': bogey,
      'Double+': double,
    };
  };

  const distributionData = [
    { name: 'Par 3', ...getDistributionPercentages('par3_') },
    { name: 'Par 4', ...getDistributionPercentages('par4_') },
    { name: 'Par 5', ...getDistributionPercentages('par5_') },
    { name: 'Overall', ...getDistributionPercentages('') },
  ].filter(d => d); // Filter out any null entries if a par type has no data

  const renderTooltipContent = (props) => {
    const { payload, label } = props;
    if (!payload || payload.length === 0) return null;
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <Paper sx={{ p: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} (${total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%)`}
          </Typography>
        ))}
      </Paper>
    );
  };

  const legendPayload = [
    { value: 'Birdie+', type: 'square', color: COLORS[0] },
    { value: 'Par', type: 'square', color: COLORS[1] },
    { value: 'Bogey', type: 'square', color: COLORS[2] },
    { value: 'Double+', type: 'square', color: COLORS[3] },
  ];

  const renderCustomLegend = (props) => {
    const { payload } = props;
    // The payload from recharts might be in the wrong order, so we'll use our own defined order
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
        {legendPayload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Box sx={{ width: 10, height: 10, backgroundColor: entry.color, mr: 1 }} />
            <Typography variant="caption">{entry.value}</Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        '& > .MuiPaper-root': { // Target the Paper components directly
          flexGrow: 1,
        },
      }}
    >
      {performanceData.some(d => d['Par 3 Avg Score'] != null) && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Par 3 Performance</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Par 3 Avg Score" stroke="#8884d8" connectNulls />
              <Line type="monotone" dataKey="Par 3 Avg Putts" stroke="#82ca9d" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {performanceData.some(d => d['Par 4 Avg Score'] != null) && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Par 4 Performance</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Par 4 Avg Score" stroke="#8884d8" connectNulls />
              <Line type="monotone" dataKey="Par 4 Avg Putts" stroke="#82ca9d" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {performanceData.some(d => d['Par 5 Avg Score'] != null) && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Par 5 Performance</Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Par 5 Avg Score" stroke="#8884d8" connectNulls />
              <Line type="monotone" dataKey="Par 5 Avg Putts" stroke="#ffc658" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {scoreProportionData.length > 0 && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Putts as Proportion of Score</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={scoreProportionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Strokes to Green" stackId="a" fill="#8884d8" />
              <Bar dataKey="Putts" stackId="a" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {correlationData.some(d => d['Achieved SZIR'] || d['Missed SZIR']) && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Score Correlation (Long Game)</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={correlationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Achieved SZIR" fill="#82ca9d" />
              <Bar dataKey="Missed SZIR" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {shortGameCorrelationData.some(d => d['Achieved SZ Par'] || d['Missed SZ Par']) && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Score Correlation (Short Game)</Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={shortGameCorrelationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Achieved SZ Par" fill="#82ca9d" />
              <Bar dataKey="Missed SZ Par" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
      {distributionData.length > 0 && (
        <Paper {...elevatedCardStyles} sx={{ p: 2, flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' } }}>
          <Typography {...sectionHeaderStyles}>Score Distribution Analysis</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={distributionData} layout="vertical" stackOffset="expand" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide={true} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip content={renderTooltipContent} />
              <Legend content={renderCustomLegend} />
              <Bar dataKey="Birdie+" stackId="a" fill={COLORS[0]} />
              <Bar dataKey="Par" stackId="a" fill={COLORS[1]} />
              <Bar dataKey="Bogey" stackId="a" fill={COLORS[2]} />
              <Bar dataKey="Double+" stackId="a" fill={COLORS[3]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
};

export default Analytics;