import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, Alert, Typography } from "@mui/material";
import { userService } from "../services/userService";
import { roundService } from "../services/roundService";
import { elevatedCardStyles } from "../styles/commonStyles";
import RoundsTable from "./RoundsTable";
import Analytics from "./Analytics";
import AllTimeStats from "./AllTimeStats";
import PageHeader from "./PageHeader";
import DashboardFilters from "./DashboardFilters";
import RecentInsights from "./RecentInsights";
import FlippingGolfIcon from "./FlippingGolfIcon";
import CoachNotes from "./CoachNotes";

const Dashboard = ({ user, onViewRound, isActive, impersonatedUser, userProfile }) => {
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
  const [coach, setCoach] = useState(null);

  const isInitialMount = useRef(true);
  const hasFetchedAllTime = useRef(false);
  const wasActive = useRef(isActive);
  
  // ✅ Track the last fetched filter state to prevent refetching with same filters
  const lastFetchedFilters = useRef(null);
  const lastFetchedUser = useRef(null);

    // ✅ Use impersonated user data when available
  const currentUser = impersonatedUser || user;

  useEffect(() => {
    // When the user being viewed changes (due to impersonation), reset flags
    if (impersonatedUser !== lastFetchedUser.current) {
      hasFetchedAllTime.current = false;
      lastFetchedFilters.current = null;
      lastFetchedUser.current = impersonatedUser;
    }
  }, [impersonatedUser]);

  useEffect(() => {
    const fetchAllTimeDataIfNeeded = async () => {
      const fetchAllTimeData = async (isImpersonating) => {
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
        await fetchAllTimeData(!!impersonatedUser);
      }
    };
    fetchAllTimeDataIfNeeded();
    wasActive.current = isActive;
  }, [user, isActive, impersonatedUser, userProfile]);

useEffect(() => {
    const loadCoach = async () => {
      // If the user has a profile, try to load their coach.
      if (user?.id) {
        try {
          // Use the service to get the coach details
          const coachData = await userService.getCoachForStudent(user.id);
          setCoach(coachData); // This will be null if no coach is found
        } catch (err) {
          console.error("Failed to load coach details:", err);
          setCoach(null); // Clear coach on error
        }
      } else {
        setCoach(null); // No user profile, so no coach
      }
    };
    loadCoach();
  }, [userProfile, user]);


  useEffect(() => {
    // Effect 2: Fetch filter-dependent data ONLY when filters actually change or first mount
    const fetchData = async () => {
      // Only fetch if the user is available
      if (!user) return;

      // ✅ Create a filter state key
      const currentFiltersKey = `${roundLimit}-${showEligibleRoundsOnly}-${user.email}`;
      
      // ✅ Skip if we've already fetched with these exact filters (prevents refetch on tab switch)
      if (lastFetchedFilters.current === currentFiltersKey && !isInitialMount.current) {
        return;
      }

      // ✅ Mark these filters as fetched
      lastFetchedFilters.current = currentFiltersKey;

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
  }, [user, roundLimit, showEligibleRoundsOnly]); // ✅ Removed isActive and impersonatedUser from deps

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
          {/* Conditionally render Coach's Notes for students */}
          {coach && (
            <CoachNotes studentId={user.id} userProfile={userProfile} />
          )}
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