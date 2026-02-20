import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Score as ScoreIcon,
  GolfCourse as GolfCourseIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { roundService } from "../services/roundService";
import ScorecardTable from "./ScorecardTable";
import RoundInsights from "./RoundInsights";
import ScoringBiasSlider from "./ScoringBiasSlider";
import { elevatedCardStyles, sectionHeaderStyles } from "../styles/commonStyles";
import { alpha } from "@mui/material/styles";
import PageHeader from "./PageHeader";

const DetailItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1" fontWeight="medium">{value}</Typography>
  </Box>
);

const InfoTile = ({ label, value, icon: Icon, tone = "default" }) => (
  <Paper
    elevation={0}
    sx={(theme) => {
      const toneColor =
        tone === "success"
          ? theme.palette.success.main
          : tone === "warning"
          ? theme.palette.warning.main
          : tone === "error"
          ? theme.palette.error.main
          : theme.palette.primary.main;

      return {
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(theme.palette.text.primary, 0.10),
        background: alpha(theme.palette.text.primary, 0.02),
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.10)}`,
          borderColor: alpha(toneColor, 0.25),
          background: alpha(toneColor, 0.04),
        },
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
      };
    }}
  >
    <Box
      sx={(theme) => ({
        width: 40,
        height: 40,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        bgcolor: alpha(theme.palette.primary.main, 0.10),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      })}
    >
      {Icon ? <Icon sx={{ fontSize: 22 }} /> : null}
    </Box>

    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          lineHeight: 1.2,
        }}
        noWrap
      >
        {label}
      </Typography>

      <Typography

        sx={{ fontWeight: 800, mt: 0.75, lineHeight: 1.1, letterSpacing: "-0.02em" }}
        noWrap
      >
        {value ?? "–"}
      </Typography>
    </Box>
  </Paper>
);


const RoundDetailsPage = ({ roundId, user, userProfile, onEdit, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentScoringBias, setCurrentScoringBias] = useState(userProfile?.scoring_bias ?? 1);
  
  // ✅ Track if we've already fetched for this roundId
  const hasFetchedRef = useRef(false);
  const lastFetchedRoundId = useRef(null);

  const handleBiasChange = (event, newBias) => {
    if (newBias !== null) {
      setCurrentScoringBias(newBias);
    }
  };

  useEffect(() => {
    // ✅ Only fetch if:
    // 1. We have roundId and user
    // 2. We haven't fetched yet OR the roundId changed
    if (roundId && user) {
      if (hasFetchedRef.current && lastFetchedRoundId.current === roundId) {
        // Already fetched this round, skip
        return;
      }

      const fetchRound = async () => {
        try {
          setLoading(true);
          setError("");
          const roundData = await roundService.getRoundWithHoles(
            roundId,
            user.email
          );
          setRound(roundData);
          
          // ✅ Mark as fetched
          hasFetchedRef.current = true;
          lastFetchedRoundId.current = roundId;
        } catch (err) {
          setError("Failed to load round details: " + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRound();
    }
  }, [roundId, user]);

  // ... rest of your component stays exactly the same
  
  const insightsData = useMemo(() => {
    if (!round) return {};
    const scoringHoles = round.holes.filter(
      (h) => h.hole_score && (h.putts !== null || h.holeout_from_outside_4ft)
    );

    return {
      totalScore: round.total_score,
      totalPenalties: round.total_penalties,
      totalHolesPlayed: scoringHoles.length,
      totalSZIR: round.holes.filter((h) => h.scoring_zone_in_regulation).length,
      totalPutts: round.total_putts,
      totalPuttsWithin4ft: round.holes.reduce(
        (sum, h) => sum + (h.putts_within4ft || 0),
        0
      ),
      holesWithMoreThanOnePuttWithin4ft: round.holes.filter(
        (h) => h.putts_within4ft > 1
      ).length,
      totalHoleoutFromOutside4ft: round.holes.filter(
        (h) => h.holeout_from_outside_4ft
      ).length,
      totalHoleoutWithin3Shots: round.holes.filter(
        (h) => h.holeout_within_3_shots_scoring_zone
      ).length,
    };
  }, [round]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!round) return <Typography>No round data found.</Typography>;

  const playedHoles = round.holes.filter((hole) => hole.played);

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header Section */}
      <PageHeader
        title={round.courses?.name}
        subtitle={new Date(round.round_date).toLocaleDateString("en-UK", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        icon={<GolfCourseIcon />}
        chips={[
          { label: round.tee_box ? `Tee: ${round.tee_box}` : "Tee: –", color: "info" },
          {
            label: round.round_type ? round.round_type.replace("_", " ").toUpperCase() : "–",
            color: "default",
          },
          {
            label: round.is_eligible_round ? "Eligible ✓" : "Not eligible",
            color: round.is_eligible_round ? "success" : "warning",
          },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(round.id)}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800, px: 2.5 }}
            >
              Edit
            </Button>
          </Stack>
        }
      />

      <Divider sx={{ my: 2 }} />

      {/* Tabs for Mobile Navigation */}
      {isMobile && (
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab icon={<ScoreIcon />} label="Scorecard" />
            <Tab icon={<GolfCourseIcon />} label="Details" />
            <Tab icon={<TrendingUpIcon />} label="Insights" />
          </Tabs>
        </Paper>
      )}
  
      {/* Content based on active tab (mobile) or all content (desktop) */}
      <Box sx={{ display: "block", gap: 2 }}>
        {(isMobile ? activeTab === 1 : true) && (
          <Paper {...elevatedCardStyles}>
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Round Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                <InfoTile label="Round Score" value={round.total_score} icon={ScoreIcon} />
                <InfoTile label="Putts" value={round.total_putts} icon={TrendingUpIcon} />
                <InfoTile label="Penalties" value={round.total_penalties || 0} icon={TrendingUpIcon} />
                <InfoTile label="Holes Played" value={round.total_holes_played} icon={GolfCourseIcon} />

                <InfoTile label="Tee Box" value={round.tee_box} icon={GolfCourseIcon} />
                <InfoTile
                  label="Round Type"
                  value={round.round_type?.replace("_", " ").toUpperCase() || "18 HOLES"}
                  icon={GolfCourseIcon}
                />
                <InfoTile label="SZ Level" value={round.scoring_zone_level} icon={TrendingUpIcon} />

                <InfoTile
                  label="Eligible"
                  value={round.is_eligible_round ? "Eligible ✓" : "Not eligible ✗"}
                  icon={TrendingUpIcon}
                  tone={round.is_eligible_round ? "success" : "warning"}
                />
              </Box>
            </Box>
          </Paper>
        )}
        
        {/* Scorecard */}
        {(isMobile ? activeTab === 0 : true) && (
          <Paper {...elevatedCardStyles}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Scorecard {isMobile && '(Scroll to view)'}
              </Typography>
            </Box>
            <ScoringBiasSlider 
              currentScoringBias={currentScoringBias} 
              handleBiasChange={handleBiasChange} 
            />
            <ScorecardTable holes={round.holes} scoringBias={currentScoringBias} />
          </Paper>
        )}

        {/* Insights */}
        {(isMobile ? activeTab === 2 : true) && (
          <Paper {...elevatedCardStyles}>
            <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 2 }}
              >
              Round Insights
            </Typography>
            <RoundInsights insightsData={insightsData} />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RoundDetailsPage;