import React, { useState, useEffect, useCallback } from 'react';
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
import { Search, GolfCourse } from '@mui/icons-material';
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
  const [carryQuery, setCarryQuery] = useState('');
  const [totalQuery, setTotalQuery] = useState('');
  const [suggestedShots, setSuggestedShots] = useState([]);
  const [lookupSelectedBagId, setLookupSelectedBagId] = useState('all');

  // Use useCallback to memoize the handleSearch function
  // This prevents it from being recreated on every render, which is important for the useEffect dependency array.
  const handleSearch = useCallback((carryVal, totalVal) => {
    const carryDist = parseInt(carryVal, 10);
    const totalDist = parseInt(totalVal, 10);

    const hasCarryQuery = !isNaN(carryDist) && carryDist > 0;
    const searchDistance = hasCarryQuery ? carryDist : totalDist;
    const hasTotalQuery = !isNaN(totalDist) && totalDist > 0;

    if (!hasCarryQuery && !hasTotalQuery) {
      setSuggestedShots([]);
      return;
    }

    const clubsToSearch = lookupSelectedBagId === 'all'
      ? myClubs
      : myClubs.filter(club => myBags.find(b => b.id === lookupSelectedBagId)?.clubIds.includes(club.id));

    const exactMatches = [];
    const allShotsWithDiff = [];

    clubsToSearch.forEach(club => {
      club.shots.forEach(shot => {
        const carry = convertDistance(shot.carry_distance, shot.unit, displayUnit);
        const bagsContainingClub = myBags.filter(bag =>
          bag.clubIds.includes(club.id)
        );
        const carryVariance = convertDistance(shot.carry_variance, shot.unit, displayUnit);
        const total = convertDistance(shot.total_distance, shot.unit, displayUnit);
        const totalVariance = convertDistance(shot.total_variance, shot.unit, displayUnit);

        const medianToCompare = hasCarryQuery ? carry : total;

        let isExactMatch = false;
        if (hasCarryQuery) {
          isExactMatch = (carryDist >= carry - carryVariance && carryDist <= carry + carryVariance);
        } else if (hasTotalQuery) {
          isExactMatch = (totalDist >= total - totalVariance && totalDist <= total + totalVariance);
        }

        const suggestion = { clubName: club.name, clubLoft: club.loft, bags: bagsContainingClub, ...shot, displayUnit, medianToCompare };

        if (isExactMatch) {
          exactMatches.push(suggestion);
        }

        // For nearby logic, calculate difference from the relevant median
        const diff = Math.abs(searchDistance - medianToCompare);
        allShotsWithDiff.push({ ...suggestion, diff });
      });
    });

    if (exactMatches.length > 0) {
      setSuggestedShots(exactMatches.map(shot => ({ ...shot, isExact: true })));
    } else {
      // No exact matches, find the nearest higher and lower options.
      const shotsAbove = allShotsWithDiff.filter(s => s.medianToCompare > searchDistance).sort((a, b) => a.diff - b.diff);
      const shotsBelow = allShotsWithDiff.filter(s => s.medianToCompare < searchDistance).sort((a, b) => a.diff - b.diff);

      const nearbyShots = [];
      if (shotsBelow.length > 0) nearbyShots.push({ ...shotsBelow[0], isNearby: true, label: 'Nearest Shorter' });
      if (shotsAbove.length > 0) nearbyShots.push({ ...shotsAbove[0], isNearby: true, label: 'Nearest Longer' });

      setSuggestedShots(nearbyShots);
    }
  }, [myBags, myClubs, displayUnit, lookupSelectedBagId]);

  // This useEffect will re-run the search whenever the display unit or bag filter changes.
  useEffect(() => {
    handleSearch(carryQuery, totalQuery);
  }, [displayUnit, lookupSelectedBagId, handleSearch]);

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Distance Lookup</Typography>        
        <ToggleButtonGroup size="small" value={lookupSelectedBagId} exclusive onChange={(e, newId) => { if (newId) setLookupSelectedBagId(newId); }}>
          <ToggleButton value="all">All Clubs</ToggleButton>
          {myBags.map(bag => <ToggleButton key={bag.id} value={bag.id}>{bag.name}</ToggleButton>)}
        </ToggleButtonGroup>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label={`Search by Carry (${displayUnit})`}
          type="number"
          value={carryQuery}
          onChange={(e) => {
            setCarryQuery(e.target.value);
            setTotalQuery(''); // Erase the other box
            handleSearch(e.target.value, '');
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
        <TextField
          fullWidth
          label={`Search by Total (${displayUnit})`}
          type="number"
          value={totalQuery}
          onChange={(e) => {
            setTotalQuery(e.target.value);
            setCarryQuery(''); // Erase the other box
            handleSearch('', e.target.value);
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
          }}
        />
      </Stack>
      {suggestedShots.length > 0 && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="subtitle2">
            {suggestedShots[0]?.isExact 
              ? 'Suggested Shots:' 
              : suggestedShots[0]?.isNearby 
              ? 'No logged ranges for this distance. Nearby options:' 
              : 'Suggested Shots:'
            }
          </Typography>
          {suggestedShots.map((shot) => {
            const unitLabel = shot.displayUnit === 'meters' ? 'm' : 'yd';

            // Carry calculations
            const medianCarry = convertDistance(shot.carry_distance, shot.unit, shot.displayUnit);
            const carryVariance = convertDistance(shot.carry_variance, shot.unit, shot.displayUnit);
            const lowerBoundCarry = Math.round(medianCarry - carryVariance);
            const upperBoundCarry = Math.round(medianCarry + carryVariance);

            // Total calculations
            const medianTotal = convertDistance(shot.total_distance, shot.unit, shot.displayUnit);
            const totalVariance = convertDistance(shot.total_variance, shot.unit, shot.displayUnit);
            const lowerBoundTotal = Math.round(medianTotal - totalVariance);
            const upperBoundTotal = Math.round(medianTotal + totalVariance);

            return (
              <Paper key={`${shot.clubName}-${shot.id}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                {shot.label && (
                  <Chip label={shot.label} color={shot.label === 'Nearest Longer' ? 'success' : 'warning'} size="small" sx={{ mb: 1, fontWeight: 'bold' }} />
                )}
                <Typography variant="body1" fontWeight="bold">{shot.clubName} ({shot.clubLoft}) - {shot.shot_type}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Carry: {lowerBoundCarry} - <b>{Math.round(medianCarry)}</b> - {upperBoundCarry} {unitLabel}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">| Total: {lowerBoundTotal} - <b>{Math.round(medianTotal)}</b> - {upperBoundTotal} {unitLabel}</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {shot.launch && <Chip label={`Launch: ${shot.launch}`} size="small" />}
                  {shot.roll && <Chip label={`Roll: ${shot.roll}`} size="small" color="success" />}
                  {shot.tendency && <Chip label={`Tendency: ${shot.tendency}`} size="small" color="warning" />}
                  {shot.swing_key && <Chip label={`Key: ${shot.swing_key}`} size="small" color="info" />}
                </Stack>
                {shot.bags && shot.bags.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {shot.bags.map(bag => (<Chip key={bag.id} icon={<GolfCourse />} label={bag.name} size="small" variant="outlined" />))}
                    </Stack>
                  </>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default DistanceLookup;