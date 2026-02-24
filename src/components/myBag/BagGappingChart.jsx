import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Slider,
  ToggleButtonGroup,
  ToggleButton,  
  Paper,
  Tooltip,
  useTheme
} from "@mui/material";
import { convertDistance } from "../utils/utils";
import { segmentedSx } from "../../styles/commonStyles";
import { alpha } from "@mui/material/styles";

// Helper functions moved here to make the component self-contained
  const getShotTypeDetails = (shotTypeValue, shotConfig) => {
    if (!shotConfig?.shotTypes?.length) return null;

    return (
      shotConfig.shotTypes.find(st => st.name === shotTypeValue) ||
      shotConfig.shotTypes.find(st => String(st.id) === String(shotTypeValue))
    );
  };

const BagGappingChart = ({ clubs, displayUnit, shotConfig }) => {
  const [distanceMetric, setDistanceMetric] = useState('total');
  const allCategoryIds = useMemo(() => {
    if (!shotConfig || !shotConfig.categories) return [];
    return shotConfig.categories.map(c => c.id);
  }, [shotConfig]);

  const [selectedCategoryId, setSelectedCategoryId] = useState('cat_long');
  const theme = useTheme();
  const BAR_PAD = 10;


  useEffect(() => {
    setSelectedCategoryId('cat_long');
  }, [allCategoryIds]); // Keep this to reset on data load, but to the new default.

  const clubRanges = useMemo(() => {
    if (!clubs) return [];

    const minKey = `${distanceMetric}_min`;
    const maxKey = `${distanceMetric}_max`;


    return clubs.map(club => {
      if (!club.shots || club.shots.length === 0) {
        return { ...club, min: 0, max: 0, avg: 0 };
      }

      const filteredShots = club.shots.filter(shot => {
        const shotDetails = getShotTypeDetails(shot.shot_type, shotConfig);

        if (selectedCategoryId === 'all') return true;

        const categoryIds = shotDetails?.category_ids || [];
        return Array.isArray(categoryIds) && categoryIds.includes(selectedCategoryId);
      });

      if (filteredShots.length === 0) {
        return { ...club, min: 0, max: 0, avg: 0 };
      }

      const ranges = filteredShots.map(shot => {
        return { min: convertDistance(shot[minKey], shot.unit, displayUnit), max: convertDistance(shot[maxKey], shot.unit, displayUnit) };
      });

      const min = Math.min(...ranges.map(r => r.min));
      const max = Math.max(...ranges.map(r => r.max));
      const avg = (min + max) / 2;

      return { ...club, min, max, avg };
    }).filter(club => club.min > 0 && club.max > 0)
      .sort((a, b) => b.max - a.max);
  }, [clubs, distanceMetric, displayUnit, selectedCategoryId, shotConfig]);

  // Dynamic Chart Scaling Logic
  const { chartMin, chartMax } = useMemo(() => {
    if (clubRanges.length === 0) {
      return { chartMin: 0, chartMax: 300 }; // Default scale
    }
    const minDistance = Math.min(...clubRanges.map(c => c.min));
    const maxDistance = Math.max(...clubRanges.map(c => c.max));
    const range = maxDistance - minDistance;
    const padding = range * 0.1; // 10% padding on each side

    return { chartMin: Math.max(0, minDistance - padding), chartMax: maxDistance + padding };
  }, [clubRanges]);

  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';

  return (
    <Box>
      {/* Header with Stats */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 2,
          gap: 1.5,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            textAlign: { xs: "center", sm: "left" },
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Club Gapping
        </Typography>

        <ToggleButtonGroup
          size="small"
          value={distanceMetric}
          exclusive
          onChange={(e, newMetric) => {
            if (newMetric) setDistanceMetric(newMetric);
          }}
          sx={segmentedSx(theme, { fullWidth: { xs: true, sm: false } })}
        >
          <ToggleButton value="total">
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Total Distance
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              Total
            </Box>
          </ToggleButton>
          <ToggleButton value="carry">
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Carry Distance
            </Box>
            <Box
              component="span"
              sx={{ display: { xs: "inline", sm: "none" } }}
            >
              Carry
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <ToggleButtonGroup
          size="small"
          value={selectedCategoryId}
          exclusive
          onChange={(e, newId) => {
            if (newId) setSelectedCategoryId(newId);
          }}
          sx={segmentedSx(theme, { fullWidth: { xs: true, sm: false } })}
        >
          <ToggleButton value="all">All</ToggleButton>
         {(shotConfig?.categories || []).map((cat) => (
            <ToggleButton key={cat.id} value={cat.id}>
              {cat.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Chart */}
      {clubRanges.length > 0 ? (
        <Stack spacing={2.5}>
          {clubRanges.map((club, index) => {
            const chartRange = chartMax - chartMin || 1; // Prevent division by zero
            const leftPercent = ((club.min - chartMin) / chartRange) * 100;
            const widthPercent = ((club.max - club.min) / chartRange) * 100;
            const gap =
              index < clubRanges.length - 1
                ? club.min - (clubRanges[index + 1]?.max || 0)
                : 0;

            return (
              <Tooltip
                key={club.id}
                arrow
                placement="right"
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {club.name} ({club.loft})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Min: {Math.round(club.min)} {unitLabel}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Avg: {Math.round(club.avg)} {unitLabel}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Max: {Math.round(club.max)} {unitLabel}
                    </Typography>
                    <Typography variant="caption" color="primary.light">
                      Range: {Math.round(club.max - club.min)} {unitLabel}
                    </Typography>
                  </Box>
                }
              >
                <Box>

                  <Box sx={{ mb: gap ? 2.25 : 0 }}>
                    {/* Top row: name + chips (responsive) */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                      spacing={0.75}
                      sx={{ mb: 0.75 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={800} noWrap>
                          {club.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {[club.type, club.make && `${club.make} ${club.model}`, club.loft && `${club.loft}°`]
                            .filter(Boolean)
                            .join(" • ")}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{
                          flexShrink: 0,
                          flexWrap: "wrap",
                          justifyContent: { xs: "flex-start", sm: "flex-end" },
                        }}
                      >
                        <Chip size="small" variant="outlined" label={`${Math.round(club.min)}${unitLabel}`} />
                        <Chip size="small" color="primary" label={`${Math.round(club.avg)}${unitLabel}`} sx={{ fontWeight: 900 }} />
                        <Chip size="small" variant="outlined" label={`${Math.round(club.max)}${unitLabel}`} />
                      </Stack>
                    </Stack>

                    {/* Inner track wrapper: % math is now correct */}
                    <Box sx={{ position: "relative", px: `${BAR_PAD}px`, height: 18 }}>
                      {/* Track */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: 8,
                          bgcolor: "grey.300",
                          borderRadius: 999,
                        }}
                      />

                      {/* Range fill (now correctly aligned) */}
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: 12,
                          borderRadius: 999,
                          bgcolor: alpha(theme.palette.primary.main, 0.7),
                          boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
                        }}
                      >
                        {/* Typical marker */}
                        <Box
                          sx={{
                            position: "absolute",
                            left: `${((club.avg - club.min) / Math.max(1, (club.max - club.min))) * 100}%`,
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 3,
                            height: 16,
                            borderRadius: 2,
                            bgcolor: theme.palette.text.primary,
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Gap/overlap chip: keep it simple + centered under the bar */}
                    {gap !== 0 && (
                      <Box sx={{ mt: 0.75, display: "flex", justifyContent: "center" }}>
                        <Chip
                          size="small"
                          label={`${Math.abs(Math.round(gap))}${unitLabel} ${gap > 0 ? "gap" : "overlap"}`}
                          color={gap > 0 ? "warning" : "success"}
                          variant={gap > 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: 800 }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ py: 4 }}
        >
          No distance data available for the selected categories.
        </Typography>
      )}
    </Box>
  );
};

export default BagGappingChart;