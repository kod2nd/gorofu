import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Add, Edit, Delete, Search, Straighten as StraightenIcon, Settings } from '@mui/icons-material';
import PageHeader from './PageHeader';
import { elevatedCardStyles } from '../styles/commonStyles';

// Mock user-defined shot configuration. In a real app, this would be fetched from the database.
const mockUserShotConfig = {
  categories: [
    { id: 'cat_long', name: 'Long Game' },
    { id: 'cat_approach', name: 'Approach' },
    { id: 'cat_short', name: 'Short Game' },
  ],
  shotTypes: [
    { id: 'st_full', name: 'Full', categoryIds: ['cat_long'] },
    { id: 'st_3_4', name: '3/4 Swing', categoryIds: ['cat_long', 'cat_approach'] },
    { id: 'st_1_2', name: '1/2 Swing', categoryIds: ['cat_approach', 'cat_short'] },
    { id: 'st_pitch', name: 'Pitch', categoryIds: ['cat_short'] },
    { id: 'st_chip', name: 'Chip', categoryIds: ['cat_short'] },
  ],
};

// Helper to get shot type details from config
const getShotTypeDetails = (shotTypeName) => {
  return mockUserShotConfig.shotTypes.find(st => st.name === shotTypeName);
};
// Mock data to simulate what we'll get from the database.
// I've added a 'unit' field to each shot to specify the original entry unit.
const mockMyBagData = [
  {
    id: 1,
    name: '7 Iron',
    type: 'Iron',
    loft: '34°',
    shaft_model: 'Project X LS 6.0',
    shaft_weight: '120g',
    shaft_flex: 'Stiff',
    swing_weight: 'D2',
    grip_size: 'Standard',
    shots: [
      { id: 101, shot_type: 'Full', carry_distance: 150, carry_variance: 5, total_distance: 155, total_variance: 4, launch: 'Medium', roll: 'Stops', unit: 'yards', tendency: 'Over-draws', swing_key: 'Aim right of target' },
      { id: 102, shot_type: '3/4 Swing', carry_distance: 135, carry_variance: 4, total_distance: 140, total_variance: 4, launch: 'Medium', roll: 'Stops', unit: 'yards', tendency: 'Slight pull', swing_key: 'Smooth tempo' },
      { id: 103, shot_type: '1/2 Swing', carry_distance: 110, carry_variance: 3, total_distance: 115, total_variance: 3, launch: 'Low', roll: 'Rolls', unit: 'yards', tendency: 'Good', swing_key: 'Cover the ball' },
    ],
  },
  {
    id: 3,
    name: '8 Iron',
    type: 'Iron',
    loft: '38°',
    shaft_model: 'Project X LS 6.0',
    shaft_weight: '120g',
    shaft_flex: 'Stiff',
    swing_weight: 'D2',
    grip_size: 'Standard',
    shots: [
      { id: 301, shot_type: 'Full', carry_distance: 138, carry_variance: 5, total_distance: 142, total_variance: 4, launch: 'Medium', roll: 'Stops', unit: 'yards', tendency: 'Straight', swing_key: 'Commit to shot' },
      { id: 302, shot_type: '3/4 Swing', carry_distance: 125, carry_variance: 4, total_distance: 130, total_variance: 4, launch: 'Medium', roll: 'Stops', unit: 'yards', tendency: 'Slight fade', swing_key: 'Hold the face' },
      { id: 303, shot_type: '1/2 Swing', carry_distance: 100, carry_variance: 3, total_distance: 105, total_variance: 3, launch: 'Low', roll: 'Rolls', unit: 'yards', tendency: 'Good', swing_key: 'N/A' },
    ],
  },
  {
    id: 4,
    name: '9 Iron',
    type: 'Iron',
    loft: '42°',
    shaft_model: 'Project X LS 6.0',
    shaft_weight: '120g',
    shaft_flex: 'Stiff',
    swing_weight: 'D3',
    grip_size: 'Standard',
    shots: [
      { id: 401, shot_type: 'Full', carry_distance: 125, carry_variance: 5, total_distance: 130, total_variance: 4, launch: 'High', roll: 'Stops', unit: 'yards', tendency: 'Good', swing_key: 'Full turn' },
      { id: 402, shot_type: '3/4 Swing', carry_distance: 112, carry_variance: 4, total_distance: 116, total_variance: 4, launch: 'High', roll: 'Stops', unit: 'yards', tendency: 'Good', swing_key: 'N/A' },
      { id: 403, shot_type: '1/2 Swing', carry_distance: 90, carry_variance: 3, total_distance: 95, total_variance: 3, launch: 'Medium', roll: 'Rolls', unit: 'yards', tendency: 'Can be thin', swing_key: 'Stay down' },
    ],
  },
  {
    id: 2,
    name: 'Pitching Wedge',
    type: 'Wedge',
    loft: '46°',
    shaft_model: 'DG S400 Tour Issue',
    shaft_weight: '130g',
    shaft_flex: 'Wedge Flex',
    swing_weight: 'D4',
    grip_size: 'Standard',
    shots: [
      { id: 201, shot_type: 'Full', carry_distance: 110, carry_variance: 4, total_distance: 114, total_variance: 3, launch: 'High', roll: 'Stops', unit: 'yards', tendency: 'Good', swing_key: 'N/A' },
      { id: 202, shot_type: 'Pitch', carry_distance: 75, carry_variance: 3, total_distance: 78, total_variance: 2, launch: 'High', roll: 'Stops', unit: 'yards', tendency: 'Good', swing_key: 'N/A' },
      { id: 203, shot_type: 'Chip', carry_distance: 25, carry_variance: 2, total_distance: 30, total_variance: 2, launch: 'Low', roll: 'Rolls', unit: 'yards', tendency: 'Good', swing_key: 'N/A' },
    ],
  },
];

