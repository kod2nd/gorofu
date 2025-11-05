import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

const MobileScorecardTable = ({ holes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const rowDefinitions = [
    {
      key: "par",
      label: "Par",
      getValue: (hole) => hole.par || "-",
      icon: "⛳",
    },
    {
      key: "score",
      label: "Score",
      getValue: (hole) => hole.hole_score || "-",
      icon: "🎯",
    },
    {
      key: "putts",
      label: "Putts",
      getValue: (hole) => hole.putts || "-",
      icon: "🏌️",
    },
    {
      key: "szir",
      label: "SZIR",
      getValue: (hole) =>
        hole.hole_score ? (hole.scoring_zone_in_regulation ? "✓" : "✗") : "-",
      icon: "🎪",
    },
    {
      key: "sz_par",
      label: "SZ Par",
      getValue: (hole) =>
        hole.hole_score
          ? hole.holeout_within_3_shots_scoring_zone
            ? "✓"
            : "✗"
          : "-",
      icon: "⭐",
    },
    {
      key: "putts_4ft",
      label: "Putts <4ft",
      getValue: (hole) => hole.putts_within4ft || "-",
      icon: "📏",
    },
    {
      key: "luck",
      label: "Luck",
      getValue: (hole) =>
        hole.hole_score ? (hole.holeout_from_outside_4ft ? "✓" : "-") : "-",
      icon: "🍀",
    },
    {
      key: "penalties",
      label: "Penalties",
      getValue: (hole) => hole.penalty_shots || "-",
      icon: "⚠️",
    },
  ];

  return (
    <Box
      sx={{
        height: isMobile ? "60vh" : "70vh",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
      }}
    >
      <TableContainer
        sx={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          "&::-webkit-scrollbar": {
            width: 8,
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: theme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.primary.main,
            borderRadius: 4,
          },
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            "& .MuiTableCell-root": {
              padding: "10px 6px",
              fontSize: "0.75rem",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
              borderRight: `1px solid ${theme.palette.primary.dark}`,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 20,
                  backgroundColor: theme.palette.primary.main,
                  minWidth: 90,
                  textAlign: "center",
                  borderRight: `2px solid ${theme.palette.primary.dark}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <span>🏌️‍♂️</span>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "white" }}
                  >
                    Hole
                  </Typography>
                </Box>
              </TableCell>
              {Array.from({ length: 18 }, (_, i) => (
                <TableCell
                  key={i}
                  align="center"
                  sx={{
                    minWidth: 52,
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    borderRight: `1px solid ${theme.palette.divider}`,
                    background: `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[100]} 100%)`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", lineHeight: 1 }}
                    >
                      {i + 1}
                    </Typography>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.primary.main,
                        mt: 0.25,
                        opacity: 0.6,
                      }}
                    />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowDefinitions.map((rowDef, rowIndex) => (
              <TableRow
                key={rowDef.key}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&:hover": {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 15,
                    backgroundColor:
                      rowIndex % 2 === 0
                        ? "background.paper"
                        : theme.palette.action.hover,
                    fontWeight: "bold",
                    borderRight: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: "3px 0 6px rgba(0,0,0,0.1)",
                    minWidth: 90,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}10 0%, ${theme.palette.grey[100]} 100%)`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.9rem",
                        opacity: 0.8,
                      }}
                    >
                      {rowDef.icon}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        textAlign: "left",
                        flex: 1,
                      }}
                    >
                      {rowDef.label}
                    </Typography>
                  </Box>
                </TableCell>
                {holes.map((hole, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      minWidth: 52,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      ...(rowDef.key === "score" &&
                        hole.hole_score && {
                          color:
                            hole.hole_score < hole.par
                              ? "success.main"
                              : hole.hole_score > hole.par
                              ? "error.main"
                              : "inherit",
                          fontWeight: "bold",
                          backgroundColor:
                            hole.hole_score < hole.par
                              ? theme.palette.success.light + "40"
                              : hole.hole_score > hole.par
                              ? theme.palette.error.light + "40"
                              : "inherit",
                        }),
                      ...(rowDef.key === "penalties" &&
                        hole.penalty_shots > 0 && {
                          color: "error.main",
                          fontWeight: "bold",
                          backgroundColor: theme.palette.error.light + "40",
                        }),
                      ...(rowDef.key === "szir" &&
                        hole.scoring_zone_in_regulation && {
                          backgroundColor: theme.palette.success.light + "30",
                        }),
                      ...(rowDef.key === "sz_par" &&
                        hole.holeout_within_3_shots_scoring_zone && {
                          backgroundColor: theme.palette.info.light + "30",
                        }),
                      ...(rowDef.key === "luck" &&
                        hole.holeout_from_outside_4ft && {
                          backgroundColor: theme.palette.warning.light + "30",
                        }),
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        borderRadius: 1,
                        py: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      >
                        {rowDef.getValue(hole)}
                      </Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Legend Footer */}
      <Box
        sx={{
          padding: 1.5,
          backgroundColor: theme.palette.grey[50],
          borderTop: `2px solid ${theme.palette.divider}`,
          fontSize: "0.7rem",
          color: theme.palette.text.secondary,
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">
              SZIR:
            </Typography>
            <Typography variant="caption">
              Scoring Zone In Regulation
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">
              SZ Par:
            </Typography>
            <Typography variant="caption">Scoring Zone Par</Typography>
          </Box>
          <Typography variant="caption">
            | Scroll horizontally to view all holes →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const RoundDetailsPage = ({ roundId, user, onEdit, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

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
      <Box sx={{ display: isMobile ? "block" : "grid", gap: 2 }}>
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
                  label="Played Holes"
                  value={`${playedHoles.length} / 18`}
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
              {isMobile && <LockIcon color="primary" fontSize="small" />}
              <Typography {...sectionHeaderStyles}>Scorecard</Typography>
            </Box>
            <MobileScorecardTable holes={round.holes} />
          </Paper>
        )}

        {/* Insights */}
        {(isMobile ? activeTab === 2 : true) && (
          <Paper {...elevatedCardStyles}>
            <Typography {...sectionHeaderStyles}>Round Insights</Typography>
            <RoundInsights insightsData={insightsData} />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RoundDetailsPage;
