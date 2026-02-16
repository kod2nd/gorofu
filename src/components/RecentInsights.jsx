import React, { useMemo } from "react";
import { Box, Typography, Paper, Skeleton, Tooltip, Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { elevatedCardStyles } from "../styles/commonStyles";

const StatCard = ({ label, value, percentage, tooltip }) => {
  const theme = useTheme();

  const pct =
    percentage != null && Number.isFinite(Number(percentage))
      ? Math.round(Number(percentage))
      : null;

  return (
    <Tooltip title={tooltip || ""} arrow placement="top">
      <Paper
        elevation={0}
        sx={{
          p: 2,
          height: "100%",
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          background: alpha(theme.palette.text.primary, 0.02),
          transition: "all 0.18s ease",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&:hover": {
            transform: "translateY(-2px)",
            background: alpha(theme.palette.primary.main, 0.04),
            borderColor: alpha(theme.palette.primary.main, 0.22),
            boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.10)}`,
          },
        }}
      >
        {/* top row: label + optional % chip */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>

          {pct != null && pct > 0 ? (
            <Chip
              size="small"
              label={`${pct}%`}
              sx={{
                height: 22,
                borderRadius: 999,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, 0.10),
                color: theme.palette.primary.main,
              }}
            />
          ) : (
            <Box sx={{ width: 1 }} />
          )}
        </Box>

        {/* value */}
        <Typography
          sx={{
            mt: 1.5,
            fontSize: "1.6rem",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {value ?? "–"}
        </Typography>
      </Paper>
    </Tooltip>
  );
};

const RecentInsights = ({ recentStats, isFiltering }) => {
  const theme = useTheme();

  const computed = useMemo(() => {
    if (!recentStats) return null;

    const total = Number(recentStats.total_holes_played || 0);
    const szParPct =
      total > 0
        ? (Number(recentStats.holeout_within_3_shots_count || 0) / total) * 100
        : 0;

    return {
      ...recentStats,
      sz_par_percentage: szParPct,
    };
  }, [recentStats]);

  const statsConfig = useMemo(
    () => [
      {
        key: "avg_par3_score",
        label: "Avg Par 3",
        tooltip: "Average score on par 3 holes.",
        format: (v) => (v == null ? "–" : Number(v).toFixed(1)),
      },
      {
        key: "avg_par4_score",
        label: "Avg Par 4",
        tooltip: "Average score on par 4 holes.",
        format: (v) => (v == null ? "–" : Number(v).toFixed(1)),
      },
      {
        key: "avg_par5_score",
        label: "Avg Par 5",
        tooltip: "Average score on par 5 holes.",
        format: (v) => (v == null ? "–" : Number(v).toFixed(1)),
      },
      {
        key: "avg_putts_per_hole",
        label: "Avg Putts",
        tooltip: "Average number of putts per hole.",
        format: (v) => (v == null ? "–" : Number(v).toFixed(1)),
      },
      {
        key: "szir_count",
        label: "SZIR",
        tooltip: "Scoring Zone in Regulation.",
        format: (v, s) => `${Number(v || 0)} / ${Number(s.total_holes_played || 0)}`,
        percentageKey: "szir_percentage",
      },
      {
        key: "holeout_within_3_shots_count",
        label: "SZ Par",
        tooltip: "Scoring Zone Par conversion.",
        format: (v, s) => `${Number(v || 0)} / ${Number(s.total_holes_played || 0)}`,
        percentageKey: "sz_par_percentage",
      },
    ],
    []
  );

  return (
    <Paper
      {...elevatedCardStyles}
      sx={{
        ...elevatedCardStyles.sx,
        p: 2.25,
        borderRadius: 4,
        "&:hover": { transform: "none", boxShadow: elevatedCardStyles.elevation }, // avoid double “float”
      }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>
          Recent Insights
        </Typography>

        {/* Optional: subtle hint */}
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {computed?.total_holes_played ? `${computed.total_holes_played} holes` : ""}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        {isFiltering ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)" },
              gap: 1.5,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={84} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        ) : computed && Number(computed.total_holes_played || 0) > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)" },
              gap: 1.5,
            }}
          >
            {statsConfig.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stat.format(computed[stat.key], computed)}
                percentage={stat.percentageKey ? computed[stat.percentageKey] : null}
                tooltip={stat.tooltip}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              mt: 2,
              p: 2.5,
              borderRadius: 3,
              border: `1px dashed ${alpha(theme.palette.text.primary, 0.18)}`,
              background: alpha(theme.palette.text.primary, 0.02),
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">No data for selected filters.</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default RecentInsights;
