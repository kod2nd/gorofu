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
} from "@mui/material";

// Helper functions moved here to make the component self-contained
const getShotTypeDetails = (shotTypeName, shotConfig) => {
  if (!shotConfig || !shotConfig.shotTypes) return null;
  return shotConfig.shotTypes.find(st => st.name === shotTypeName);
};

const convertDistance = (distance, fromUnit, toUnit) => {
  const YARDS_TO_METERS = 0.9144;
  const METERS_TO_YARDS = 1.09361;
  if (typeof distance !== 'number') return 0;
  if (fromUnit === toUnit) return distance;
  if (fromUnit === 'yards' && toUnit === 'meters') return distance * YARDS_TO_METERS;
  if (fromUnit === 'meters' && toUnit === 'yards') return distance * METERS_TO_YARDS;
  return distance;
};

const BagGappingChart = ({ clubs, displayUnit, shotConfig }) => {
  const [distanceMetric, setDistanceMetric] = useState('total');
  const allCategoryIds = useMemo(() => {
    if (!shotConfig || !shotConfig.categories) return [];
    return shotConfig.categories.map(c => c.id);
  }, [shotConfig]);

  const [selectedCategoryId, setSelectedCategoryId] = useState('cat_long');

  useEffect(() => {
    setSelectedCategoryId('cat_long');
  }, [allCategoryIds]); // Keep this to reset on data load, but to the new default.

  const clubRanges = useMemo(() => {
    if (!clubs) return [];

    const distanceKey = `${distanceMetric}_distance`;
    const varianceKey = `${distanceMetric}_variance`;

    return clubs.map(club => {
      if (!club.shots || club.shots.length === 0) {
        return { ...club, min: 0, max: 0, avg: 0 };
      }

      const filteredShots = club.shots.filter(shot => {
        const shotDetails = getShotTypeDetails(shot.shot_type, shotConfig);
        if (selectedCategoryId === 'all') return true;
        return shotDetails?.category_ids?.includes(selectedCategoryId);
      });

      if (filteredShots.length === 0) {
        return { ...club, min: 0, max: 0, avg: 0 };
      }

      const ranges = filteredShots.map(shot => {
        const median = convertDistance(shot[distanceKey], shot.unit, displayUnit);
        const variance = convertDistance(shot[varianceKey], shot.unit, displayUnit);
        return { min: median - variance, max: median + variance };
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight="bold">Club Gapping</Typography>
        <ToggleButtonGroup size="small" value={distanceMetric} exclusive onChange={(e, newMetric) => { if (newMetric) setDistanceMetric(newMetric); }}>
          <ToggleButton value="total">Total Distance</ToggleButton>
          <ToggleButton value="carry">Carry Distance</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          size="small"
          value={selectedCategoryId}
          exclusive
          onChange={(e, newId) => { if (newId) setSelectedCategoryId(newId); }}
        >
          <ToggleButton value="all">All Shots</ToggleButton>
          {shotConfig.categories.map(cat => (
            <ToggleButton key={cat.id} value={cat.id}>{cat.name}</ToggleButton>
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
            const gap = index < clubRanges.length - 1 ? club.min - (clubRanges[index + 1]?.max || 0) : 0;

            return (
              <Tooltip
                key={club.id}
                arrow
                placement="right"
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="body2" fontWeight="bold">{club.name} ({club.loft})</Typography>
                    <Typography variant="caption" display="block">Min: {Math.round(club.min)} {unitLabel}</Typography>
                    <Typography variant="caption" display="block">Avg: {Math.round(club.avg)} {unitLabel}</Typography>
                    <Typography variant="caption" display="block">Max: {Math.round(club.max)} {unitLabel}</Typography>
                    <Typography variant="caption" color="primary.light">Range: {Math.round(club.max - club.min)} {unitLabel}</Typography>
                  </Box>
                }
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{club.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {club.type} {club.make && ` • ${club.make} ${club.model}`} {club.loft && ` • ${club.loft}°`} {club.bounce && ` • ${club.bounce}° Bounce`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ position: 'relative', height: 40, mt: 3 }}>
                    {/* Distance Labels */}
                    <Typography
                      variant="body2"
                      sx={{
                        position: 'absolute',
                        left: `calc(${leftPercent}% + (${widthPercent}% / 2))`,
                        bottom: '100%',
                        transform: 'translateX(-50%)',
                        mb: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Typography component="span" variant="caption" color="text.secondary">{Math.round(club.min)}</Typography>
                      <Typography component="span" variant="body2" color="primary.main" fontWeight="bold"> / {Math.round(club.avg)} / </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">{Math.round(club.max)} {unitLabel}</Typography>
                    </Typography>

                    <Box sx={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 8, bgcolor: 'grey.300', borderRadius: 1 }} />
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: 16,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        boxShadow: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-50%) scale(1.05)', boxShadow: 6 }
                      }}
                    >
                      {/* Average Marker */}
                      <Box sx={{
                        position: 'absolute',
                        left: `${((club.avg - club.min) / (club.max - club.min)) * 100}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 4,
                        height: '120%',
                        bgcolor: 'black',
                        borderRadius: '2px',
                        boxShadow: 1,
                      }} />
                    </Box>
                    {/* Gap/Overlap Indicator */}
                    {gap > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `calc(${((clubRanges[index + 1].max - chartMin) / chartRange) * 100}% + 8px)`,
                          width: `calc(${(gap / chartRange) * 100}%)`,
                          top: '100%',
                          mt: 0.5,
                          height: 8,
                          bgcolor: 'warning.main',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Chip label={`${Math.round(gap)} ${unitLabel}`} size="small" color="warning" variant="solid" sx={{ height: 16, fontSize: '0.65rem' }} />
                      </Box>
                    )}
                    {gap < 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `calc(${leftPercent}% + 8px)`,
                          width: `calc(${(Math.abs(gap) / chartRange) * 100}%)`,
                          top: '100%',
                          mt: 0.5,
                          height: 8,
                          bgcolor: 'success.light',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Chip label={`${Math.abs(Math.round(gap))} ${unitLabel}`} size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: '0.65rem', bgcolor: 'white' }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No distance data available for the selected categories.
        </Typography>
      )}
    </Box>
  );
};

export default BagGappingChart;