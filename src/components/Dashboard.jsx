import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Divider,
} from '@mui/material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';
import RoundsTable from './RoundsTable';
import Analytics from './Analytics';
import AllTimeStats from './AllTimeStats';
import DashboardFilters from './DashboardFilters';
import RecentInsights from './RecentInsights';
import FlippingGolfIcon from './FlippingGolfIcon';

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
  const hasFetchedAllTime = useRef(false); // Track if we've fetched all-time stats
  const lastFetchedFilters = useRef(null); // Track the last filters we actually fetched with
  
  useEffect(() => {
    // Effect 1: Fetch all-time stats ONCE when component first mounts
    if (user && !hasFetchedAllTime.current) {
      const fetchAllTimeData = async () => {
        try {
          const [szirStreakData, szParStreakData, allTimeStats] = await Promise.all([
            roundService.getCurrentSzirStreak(user.email),
            roundService.getCurrentSzParStreak(user.email),
            roundService.getCumulativeStats(user.email, false)
          ]);
          setSzirStreak(szirStreakData);
          setCumulativeStats(allTimeStats);
          setSzParStreak(szParStreakData);
          hasFetchedAllTime.current = true;
        } catch (err) {
          setError('Failed to load all-time stats: ' + err.message);
        }
      };
      fetchAllTimeData();
    }
  }, [user]);
  
  useEffect(() => {
    // Effect 2: Fetch filter-dependent data ONLY when filters actually change
    const fetchData = async () => {
      if (!user) return;

      // Create a key representing current filter state
      const currentFilters = `${roundLimit}-${showEligibleRoundsOnly}`;
      
      // ✅ CRITICAL FIX: Skip if we've already fetched with these exact filters
      if (lastFetchedFilters.current === currentFilters && !isInitialMount.current) {
        return;
      }

      // Mark these filters as fetched
      lastFetchedFilters.current = currentFilters;

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
  
  // ✅ Show centered flipping icon only on initial load
  if (initialLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}
      >
        <FlippingGolfIcon size={80} />
      </Box>
    );
  }
  
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sx={{ width: '100%'}}>
        <AllTimeStats
          cumulativeStats={cumulativeStats}
          szirStreak={szirStreak}
          szParStreak={szParStreak}
        />
      </Grid>

      <Grid item xs={12}><Divider /></Grid>

      <Grid item xs={12} sx={{ width: '100%'}}>
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ width: '100%'}}>
            <DashboardFilters
              roundLimit={roundLimit}
              setRoundLimit={setRoundLimit}
              showEligibleRoundsOnly={showEligibleRoundsOnly}
              setShowEligibleRoundsOnly={setShowEligibleRoundsOnly}
              isFiltering={isFiltering}
            />
          </Grid>
          <Grid item xs={12} sx={{ width: '100%'}}>
            {isFiltering ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <FlippingGolfIcon size={60} />
              </Box>
            ) : (
              <RecentInsights recentStats={recentStats} isFiltering={isFiltering} />
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ width: '100%'}}>
        <Paper {...elevatedCardStyles} sx={{ mb: 3, width: '100%'}}>
          <Typography variant="h6" component="h2" sx={{ p: 2, fontWeight: 'bold' }}>
            Recent Rounds
          </Typography>
          {isFiltering ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <FlippingGolfIcon size={60} />
            </Box>
          ) : (
            <RoundsTable rounds={recentRounds} onViewRound={onViewRound} />
          )}
        </Paper>

        {isFiltering ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <FlippingGolfIcon size={60} />
          </Box>
        ) : (
          <Analytics recentRounds={recentRounds} recentStats={recentStats} />
        )}
      </Grid>
    </Grid>
  );
};

export default Dashboard;