import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Tooltip } from '@mui/material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';
import RoundsTable from './RoundsTable';
import Analytics from './Analytics';

const StatCard = ({ label, value, percentage, tooltip }) => (
  <Tooltip title={tooltip || ''} arrow placement="top">
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
  </Tooltip>
);

const Dashboard = ({ user, onViewRound }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentStats, setRecentStats] = useState(null);
  const [cumulativeStats, setCumulativeStats] = useState(null);
  const [szirStreak, setSzirStreak] = useState(0);
  const [szParStreak, setSzParStreak] = useState(0);
  const [recentRounds, setRecentRounds] = useState([]);
  const [roundLimit, setRoundLimit] = useState(5);
  const [showEligibleRoundsOnly, setShowEligibleRoundsOnly] = useState(false);

  useEffect(() => {
    // Fetch all-time stats only when the user changes. These are unaffected by filters.
    if (user) {
      const fetchAllTimeData = async () => {
        try {
          const [szirStreakData, szParStreakData, allTimeStats] = await Promise.all([
            roundService.getCurrentSzirStreak(user.email),
            roundService.getCurrentSzParStreak(user.email),
            roundService.getCumulativeStats(user.email, false) // Always fetch all cumulative stats
          ]);
          setSzirStreak(szirStreakData);
          setCumulativeStats(allTimeStats);
          setSzParStreak(szParStreakData);
        } catch (err) {
          setError('Failed to load all-time stats: ' + err.message);
        }
      };
      fetchAllTimeData();
    }
  }, [user]);

  useEffect(() => {
    // Fetch recent/filtered stats when user or filters change.
    if (user) {
      const fetchRecentData = async () => {
        setLoading(true);
        setError('');
        try {
          const limit = roundLimit === 0 ? 9999 : roundLimit;
          const [roundsForTable, recentStatsData] = await Promise.all([
            roundService.getDashboardStats(user.email, limit, showEligibleRoundsOnly),
            roundService.getRecentRoundsStats(user.email, limit, showEligibleRoundsOnly)
          ]);
          setRecentRounds(roundsForTable);
          setRecentStats(recentStatsData);
        } catch (err) {
          setError('Failed to load dashboard data: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRecentData();
    }
  }, [user, roundLimit, showEligibleRoundsOnly]);
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      {/* All-Time Stats (Unaffected by filters) */}
      <Grid item xs={12} sx={{ width: '100%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>All-Time Stats</Typography>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} sm={4} md={3}>
                <Box sx={{ p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, background: (theme) => theme.palette.action.hover, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{szirStreak}</Typography>
                    <Typography variant="h6" color="text.secondary">SZIR Streak</Typography>
                </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
                <Box sx={{ p: 2, border: '2px solid', borderColor: 'secondary.main', borderRadius: 2, background: (theme) => theme.palette.action.hover, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>{szParStreak}</Typography>
                    <Typography variant="h6" color="text.secondary">SZ Par Streak</Typography>
                </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}> <StatCard label="Total Rounds" value={cumulativeStats?.total_rounds_played} /> </Grid>
                <Grid item xs={6} sm={4}> <StatCard label="Eligible Rounds" value={cumulativeStats?.eligible_rounds_count} /> </Grid>
                <Grid item xs={12} sm={4}> <StatCard label="Total Holes" value={cumulativeStats?.total_holes_played} /> </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Divider */}
      <Grid item xs={12}><Divider /></Grid>

      {/* Left Column: Filters & Insights */}
      <Grid item xs={12} md={4} sx={{ width: '100%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Filters */}
            <Box>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Filters</Typography>
              <FormControl fullWidth size="small">
                <Select value={roundLimit} onChange={(e) => setRoundLimit(e.target.value)}>
                  <MenuItem value={5}>Last 5 Rounds</MenuItem>
                  <MenuItem value={10}>Last 10 Rounds</MenuItem>
                  <MenuItem value={20}>Last 20 Rounds</MenuItem>
                  <MenuItem value={0}>All-Time</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Switch checked={showEligibleRoundsOnly} onChange={(e) => setShowEligibleRoundsOnly(e.target.checked)} />}
                label="Eligible Rounds Only"
                sx={{ mt: 1 }}
              />
            </Box>
            </Box>
            </Paper>
      </Grid>
            {/* Insights */}
      <Grid item xs={12} md={4} sx={{ width: '100%', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Recent Insights</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ width: '100%', p: 2 }}>
              {recentStats && recentStats.total_holes_played > 0 ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}> <StatCard label="Avg Score" value={Number(recentStats.avg_par4_score).toFixed(1)} tooltip="Average score on par 4 holes." /> </Grid>
                  <Grid item xs={6}> <StatCard label="Avg Putts" value={recentStats.avg_putts_per_hole ? Number(recentStats.avg_putts_per_hole).toFixed(1) : '-'} tooltip="Average number of putts per hole." /> </Grid>
                  <Grid item xs={6}> <StatCard label="SZIR %" value={recentStats.szir_percentage ? `${Number(recentStats.szir_percentage).toFixed(0)}%` : '-'} tooltip="Scoring Zone in Regulation %" /> </Grid>
                  <Grid item xs={6}> <StatCard label="SZ Par %" value={recentStats.holeout_within_3_shots_count} percentage={recentStats.szir_count > 0 ? (recentStats.holeout_within_3_shots_count / recentStats.szir_count) * 100 : 0} tooltip="SZ Par Conversion %" /> </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>No data for selected filters.</Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Right Column: Analytics Charts */}
      <Grid item xs={12} md={8} sx={{ width: '100%' }}>
        <Analytics recentRounds={recentRounds} recentStats={recentStats} sx={{ width: '100%' }} />
      </Grid>

      {/* Recent Rounds Table (Full Width Below) */}
      <Grid item xs={12}  sx={{ width: '100%', p: 2 }}>
        <Paper {...elevatedCardStyles}>
          <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Recent Rounds
          </Typography>
          <RoundsTable rounds={recentRounds} onViewRound={onViewRound} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;