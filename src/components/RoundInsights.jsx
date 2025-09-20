import { Typography, Paper, Box } from "@mui/material";

const StatItem = ({ label, value, percentage }) => (
  <Box sx={{ mb: 2, p: 2, borderLeft: "3px solid #1976d2" }}>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
      {value === 0 || value === "0.0" || value === "NaN" ? "-" : value}
      {percentage !== null && !isNaN(percentage) && (
        <Typography
          component="span"
          variant="body1"
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          ({percentage.toFixed(0)}%)
        </Typography>
      )}
    </Typography>
  </Box>
);

const RoundInsights = ({ insightsData }) => {
  const {
    totalScore,
    totalPenalties,
    totalHolesPlayed,
    totalSZIR,
    totalPutts,
    totalPuttsWithin4ft,
    holesWithMoreThanOnePuttWithin4ft,
    totalHoleoutFromOutside4ft,
    totalHoleoutWithin3Shots,
  } = insightsData;

  const avgPuttsPerHole =
    totalHolesPlayed > 0 ? (totalPutts / totalHolesPlayed).toFixed(1) : 0;
  const SZIRPercentage =
    totalHolesPlayed > 0 ? (totalSZIR / totalHolesPlayed) * 100 : null;
  const holeoutFromOutside4ftPercentage =
    totalHolesPlayed > 0
      ? (totalHoleoutFromOutside4ft / totalHolesPlayed) * 100
      : null;
  const holeoutWithin3ShotsPercentage =
    totalHolesPlayed > 0
      ? (totalHoleoutWithin3Shots / totalHolesPlayed) * 100
      : null;

  return (
    <Paper elevation={2} style={{ padding: "16px", marginBottom: "24px" }}>
      <Typography variant="h6" gutterBottom>
        3. Round Insights
      </Typography>
      <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: "4px" }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Round Report Card
        </Typography>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Traditional Stats
          </Typography>
          <StatItem label="Holes Played" value={totalHolesPlayed} />
          <StatItem label="Total Strokes" value={totalScore} />
          <StatItem label="Total Penalties" value={totalPenalties} />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Long Game
          </Typography>
          <StatItem
            label="Scoring Zone in Regulation"
            value={totalSZIR}
            percentage={SZIRPercentage}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Short Game
          </Typography>
          <StatItem
            label="Holeouts within 3 Shots of S.Z."
            value={totalHoleoutWithin3Shots}
            percentage={holeoutWithin3ShotsPercentage}
          />
          <StatItem label="Total Putts on Green" value={totalPutts} />
          <StatItem label="Average Putts per Hole" value={avgPuttsPerHole} />
          <StatItem label="Putts within 4 ft" value={totalPuttsWithin4ft} />
          <StatItem
            label="Holes with multiple putts inside 4 ft"
            value={holesWithMoreThanOnePuttWithin4ft}
          />
          <StatItem
            label="Holeouts outside 4 ft (The Luck Stat)"
            value={totalHoleoutFromOutside4ft}
            percentage={holeoutFromOutside4ftPercentage}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default RoundInsights;
