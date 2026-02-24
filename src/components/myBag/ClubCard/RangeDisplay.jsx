import React, { useMemo } from "react";
import { Box, Stack, Typography, Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { convertDistance } from "../../utils/utils";

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));



const RangeDisplay = ({
  title,
  shots,
  displayUnit,
  distanceMetric = "total",
  overallChartMin,
  overallChartMax,

  // Optional: if you later pass skewed values directly (instead of deriving from shots)
  // meanOverride,
  // minOverride,
  // maxOverride,
}) => {
  const theme = useTheme();

  const computed = useMemo(() => {
    if (!Array.isArray(shots) || shots.length === 0) return null;

    const minKey = `${distanceMetric}_min`;
    const typicalKey = `${distanceMetric}_typical`;
    const maxKey = `${distanceMetric}_max`;

    const ranges = shots.map((s) => {
      const min = convertDistance(s?.[minKey], s?.unit, displayUnit);
      const typical = convertDistance(s?.[typicalKey], s?.unit, displayUnit);
      const max = convertDistance(s?.[maxKey], s?.unit, displayUnit);

      return { min, typical, max };
    }).filter(r => Number.isFinite(r.min) && Number.isFinite(r.typical) && Number.isFinite(r.max));

    if (!ranges.length) return null;

    const min = Math.min(...ranges.map(r => r.min));
    const max = Math.max(...ranges.map(r => r.max));
    const typical = Math.round(ranges.reduce((sum, r) => sum + r.typical, 0) / ranges.length);

    // For display: average under/over (supports skew)
    const under =
      ranges.reduce((acc, r) => acc + Math.max(0, (r.typical ?? 0) - (r.min ?? 0)), 0) /
      ranges.length;

    const over =
      ranges.reduce((acc, r) => acc + Math.max(0, (r.max ?? 0) - (r.typical ?? 0)), 0) /
      ranges.length;

    return {
      min,
      max,
      typical,
      under,
      over,
    };
  }, [shots, displayUnit, distanceMetric]);

  if (!computed) return null;

  const unitLabel = displayUnit === "meters" ? "m" : "yd";

  const chartMin = Number.isFinite(overallChartMin) ? overallChartMin : 0;
  const chartMax = Number.isFinite(overallChartMax) ? overallChartMax : 1;
  const chartRange = chartMax - chartMin || 1;

  const leftPct = clamp(((computed.min - chartMin) / chartRange) * 100, 0, 100);
  const rightPct = clamp(((computed.max - chartMin) / chartRange) * 100, 0, 100);
  const widthPct = clamp(rightPct - leftPct, 0, 100);
  
  const markerPct = clamp(((computed.typical - chartMin) / chartRange) * 100, 0, 100);

  const labelPct = clamp(markerPct, 8, 92);

  return (
    <Box sx={{ px: 1 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "baseline" }}
        justifyContent="space-between"
        sx={{ mb: 1, gap: 1, minWidth: 0 }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}
        >
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Chip
            size="small"
            label={`${Math.round(computed.min)}${unitLabel}`}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              color: alpha(theme.palette.primary.main, 0.55),
              bgcolor: alpha(theme.palette.primary.main, 0.15),
            }}
          />
          <Chip
            size="small"
            label={`${Math.round(computed.typical)}${unitLabel}`}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.info.main, 0.2),
            }}
          />
          <Chip
            size="small"
            label={`${Math.round(computed.max)}${unitLabel}`}
            sx={{
              borderRadius: 999,
              fontWeight: 700,
              color: alpha(theme.palette.primary.main, 0.55),
              bgcolor: alpha(theme.palette.primary.main, 0.15),
            }}
          />
        </Stack>
      </Stack>

      {/* Dispersion row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "baseline" }}
        justifyContent="space-between"
        sx={{ mb: 1, gap: 1 }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 800, letterSpacing: "0.08em", flexShrink: 0 }}
        >
          Dispersion (F/B)
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Chip
            size="small"
            label={`−${Math.round(computed.under)}${unitLabel}`}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.error.main, 0.2),
            }}
          />
          <Chip
            size="small"
            label={`+${Math.round(computed.over)}${unitLabel}`}
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.success.main, 0.2),
            }}
          />
        </Stack>
      </Stack>

      {/* Bar */}
      <Box sx={{ position: "relative", height: 22 }}>
        {/* Track */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            height: 8,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.text.primary, 0.10),
          }}
        />

        {/* Range fill */}
        <Box
          sx={{
            position: "absolute",
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            top: "50%",
            transform: "translateY(-50%)",
            height: 12,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.text.primary, 0.65),
            boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
          }}
        />

        {/* Typical marker */}
        <Box
          sx={{
            position: "absolute",
            left: `${markerPct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 3,
            height: 18,
            borderRadius: 2,
            bgcolor: theme.palette.text.primary,
            boxShadow: `0 6px 14px ${alpha(theme.palette.common.black, 0.18)}`,
          }}
        />
      </Box>
    </Box>
  );
};

export default RangeDisplay;