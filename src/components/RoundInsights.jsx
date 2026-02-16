import React from "react";
import { Box, Typography, Paper, Skeleton, Tooltip, Chip, alpha, useTheme } from "@mui/material";
import { elevatedCardStyles } from "../styles/commonStyles";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import Looks3Icon from "@mui/icons-material/Looks3";
import Looks4Icon from "@mui/icons-material/Looks4";
import Looks5Icon from "@mui/icons-material/Looks5";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import BoltIcon from "@mui/icons-material/Bolt";

const iconMap = {
  avg_par3_score: Looks3Icon,
  avg_par4_score: Looks4Icon,
  avg_par5_score: Looks5Icon,
  avg_putts_per_hole: SportsGolfIcon,
  szir_count: TrackChangesIcon,
  holeout_within_3_shots_count: BoltIcon,
};

const StatTile = ({ label, value, percentage, tooltip, icon: Icon }) => {
  const theme = useTheme();
  const showPct = percentage != null && percentage > 0;

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

const RecentInsights = ({ recentStats, isFiltering }) => {
  const theme = useTheme();

  const statsConfig = [
    { key: "avg_par3_score", label: "Avg Par 3", tooltip: "Average score on par 3 holes.", format: (v) => Number(v).toFixed(1) },
    { key: "avg_par4_score", label: "Avg Par 4", tooltip: "Average score on par 4 holes.", format: (v) => Number(v).toFixed(1) },
    { key: "avg_par5_score", label: "Avg Par 5", tooltip: "Average score on par 5 holes.", format: (v) => Number(v).toFixed(1) },
    { key: "avg_putts_per_hole", label: "Avg Putts", tooltip: "Average number of putts per hole.", format: (v) => Number(v).toFixed(1) },
    { key: "szir_count", label: "SZIR", tooltip: "Scoring Zone in Regulation.", format: (v, stats) => `${v} / ${stats.total_holes_played}`, percentageKey: "szir_percentage" },
    { key: "holeout_within_3_shots_count", label: "SZ Par", tooltip: "SZ Par conversion.", format: (v, stats) => `${v} / ${stats.total_holes_played}`, percentageKey: "sz_par_percentage" },
  ];

  // compute sz_par_percentage safely (avoid mutating prop object if you can)
  const computed = React.useMemo(() => {
    if (!recentStats) return null;
    const total = recentStats.total_holes_played || 0;
    const szParPct = total > 0 ? (recentStats.holeout_within_3_shots_count / total) * 100 : 0;
    return { ...recentStats, sz_par_percentage: szParPct };
  }, [recentStats]);

  const hasData = computed && computed.total_holes_played > 0;

  return (
    <Paper
      {...elevatedCardStyles}
      sx={{
        ...elevatedCardStyles.sx,
        p: 2.5,
        borderRadius: 4,
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
          theme.palette.background.default,
          0.6
        )} 100%)`,
      }}
    >
      {/* header */}
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>Recent Insights</Typography>
          <Typography variant="body2" color="text.secondary">
            Based on your selected rounds
          </Typography>
        </Box>
      </Box>

      {/* tiles */}
      {isFiltering ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={92} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : hasData ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          {statsConfig.map((stat) => {
            const Icon = iconMap[stat.key] || GolfCourseIcon;
            return (
              <StatTile
                key={stat.key}
                label={stat.label}
                value={stat.format(computed[stat.key], computed)}
                percentage={stat.percentageKey ? computed[stat.percentageKey] : null}
                tooltip={stat.tooltip}
                icon={Icon}
              />
            );
          })}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
          No data for selected filters.
        </Typography>
      )}
    </Paper>
  );
};

export default RecentInsights;
