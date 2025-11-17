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
        <Box sx={{ px: 2, mb: 3 }}>
          <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
            Define Long/Short Threshold: {threshold}%
          </Typography>
          <Slider
            value={threshold}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderCommit}
            valueLabelDisplay="auto"
            step={5}
            marks={[
              { value: 5, label: '5%' },
              { value: 10, label: '10%' },
              { value: 15, label: '15%' },
              { value: 20, label: '20%' },
              { value: 25, label: '25%' },
            ]}
            min={5}
            max={25}
            valueLabelFormat={(value) => `${value}%`}
            sx={{ mt: 2, '& .MuiSlider-markLabel': { fontSize: '0.7rem' } }}
          />
        </Box>
  
        {/* Meters/Yards Toggle */}
        <Box sx={{ px: 2, mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            color="primary"
            value={distanceUnit}
            exclusive
            onChange={handleUnitChange}
            aria-label="distance unit"
            size="small"
            sx={{
              "& .Mui-selected, & .Mui-selected:hover": {
                color: "white",
                backgroundColor: 'primary.dark'
              },
            }}
          >
            <ToggleButton value="yards">Yards</ToggleButton>
            <ToggleButton value="meters">Meters</ToggleButton>
          </ToggleButtonGroup>
        </Box>
  
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {parData.map((data) => (
            <Box key={data.par}>
              <Typography variant="subtitle1" fontWeight="bold">{data.par}</Typography>
              <Typography variant="caption" color="text.secondary">
                Your average distance: {data.avgDist 
                  ? `${Math.round(distanceUnit === 'yards' ? data.avgDist : data.avgDist / 1.09361)}${distanceUnit === 'yards' ? 'y' : 'm'}` 
                  : '-'}
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ mt: 1, border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Distance Range</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Avg Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['Short', 'Medium', 'Long'].map((type) => (
                      <TableRow key={type}>
                        <TableCell>{type}</TableCell>
                        <TableCell align="center">{getDistanceRange(data.avgDist, type)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={data[type.toLowerCase()] ? data[type.toLowerCase()].toFixed(2) : '-'}
                            size="small"
                            color={getScoreColor(data[type.toLowerCase()], data.avgScore)}
                            icon={getScoreIcon(data[type.toLowerCase()], data.avgScore)}
                            sx={{ fontWeight: 'bold', minWidth: 70 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
  
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingDown fontSize="small" color="success" />
            <Typography variant="caption">Better than average</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Remove fontSize="small" color="action" />
            <Typography variant="caption">About average</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp fontSize="small" color="error" />
            <Typography variant="caption">Worse than average</Typography>
          </Box>
        </Box>
      </ChartCard>
    );
  };

export default RelativeDistanceAnalysis;