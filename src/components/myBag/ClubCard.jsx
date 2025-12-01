import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,  
  Paper,
} from "@mui/material";
import { Edit, Delete, GolfCourse, Tune, Star, Add } from "@mui/icons-material";
import { elevatedCardStyles } from "../../styles/commonStyles";

// Safe helper functions with comprehensive error handling
const YARDS_TO_METERS = 0.9144;
const METERS_TO_YARDS = 1.09361;

const convertDistance = (distance, fromUnit, toUnit) => {
  try {
    if (typeof distance !== 'number' || isNaN(distance)) return 0;
    if (fromUnit === toUnit) return distance;
    if (fromUnit === 'yards' && toUnit === 'meters') return distance * YARDS_TO_METERS;
    if (fromUnit === 'meters' && toUnit === 'yards') return distance * METERS_TO_YARDS;
    return distance;
  } catch (error) {
    console.error('Error converting distance:', error);
    return 0;
  }
};

const getShotTypeDetails = (shotTypeName, shotConfig) => {
  try {
    if (!shotConfig || !shotConfig.shotTypes || !Array.isArray(shotConfig.shotTypes)) {
      return null;
    }
    return shotConfig.shotTypes.find(st => st && st.name === shotTypeName) || null;
  } catch (error) {
    console.error('Error getting shot type details:', error);
    return null;
  }
};

