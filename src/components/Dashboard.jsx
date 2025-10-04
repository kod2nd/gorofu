import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Skeleton,
} from '@mui/material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';
import RoundsTable from './RoundsTable';
import Analytics from './Analytics';
import AllTimeStats from './AllTimeStats';
import DashboardFilters from './DashboardFilters';
import RecentInsights from './RecentInsights';

const Dashboard = ({ user, onViewRound }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [recentStats, setRecentStats] = useState(null);
  const [cumulativeStats, setCumulativeStats] = useState(null);
  const [szirStreak, setSzirStreak] = useState(0);
  const [szParStreak, setSzParStreak] = useState(0);
  const [recentRounds, setRecentRounds] = useState([]);
  const [roundLimit, setRoundLimit] = useState(5);
  const [showEligibleRoundsOnly, setShowEligibleRoundsOnly] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Effect 1: Fetch all-time stats that are NOT affected by filters.
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
    // Effect 2: Fetch filter-dependent data on initial mount and on filter changes.
    const fetchData = async () => {
      if (!user) return;

      // Determine which loading state to set
      if (isInitialMount.current) {
        setInitialLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError('');

      try {
        const limit = roundLimit === 0 ? 9999 : roundLimit;
        const [roundsForTable, recentStatsData] = await Promise.all([
          roundService.getDashboardStats(user.email, limit, showEligibleRoundsOnly),
          roundService.getRecentRoundsStats(user.email, limit, showEligibleRoundsOnly),
        ]);
        setRecentRounds(roundsForTable);
        setRecentStats(recentStatsData);
      } catch (err) {
        setError('Failed to load dashboard data: ' + err.message);
      } finally {
        if (isInitialMount.current) {
          isInitialMount.current = false;
          setInitialLoading(false);
        } else {
          setIsFiltering(false);
        }
      }
    };

    fetchData();
  }, [user, roundLimit, showEligibleRoundsOnly]);
  
  if (initialLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AllTimeStats
          cumulativeStats={cumulativeStats}
          szirStreak={szirStreak}
          szParStreak={szParStreak}
        />
      </Grid>

      <Grid item xs={12}><Divider /></Grid>

      <Grid item xs={12} md={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DashboardFilters
              roundLimit={roundLimit}
              setRoundLimit={setRoundLimit}
              showEligibleRoundsOnly={showEligibleRoundsOnly}
              setShowEligibleRoundsOnly={setShowEligibleRoundsOnly}
              isFiltering={isFiltering}
            />
          </Grid>
          <Grid item xs={12}>
            <RecentInsights recentStats={recentStats} isFiltering={isFiltering} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper {...elevatedCardStyles} sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2" sx={{ p: 2, fontWeight: 'bold' }}>
            Recent Rounds
          </Typography>
          {isFiltering ? (
            <Box sx={{ p: 2 }}><Skeleton variant="rounded" height={200} /></Box>
          ) : (
            <RoundsTable rounds={recentRounds} onViewRound={onViewRound} />
          )}
        </Paper>

        {isFiltering ? (
          <Skeleton variant="rounded" height={400} />
        ) : (
          <Analytics recentRounds={recentRounds} recentStats={recentStats} />
        )}
      </Grid>
    </Grid>
  );
};

export default Dashboard;