import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,  
  Paper,
  Collapse,
  ButtonBase,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  useTheme,
} from "@mui/material";
import { Edit, Delete, GolfCourse, Tune, Star, Add as Plus, Info, ExpandMore as ExpandMoreIcon,
  TrendingUp,
  Settings,
  Explore,
  ArrowUpward,
  ArrowDownward,
  Sort,
  AutoAwesome as Sparkles,
  Air as AirIcon,
  Bolt as BoltIcon, } from "@mui/icons-material";
import { elevatedCardStyles } from "../../styles/commonStyles";

import ShotCard from './ShotCard';
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

const calculateAggregateRange = (shots, distanceMetric, displayUnit) => {
  if (!shots || shots.length === 0) {
    return null;
  }

  const distanceKey = `${distanceMetric}_distance`;
  const varianceKey = `${distanceMetric}_variance`;

  const ranges = shots.map(s => {
    const median = convertDistance(s[distanceKey], s.unit, displayUnit);
    const variance = convertDistance(s[varianceKey], s.unit, displayUnit);
    return { min: median - variance, max: median + variance };
  });

  const lowerBound = Math.round(Math.min(...ranges.map(r => r.min)));
  const upperBound = Math.round(Math.max(...ranges.map(r => r.max)));

  const medianDistances = shots.map(s => convertDistance(s[distanceKey], s.unit, displayUnit));
  const median = Math.round(medianDistances.reduce((a, b) => a + b, 0) / medianDistances.length);

  return { lowerBound, median, upperBound };
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
  const [expanded, setExpanded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(true);
  const [showRanges, setShowRanges] = useState(true);
  const [shotSortOrder, setShotSortOrder] = useState('distance');
  const [shotSortDirection, setShotSortDirection] = useState('desc'); // 'asc' or 'desc'
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

  const sortedShots = useMemo(() => {
    const shotsToSort = [...safeShots];
    if (shotsToSort.length === 0) return [];

    const directionMultiplier = shotSortDirection === 'asc' ? 1 : -1;
    shotsToSort.sort((a, b) => {
      const getPrimaryCategory = (shot) => {
        const shotDetails = getShotTypeDetails(shot.shot_type, safeShotConfig);
        if (!shotDetails?.category_ids?.length) return 'ZZZ'; // Push to end
        const category = safeShotConfig.categories.find(c => c.id === shotDetails.category_ids[0]);
        return category?.name || 'ZZZ';
      };

      const distanceA = convertDistance(a.total_distance, a.unit, displayUnit);
      const distanceB = convertDistance(b.total_distance, b.unit, displayUnit);

      switch (shotSortOrder) {
        case 'distance':
          return (distanceA - distanceB) * directionMultiplier;
        case 'category':
          const catCompare = getPrimaryCategory(a).localeCompare(getPrimaryCategory(b));
          // For category, asc/desc is based on name, so multiplier is applied to the result
          return catCompare * directionMultiplier;
        case 'category_distance':
          const catDistCompare = getPrimaryCategory(a).localeCompare(getPrimaryCategory(b));
          if (catDistCompare !== 0) return catDistCompare;
          return (distanceB - distanceA); // Always sort distance descending within category
        case 'distance_category':
          if (distanceA !== distanceB) return (distanceB - distanceA); // Always sort distance descending first
          return getPrimaryCategory(a).localeCompare(getPrimaryCategory(b)); // Then sort category ascending
        default:
          return 0;
      }
    });
    return shotsToSort;
  }, [safeShots, shotSortOrder, shotSortDirection, safeShotConfig, displayUnit]);

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

  const handleEditClub = (event) => {
    event.stopPropagation();
    if (onEdit && safeClub) {
      onEdit(safeClub);
    }
  };

  const handleDeleteClub = (event) => {
    event.stopPropagation();
    if (onDeleteRequest && safeClub) {
      onDeleteRequest(safeClub, 'club');
    }
  };

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };


  // Safe categories
  const safeCategories = Array.isArray(safeShotConfig.categories) ? safeShotConfig.categories : [];
  
  const longGameCategoryId = useMemo(() => {
    const longGameCategory = safeCategories.find(c => c.name.toLowerCase() === 'long game');
    return longGameCategory?.id;
  }, [safeCategories]);

  const longGameShots = longGameCategoryId ? shotsByCategoryId[longGameCategoryId] : [];

  const summaryCarryRange = useMemo(() => calculateAggregateRange(longGameShots, 'carry', displayUnit), [longGameShots, displayUnit]);
  const summaryTotalRange = useMemo(() => calculateAggregateRange(longGameShots, 'total', displayUnit), [longGameShots, displayUnit]);

  const hasSummaryData = summaryCarryRange || summaryTotalRange;
  const isPutter = safeClub.type === 'Putter';

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleAccordionChange}
      sx={{ ...elevatedCardStyles, borderRadius: 3, overflow: 'hidden', '&:before': { display: 'none' } }}
    >
      <AccordionSummary
  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
  aria-controls={`panel-${safeClub.id}-content`}
  id={`panel-${safeClub.id}-header`}
  sx={{ 
    p: { xs: 1.5, sm: 2, md: 3 }, 
    bgcolor: 'primary.main', 
    color: 'white',
    '& .MuiAccordionSummary-content': {
      m: 0, 
      alignItems: 'center',
      overflow: 'hidden'
    }
  }}
