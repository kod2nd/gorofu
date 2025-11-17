import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { TrendingUp, TrendingDown, ShowChart } from '@mui/icons-material';

const AVG_STROKE_DIVIATION = 0.2;

const getScoreColor = (score, avgScore) => {
  if (!score || !avgScore) return '#6b7280';
  const diff = score - avgScore;
  if (diff < -AVG_STROKE_DIVIATION) return '#10b981';  // green
  if (diff > AVG_STROKE_DIVIATION) return '#ef4444';  // red
  return '#6b7280';  // neutral
};

const getScoreDisplay = (score, avgScore) => {
  if (!score || !avgScore) return "No Data";
  const diff = score - avgScore;
  const sign = diff >= 0 ? '+' : '';
  return `${score.toFixed(2)} (${sign}${diff.toFixed(2)})`;
};

const getScoreIcon = (score, avgScore) => {
  if (!score || !avgScore) return null;
  const diff = score - avgScore;
  if (diff < -AVG_STROKE_DIVIATION) return <TrendingDown fontSize="small" />;
  if (diff > AVG_STROKE_DIVIATION) return <TrendingUp fontSize="small" />;
  return <Box sx={{ width: 12, height: 2, backgroundColor: '#6b7280', borderRadius: 1 }} />;
};

const RelativeDistanceAnalysis = ({ recentRounds }) => {
  const [deviation, setDeviation] = useState(20);
  const [distanceUnit, setDistanceUnit] = useState('meters');

  const handleSliderChange = (event, newValue) => {
    // Slider always represents user's preferred units
    setDeviation(newValue);
  };

  const handleUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setDistanceUnit(newUnit);
    }
  };

  const convertDistance = (dist) =>
    distanceUnit === 'yards' ? dist / 0.9144 : dist;

  const getDistanceRange = (avgDist, type) => {
    if (!avgDist) return '-';
    const convertedAvg = convertDistance(avgDist);
    const convertedDeviation = convertDistance(deviation);
    const unit = distanceUnit === 'yards' ? 'y' : 'm';
    switch (type) {
      case 'Short':   return `Under ${Math.round(convertedAvg - convertedDeviation)}${unit}`;
      case 'Medium':  return `Target ± ${Math.round(convertedDeviation)}${unit}`;
      case 'Long':    return `Over ${Math.round(convertedAvg + convertedDeviation)}${unit}`;
      default: return '-';
    }
  };

  const parData = useMemo(() => {
    const allHoles = recentRounds.flatMap(round => round.round_holes);
    if (allHoles.length === 0) return [];
    const calculateStatsForPar = (par) => {
      const holesOfPar = allHoles.filter(h => h.par === par && h.distance > 0);
      if (holesOfPar.length === 0) return null;
      const distances = holesOfPar.map(h => h.distance).sort((a, b) => a - b);
      const mid = Math.floor(distances.length / 2);
      const medianDist = distances.length % 2 !== 0
        ? distances[mid]
        : (distances[mid - 1] + distances[mid]) / 2;
      const totalScore = holesOfPar.reduce((sum, h) => sum + h.hole_score, 0);
      const avgScore = totalScore / holesOfPar.length;
      const lowerBound = medianDist - convertDistance(deviation);
      const upperBound = medianDist + convertDistance(deviation);
      const shortHoles = holesOfPar.filter(h => h.distance < lowerBound);
      const mediumHoles = holesOfPar.filter(h => h.distance >= lowerBound && h.distance <= upperBound);
      const longHoles = holesOfPar.filter(h => h.distance > upperBound);
      const calcAvg = (arr) => arr.length > 0 ? arr.reduce((sum, h) => sum + h.hole_score, 0) / arr.length : null;
      return {
        par: `${par}`,
        medianDist,
        avgScore,
        short: calcAvg(shortHoles),
        medium: calcAvg(mediumHoles),
        long: calcAvg(longHoles),
      };
    };
    return [
      calculateStatsForPar(3),
      calculateStatsForPar(4),
      calculateStatsForPar(5),
    ].filter(Boolean);
  }, [recentRounds, deviation, distanceUnit]);

  if (parData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <ShowChart />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="600">
              Scoring by Hole Length
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Play more rounds to see analysis
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #fafeff 0%, #eef2ff 100%)',
        boxShadow: '0 4px 32px #bcd',
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <ShowChart />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Scoring by Hole Length
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Performance on short, medium, and long holes against the average
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Controls Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Threshold Slider */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight="bold"
            gutterBottom
            display="block"
          >
            Length Deviation
          </Typography>

          {(() => {
            const isYards = distanceUnit === "yards";
            const YARDS_TO_METERS = 0.9144;
            const marks = isYards
              ? [
                  { value: 10, label: "10y" },
                  { value: 20, label: "20y" },
                  { value: 30, label: "30y" },
                  { value: 40, label: "40y" },
                ]
              : [
                  { value: 10, label: "10m" },
                  { value: 20, label: "20m" },
                  { value: 30, label: "30m" },
                  { value: 40, label: "40m" },
                ];

            return (
              <Slider
                value={isYards ? deviation : deviation * YARDS_TO_METERS}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                step={isYards ? 5 : 5}
                marks={marks}
                min={isYards ? 10 : 10}
                max={isYards ? 40 : 40}
                valueLabelFormat={(value) =>
                  `${Math.round(value)}${isYards ? "y" : "m"}`
                }
                sx={{
                  mt: 1.5,
                  "& .MuiSlider-markLabel": { fontSize: "0.65rem" },
                  "& .MuiSlider-mark": {
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                  },
                }}
              />
            );
          })()}
        </Box>

        {/* Unit Toggle */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            gutterBottom
            display="block"
          >
            Distance Unit
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={distanceUnit}
            exclusive
            onChange={handleUnitChange}
            size="small"
            sx={{
              "& .Mui-selected, & .Mui-selected:hover": {
                color: "white",
                backgroundColor: "primary.dark",
              },
            }}
          >
            <ToggleButton value="yards">Yards</ToggleButton>
            <ToggleButton value="meters">Meters</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Data Cards */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        mb: 1
      }}>
        {parData.map((data) => (
            <Card
            key={data.par}
              elevation={3}
              sx={{
                flexBasis: { xs: '100%', md: 'calc(100% - 11px)' },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fafeff 0%, #eef2ff 100%)',
                boxShadow: '0 4px 20px #667eea22',
                minWidth: 240,
                transition: 'box-shadow 0.12s',
                '&:hover': { boxShadow: '0 8px 32px #667eea44' },
                border: '1.5px solid',
                borderColor: 'divider',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 2.5, textAlign: 'center', position: 'relative' }}>
                <Typography variant="subtitle1" fontWeight="bold" >
                  Par {data.par} 
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  {Math.round(convertDistance(data.medianDist))}
                  {distanceUnit === 'yards' ? 'y' : 'm'} Avg Dist / {data.avgScore ? data.avgScore.toFixed(2) : "-"} Avg Score
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{
                  display: 'flex',
                  mt: 1,
                  justifyContent: 'space-between',
                  gap: 2,
                  textAlign: 'center'
                }}>
                  {[
                    { key: 'short', label: 'Short', color: '#6b7280', icon: <TrendingDown fontSize="small" /> },
                    { key: 'medium', label: 'Medium', color: '#6b7280', icon: null },
                    { key: 'long', label: 'Long', color: '#6b7280', icon: <TrendingUp fontSize="small" /> }
                  ].map((cat) => (
                    <Box key={cat.key} sx={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      p: 1.1, borderRadius: 2, backgroundColor: cat.color + '12',
                      minWidth: 0,
                    }}>
                      <Box sx={{
                        mb: 0.2, width: 30, height: 30, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', 
                        backgroundColor: getScoreColor(data[cat.key], data.avgScore) + '22', // Dynamic background color
                        borderRadius: '50%',
                        color: getScoreColor(data[cat.key], data.avgScore) // Match icon color
                      }}>
                        {getScoreIcon(data[cat.key], data.avgScore)}
                      </Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.2 }}>
                        {cat.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" sx={{
                        color: getScoreColor(data[cat.key], data.avgScore), mt: 0.3, mb: 0.1,
                        fontSize: '0.75rem'
                      }}>
                        {getScoreDisplay(data[cat.key], data.avgScore)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                        {getDistanceRange(data.medianDist, cat.label)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>

      {/* Legend */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: '#f8fafc',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingDown fontSize="small" sx={{ color: '#10b981' }} />
          <Typography variant="caption" fontWeight="500">Lower than avg score</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 2, backgroundColor: '#6b7280', borderRadius: 1 }} />
          <Typography variant="caption" fontWeight="500">Within ±{AVG_STROKE_DIVIATION}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp fontSize="small" sx={{ color: '#ef4444' }} />
          <Typography variant="caption" fontWeight="500">Higher than avg score</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RelativeDistanceAnalysis;
