import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Delete,
  TrendingUp,
  Explore,
  Air as AirIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';

// Helper functions can be moved to a shared utils file later
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
              <Chip icon={<TrendingUp fontSize="small" />} label={shot.launch} size="small" sx={{ borderRadius: 1.5, bgcolor: alpha('#3b82f6', 0.1), color: 'primary.dark', fontWeight: 500, }} />
            )}
            {shot.roll && (
              <Chip icon={<Explore fontSize="small" />} label={shot.roll} size="small" sx={{ borderRadius: 1.5, bgcolor: alpha('#10b981', 0.1), color: 'success.dark', fontWeight: 500, }} />
            )}
            {shot.tendency && shot.tendency.split(',').map(t => t.trim()).map((t, i) => (
              <Chip key={i} icon={<AirIcon fontSize="small" />} label={t} size="small" sx={{ borderRadius: 1.5, bgcolor: alpha('#f59e0b', 0.1), color: 'warning.dark', fontWeight: 500, }} />
            ))}
            {shot.swing_key && shot.swing_key.split(',').map(k => k.trim()).map((k, i) => (
              <Chip key={i} icon={<BoltIcon fontSize="small" />} label={k} size="small" sx={{ borderRadius: 1.5, bgcolor: alpha('#8b5cf6', 0.1), color: 'secondary.dark', fontWeight: 500, }} />
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default ShotCard;