>
  <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }} sx={{ width: '100%' }}>
    {/* Main clickable area */}
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        alignItems={{ xs: 'flex-start', md: 'center' }} 
        spacing={{ xs: 1, md: 4 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography 
            variant="h6"
            fontWeight="bold" 
            noWrap 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              lineHeight: 1.2
            }}
          >
            {safeClub.name || 'Unnamed Club'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9, 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4
            }}
          >
            {[safeClub.type, safeClub.make, safeClub.model].filter(Boolean).join(' • ')}
            {safeClub.loft && ` • ${safeClub.loft}°`}
          </Typography>
        </Box>
        
        {!isPutter && hasSummaryData && (
          <Stack direction="row" spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            {summaryCarryRange && (
              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    display: 'block'
                  }}
                >
                  Carry
                </Typography>
                <Typography 
                  fontWeight="bold" 
                  color="white"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  {summaryCarryRange.lowerBound} - {summaryCarryRange.median} {unitLabel}
                </Typography>
              </Box>
            )}
            {summaryTotalRange && (
              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    display: 'block'
                  }}
                >
                  Total
                </Typography>
                <Typography 
                  fontWeight="bold" 
                  color="white"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  {summaryTotalRange.lowerBound} - {summaryTotalRange.median} {unitLabel}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Box>

    {/* Action Buttons - Sibling to the main content */}
    <Box 
  sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.5 }, flexShrink: 0 }}
  onClick={(e) => e.stopPropagation()}
>
  <Box
    component="div"
    onClick={handleEditClub}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      color: 'white',
      cursor: 'pointer',
      borderRadius: '50%',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
    }}
    aria-label="edit club"
  >
    <Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />
  </Box>
  <Box
    component="div"
    onClick={handleDeleteClub}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      color: 'white',
      cursor: 'pointer',
      borderRadius: '50%',
      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
    }}
    aria-label="delete club"
  >
    <Delete sx={{ fontSize: { xs: 18, sm: 20 } }} />
  </Box>
</Box>
    </Stack>
</AccordionSummary>
      <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
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
<Box sx={{ mt: 1, position: 'relative' }}>
  <Box 
    sx={{ 
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      gap: 0.75,
      py: 0.5,
      px: 0.5,
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        height: 4,
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'grey.400',
        borderRadius: 2,
      },
      '& .MuiChip-root': {
        flexShrink: 0,
        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
        height: { xs: 26, sm: 32 },
        '& .MuiChip-label': {
          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.25, sm: 0.5 },
          whiteSpace: 'nowrap'
        }
      }
    }}
  >
    {clubSpecs.map(spec => (
      <Chip 
        key={spec.label} 
        label={`${spec.label}: ${spec.value}`} 
        size="small" 
        variant="outlined"
      />
    ))}
  </Box>
</Box>
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
<Box
  onClick={() => setShowRanges(!showRanges)}
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
    cursor: 'pointer',
    p: 1,
    mb: 1,
    borderRadius: 1,
    gap: { xs: 1, sm: 0 },
    '&:hover': { bgcolor: 'action.hover' }
  }}
