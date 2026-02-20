import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { convertDistance } from "../../utils/utils";

const RangeDisplay = ({
  title,
  shots,
  displayUnit,
  distanceMetric = "total",
  shotConfig,
  overallChartMin,
  overallChartMax,
}) => {
  try {
    if (!shots || !Array.isArray(shots) || shots.length === 0) return null;

    const distanceKey = `${distanceMetric}_distance`;
    const varianceKey = `${distanceMetric}_variance`;

    const ranges = shots.map((s) => {
      if (!s) return { min: 0, max: 0 };
      const total = convertDistance(s[distanceKey], s.unit, displayUnit);
      const variance = convertDistance(s[varianceKey], s.unit, displayUnit);
      return { min: total - variance, max: total + variance };
    });

    const min = Math.min(...ranges.map((r) => r.min));
    const max = Math.max(...ranges.map((r) => r.max));

    if (!isFinite(min) || !isFinite(max)) {
      return null;
    }

    const meanDistances = shots.map((s) =>
      convertDistance(s[distanceKey], s.unit, displayUnit)
    );
    const mean =
      meanDistances.reduce((a, b) => a + b, 0) / meanDistances.length;

    const unitLabel = displayUnit === "meters" ? "m" : "yd";

    const chartRange = overallChartMax - overallChartMin || 1; // Prevent division by zero
    const leftPercent = ((min - overallChartMin) / chartRange) * 100;
    const widthPercent = ((max - min) / chartRange) * 100;
    const avgPosition = max - min > 0 ? ((mean - min) / (max - min)) * 100 : 50;

    return (
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 1, mb: 2 }}
        >
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
        </Stack>
        <Box sx={{ position: "relative", height: 24, px: 1, mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              left: `calc(${leftPercent}% + (${widthPercent}% / 2))`,
              bottom: "100%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              {Math.round(min)}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="primary.main"
              fontWeight="bold"
            >
              {" "}
              / {Math.round(mean)} /{" "}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              {Math.round(max)} {unitLabel}
            </Typography>
          </Typography>
          <Box
            sx={{
              position: "absolute",
              left: 8,
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              height: 8,
              bgcolor: "grey.300",
              borderRadius: 1,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: `calc(${leftPercent}% + 8px)`,
              width: `calc(${widthPercent}%)`,
              top: "50%",
              transform: "translateY(-50%)",
              height: 16,
              bgcolor: "primary.main",
              boxShadow: 1,
            }}
          >
            {/* Average Marker */}
            <Box
              sx={{
                position: "absolute",
                left: `${avgPosition}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 4,
                height: "120%",
                bgcolor: "black", // Consistent with BagGappingChart
                borderRadius: "2px",
                boxShadow: 1,
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  } catch (error) {
    console.error("Error in RangeDisplay:", error);
    return null;
  }
};

export default RangeDisplay;