const YARDS_TO_METERS = 0.9144;
const METERS_TO_YARDS = 1.09361;

const convertDistance = (distance, fromUnit, toUnit) => {
  if (typeof distance !== 'number') return 0; // Gracefully handle undefined or non-numeric inputs
  if (fromUnit === toUnit) return distance;
  if (fromUnit === 'yards' && toUnit === 'meters') return distance * YARDS_TO_METERS;
  if (fromUnit === 'meters' && toUnit === 'yards') return distance * METERS_TO_YARDS;
  return distance; // Fallback
};

const RangeDisplay = ({ title, shots, displayUnit }) => {
  if (shots.length === 0) return null;

  const ranges = shots.map(s => {
    const total = convertDistance(s.total_distance, s.unit, displayUnit);
    const variance = convertDistance(s.total_variance, s.unit, displayUnit);
    return { min: total - variance, max: total + variance };
  });
  const min = Math.min(...ranges.map(r => r.min));
  const max = Math.max(...ranges.map(r => r.max));

  // Fix for NaN: Check if min/max are finite. If not, the component shouldn't render.
  if (!isFinite(min) || !isFinite(max)) {
    return null;
  }

  const meanDistances = shots.map(s => convertDistance(s.total_distance, s.unit, displayUnit));
  const mean = meanDistances.reduce((a, b) => a + b, 0) / meanDistances.length;

  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';

  // The overall scale of the slider.
  // 300 yards is a reasonable max for most clubs. Convert to meters for meter scale.
  const sliderMax = displayUnit === 'meters' ? convertDistance(300, 'yards', 'meters') : 300;
  
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {Math.round(min)}<Typography component="span" variant="caption" color="primary.main" fontWeight="bold"> / {Math.round(mean)} / </Typography>{Math.round(max)} {unitLabel}
        </Typography>
      </Stack>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1, mt: -1 }}>
        <Slider
          value={[min, mean, max]}
          min={0}
          max={sliderMax}
          disabled
          track={false} // We only want to show the thumbs
          sx={{
            '& .MuiSlider-rail': {
              height: 6,
              opacity: 0.3,
              background: (theme) => `linear-gradient(to right, ${theme.palette.info.light}, ${theme.palette.primary.main}, ${theme.palette.error.light})`,
            },
            '& .MuiSlider-thumb': { // Style the thumbs to act as markers
              height: 16,
              width: 4,
              borderRadius: '1px',
              backgroundColor: 'white',
              border: '1px solid currentColor',
              '&:nth-of-type(3)': { // The middle thumb (mean)
                backgroundColor: 'primary.main',
                borderColor: 'white',
                boxShadow: '0 0 4px 2px rgba(0,0,0,0.2)',
                zIndex: 1,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

const ClubCard = ({ club, shotConfig, displayUnit }) => {
  // Group shots by the user-defined categories
  const shotsByCategoryId = club.shots.reduce((acc, shot) => {
    const shotTypeDetail = getShotTypeDetails(shot.shot_type);    
    if (shotTypeDetail && shotTypeDetail.categoryIds) {
      shotTypeDetail.categoryIds.forEach(categoryId => {
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(shot);
      });
    }
    return acc;
  }, {});

  const clubSpecs = [
    { label: 'Loft', value: club.loft },
    { label: 'Shaft', value: `${club.shaft_model}` },
    { label: 'Flex', value: club.shaft_flex },
    { label: 'Weight', value: club.shaft_weight },
    { label: 'Swing Wt', value: club.swing_weight },
    { label: 'Grip', value: club.grip_size },
  ].filter(spec => spec.value); // Filter out any specs that are not defined

  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';

  return (
    <Card {...elevatedCardStyles} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={club.name}
        subheader={club.type}
        action={
          <>
            <IconButton aria-label="edit club">
              <Edit />
            </IconButton>
            <IconButton aria-label="delete club">
              <Delete />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <Stack spacing={3} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Specifications</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {clubSpecs.map(spec => (<Chip key={spec.label} label={`${spec.label}: ${spec.value}`} size="small" variant="outlined" />))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Distance Ranges</Typography>
            <Stack spacing={2}>
              {shotConfig.categories.map(category => (
                <RangeDisplay
                  key={category.id}
                  title={category.name}
                  shots={shotsByCategoryId[category.id] || []}
                  displayUnit={displayUnit}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          Shots
        </Typography>
        <Stack spacing={2}>
          {club.shots.map(shot => {
            // Calculate carry bounds
            const medianCarry = convertDistance(shot.carry_distance, shot.unit, displayUnit);
            const carryVariance = convertDistance(shot.carry_variance, shot.unit, displayUnit);
            const lowerBoundCarry = Math.round(medianCarry - carryVariance);
            const upperBoundCarry = Math.round(medianCarry + carryVariance);

            // Calculate total bounds
            const medianTotal = convertDistance(shot.total_distance, shot.unit, displayUnit);
            const totalVariance = convertDistance(shot.total_variance, shot.unit, displayUnit);
            const lowerBoundTotal = Math.round(medianTotal - totalVariance);
            const upperBoundTotal = Math.round(medianTotal + totalVariance);

            const shotTypeDetail = getShotTypeDetails(shot.shot_type);
            const categories = shotConfig.categories.filter(cat => shotTypeDetail?.categoryIds?.includes(cat.id));

            return ( // Parentheses added here
              <Paper key={shot.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{shot.shot_type}</Typography>
                  {categories.map(category => (
                    <Chip key={category.id} label={category.name} size="small" variant="outlined" />
                  ))}
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={
                    <span>
                      Carry: {lowerBoundCarry} - <Typography component="span" variant="body2" fontWeight="bold">{Math.round(medianCarry)}</Typography> - {upperBoundCarry} {unitLabel}
                    </span>
                  } />
                  <Chip label={
                    <span>
                      Total: {lowerBoundTotal} - <Typography component="span" variant="body2" fontWeight="bold">{Math.round(medianTotal)}</Typography> - {upperBoundTotal} {unitLabel}
                    </span>
                  } />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={`Launch: ${shot.launch}`} size="small" variant="outlined" />
                  <Chip label={`Roll: ${shot.roll}`} size="small" variant="outlined" />
                  <Chip label={`Tendency: ${shot.tendency}`} size="small" variant="outlined" color="warning" />
                  <Chip label={`Swing Key: ${shot.swing_key}`} size="small" variant="outlined" color="info" />
                </Stack>
              </Paper> // Parentheses added here
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

const MyBagPage = ({ userProfile, isActive }) => {
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distanceQuery, setDistanceQuery] = useState('');
  const [suggestedShots, setSuggestedShots] = useState([]);
  const [shotConfig, setShotConfig] = useState({ categories: [], shotTypes: [] });
  const [displayUnit, setDisplayUnit] = useState('meters'); // Default to meters

  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    // e.g., `userService.getBag(userProfile.user_id)`
    setMyClubs(mockMyBagData);
    setShotConfig(mockUserShotConfig);
    setLoading(false);
  }, [userProfile, isActive]);

  const handleDistanceSearch = (e) => {
    const distance = parseInt(e.target.value, 10);
    setDistanceQuery(e.target.value);

    if (isNaN(distance) || distance <= 0) {
      setSuggestedShots([]);
      return;
    }

    // This is the logic for the lookup tool (Requirement #5)
    const suggestions = [];
    myClubs.forEach(club => {
      club.shots.forEach(shot => {
        // Convert shot distances to the current display unit for comparison
        const carry = convertDistance(shot.carry_distance, shot.unit, displayUnit);
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
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="My Bag"
        subtitle="Manage your clubs and know your distances."
        icon={<StraightenIcon />}
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              color="primary"
              value={displayUnit}
              exclusive
              onChange={(e, newUnit) => { if (newUnit) setDisplayUnit(newUnit); }}
              aria-label="distance unit"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiToggleButton-root': { color: 'white', borderColor: 'rgba(255,255,255,0.3)' },
                '& .Mui-selected': { backgroundColor: 'white !important', color: 'primary.main !important' }
              }}
            >
              <ToggleButton value="meters">Meters</ToggleButton>
              <ToggleButton value="yards">Yards</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" startIcon={<Settings />} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}>
              Configure Shots
            </Button>
          </Stack>
        }
      />

      {/* Distance Lookup Tool */}
      <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>Distance Lookup</Typography>
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

              // Calculate carry bounds
              const medianCarry = convertDistance(shot.carry_distance, shot.unit, shot.displayUnit);
              const carryVariance = convertDistance(shot.carry_variance, shot.unit, shot.displayUnit);
              const lowerBoundCarry = Math.round(medianCarry - carryVariance);
              const upperBoundCarry = Math.round(medianCarry + carryVariance);

              // Calculate total bounds
              const medianTotal = convertDistance(shot.total_distance, shot.unit, shot.displayUnit);
              const totalVariance = convertDistance(shot.total_variance, shot.unit, shot.displayUnit);
              const lowerBoundTotal = Math.round(medianTotal - totalVariance);
              const upperBoundTotal = Math.round(medianTotal + totalVariance);

              return (
              <Paper key={`${shot.clubName}-${shot.id}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Box>
                  <Typography variant="body1" fontWeight="bold">{shot.clubName} - {shot.shot_type}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Carry: {lowerBoundCarry} - <b>{Math.round(medianCarry)}</b> - {upperBoundCarry} {unitLabel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">| Total: {lowerBoundTotal} - <b>{Math.round(medianTotal)}</b> - {upperBoundTotal} {unitLabel}</Typography>
                  </Stack>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={`Launch: ${shot.launch}`} size="small" color={shot.launch === 'High' ? 'info' : shot.launch === 'Low' ? 'warning' : 'default'} />
                  <Chip label={`Roll: ${shot.roll}`} size="small" color="success"/>
                  <Chip label={`Tendency: ${shot.tendency}`} size="small" color="warning" />
                  <Chip label={`Swing Key: ${shot.swing_key}`} size="small"  color="info" />
                  </Stack>
              </Paper>
            )})}
          </Stack>
        )}
      </Paper>

      {/* Club List */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Your Clubs</Typography>
        <Button variant="contained" startIcon={<Add />}>Add Club</Button>
      </Box>

      <Stack spacing={3}>
        {myClubs.map(club => (
          <ClubCard key={club.id} club={club} shotConfig={shotConfig} displayUnit={displayUnit} />
        ))}
      </Stack>
    </Box>
  );
};

export default MyBagPage;