>
  <Typography 
    variant="h6" 
    sx={{ 
      fontSize: { xs: '1rem', sm: '1.25rem' },
      fontWeight: 600 
    }}
  >
    Distance Ranges
  </Typography>
  
  <Box 
    onClick={(e) => e.stopPropagation()} 
    sx={{ 
      display: 'flex', 
      alignItems: 'center',
      width: { xs: '100%', sm: 'auto' },
      justifyContent: 'space-between'
    }}
  >
    <ToggleButtonGroup 
      size="small" 
      value={distanceView} 
      exclusive 
      onChange={(e, newView) => { if (newView) setDistanceView(newView); }} 
      aria-label="distance view"
      sx={{
        '& .MuiToggleButton-root': {
          px: { xs: 1, sm: 1.5 },
          py: { xs: 0.25, sm: 0.5 },
          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
          minWidth: { xs: 60, sm: 70 }
        }
      }}
    >
      <ToggleButton value="carry">Carry</ToggleButton>
      <ToggleButton value="total">Total</ToggleButton>
      <ToggleButton value="both">Both</ToggleButton>
    </ToggleButtonGroup>
    
    <ExpandMoreIcon 
      sx={{ 
        transform: showRanges ? 'rotate(180deg)' : 'rotate(0deg)', 
        transition: 'transform 0.3s', 
        ml: 1,
        fontSize: { xs: 20, sm: 24 }
      }} 
    />
  </Box>
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
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }, 
        justifyContent: 'space-between', 
        mb: 4,
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles sx={{ width: 20, height: 20, color: 'text.secondary' }} />
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Shots ({safeShots.length})
          </Typography>
        </Box>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
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

      {safeShots.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Sort color="action" />
            <Typography variant="body2" fontWeight="bold" color="text.secondary">Sort Shots By</Typography>
          </Box>
          <Stack 
  direction={{ xs: 'column', sm: 'row' }} 
  spacing={1} 
  sx={{ 
    flexWrap: 'wrap', 
    gap: 1,
    alignItems: { xs: 'stretch', sm: 'center' }
  }}
>
  <ToggleButtonGroup
    size="small"
    value={shotSortOrder}
    exclusive
    onChange={(e, newOrder) => { if (newOrder) setShotSortOrder(newOrder); }}
    sx={{
      width: { xs: '100%', sm: 'auto' },
      '& .MuiToggleButton-root': {
        flex: { xs: 1, sm: 'initial' },
        px: { xs: 0.75, sm: 1.5 },
        py: { xs: 0.5, sm: 0.375 },
        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
        whiteSpace: 'nowrap',
        minWidth: { xs: 'auto', sm: 80 }
      }
    }}
  >
    <ToggleButton value="distance">Distance</ToggleButton>
    <ToggleButton value="category">Category</ToggleButton>
    <ToggleButton value="category_distance">Cat & Dist</ToggleButton>
  </ToggleButtonGroup>
  
  <ToggleButtonGroup
    size="small"
    value={shotSortDirection}
    exclusive
    onChange={(e, newDir) => { if (newDir) setShotSortDirection(newDir); }}
    sx={{
      '& .MuiToggleButton-root': {
        px: { xs: 1, sm: 0.75 },
        py: { xs: 0.5, sm: 0.375 },
        minWidth: { xs: '50%', sm: 'auto' }
      }
    }}
  >
    <ToggleButton value="desc">
      <ArrowDownward fontSize="small" />
      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 0.5, fontSize: '0.75rem' }}>
        Desc
      </Box>
    </ToggleButton>
    <ToggleButton value="asc">
      <ArrowUpward fontSize="small" />
      <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 0.5, fontSize: '0.75rem' }}>
        Asc
      </Box>
    </ToggleButton>
  </ToggleButtonGroup>
</Stack>
        </Paper>
      )}

      {sortedShots.length > 0 ? (
        <Stack spacing={2}>
          {sortedShots.map(shot => (
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
      </AccordionDetails>
</Accordion>
  );
};

export default ClubCard;