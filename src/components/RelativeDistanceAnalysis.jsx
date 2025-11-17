import React, { useState, useMemo } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import { TrendingUp, TrendingDown, Circle, ShowChart } from '@mui/icons-material';

const RelativeDistanceAnalysis = ({ recentRounds }) => {
  const [deviation, setDeviation] = useState(20); // Base unit is always yards
  const [distanceUnit, setDistanceUnit] = useState('meters');

  const handleSliderChange = (event, newValue) => {
    // The slider's value is in the current display unit.
    // We convert it back to yards to store in state.
    const YARDS_TO_METERS = 0.9144;
    if (distanceUnit === 'meters') {
      setDeviation(newValue / YARDS_TO_METERS);
    } else {
      setDeviation(newValue);
    }
  };

  const handleUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setDistanceUnit(newUnit);
    }
  };

  const convertDistance = (dist) => {
    // Database stores in yards, so we convert from yards to meters if needed.
    return distanceUnit === 'yards' ? dist : dist * 0.9144;
  };

  const getDistanceRange = (avgDist, type) => {
    if (!avgDist) return '-';
    
    const convertedAvg = convertDistance(avgDist);
    const convertedDeviation = convertDistance(deviation);

    const lower = Math.round(convertedAvg - convertedDeviation);
    const upper = Math.round(convertedAvg + convertedDeviation);
    const unit = distanceUnit === 'yards' ? 'y' : 'm';
    
    switch (type) {
      case 'Short': return `under ${lower}${unit}`;
      case 'Medium': return `${convertedAvg.toFixed(0)}${unit}`;
      case 'Long': return `over ${upper}${unit}`;
      default: return '-';
    }
  };

  const AVG_STROKE_DIVIATION = 0.2; // Within +/- of this number is considered about average

  const getChipStyles = (score, avgScore) => {
    if (!score || !avgScore) return {};

    const diff = score - avgScore;

    if (diff < -AVG_STROKE_DIVIATION) {
      return {
        color: "#2e7d32",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        border: "1px solid rgba(76, 175, 80, 0.3)",
        "&:hover": {
          backgroundColor: "rgba(76, 175, 80, 0.2)",
        },
      };
    }

    if (diff > AVG_STROKE_DIVIATION) {
      return {
        color: "#c62828",
        backgroundColor: "rgba(244, 67, 54, 0.1)",
        border: "1px solid rgba(244, 67, 54, 0.3)",
        "&:hover": {
          backgroundColor: "rgba(244, 67, 54, 0.2)",
        },
      };
    }

    return {
      color: "text.secondary",
      backgroundColor: "grey.50",
      border: "1px solid grey.300",
    };
  };

  const getScoreDisplay = (score, avgScore) => {
    if (!score || !avgScore) return "-";
    const diff = score - avgScore;
    return score.toFixed(2) + " (" + diff.toFixed(2) + ")";
  };

  const getScoreIcon = (score, avgScore) => {
    if (!score || !avgScore) return null;
    const diff = score - avgScore;
    if (diff < -AVG_STROKE_DIVIATION) return <TrendingDown fontSize="small" />;
    if (diff > AVG_STROKE_DIVIATION) return <TrendingUp fontSize="small" />;
    return "";
  };

  const parData = useMemo(() => {
    const allHoles = recentRounds.flatMap(round => round.round_holes);
    if (allHoles.length === 0) return [];

    const calculateStatsForPar = (par) => {
      const holesOfPar = allHoles.filter(h => h.par === par && h.distance > 0);
      if (holesOfPar.length === 0) return null;

      // Calculate median distance instead of mean
      const distances = holesOfPar.map(h => h.distance).sort((a, b) => a - b);
      const mid = Math.floor(distances.length / 2);
      const medianDist = distances.length % 2 !== 0
        ? distances[mid]
        : (distances[mid - 1] + distances[mid]) / 2;

      const totalScore = holesOfPar.reduce((sum, h) => sum + h.hole_score, 0);
      const avgScore = totalScore / holesOfPar.length;

      const lowerBound = medianDist - deviation;
      const upperBound = medianDist + deviation;

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
    ].filter(Boolean); // Filter out nulls if a par type has no data

  }, [recentRounds, deviation]);

  if (parData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
            <ShowChart />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Scoring by Hole Length
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Play more rounds with distance data to see this analysis!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
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
            Performance on short, medium, and long holes relative to your
            average
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

      {/* Single Unified Table */}
      <TableContainer
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Par</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Avg Distance
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Avg Score
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "600",
                  color: "#1a5632",
                  bgcolor: "#e8f5e8",
                  border: "1px solid #c8e6c9",
                }}
              >
                Short
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "600",
                  color: "#0d47a1",
                  bgcolor: "#e3f2fd",
                  border: "1px solid #bbdefb",
                }}
              >
                Medium
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "600",
                  color: "#b71c1c",
                  bgcolor: "#ffebee",
                  border: "1px solid #ffcdd2",
                }}
              >
                Long
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parData.map((data, idx) => (
              <TableRow
                key={data.par}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  bgcolor: idx % 2 === 0 ? "background.paper" : "grey.50",
                }}
              >
                {/* Par Type */}
                <TableCell sx={{ fontWeight: "bold" }}>{data.par}</TableCell>

                {/* Average Distance */}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {Math.round(convertDistance(data.medianDist))}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      {distanceUnit === "yards" ? "y" : "m"}
                    </Typography>
                  </Typography>
                </TableCell>

                {/* Average Score */}
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="bold">
                    {data.avgScore ? data.avgScore.toFixed(2) : "-"}
                  </Typography>
                </TableCell>

                {/* Short */}
                <TableCell
                  align="center"
                  sx={{ bgcolor: "success.light" + "20" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Chip
                      label={data.short ? getScoreDisplay(data.short, data.avgScore) : "No Data"}
                      size="small"
                      icon={getScoreIcon(data.short, data.avgScore)}
                      sx={{ fontWeight: "bold", minWidth: 60, ...getChipStyles(data.short, data.avgScore) }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getDistanceRange(data.medianDist, "Short")}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Medium */}
                <TableCell align="center" sx={{ bgcolor: "info.light" + "20" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Chip
                      label={data.medium ? data.medium.toFixed(2) : "No Data"}
                      size="small"
                      icon={getScoreIcon(data.medium, data.avgScore)}
                      sx={{ fontWeight: "bold", minWidth: 60, ...getChipStyles(data.medium, data.avgScore) }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getDistanceRange(data.medianDist, "Medium")}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Long */}
                <TableCell
                  align="center"
                  sx={{ bgcolor: "error.light" + "20" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Chip
                      label={data.long ? data.long.toFixed(2) : "No Data"}
                      size="small"
                      icon={getScoreIcon(data.long, data.avgScore)}
                      sx={{ fontWeight: "bold", minWidth: 60, ...getChipStyles(data.long, data.avgScore) }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getDistanceRange(data.medianDist, "Long")}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 1,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendingDown fontSize="small" color="success" />
          <Typography variant="caption">Below average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Circle fontSize="small" sx={{ fontSize: '8px' }} color="action" />
          <Typography variant="caption">About Average (+/- {AVG_STROKE_DIVIATION} Strokes)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TrendingUp fontSize="small" color="error" />
          <Typography variant="caption">Above average</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RelativeDistanceAnalysis;