const RangeDisplay = ({ title, shots, displayUnit, distanceMetric = 'total', shotConfig }) => {
  try {
    if (!shots || !Array.isArray(shots) || shots.length === 0) return null;

    const distanceKey = `${distanceMetric}_distance`;
    const varianceKey = `${distanceMetric}_variance`;

    const ranges = shots.map(s => {
      if (!s) return { min: 0, max: 0 };
      const total = convertDistance(s[distanceKey], s.unit, displayUnit);
      const variance = convertDistance(s[varianceKey], s.unit, displayUnit);
      return { min: total - variance, max: total + variance };
    });
    
    const min = Math.min(...ranges.map(r => r.min));
    const max = Math.max(...ranges.map(r => r.max));

    if (!isFinite(min) || !isFinite(max)) {
      return null;
    }

    const meanDistances = shots.map(s => convertDistance(s[distanceKey], s.unit, displayUnit));
    const mean = meanDistances.reduce((a, b) => a + b, 0) / meanDistances.length;

    const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';
    const sliderMax = displayUnit === 'meters' ? convertDistance(300, 'yards', 'meters') : 300;
    
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1 }}>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(min)}<Typography component="span" variant="caption" color="primary.main" fontWeight="bold"> / {Math.round(mean)} / </Typography>{Math.round(max)} {unitLabel}
          </Typography>
        </Stack>
      <Box sx={{ position: 'relative', height: 24, px: 1 }}>
        <Box sx={{ position: 'absolute', left: 8, right: 8, top: '50%', transform: 'translateY(-50%)', height: 8, bgcolor: 'grey.300', borderRadius: 1 }} />
        <Box
          sx={{
            position: 'absolute',
            left: `calc(${(min / sliderMax) * 100}% + 8px)`,
            width: `calc(${((max - min) / sliderMax) * 100}%)`,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 16,
            bgcolor: 'primary.main',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          {/* Average Marker */}
          <Box sx={{
            position: 'absolute',
            left: `${((mean - min) / (max - min)) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 4,
            height: '120%',
            bgcolor: 'white',
            borderRadius: '2px',
            boxShadow: 1,
          }} />
        </Box>
        </Box>
      </Box>
    );
  } catch (error) {
    console.error('Error in RangeDisplay:', error);
    return null;
  }
};

const ClubCard = ({ 
  club, 
  shotConfig, 
  displayUnit, 
  bags, 
  onEdit, 
  onDeleteRequest, 
  onConfigureShots, 
  onManageShotTypes, 
  onBagAssignmentChange 
}) => {
  const [distanceView, setDistanceView] = useState('total');

  // Safe defaults for all props
  const safeClub = club || {};
  const safeShotConfig = shotConfig || { categories: [], shotTypes: [] };
  const safeBags = Array.isArray(bags) ? bags : [];
  const safeShots = Array.isArray(safeClub.shots) ? safeClub.shots : [];

  // Safe shots by category grouping
  const shotsByCategoryId = safeShots.reduce((acc, shot) => {
    try {
      if (!shot || !shot.shot_type) return acc;
      
      const shotTypeDetail = getShotTypeDetails(shot.shot_type, safeShotConfig);    
      if (shotTypeDetail && Array.isArray(shotTypeDetail.category_ids)) {
        shotTypeDetail.category_ids.forEach(categoryId => {
          if (categoryId) {
            if (!acc[categoryId]) {
              acc[categoryId] = [];
            }
            acc[categoryId].push(shot);
          }
        });
      }
      return acc;
    } catch (error) {
      console.error('Error processing shot:', error);
      return acc;
    }
  }, {});

  // Safe club specs
  const clubSpecs = [
    { label: 'Make', value: safeClub.make },
    { label: 'Model', value: safeClub.model },
    { label: 'Loft', value: safeClub.loft },
    { label: 'Shaft', value: `${safeClub.shaft_make || ''} ${safeClub.shaft_model || ''}`.trim() },
    { label: 'Flex', value: safeClub.shaft_flex },
    { label: 'Grip', value: `${safeClub.grip_make || ''} ${safeClub.grip_model || ''}`.trim() },
  ].filter(spec => spec.value && spec.value.trim() !== '');

  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';
  
  // Safe bag filtering
  const bagsContainingClubIds = safeBags
    .filter(bag => bag && Array.isArray(bag.clubIds) && bag.clubIds.includes(safeClub.id))
    .map(b => b.id);

  const handleBagToggle = (bagId) => {
    try {
      const newBagIds = [...bagsContainingClubIds];
      const currentIndex = newBagIds.indexOf(bagId);

      if (currentIndex === -1) {
        newBagIds.push(bagId);
      } else {
        newBagIds.splice(currentIndex, 1);
      }
      
      if (onBagAssignmentChange) {
        onBagAssignmentChange(safeClub.id, newBagIds);
      }
    } catch (error) {
      console.error('Error handling bag toggle:', error);
    }
  };

  const handleDeleteShot = (shotId) => {
    if (onDeleteRequest) {
      onDeleteRequest(shotId, 'shot');
    }
  };

  const handleEditClub = () => {
    if (onEdit && safeClub) {
      onEdit(safeClub);
    }
  };

  const handleDeleteClub = () => {
    if (onDeleteRequest && safeClub) {
      onDeleteRequest(safeClub, 'club');
    }
  };

  const handleAddShot = () => {
    if (onConfigureShots && safeClub) {
      onConfigureShots(safeClub, true);
    }
  };

  const handleEditShot = (shot) => {
    if (onConfigureShots && safeClub && shot) {
      onConfigureShots(safeClub, false, shot);
    }
  };

  // Safe categories
  const safeCategories = Array.isArray(safeShotConfig.categories) ? safeShotConfig.categories : [];
  
  return (
    <Card {...elevatedCardStyles} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={safeClub.name || 'Unnamed Club'}
        subheader={safeClub.type || 'Unknown Type'}
        action={
          <>
            <IconButton aria-label="edit club" onClick={handleEditClub}>
              <Edit />
            </IconButton>
            <IconButton aria-label="delete club" onClick={handleDeleteClub}>
              <Delete />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <Stack spacing={3} sx={{ mb: 2 }}>
          {safeBags.length > 0 && (            
            <Box>
              <Typography variant="overline" color="text.secondary">In Bags</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {safeBags.map(bag => (
                  <Chip
                    key={bag?.id || 'unknown'}
                    icon={<GolfCourse />}
                    label={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        {bag?.name || 'Unknown Bag'}
                        {bag?.is_default && <Star sx={{ fontSize: 16, ml: 0.5, color: 'inherit' }} />}
                      </Box>
                    }
                    clickable
                    color={bagsContainingClubIds.includes(bag?.id) ? 'primary' : 'default'}
                    variant={bagsContainingClubIds.includes(bag?.id) ? 'filled' : 'outlined'}
                    onClick={() => bag?.id && handleBagToggle(bag.id)}
                  />
                ))}
              </Stack>
            </Box>
          )}
          
          {clubSpecs.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1.5 }}>Specifications</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {clubSpecs.map(spec => (
                  <Chip 
                    key={spec.label} 
                    label={`${spec.label}: ${spec.value}`} 
                    size="small" 
                    variant="outlined" 
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6">Distance Ranges</Typography>
              <ToggleButtonGroup
                size="small"
                value={distanceView}
                exclusive
                onChange={(e, newView) => { if (newView) setDistanceView(newView); }}
                aria-label="distance view"
              >
                <ToggleButton value="carry">Carry</ToggleButton>
                <ToggleButton value="total">Total</ToggleButton>
                <ToggleButton value="both">Both</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Stack spacing={2}>
              {safeCategories.map(category => {
                if (!category || !category.id) return null;
                
                const categoryShots = shotsByCategoryId[category.id] || [];
                if (categoryShots.length === 0) return null;

                return (
                  <Box key={category.id}>
                    <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
                      {category.name || 'Unknown Category'}
                    </Typography>
                    { (distanceView === 'carry' || distanceView === 'both') && (
                      <RangeDisplay 
                        title="Carry" 
                        shots={categoryShots} 
                        displayUnit={displayUnit} 
                        distanceMetric="carry" 
                        shotConfig={safeShotConfig} 
                      />
                    )}
                    { (distanceView === 'total' || distanceView === 'both') && (
                      <RangeDisplay 
                        title="Total" 
                        shots={categoryShots} 
                        displayUnit={displayUnit} 
                        distanceMetric="total" 
                        shotConfig={safeShotConfig} 
                      />
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Shots</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="text" startIcon={<Tune />} onClick={onManageShotTypes}>
              Manage Types
            </Button>
            <Button variant="outlined" startIcon={<Add />} onClick={handleAddShot}>
              Add Shot
            </Button>
          </Stack>
        </Box>
        
        <Stack spacing={2}>
          {safeShots.map(shot => {
            if (!shot || !shot.id) return null;

            const medianCarry = convertDistance(shot.carry_distance, shot.unit, displayUnit);
            const carryVariance = convertDistance(shot.carry_variance, shot.unit, displayUnit);
            const lowerBoundCarry = Math.round(medianCarry - carryVariance);
            const upperBoundCarry = Math.round(medianCarry + carryVariance);

            const medianTotal = convertDistance(shot.total_distance, shot.unit, displayUnit);
            const totalVariance = convertDistance(shot.total_variance, shot.unit, displayUnit);
            const lowerBoundTotal = Math.round(medianTotal - totalVariance);
            const upperBoundTotal = Math.round(medianTotal + totalVariance);

            const shotTypeDetail = getShotTypeDetails(shot.shot_type, safeShotConfig);
            const categories = safeCategories.filter(cat => 
              shotTypeDetail?.category_ids?.includes(cat.id)
            );

            return (
              <Paper key={shot.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {shot.shot_type || 'Unknown Shot Type'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      {categories.map(category => (
                        <Chip 
                          key={category.id} 
                          label={category.name} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditShot(shot)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteShot(shot.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={
                    <span>
                      Carry: {lowerBoundCarry} - 
                      <Typography component="span" variant="body2" fontWeight="bold">
                        {Math.round(medianCarry)}
                      </Typography> - {upperBoundCarry} {unitLabel}
                    </span>
                  } />
                  <Chip label={
                    <span>
                      Total: {lowerBoundTotal} - 
                      <Typography component="span" variant="body2" fontWeight="bold">
                        {Math.round(medianTotal)}
                      </Typography> - {upperBoundTotal} {unitLabel}
                    </span>
                  } />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {shot.launch && <Chip label={`Launch: ${shot.launch}`} size="small" />}
                  {shot.roll && <Chip label={`Roll: ${shot.roll}`} size="small" color="success"/>}
                  {shot.tendency && <Chip label={`Tendency: ${shot.tendency}`} size="small" color="warning" />}
                  {shot.swing_key && <Chip label={`Swing Key: ${shot.swing_key}`} size="small" color="info" />}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ClubCard;