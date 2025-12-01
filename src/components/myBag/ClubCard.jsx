import React, { useState, useMemo } from "react";
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
  Collapse,
  alpha,
  useTheme,
} from "@mui/material";
import { Edit, Delete, GolfCourse, Tune, Star, Add as Plus, Info, ExpandMore as ExpandMoreIcon,
  TrendingUp,
  Settings,
  Explore,
  AutoAwesome as Sparkles,
  Air as AirIcon,
  Bolt as BoltIcon, } from "@mui/icons-material";
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
const getClubTypeStyle = (type, theme) => {
  const styles = {
    Driver: { gradient: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.dark} 100%)` },
    Woods: { gradient: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.dark} 100%)` },
    Hybrid: { gradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.dark} 100%)` },
    Iron: { gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.dark} 100%)` },
    Wedge: { gradient: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.dark} 100%)` },
    Putter: { gradient: `linear-gradient(135deg, ${theme.palette.grey[400]} 0%, ${theme.palette.grey[600]} 100%)` },
    Other: { gradient: `linear-gradient(135deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[700]} 100%)` },
  };
  return styles[type] || styles.Iron;
};

const RangeDisplay = ({ title, shots, displayUnit, distanceMetric = 'total', shotConfig, overallChartMin, overallChartMax }) => {
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
    
    const chartRange = overallChartMax - overallChartMin || 1; // Prevent division by zero
    const leftPercent = ((min - overallChartMin) / chartRange) * 100;
    const widthPercent = ((max - min) / chartRange) * 100;
    const avgPosition = max - min > 0 ? ((mean - min) / (max - min)) * 100 : 50;

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, mb: 2 }}>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
        </Stack>
        <Box sx={{ position: 'relative', height: 24, px: 1, mt: 3 }}>
          <Typography
            variant="body2"
            sx={{
              position: 'absolute',
              left: `calc(${leftPercent}% + (${widthPercent}% / 2))`,
              bottom: '100%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            <Typography component="span" variant="caption" color="text.secondary">{Math.round(min)}</Typography>
            <Typography component="span" variant="body2" color="primary.main" fontWeight="bold"> / {Math.round(mean)} / </Typography>
            <Typography component="span" variant="caption" color="text.secondary">{Math.round(max)} {unitLabel}</Typography>
          </Typography>
          <Box sx={{ position: 'absolute', left: 8, right: 8, top: '50%', transform: 'translateY(-50%)', height: 8, bgcolor: 'grey.300', borderRadius: 1 }} />
          <Box
            sx={{
              position: 'absolute',
              left: `calc(${leftPercent}% + 8px)`,
              width: `calc(${widthPercent}%)`,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 16,
              bgcolor: 'primary.main',
              boxShadow: 1,
            }}
          >
            {/* Average Marker */}
            <Box sx={{
              position: 'absolute',
              left: `${avgPosition}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 4,
              height: '120%',
            bgcolor: 'black', // Consistent with BagGappingChart
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

