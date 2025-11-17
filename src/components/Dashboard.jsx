import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Alert, Typography } from "@mui/material";
import { roundService } from "../services/roundService";
import { elevatedCardStyles } from "../styles/commonStyles";
import RoundsTable from "./RoundsTable";
import Analytics from "./Analytics";
import AllTimeStats from "./AllTimeStats";
import PageHeader from "./PageHeader";
import DashboardFilters from "./DashboardFilters";
import RecentInsights from "./RecentInsights";
import FlippingGolfIcon from "./FlippingGolfIcon";

const Dashboard = ({ user, onViewRound, isActive, impersonatedUser }) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState("");
  const [recentStats, setRecentStats] = useState(null);
  const [cumulativeStats, setCumulativeStats] = useState(null);
  const [szirStreak, setSzirStreak] = useState(0);
  const [szParStreak, setSzParStreak] = useState(0);
  const [recentRounds, setRecentRounds] = useState([]);
  const [roundLimit, setRoundLimit] = useState(5);
  const [showEligibleRoundsOnly, setShowEligibleRoundsOnly] = useState(false);

  const isInitialMount = useRef(true);
  const hasFetchedAllTime = useRef(false); // Track if we've fetched all-time stats
  const wasActive = useRef(isActive); // Track previous active state

  useEffect(() => {
    // When the user being viewed changes (due to impersonation), reset the flag
    // to allow all-time stats to be re-fetched.
    hasFetchedAllTime.current = false;
  }, [impersonatedUser]);

  useEffect(() => {
    const fetchAllTimeDataIfNeeded = async () => {
      const fetchAllTimeData = async () => {
        try {
          const [szirStreakData, szParStreakData, allTimeStats] =
            await Promise.all([
              roundService.getCurrentSzirStreak(user.email),
              roundService.getCurrentSzParStreak(user.email),
              roundService.getCumulativeStats(user.email, false),
            ]);
          setSzirStreak(szirStreakData);
          setCumulativeStats(allTimeStats);
          setSzParStreak(szParStreakData);
          hasFetchedAllTime.current = true;
        } catch (err) {
          setError("Failed to load all-time stats: " + err.message);
        }
      };

      // Fetch if the component is now active and wasn't before,
      // or if the user/impersonatedUser has changed.
      if (isActive && user && (isActive !== wasActive.current || !hasFetchedAllTime.current)) {
        await fetchAllTimeData();
      }
    };
    fetchAllTimeDataIfNeeded();
    // Update the previous active state ref *after* the effect has run
    wasActive.current = isActive;
  }, [user, isActive, impersonatedUser]);

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
      setError("");

      try {
        const limit = roundLimit === 0 ? 9999 : roundLimit;
        const [roundsForTable, recentStatsData] = await Promise.all([
          roundService.getDashboardStats(
            user.email,
            limit,
            showEligibleRoundsOnly
          ),
          roundService.getRecentRoundsStats(
            user.email,
            limit,
            showEligibleRoundsOnly
          ),
        ]);
        setRecentRounds(roundsForTable);
        setRecentStats(recentStatsData);
      } catch (err) {
        setError("Failed to load dashboard data: " + err.message);
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
  }, [user, roundLimit, showEligibleRoundsOnly, isActive, impersonatedUser]);

  // ✅ Show centered flipping icon only on initial load
  if (initialLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <FlippingGolfIcon size={80} />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <PageHeader
        title="All Time Stats"
        subtitle="Golf Performance Overview"
        actions={
          <AllTimeStats
            cumulativeStats={cumulativeStats}
            szirStreak={szirStreak}
            szParStreak={szParStreak}
          />
        }
      />

      {/* Main content area with two columns on larger screens */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 3,
        }}
      >
        {/* Left Column */}
        <Box
          sx={{
            flex: "1 1 30%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: { lg: 350 },
          }}
        >
          <Paper {...elevatedCardStyles}>
            <DashboardFilters
              roundLimit={roundLimit}
              setRoundLimit={setRoundLimit}
              showEligibleRoundsOnly={showEligibleRoundsOnly}
              setShowEligibleRoundsOnly={setShowEligibleRoundsOnly}
              isFiltering={isFiltering}
            />
          </Paper>
          <Paper {...elevatedCardStyles}>
          <RecentInsights recentStats={recentStats} isFiltering={isFiltering} />

            </Paper>
        </Box>

        {/* Right Column */}
        <Box
          sx={{
            flex: "1 1 70%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Paper {...elevatedCardStyles}>
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold" }}
              >
                Recent Rounds
              </Typography>
            </Box>
            {isFiltering ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <FlippingGolfIcon size={60} />
              </Box>
            ) : (
              <RoundsTable rounds={recentRounds} onViewRound={onViewRound} />
            )}
          </Paper>
          <Paper {...elevatedCardStyles}>
          <Analytics recentRounds={recentRounds} recentStats={recentStats} />

          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
