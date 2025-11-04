import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
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

const Dashboard = ({ user, onViewRound, isActive }) => {
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
  
  useEffect(() => {
    // Effect 1: Fetch all-time stats ONCE when component first mounts
    if (isActive && user && !hasFetchedAllTime.current) {
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
  }, [user, isActive]);
  
  useEffect(() => {
    // Effect 2: Fetch filter-dependent data when page is active or filters change
    const fetchData = async () => {
      // Only fetch if the page is active and the user is available
      if (!isActive || !user) return;
      
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
  }, [user, roundLimit, showEligibleRoundsOnly, isActive]);
  
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AllTimeStats
        cumulativeStats={cumulativeStats}
        szirStreak={szirStreak}
        szParStreak={szParStreak}
      />

      <Divider />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <DashboardFilters
          roundLimit={roundLimit}
          setRoundLimit={setRoundLimit}
          showEligibleRoundsOnly={showEligibleRoundsOnly}
          setShowEligibleRoundsOnly={setShowEligibleRoundsOnly}
          isFiltering={isFiltering}
        />
        {isFiltering ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <FlippingGolfIcon size={60} />
          </Box>
        ) : (
          <RecentInsights recentStats={recentStats} isFiltering={isFiltering} />
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper {...elevatedCardStyles}>
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
      </Box>
    </Box>
  );
};

export default Dashboard;