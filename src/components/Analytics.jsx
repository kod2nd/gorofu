import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Slider,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  useTheme,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { LineChart, Line, BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, ShowChart, Remove } from '@mui/icons-material';
import RelativeDistanceAnalysis from './RelativeDistanceAnalysis';

// Modern color palette
const COLORS = {
  primary: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const SCORE_DISTRIBUTION_COLORS = {
  'Birdie+': '#10b981',
  'Par': '#3b82f6',
  'Bogey': '#f59e0b',
  'Dbl Bogey': '#ef4444',
  'Triple+': '#dc2626', // A darker red for more severe errors
};

const ChartCard = ({ title, subtitle, children, icon }) => (
  <Paper 
    elevation={2}
    sx={{ 
      p: 3,
      flexBasis: { xs: '100%', lg: 'calc(50% - 12px)' },
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 4,
        borderColor: 'primary.light',
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      {icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {children}
  </Paper>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  
  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 1.5,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: entry.color 
            }} 
          />
          <Typography variant="caption" color="text.secondary">
            {entry.name}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const DistributionTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const total = payload.reduce((sum, entry) => sum + entry.value, 0);
  
  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 1.5,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {label}
      </Typography>
      {payload.map((entry, index) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: 1,
                backgroundColor: entry.color 
              }} 
            />
            <Typography variant="caption" color="text.secondary">
              {entry.name}:
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {entry.value} ({total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0}%)
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

const CustomLegend = ({ payload, colors }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
    {payload.map((entry, index) => (
      <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box 
          sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: 1,
            backgroundColor: colors ? colors[entry.value] : entry.color 
          }} 
        />
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {entry.value}
        </Typography>
      </Box>
    ))}
  </Box>
);

const TotalBarLabel = (props) => {
  const { x, y, width, value, index, data } = props;
  const dataPoint = data[index];
  const total = (dataPoint['Putts'] || 0) + (dataPoint['Strokes to Green'] || 0);

  if (total === 0) {
    return null;
  }

  return (
    <text x={x + width / 2} y={y} fill="#6b7280" textAnchor="middle" dy={-6} fontSize="12px" fontWeight="bold">
      {total.toFixed(1)}
    </text>
  );
};

const PerformanceLineChart = ({ title, data, scoreDataKey, puttsDataKey, scoreColor, puttsColor }) => (
  <ChartCard 
    title={title}
    subtitle="Average score and putts over time"
    icon={<ShowChart />}
  >
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        <Line 
          type="monotone" 
          dataKey={scoreDataKey}
          stroke={scoreColor}
          strokeWidth={3}
          dot={{ fill: scoreColor, r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls 
        />
        <Line 
          type="monotone" 
          dataKey={puttsDataKey}
          stroke={puttsColor}
          strokeWidth={3}
          dot={{ fill: puttsColor, r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls 
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

const Analytics = ({ recentRounds, recentStats, onRelativeDistanceThresholdChange }) => {
  if (!recentRounds || recentRounds.length === 0 || !recentStats) {
    return null;
  }

  const getParTypeStatsForRound = (round, par) => {
    const holes = round.round_holes.filter(h => h.par === par && h.hole_score != null && h.putts != null);
    if (holes.length === 0) return null;
    const totalScore = holes.reduce((sum, h) => sum + h.hole_score, 0); // This is correct
    const totalPutts = holes.reduce((sum, h) => sum + h.putts, 0); // This is correct
    return {
      score: totalScore / holes.length,
      putts: totalPutts / holes.length,
    };
  };

  const performanceData = recentRounds.map(r => ({
    date: new Date(r.round_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
  ];

  const correlationData = [
    {
      name: 'Par 3',
      'Achieved SZIR': recentStats.avg_score_with_szir_par3 ? parseFloat(recentStats.avg_score_with_szir_par3) : null,
      'Missed SZIR': recentStats.avg_score_without_szir_par3 ? parseFloat(recentStats.avg_score_without_szir_par3) : null,
    },
    {
      name: 'Par 4',
      'Achieved SZIR': recentStats.avg_score_with_szir_par4 ? parseFloat(recentStats.avg_score_with_szir_par4) : null,
      'Missed SZIR': recentStats.avg_score_without_szir_par4 ? parseFloat(recentStats.avg_score_without_szir_par4) : null,
    },
    {
      name: 'Par 5',
      'Achieved SZIR': recentStats.avg_score_with_szir_par5 ? parseFloat(recentStats.avg_score_with_szir_par5) : null,
      'Missed SZIR': recentStats.avg_score_without_szir_par5 ? parseFloat(recentStats.avg_score_without_szir_par5) : null,
    },
  ];

  const shortGameCorrelationData = [
    {
      name: 'Par 3',
      'Achieved SZ Par': recentStats.avg_score_with_szpar_par3 ? parseFloat(recentStats.avg_score_with_szpar_par3) : null,
      'Missed SZ Par': recentStats.avg_score_without_szpar_par3 ? parseFloat(recentStats.avg_score_without_szpar_par3) : null,
    },
    {
      name: 'Par 4',
      'Achieved SZ Par': recentStats.avg_score_with_szpar_par4 ? parseFloat(recentStats.avg_score_with_szpar_par4) : null,
      'Missed SZ Par': recentStats.avg_score_without_szpar_par4 ? parseFloat(recentStats.avg_score_without_szpar_par4) : null,
    },
    {
      name: 'Par 5',
      'Achieved SZ Par': recentStats.avg_score_with_szpar_par5 ? parseFloat(recentStats.avg_score_with_szpar_par5) : null,
      'Missed SZ Par': recentStats.avg_score_without_szpar_par5 ? parseFloat(recentStats.avg_score_without_szpar_par5) : null,
    },
  ];

  const getDistributionPercentages = (prefix) => {
    const birdie = recentStats[`${prefix}birdie_or_better_count`] || 0;
    const par = recentStats[`${prefix}par_count`] || 0;
    const bogey = recentStats[`${prefix}bogey_count`] || 0;
    const double = recentStats[`${prefix}double_bogey_count`] || 0;
    const triplePlus = recentStats[`${prefix}triple_bogey_plus_count`] || 0;
    const total = birdie + par + bogey + double + triplePlus;
    if (total === 0) return null;
    return {
      'Birdie+': birdie,
      'Par': par,
      'Bogey': bogey,
      'Dbl Bogey': double,
      'Triple+': triplePlus,
    };
  };

  const distributionData = [
    { name: 'Par 3', ...getDistributionPercentages('par3_') },
    { name: 'Par 4', ...getDistributionPercentages('par4_') },
    { name: 'Par 5', ...getDistributionPercentages('par5_') },
  ].filter(d => d['Birdie+'] || d['Par'] || d['Bogey'] || d['Dbl Bogey'] || d['Triple+']);

  const luckByParData = [
    { name: 'Par 3', '% of Holes': recentStats.total_par3_holes > 0 ? (recentStats.luck_on_par3_count / recentStats.total_par3_holes) * 100 : 0 },
    { name: 'Par 4', '% of Holes': recentStats.total_par4_holes > 0 ? (recentStats.luck_on_par4_count / recentStats.total_par4_holes) * 100 : 0 },
    { name: 'Par 5', '% of Holes': recentStats.total_par5_holes > 0 ? (recentStats.luck_on_par5_count / recentStats.total_par5_holes) * 100 : 0 },
  ];

  const luckBySzirData = [
    { 
      name: 'With SZIR', 
      'Propensity for Luck (%)': recentStats.total_szir_holes > 0 
        ? (recentStats.luck_with_szir_count / recentStats.total_szir_holes) * 100 
        : 0,
      'description': 'Holed out from >4ft after reaching the Scoring Zone in regulation.'
    },
    { 
      name: 'Without SZIR', 
      'Propensity for Luck (%)': recentStats.total_non_szir_holes > 0 
        ? (recentStats.luck_without_szir_count / recentStats.total_non_szir_holes) * 100 
        : 0,
      'description': 'Holed out from >4ft after missing the Scoring Zone in regulation (a recovery shot).'
    },
  ];

  const penaltyPropensityData = [
    { name: 'Par 3', '% of Holes with Penalty': recentStats.total_par3_holes > 0 ? (recentStats.penalty_on_par3_count / recentStats.total_par3_holes) * 100 : 0 },
    { name: 'Par 4', '% of Holes with Penalty': recentStats.total_par4_holes > 0 ? (recentStats.penalty_on_par4_count / recentStats.total_par4_holes) * 100 : 0 },
    { name: 'Par 5', '% of Holes with Penalty': recentStats.total_par5_holes > 0 ? (recentStats.penalty_on_par5_count / recentStats.total_par5_holes) * 100 : 0 },
  ];

  const penaltyImpactData = [
    {
      name: 'Par 3',
      'With Penalty': recentStats.avg_score_with_penalty_par3 ? parseFloat(recentStats.avg_score_with_penalty_par3) : null,
      'No Penalty': recentStats.avg_score_without_penalty_par3 ? parseFloat(recentStats.avg_score_without_penalty_par3) : null,
    },
    {
      name: 'Par 4',
      'With Penalty': recentStats.avg_score_with_penalty_par4 ? parseFloat(recentStats.avg_score_with_penalty_par4) : null,
      'No Penalty': recentStats.avg_score_without_penalty_par4 ? parseFloat(recentStats.avg_score_without_penalty_par4) : null,
    },
    {
      name: 'Par 5',
      'With Penalty': recentStats.avg_score_with_penalty_par5 ? parseFloat(recentStats.avg_score_with_penalty_par5) : null,
      'No Penalty': recentStats.avg_score_without_penalty_par5 ? parseFloat(recentStats.avg_score_without_penalty_par5) : null,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Performance Analytics
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Par 3 Performance */}
        {performanceData.some(d => d['Par 3 Avg Score'] != null) && (
          <PerformanceLineChart
            title="Par 3 Performance"
            data={performanceData}
            scoreDataKey="Par 3 Avg Score"
            puttsDataKey="Par 3 Avg Putts"
            scoreColor={COLORS.primary}
            puttsColor={COLORS.success}
          />
        )}

        {/* Par 4 Performance */}
        {performanceData.some(d => d['Par 4 Avg Score'] != null) && (
          <PerformanceLineChart
            title="Par 4 Performance"
            data={performanceData}
            scoreDataKey="Par 4 Avg Score"
            puttsDataKey="Par 4 Avg Putts"
            scoreColor={COLORS.primary}
            puttsColor={COLORS.success}
          />
        )}

        {/* Par 5 Performance */}
        {performanceData.some(d => d['Par 5 Avg Score'] != null) && (
          <PerformanceLineChart
            title="Par 5 Performance"
            data={performanceData}
            scoreDataKey="Par 5 Avg Score"
            puttsDataKey="Par 5 Avg Putts"
            scoreColor={COLORS.primary}
            puttsColor={COLORS.success}
          />
        )}

        {/* Score Proportion */}
        {scoreProportionData.length > 0 && (
          <ChartCard 
            title="Putts vs Strokes to Green" 
            subtitle="Understanding where your strokes come from"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scoreProportionData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, dataMax => Math.ceil(dataMax * 1.2)]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="Strokes to Green" stackId="a" fill={COLORS.primary} radius={[0, 0, 8, 8]} />
                <Bar dataKey="Putts" stackId="a" fill={COLORS.success} radius={[8, 8, 0, 0]}>
                  <LabelList content={<TotalBarLabel data={scoreProportionData} />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* SZIR Correlation */}
        {correlationData.some(d => d['Achieved SZIR'] || d['Missed SZIR']) && (
          <ChartCard 
            title="SZIR Impact on Scoring" 
            subtitle="How reaching the scoring zone affects your score"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, dataMax => Math.ceil(dataMax * 1.2)]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="Achieved SZIR" fill={COLORS.success} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Achieved SZIR" position="top" formatter={(value) => value.toFixed(1)} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
                <Bar dataKey="Missed SZIR" fill={COLORS.error} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Missed SZIR" position="top" formatter={(value) => value.toFixed(1)} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* SZ Par Correlation */}
        {shortGameCorrelationData.some(d => d['Achieved SZ Par'] || d['Missed SZ Par']) && (
          <ChartCard 
            title="SZ Par Impact on Scoring" 
            subtitle="Short game performance when in scoring zone"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={shortGameCorrelationData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, dataMax => Math.ceil(dataMax * 1.2)]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="Achieved SZ Par" fill={COLORS.success} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Achieved SZ Par" position="top" formatter={(value) => value.toFixed(1)} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
                <Bar dataKey="Missed SZ Par" fill={COLORS.error} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Missed SZ Par" position="top" formatter={(value) => value.toFixed(1)} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Penalty Propensity */}
        {penaltyPropensityData.length > 0 && (
          <ChartCard 
            title="Penalty Propensity by Par Type" 
            subtitle="Percentage of holes where a penalty was taken"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={penaltyPropensityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} unit="%" domain={[0, dataMax => Math.min(100, Math.ceil(dataMax * 1.2))]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="% of Holes with Penalty" fill={COLORS.error} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="% of Holes with Penalty" position="top" formatter={(value) => `${value.toFixed(1)}%`} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Penalty Impact */}
        {penaltyImpactData.some(d => d['With Penalty'] || d['No Penalty']) && (
          <ChartCard 
            title="Impact of Penalties on Scoring" 
            subtitle="Average score on holes with and without penalties"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={penaltyImpactData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, dataMax => Math.ceil(dataMax * 1.2)]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="No Penalty" fill={COLORS.success} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="No Penalty" position="top" formatter={(value) => value.toFixed(1)} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
                <Bar dataKey="With Penalty" fill={COLORS.error} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="With Penalty" position="top" formatter={(value) => value.toFixed(1)} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Luck by Par Type */}
        {luckByParData.length > 0 && (
          <ChartCard 
            title="Propensity for 'Luck' by Par Type" 
            subtitle="Percentage of holes with a holed shot from >4ft"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={luckByParData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="% of Holes" fill={COLORS.purple} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="% of Holes" position="top" formatter={(value) => `${value.toFixed(1)}%`} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Luck by SZIR Status */}
        {luckBySzirData.some(d => d["Propensity for Luck (%)"] > 0) && (
          <ChartCard 
            title="'Luck' by SZIR Status" 
            subtitle="Are you more likely to hole a long putt after a good or bad approach?"
            icon={<ShowChart />}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={luckBySzirData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} unit="%" domain={[0, dataMax => Math.min(100, Math.ceil(dataMax * 1.2))]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="Propensity for Luck (%)" fill={COLORS.pink} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="Propensity for Luck (%)" position="top" formatter={(value) => `${value.toFixed(1)}%`} style={{ fontSize: '12px', fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Score Distribution */}
        {distributionData.length > 0 && (
          <Box sx={{ flexBasis: '100%' }}>
            <ChartCard
              title="Score Distribution" 
              subtitle="Breakdown of your scoring patterns"
              icon={<ShowChart />}
            >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={distributionData} layout="vertical" stackOffset="expand" margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" hide={true} />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip content={<DistributionTooltip />} />
                <Legend content={(props) => <CustomLegend {...props} colors={SCORE_DISTRIBUTION_COLORS} />} wrapperStyle={{ bottom: -10, left: 20 }} />
                <Bar dataKey="Birdie+" stackId="a" fill={SCORE_DISTRIBUTION_COLORS['Birdie+']} />
                <Bar dataKey="Par" stackId="a" fill={SCORE_DISTRIBUTION_COLORS['Par']} />
                <Bar dataKey="Bogey" stackId="a" fill={SCORE_DISTRIBUTION_COLORS['Bogey']} />
                <Bar dataKey="Dbl Bogey" stackId="a" fill={SCORE_DISTRIBUTION_COLORS['Dbl Bogey']} />
                <Bar dataKey="Triple+" stackId="a" fill={SCORE_DISTRIBUTION_COLORS['Triple+']} />
              </BarChart>
            </ResponsiveContainer>
            </ChartCard>
          </Box>
        )}

        {/* Relative Distance Chart */}
        {recentStats && (
          <Box sx={{ flexBasis: '100%' }}>
          <RelativeDistanceAnalysis
            recentRounds={recentRounds}
          />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Analytics;