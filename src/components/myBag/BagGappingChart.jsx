import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';

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

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(allCategoryIds);

  useEffect(() => {
    setSelectedCategoryIds(allCategoryIds);
  }, [allCategoryIds]);

  const clubRanges = useMemo(() => {
    if (!clubs || selectedCategoryIds.length === 0) return [];

    const distanceKey = `${distanceMetric}_distance`;
    const varianceKey = `${distanceMetric}_variance`;

    return clubs.map(club => {
      if (!club.shots || club.shots.length === 0) {
        return { id: club.id, name: club.name, min: 0, max: 0, avg: 0 };
      }

      const filteredShots = club.shots.filter(shot => {
        const shotDetails = getShotTypeDetails(shot.shot_type, shotConfig);
        return shotDetails?.category_ids?.some(catId => selectedCategoryIds.includes(catId));
      });

      if (filteredShots.length === 0) {
        return { id: club.id, name: club.name, min: 0, max: 0, avg: 0 };
      }

      const ranges = filteredShots.map(shot => {
        const median = convertDistance(shot[distanceKey], shot.unit, displayUnit);
        const variance = convertDistance(shot[varianceKey], shot.unit, displayUnit);
        return { min: median - variance, max: median + variance };
      });

      const min = Math.min(...ranges.map(r => r.min));
      const max = Math.max(...ranges.map(r => r.max));
      const avg = (min + max) / 2;

      return { id: club.id, name: club.name, min, max, avg };
    }).filter(club => club.min > 0 && club.max > 0)
      .sort((a, b) => b.max - a.max);
  }, [clubs, distanceMetric, displayUnit, selectedCategoryIds, shotConfig]);

  const maxDistanceOverall = Math.max(...clubRanges.map(c => c.max), 300);
  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';

  const handleCategoryToggle = (catId) => {
    const newIds = selectedCategoryIds.includes(catId)
      ? selectedCategoryIds.filter(id => id !== catId)
      : [...selectedCategoryIds, catId];
    if (newIds.length > 0) setSelectedCategoryIds(newIds);
  };

  const areAllCategoriesSelected = selectedCategoryIds.length === allCategoryIds.length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">Distance Gapping</Typography>
        <ToggleButtonGroup size="small" value={distanceMetric} exclusive onChange={(e, newMetric) => { if (newMetric) setDistanceMetric(newMetric); }}>
          <ToggleButton value="total">Total Distance</ToggleButton>
          <ToggleButton value="carry">Carry Distance</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Chip label="All Shots" clickable color={areAllCategoriesSelected ? 'primary' : 'default'} variant={areAllCategoriesSelected ? 'filled' : 'outlined'} onClick={() => setSelectedCategoryIds(allCategoryIds)} />
        {shotConfig.categories.map(cat => (
          <Chip key={cat.id} label={cat.name} clickable color={selectedCategoryIds.includes(cat.id) ? 'primary' : 'default'} variant={selectedCategoryIds.includes(cat.id) ? 'filled' : 'outlined'} onClick={() => handleCategoryToggle(cat.id)} />
        ))}
      </Box>
      
      {clubRanges.length > 0 ? (
        <Stack spacing={2.5}>
          {clubRanges.map(club => (
            <Box key={club.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">{club.name}</Typography>
                <Typography variant="caption" color="text.secondary">{Math.round(club.min)} - {Math.round(club.max)} {unitLabel}</Typography>
              </Box>
              <Slider value={[club.min, club.max]} min={0} max={maxDistanceOverall} disabled sx={{ padding: '13px 0', '& .MuiSlider-thumb': { display: 'none' }, '& .MuiSlider-track': { background: (theme) => `linear-gradient(to right, transparent ${(club.min / maxDistanceOverall) * 100}%, ${theme.palette.primary.main} ${(club.min / maxDistanceOverall) * 100}%, ${theme.palette.primary.main} ${(club.max / maxDistanceOverall) * 100}%, transparent ${(club.max / maxDistanceOverall) * 100}%)` } }} />
            </Box>
          ))}
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