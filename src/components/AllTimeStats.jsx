import React from "react";
import { Box, Typography, Paper, Tooltip, useTheme, alpha } from "@mui/material";
import { GolfCourse, Whatshot, BarChart } from "@mui/icons-material";
import StreakBox from "./StreakBox";

const StatCard = ({ label, value, tooltip, icon: Icon, color = "primary" }) => {
  const theme = useTheme();

  // Use theme palette instead of hardcoded colors
  const mainColor =
    theme.palette[color]?.main ?? theme.palette.primary.main;

  return (
    <Tooltip title={tooltip || ""} arrow placement="top">
      <Paper
        elevation={0}
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          transition: "box-shadow 160ms ease, border-color 160ms ease",
          boxShadow: "0 1px 2px rgba(16,24,40,0.06)",
          "&:hover": {
            boxShadow: "0 10px 26px rgba(16,24,40,0.10)",
            borderColor: alpha(mainColor, 0.35),
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          {Icon && (
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(mainColor, 0.12),
                border: `1px solid ${alpha(mainColor, 0.18)}`,
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 18, color: mainColor }} />
            </Box>
          )}

          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
        </Box>

        {/* Value */}
        <Box sx={{ mt: 1.5 }}>
          {typeof value === "string" || typeof value === "number" ? (
            <Typography
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.6rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                color: "text.primary",
              }}
            >
              {value ?? "–"}
            </Typography>
          ) : (
            <Box sx={{ mt: 0.5 }}>{value}</Box>
          )}

          {/* Accent line */}
          <Box
            sx={{
              width: 32,
              height: 3,
              borderRadius: 999,
              mt: 1.25,
              backgroundColor: alpha(mainColor, 0.45),
            }}
          />
        </Box>
      </Paper>
    </Tooltip>
  );
};

const AllTimeStats = ({ cumulativeStats, szirStreak, szParStreak }) => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 750 }}>
          All Time Stats
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(5, 1fr)",
          },
          gap: 2,
        }}
      >
        <StatCard
          label="SZIR Streak"
          value={<StreakBox streak={szirStreak} type="szir" />}
          tooltip="Consecutive holes with Scoring Zone In Regulation"
          icon={Whatshot}
          color="warning"
        />

        <StatCard
          label="SZ Par Streak"
          value={<StreakBox streak={szParStreak} type="szpar" />}
          tooltip="Consecutive SZIR holes with Par or better"
          icon={Whatshot}
          color="success"
        />

        <StatCard
          label="Total Rounds"
          value={cumulativeStats?.total_rounds_played}
          tooltip="All rounds played"
          icon={BarChart}
          color="info"
        />

        <StatCard
          label="Eligible Rounds"
          value={cumulativeStats?.eligible_rounds_count}
          tooltip="Rounds counted for statistics"
          icon={BarChart}
          color="secondary"
        />

        <StatCard
          label="Holes Played"
          value={cumulativeStats?.total_holes_played}
          tooltip="Total holes completed"
          icon={GolfCourse}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AllTimeStats;
