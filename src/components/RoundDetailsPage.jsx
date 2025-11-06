import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Card,
  CardContent,
  Chip,
  Tabs, Tab, useTheme, useMediaQuery, ToggleButtonGroup, ToggleButton
} from "@mui/material";
import { Stack } from "@mui/system";
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  GolfCourse as GolfCourseIcon,
  Score as ScoreIcon,
  TrendingUp as TrendingUpIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { roundService } from "../services/roundService";
import {
  elevatedCardStyles,
  sectionHeaderStyles,
} from "../styles/commonStyles";
import RoundInsights from "./RoundInsights";
import ScoringBiasSlider from "./ScoringBiasSlider";
import ScorecardTable from "./ScorecardTable";

const StatItem = ({ label, value, size = "medium" }) => (
  <Box sx={{ textAlign: "center", p: 1 }}>
    <Typography
      variant={size === "small" ? "caption" : "body2"}
      color="text.secondary"
    >
      {label}
    </Typography>
    <Typography
      variant={size === "small" ? "h6" : "h5"}
      fontWeight="bold"
      color="primary.main"
    >
      {value}
    </Typography>
  </Box>
);

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      p: 2,
      bgcolor: "grey.50",
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
  </Box>
);


const RoundDetailsPage = ({ roundId, user, userProfile, onEdit, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [currentScoringBias, setCurrentScoringBias] = useState(userProfile?.scoring_bias ?? 1);

  const handleBiasChange = (event, newBias) => {
    if (newBias !== null) {
      setCurrentScoringBias(newBias);
    }
  };

  useEffect(() => {
    if (roundId && user) {
      const fetchRound = async () => {
        try {
          setLoading(true);
          setError("");
          const roundData = await roundService.getRoundWithHoles(
            roundId,
            user.email
          );
          setRound(roundData);
        } catch (err) {
          setError("Failed to load round details: " + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRound();
    }
  }, [roundId, user]);

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
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 3,
          background: "linear-gradient(135deg, #007991 0%, #78ffd6 100%)",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems="center"
        >
          <Box
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              border: "4px solid rgba(255, 255, 255, 0.4)",
            }}
          >
            <GolfCourseIcon sx={{ fontSize: { xs: 40, sm: 50 } }} />
          </Box>
          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
            >
              {round.courses.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
              {new Date(round.round_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.5)",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(round.id)}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
              }}
            >
              Edit
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Round Details */}

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
            {/* Detailed Information */}
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
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <DetailItem
                  label="Scoring Zone Level"
                  value={round.scoring_zone_level}
                />
                <DetailItem
                  label="Round Type"
                  value={
                    round.round_type?.replace("_", " ").toUpperCase() ||
                    "18 HOLES"
                  }
                />
                <DetailItem
                  label="Total Penalties"
                  value={round.total_penalties || 0}
                />
                <DetailItem
                  label="Eligible"
                  value={round.is_eligible_round ? "✓" : "✗"}
                />
                <DetailItem label="Tee Box" value={round.tee_box} />
                <DetailItem
                  label="Holes Played"
                  value={round.total_holes_played}
                />
                <DetailItem label="Putts Taken" value={round.total_putts} />
                <DetailItem label="Round Score" value={round.total_score} />
              </Box>
            </Box>
          </Paper>
        )}
        {/* Scorecard */}
        {(isMobile ? activeTab === 0 : true) && (
          <Paper {...elevatedCardStyles}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography {...sectionHeaderStyles}>
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
            <Typography {...sectionHeaderStyles} sx={{mb: 2}}>
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
