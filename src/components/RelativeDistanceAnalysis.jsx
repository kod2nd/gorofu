import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove, ShowChart } from '@mui/icons-material';

const ChartCard = ({ title, subtitle, children, icon, sx }) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          borderColor: 'primary.light',
        },
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </Paper>
  );

const RelativeDistanceAnalysis = ({ stats, onThresholdChange }) => {
    const theme = useTheme();
    const [threshold, setThreshold] = useState(15); // Default to 15%
    const [distanceUnit, setDistanceUnit] = useState('meters'); // Default to meters
  
    const handleSliderChange = (event, newValue) => {
      setThreshold(newValue);
    };
  
    const handleSliderCommit = (event, newValue) => {
      if (typeof onThresholdChange === 'function') {
        onThresholdChange(newValue / 100); // Convert to decimal for the DB function
      }
    };
  
    const handleUnitChange = (event, newUnit) => {
      if (newUnit !== null) {
        setDistanceUnit(newUnit);
      }
    };
  
    const getDistanceRange = (avgDist, type) => {
      if (!avgDist) return type;
  
      // Convert avgDist if unit is meters
      const convertedAvgDist = distanceUnit === 'yards' ? avgDist : avgDist / 1.09361; // 1 meter = 1.09361 yards
  
      const lowerBound = Math.round(convertedAvgDist * (1 - (threshold / 100)));
      const upperBound = Math.round(convertedAvgDist * (1 + (threshold / 100)));
      const unitLabel = distanceUnit === 'yards' ? 'y' : 'm';
      switch (type) {
        case 'Short': return `Short (<${lowerBound}${unitLabel})`;
        case 'Medium': return `Medium (${lowerBound}-${upperBound}${unitLabel})`;
        case 'Long': return `Long (>${upperBound}${unitLabel})`;
        default: return type;
      }
    };
  
    const getScoreColor = (score, avgScore) => {
      if (!score || !avgScore) return 'default';
      const diff = score - avgScore;
      if (diff < -0.2) return 'success';
      if (diff > 0.2) return 'error';
      return 'default';
    };
  
    const getScoreIcon = (score, avgScore) => {
      if (!score || !avgScore) return null;
      const diff = score - avgScore;
      if (diff < -0.2) return <TrendingDown fontSize="small" />;
      if (diff > 0.2) return <TrendingUp fontSize="small" />;
      return <Remove fontSize="small" />;
    };
  
    const parData = [
      {
        par: 'Par 3',
        avgDist: stats.avg_dist_par3,
        avgScore: stats.avg_par3_score,
        short: stats.avg_score_short_par3,
        medium: stats.avg_score_medium_par3,
        long: stats.avg_score_long_par3,
      },
      {
        par: 'Par 4',
        avgDist: stats.avg_dist_par4,
        avgScore: stats.avg_par4_score,
        short: stats.avg_score_short_par4,
        medium: stats.avg_score_medium_par4,
        long: stats.avg_score_long_par4,
      },
      {
        par: 'Par 5',
        avgDist: stats.avg_dist_par5,
        avgScore: stats.avg_par5_score,
        short: stats.avg_score_short_par5,
        medium: stats.avg_score_medium_par5,
        long: stats.avg_score_long_par5,
      },
    ].filter(d => d.avgDist);
  
    return (
      <ChartCard title="Scoring by Relative Hole Length" subtitle="How you score on holes based on their length relative to your average." icon={<ShowChart />} sx={{ flexBasis: '100%' }}>
        {/* ... (The rest of the component's JSX) ... */}
      </ChartCard>
    );
  };

export default RelativeDistanceAnalysis;