import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';

const StatCard = ({ label, value, percentage }) => (
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
      <Box sx={{ height: '1.25rem' }} /> // Placeholder to maintain alignment
    )}
  </Paper>
);

const Dashboard = ({ user, onViewRound }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentStats, setRecentStats] = useState(null);
  const [cumulativeStats, setCumulativeStats] = useState(null);
  const [szirStreak, setSzirStreak] = useState(0);
  const [recentRounds, setRecentRounds] = useState([]);
  const [roundLimit, setRoundLimit] = useState(5);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, roundLimit]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const limit = roundLimit === 0 ? 9999 : roundLimit;
      // Fetch data in parallel for better performance
      const [roundsForTable, szirStreakData, allTimeStats, recentStatsData] = await Promise.all([
        roundService.getDashboardStats(user.email, limit), // Pass the selected limit
        roundService.getCurrentSzirStreak(user.email),
        roundService.getCumulativeStats(user.email),
        roundService.getRecentRoundsStats(user.email, limit) // 0 for All-Time
      ]);
      setRecentRounds(roundsForTable);
      setSzirStreak(szirStreakData);
      setCumulativeStats(allTimeStats);
      setRecentStats(recentStatsData);
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      {/* Left Column: Recent Performance */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={3}>
          {/* Recent Rounds Insights Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography {...sectionHeaderStyles} sx={{ mb: 0 }}>Recent Rounds Insights</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={roundLimit}
                  onChange={(e) => setRoundLimit(e.target.value)}
                >
                  <MenuItem value={5}>Last 5</MenuItem>
                  <MenuItem value={10}>Last 10</MenuItem>
                  <MenuItem value={20}>Last 20</MenuItem>
                  <MenuItem value={0}>All-Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {recentStats && recentStats.total_holes_played > 0 ? (
              <Grid container spacing={2}>
                {recentStats.avg_par3_score && (
                  <Grid item size={{xs:6,sm:4,md:3}}> <StatCard label="Avg Score (Par 3)" value={Number(recentStats.avg_par3_score).toFixed(1)} /> </Grid>
                )}
                {recentStats.avg_par4_score && (
                  <Grid item size={{xs:6,sm:4,md:3}}> <StatCard label="Avg Score (Par 4)" value={Number(recentStats.avg_par4_score).toFixed(1)} /> </Grid>
                )}
                {recentStats.avg_par5_score && (
                  <Grid item size={{xs:6,sm:4,md:3}}> <StatCard label="Avg Score (Par 5)" value={Number(recentStats.avg_par5_score).toFixed(1)} /> </Grid>
                )}
                <Grid item size={{xs:6,sm:4,md:3}}> <StatCard label="Avg Putts / Hole" value={recentStats.avg_putts_per_hole ? Number(recentStats.avg_putts_per_hole).toFixed(1) : '-'} /> </Grid>
                <Grid item size={{xs:6,sm:4,md:3}}> <StatCard label="Total Holes" value={recentStats.total_holes_played} /> </Grid>
                <Grid item size={{xs:6,sm:4,md:3}}> <StatCard label="SZIR %" value={recentStats.szir_percentage ? `${Number(recentStats.szir_percentage).toFixed(0)}%` : '-'} /> </Grid>
                <Grid item size={{xs:6,sm:4,md:3}}>
                  <StatCard label="Holeout w/in 3 Shots" value={recentStats.holeout_within_3_shots_count} percentage={recentStats.total_holes_played > 0 ? (recentStats.holeout_within_3_shots_count / recentStats.total_holes_played) * 100 : 0} />
                </Grid>
                <Grid item size={{xs:6,sm:4,md:3}}>
                  <StatCard label="Holes w/ >1 Putt <4ft" value={recentStats.multi_putt_4ft_holes} percentage={recentStats.total_holes_played > 0 ? (recentStats.multi_putt_4ft_holes / recentStats.total_holes_played) * 100 : 0} />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <StatCard label="Luck Stat (Holeout >4ft)" value={recentStats.holeout_from_outside_4ft_count} percentage={recentStats.total_holes_played > 0 ? (recentStats.holeout_from_outside_4ft_count / recentStats.total_holes_played) * 100 : 0} />
                </Grid>
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center', width: '100%' }}>
                <Typography color="text.secondary">No hole-by-hole data recorded for the selected rounds.</Typography>
              </Paper>
            )}
          </Grid>

          {/* Recent Rounds Table */}
          <Grid item xs={12}>
            <Paper {...elevatedCardStyles}>
              <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Recent Rounds
              </Typography>
              {recentRounds.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell align="right">Score</TableCell>
                        <TableCell align="right">Putts</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentRounds.map((round) => (
                        <TableRow key={round.id} hover>
                          <TableCell>{new Date(round.round_date).toLocaleDateString()}</TableCell>
                          <TableCell>{round.courses.name}</TableCell>
                          <TableCell align="right">{round.total_score}</TableCell>
                          <TableCell align="right">{round.total_putts}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton onClick={() => onViewRound(round.id)} size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No rounds recorded yet.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Grid>

      {/* Right Column: All-Time Stats */}
      <Grid item siz={{xs:12,md:4}}>
        <Paper {...elevatedCardStyles} sx={{ position: 'sticky', top: '88px' }}>
          <Typography {...sectionHeaderStyles}>All-Time Stats</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}> <StatCard label="Current SZIR Streak" value={szirStreak} /> </Grid>
            <Grid item xs={6}> <StatCard label="Total Rounds" value={cumulativeStats?.total_rounds_played} /> </Grid>
            <Grid item xs={12}> <StatCard label="Total Holes Played" value={cumulativeStats?.total_holes_played} /> </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;