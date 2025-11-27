import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { elevatedCardStyles } from '../../styles/commonStyles';

// Helper function (could be moved to a shared utils file later)
const YARDS_TO_METERS = 0.9144;
const METERS_TO_YARDS = 1.09361;

const convertDistance = (distance, fromUnit, toUnit) => {
  if (typeof distance !== 'number') return 0;
  if (fromUnit === toUnit) return distance;
  if (fromUnit === 'yards' && toUnit === 'meters') return distance * YARDS_TO_METERS;
  if (fromUnit === 'meters' && toUnit === 'yards') return distance * METERS_TO_YARDS;
  return distance;
};

const DistanceLookup = ({ myBags, myClubs, displayUnit }) => {
  const [distanceQuery, setDistanceQuery] = useState('');
  const [suggestedShots, setSuggestedShots] = useState([]);
  const [lookupSelectedBagId, setLookupSelectedBagId] = useState('all');

  const handleDistanceSearch = (e) => {
    const distance = parseInt(e.target.value, 10);
    setDistanceQuery(e.target.value);

    if (isNaN(distance) || distance <= 0) {
      setSuggestedShots([]);
      return;
    }

    const clubsToSearch = lookupSelectedBagId === 'all'
      ? myClubs
      : myClubs.filter(club => myBags.find(b => b.id === lookupSelectedBagId)?.clubIds.includes(club.id));

    const suggestions = [];
    clubsToSearch.forEach(club => {
      club.shots.forEach(shot => {
        const total = convertDistance(shot.total_distance, shot.unit, displayUnit);
        const totalVariance = convertDistance(shot.total_variance, shot.unit, displayUnit);
        if (distance >= total - totalVariance && distance <= total + totalVariance) {
          suggestions.push({ clubName: club.name, ...shot, displayUnit });
        }
      });
    });
    setSuggestedShots(suggestions);
  };

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Distance Lookup</Typography>
        <ToggleButtonGroup size="small" value={lookupSelectedBagId} exclusive onChange={(e, newId) => { if (newId) setLookupSelectedBagId(newId); }}>
          <ToggleButton value="all">All Clubs</ToggleButton>
          {myBags.map(bag => <ToggleButton key={bag.id} value={bag.id}>{bag.name}</ToggleButton>)}
        </ToggleButtonGroup>
      </Box>
      <TextField
        fullWidth
        label={`Enter a distance (${displayUnit})`}
        type="number"
        value={distanceQuery}
        onChange={handleDistanceSearch}
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
        }}
      />
      {suggestedShots.length > 0 && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Suggested Shots:</Typography>
          {suggestedShots.map((shot) => {
            const unitLabel = shot.displayUnit === 'meters' ? 'm' : 'yd';
            const medianTotal = convertDistance(shot.total_distance, shot.unit, shot.displayUnit);
            const totalVariance = convertDistance(shot.total_variance, shot.unit, shot.displayUnit);
            const lowerBoundTotal = Math.round(medianTotal - totalVariance);
            const upperBoundTotal = Math.round(medianTotal + totalVariance);

            return (
              <Paper key={`${shot.clubName}-${shot.id}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">{shot.clubName} - {shot.shot_type}</Typography>
                  <Typography variant="caption" color="text.secondary">Total: {lowerBoundTotal} - <b>{Math.round(medianTotal)}</b> - {upperBoundTotal} {unitLabel}</Typography>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default DistanceLookup;