import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Cell } from 'recharts';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics = ({ recentRounds, recentStats }) => {
  if (!recentRounds || recentRounds.length === 0 || !recentStats) {
    return null; // Don't render anything if there's no data
  }

  // Helper to calculate average score and putts for a specific par type in a round
  const getParTypeStats = (round, par) => {
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
    'Par 3 Avg Score': getParTypeStats(r, 3)?.score,
    'Par 3 Avg Putts': getParTypeStats(r, 3)?.putts,
    'Par 4 Avg Score': getParTypeStats(r, 4)?.score,
    'Par 4 Avg Putts': getParTypeStats(r, 4)?.putts,
    'Par 5 Avg Score': getParTypeStats(r, 5)?.score,
    'Par 5 Avg Putts': getParTypeStats(r, 5)?.putts,
  })).reverse();

  const scoreProportionData = [
    { 
      name: 'Par 3', 
      'Putts': recentStats.avg_putts_par3 ? parseFloat(recentStats.avg_putts_par3) : 0,
      'Strokes to Green': recentStats.avg_par3_score ? parseFloat(recentStats.avg_par3_score) - parseFloat(recentStats.avg_putts_par3) : 0,
    },
    { 
      name: 'Par 4', 
      'Putts': recentStats.avg_putts_par4 ? parseFloat(recentStats.avg_putts_par4) : 0,
      'Strokes to Green': recentStats.avg_par4_score ? parseFloat(recentStats.avg_par4_score) - parseFloat(recentStats.avg_putts_par4) : 0,
    },
    { 
      name: 'Par 5', 
      'Putts': recentStats.avg_putts_par5 ? parseFloat(recentStats.avg_putts_par5) : 0,
      'Strokes to Green': recentStats.avg_par5_score ? parseFloat(recentStats.avg_par5_score) - parseFloat(recentStats.avg_putts_par5) : 0,
    },
  ].filter(d => (d['Putts'] + d['Strokes to Green']) > 0);

  const correlationData = [
    { name: 'SZIR (Par 3)', 'Avg Score': parseFloat(recentStats.avg_score_with_szir_par3).toFixed(2) },
    { name: 'SZIR (Par 4)', 'Avg Score': parseFloat(recentStats.avg_score_with_szir_par4).toFixed(2) },
    { name: 'SZIR (Par 5)', 'Avg Score': parseFloat(recentStats.avg_score_with_szir_par5).toFixed(2) },
    { name: 'Missed SZIR', 'Avg Score': parseFloat(recentStats.avg_score_without_szir).toFixed(2) },
    { name: 'Achieved SZ Par', 'Avg Score': parseFloat(recentStats.avg_score_with_szpar).toFixed(2) },
    { name: 'Missed SZ Par', 'Avg Score': parseFloat(recentStats.avg_score_without_szpar).toFixed(2) },
  ];

  const scoreDistributionData = [
    { name: 'Birdie or Better', value: recentStats.birdie_or_better_count },
    { name: 'Par', value: recentStats.par_count },
    { name: 'Bogey', value: recentStats.bogey_count },
    { name: 'Double Bogey+', value: recentStats.double_bogey_plus_count },
  ].filter(d => d.value > 0);

  return (
    <Grid container spacing={3} sx={{ width: '100%', p: 2 }}>
      <Grid item xs={12} lg={6} sx={{ width: '45%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ width: '100%', p: 2 }}>
          <Typography {...sectionHeaderStyles}>Par 3 Performance</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
      </Grid>
      <Grid item xs={12} lg={6} sx={{ width: '45%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ width: '100%', p: 2 }}>
          <Typography {...sectionHeaderStyles}>Par 4 Performance</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
      </Grid>
      <Grid item xs={12} lg={6} sx={{ width: '45%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ width: '100%', p: 2 }}>
          <Typography {...sectionHeaderStyles}>Par 5 Performance</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
      </Grid>
      <Grid item xs={12} lg={6} sx={{ width: '45%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ width: '100%', p: 2 }}>
          <Typography {...sectionHeaderStyles}>Score Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={scoreDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {scoreDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={6} sx={{ width: '45%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ width: '100%', p: 2 }}>
          <Typography {...sectionHeaderStyles}>Putts as Proportion of Score</Typography>
          <ResponsiveContainer width="100%" height={300}>
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
      </Grid>
      <Grid item xs={12} lg={6} sx={{ width: '100%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ width: '100%', p: 2 }}>
          <Typography {...sectionHeaderStyles}>Score Correlation</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={correlationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Avg Score" name="Average Score">
                {correlationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Analytics;