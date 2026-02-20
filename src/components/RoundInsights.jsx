import React from "react";
import { Box, Typography, Paper, Tooltip, Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import BoltIcon from "@mui/icons-material/Bolt";
import FlagIcon from "@mui/icons-material/Flag";
import CloseIcon from "@mui/icons-material/Close";

const StatTile = ({ label, value, percentage, tooltip, icon: Icon }) => {
  const theme = useTheme();
  const showPct = percentage != null && Number.isFinite(percentage);

  return (
    <Tooltip title={tooltip || ""} arrow placement="top">
      <Paper
        elevation={0}
        sx={{
          p: 2,
          height: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
            theme.palette.background.paper,
            0.7
          )} 100%)`,
          transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 6,
            borderColor: alpha(theme.palette.primary.main, 0.25),
          },
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        {/* Icon badge */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            backgroundColor: alpha(theme.palette.primary.main, 0.10),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          {Icon ? <Icon sx={{ fontSize: 22, color: theme.palette.primary.main }} /> : null}
        </Box>

        {/* Content */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                lineHeight: 1.2,
                pr: 1,
              }}
              noWrap
            >
              {label}
            </Typography>

            {showPct ? (
              <Chip
                size="small"
                label={`${percentage.toFixed(0)}%`}
                sx={{
                  height: 22,
                  fontWeight: 700,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.main,
                }}
              />
            ) : (
              <Box sx={{ height: 22 }} />
            )}
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mt: 0.75,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {value ?? "–"}
          </Typography>

          {/* subtle progress line when we have percentage */}
          <Box
            sx={{
              mt: 1.25,
              height: 6,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: showPct ? `${Math.min(100, Math.max(0, percentage))}%` : "0%",
                bgcolor: alpha(theme.palette.primary.main, 0.65),
                transition: "width 200ms ease",
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Tooltip>
  );
};

const RoundInsights = ({ insightsData }) => {
  const total = insightsData?.totalHolesPlayed || 0;

  const szirPct = total > 0 ? (insightsData.totalSZIR / total) * 100 : null;
  const szParPct = total > 0 ? (insightsData.totalHoleoutWithin3Shots / total) * 100 : null;

  if (!insightsData || total === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
        No hole data available for insights.
      </Typography>
    );
  }

  const tiles = [
    {
      key: "score",
      label: "Score",
      value: insightsData.totalScore ?? "–",
      tooltip: "Total score for this round.",
      icon: GolfCourseIcon,
    },
    {
      key: "putts",
      label: "Total Putts",
      value: insightsData.totalPutts ?? "–",
      tooltip: "Total putts taken in this round.",
      icon: SportsGolfIcon,
    },
    {
      key: "penalties",
      label: "Penalties",
      value: insightsData.totalPenalties ?? 0,
      tooltip: "Total penalty shots recorded.",
      icon: FlagIcon,
    },
    {
      key: "szir",
      label: "SZIR",
      value: `${insightsData.totalSZIR} / ${total}`,
      percentage: szirPct,
      tooltip: "Scoring Zone in Regulation count and percentage.",
      icon: TrackChangesIcon,
    },
    {
      key: "szpar",
      label: "SZ Par",
      value: `${insightsData.totalHoleoutWithin3Shots} / ${total}`,
      percentage: szParPct,
      tooltip: "Scoring Zone par conversion count and percentage.",
      icon: BoltIcon,
    },
    {
      key: "within4ft",
      label: "Putts ≤ 4ft",
      value: insightsData.totalPuttsWithin4ft ?? 0,
      tooltip: "Total putts taken within 4 feet.",
      icon: SportsGolfIcon,
    },
    {
      key: "missed4ft",
      label: "Missed ≤ 4ft",
      value: insightsData.holesWithMoreThanOnePuttWithin4ft ?? 0,
      tooltip: "Holes where you had more than one putt within 4 feet (missed short putt).",
      icon: CloseIcon,
    },
    {
      key: "holeouts",
      label: "Holeouts > 4ft",
      value: insightsData.totalHoleoutFromOutside4ft ?? 0,
      tooltip: "Number of holes holed out from outside 4 feet.",
      icon: BoltIcon,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
        gap: 2,
      }}
    >
      {tiles.map((t) => (
        <StatTile
          key={t.key}
          label={t.label}
          value={t.value}
          percentage={t.percentage}
          tooltip={t.tooltip}
          icon={t.icon}
        />
      ))}
    </Box>
  );
};

export default RoundInsights;