const ShotCard = ({ shot, displayUnit, shotConfig, onEdit, onDelete }) => {
  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';

  const medianCarry = convertDistance(shot.carry_distance, shot.unit, displayUnit);
  const carryVariance = convertDistance(shot.carry_variance, shot.unit, displayUnit);
  const lowerBoundCarry = Math.round(medianCarry - carryVariance);
  const upperBoundCarry = Math.round(medianCarry + carryVariance);

  const medianTotal = convertDistance(shot.total_distance, shot.unit, displayUnit);
  const totalVariance = convertDistance(shot.total_variance, shot.unit, displayUnit);
  const lowerBoundTotal = Math.round(medianTotal - totalVariance);
  const upperBoundTotal = Math.round(medianTotal + totalVariance);
  const theme = useTheme();

  const shotTypeDetail = getShotTypeDetails(shot.shot_type, shotConfig);
  const categories = shotConfig.categories?.filter(cat =>
    shotTypeDetail?.category_ids?.includes(cat.id)
  ) || [];

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2.5, 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: 'primary.light',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
            {shot.shot_type}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {categories.map(category => (
              <Chip 
                key={category.id} 
                label={category.name} 
                size="small" 
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => onEdit(shot)}
            sx={{
              bgcolor: 'grey.100',
              mr: 0.5,
              '&:hover': {
                bgcolor: 'grey.200',
              }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onDelete(shot.id)}
            sx={{
              bgcolor: 'grey.100',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.main',
              }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{
          bgcolor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 2,
          px: 2,
          py: 1.5,
          flex: 1,
          minWidth: 140,
        }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Carry
          </Typography>
          <Typography variant="caption" color="text.secondary">{lowerBoundCarry} {unitLabel}</Typography>
          <Typography variant="h6" fontWeight="bold" color="info.dark">
            {Math.round(medianCarry)} {unitLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">{upperBoundCarry} {unitLabel} </Typography>
        </Box>
        
        <Box sx={{
          bgcolor: alpha(theme.palette.success.main, 0.1),
          borderRadius: 2,
          px: 2,
          py: 1.5,
          flex: 1,
          minWidth: 140,
        }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Total
          </Typography>
          <Typography variant="caption" color="text.secondary">{lowerBoundTotal} {unitLabel}</Typography>
          <Typography variant="h6" fontWeight="bold" color="success.dark">
            {Math.round(medianTotal)} {unitLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">{upperBoundTotal} {unitLabel} </Typography>
        </Box>
      </Stack>
      
      {(shot.launch || shot.roll || shot.tendency || shot.swing_key) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {shot.launch && (
              <Chip 
                icon={<TrendingUp fontSize="small" />} 
                label={shot.launch} 
                size="small" 
                sx={{
                  borderRadius: 1.5,
                  bgcolor: alpha('#3b82f6', 0.1),
                  color: 'primary.dark',
                  fontWeight: 500,
                }}
              />
            )}
            {shot.roll && (
              <Chip 
                icon={<Explore fontSize="small" />} 
                label={shot.roll} 
                size="small" 
                sx={{
                  borderRadius: 1.5,
                  bgcolor: alpha('#10b981', 0.1),
                  color: 'success.dark',
                  fontWeight: 500,
                }}
              />
            )}
            {shot.tendency && shot.tendency.split(',').map(t => t.trim()).map((t, i) => (
              <Chip 
                key={i} 
                icon={<AirIcon fontSize="small" />} 
                label={t} 
                size="small" 
                sx={{
                  borderRadius: 1.5,
                  bgcolor: alpha('#f59e0b', 0.1),
                  color: 'warning.dark',
                  fontWeight: 500,
                }}
              />
            ))}
            {shot.swing_key && shot.swing_key.split(',').map(k => k.trim()).map((k, i) => (
              <Chip 
                key={i} 
                icon={<BoltIcon fontSize="small" />} 
                label={k} 
                size="small" 
                sx={{
                  borderRadius: 1.5,
                  bgcolor: alpha('#8b5cf6', 0.1),
                  color: 'secondary.dark',
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
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
  const [showSpecs, setShowSpecs] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const theme = useTheme();

  // Safe defaults for all props
  const safeClub = club || {};
  const safeShotConfig = shotConfig || { categories: [], shotTypes: [] };
  const safeBags = Array.isArray(bags) ? bags : [];
  const safeShots = Array.isArray(safeClub.shots) ? safeClub.shots : [];

  // Calculate the overall min/max across ALL shots for this club to create a consistent scale
  const { overallChartMin, overallChartMax } = useMemo(() => {
    if (safeShots.length === 0) {
      return { overallChartMin: 0, overallChartMax: 300 }; // Default scale
    }

    const allDistances = safeShots.flatMap(shot => {
      const carryMedian = convertDistance(shot.carry_distance, shot.unit, displayUnit);
      const carryVar = convertDistance(shot.carry_variance, shot.unit, displayUnit);
      const totalMedian = convertDistance(shot.total_distance, shot.unit, displayUnit);
      const totalVar = convertDistance(shot.total_variance, shot.unit, displayUnit);
      return [carryMedian - carryVar, carryMedian + carryVar, totalMedian - totalVar, totalMedian + totalVar];
    }).filter(d => isFinite(d));

    if (allDistances.length === 0) return { overallChartMin: 0, overallChartMax: 300 };

    const minDistance = Math.min(...allDistances);
    const maxDistance = Math.max(...allDistances);
    const range = maxDistance - minDistance;
    const padding = Math.max(10, range * 0.1); // 10% padding, at least 10 units

    return { overallChartMin: Math.max(0, minDistance - padding), overallChartMax: maxDistance + padding };

  }, [safeShots, displayUnit]);

  const typeStyle = getClubTypeStyle(safeClub.type, theme);

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
    { label: 'Bounce', value: safeClub.bounce },
    { label: 'Shaft', value: `${safeClub.shaft_make || ''} ${safeClub.shaft_model || ''}`.trim() },
    { label: 'Flex', value: safeClub.shaft_flex },
    { label: 'Grip', value: `${safeClub.grip_make || ''} ${safeClub.grip_model || ''}`.trim() },
  ].filter(spec => spec.value);

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
    <Card {...elevatedCardStyles} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">{safeClub.name || 'Unnamed Club'}</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>{safeClub.type || 'Unknown Type'}</Typography>
          </Box>
          <Box>
            <IconButton sx={{ color: 'white' }} aria-label="edit club" onClick={handleEditClub}>
              <Edit />
            </IconButton>
            <IconButton sx={{ color: 'white' }} aria-label="delete club" onClick={handleDeleteClub}>
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Box>

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
              <Button fullWidth onClick={() => setShowSpecs(!showSpecs)} endIcon={<ExpandMoreIcon sx={{ transform: showSpecs ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />} sx={{ justifyContent: 'space-between', color: 'text.primary', p: 0, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info color="action" />
                  <Typography variant="h6">Specifications</Typography>
                </Box>
              </Button>
              <Collapse in={showSpecs}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {clubSpecs.map(spec => (
                    <Chip key={spec.label} label={`${spec.label}: ${spec.value}`} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Collapse>
            </Box>
          )}

          <Box>
            <Box
              onClick={() => setShowRanges(!showRanges)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                p: 1,
                mb: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Typography variant="h6">Distance Ranges</Typography>
              <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', alignItems: 'center' }}>
                <ToggleButtonGroup size="small" value={distanceView} exclusive onChange={(e, newView) => { if (newView) setDistanceView(newView); }} aria-label="distance view">
                  <ToggleButton value="carry">Carry</ToggleButton>
                  <ToggleButton value="total">Total</ToggleButton>
                  <ToggleButton value="both">Both</ToggleButton>
                </ToggleButtonGroup>
                <ExpandMoreIcon sx={{ transform: showRanges ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', ml: 1 }} />
              </Box>
            </Box>
            <Collapse in={showRanges}>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {safeCategories.map(category => {
                  if (!category || !category.id) return null;
                  const categoryShots = shotsByCategoryId[category.id] || [];
                  if (categoryShots.length === 0) return null;

                  return (
                    <Paper key={category.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: 'block', mb: 1 }}>
                        {category.name || 'Unknown Category'}
                      </Typography>
                      <Stack spacing={2}>
                        {(distanceView === 'total' || distanceView === 'both') && (
                          <RangeDisplay title="Total" shots={categoryShots} displayUnit={displayUnit} distanceMetric="total" shotConfig={safeShotConfig} overallChartMin={overallChartMin} overallChartMax={overallChartMax}/>
                        )}
                        {(distanceView === 'carry' || distanceView === 'both') && (
                          <RangeDisplay title="Carry" shots={categoryShots} displayUnit={displayUnit} distanceMetric="carry" shotConfig={safeShotConfig} overallChartMin={overallChartMin} overallChartMax={overallChartMax}/>
                        )}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Collapse>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />
        
<Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles sx={{ width: 20, height: 20, color: 'text.secondary' }} />
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Shots ({safeShots.length})
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={onManageShotTypes}
            sx={{
              borderRadius: 3,
              bgcolor: 'grey.100',
              borderColor: 'grey.300',
              color: 'text.secondary',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                bgcolor: 'grey.200',
                borderColor: 'grey.400',
              }
            }}
          >
            Manage Types
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => onConfigureShots(club, true)}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              }
            }}
          >
            Add Shot
          </Button>
        </Stack>
      </Box>

      {safeShots.length > 0 ? (
        <Stack spacing={2}>
          {safeShots.map(shot => (
            <ShotCard
              key={shot.id}
              shot={shot}
              displayUnit={displayUnit}
              shotConfig={shotConfig}
              onEdit={(s) => onConfigureShots(club, false, s)}
              onDelete={(id) => onDeleteRequest(id, 'shot')}
            />
          ))}
        </Stack>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 4,
            border: '2px dashed',
            borderColor: 'grey.300',
            bgcolor: 'grey.50',
            p: 6,
            textAlign: 'center',
          }}
        >
          <Target sx={{ width: 48, height: 48, mx: 'auto', mb: 2, color: 'grey.400' }} />
          <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ mb: 2 }}>
            No shots logged yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus />}
            onClick={() => onConfigureShots(club, true)}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              }
            }}
          >
            Add First Shot
          </Button>
        </Paper>
      )}
    </Box>
      </CardContent>
    </Card>
  );
};

export default ClubCard;