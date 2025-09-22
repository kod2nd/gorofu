import { Typography, Paper, Box, Grid } from "@mui/material";

const StatCard = ({ label, value, percentage, tooltip }) => (
  <Box sx={{ 
    p: 2, 
    height: '100%',
    border: '1px solid #e0e0e0', 
    borderRadius: 2,
    backgroundColor: 'background.paper',
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: 1,
      borderColor: 'primary.light',
    }
  }}>
    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
      {value === 0 || value === "0.0" || value === "NaN" || value === null ? "-" : value}
    </Typography>
    {percentage !== null && !isNaN(percentage) && percentage > 0 && (
      <Typography variant="caption" color="text.secondary">
        {percentage.toFixed(0)}%
      </Typography>
    )}
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

  const avgPuttsPerHole = totalHolesPlayed > 0 ? (totalPutts / totalHolesPlayed).toFixed(1) : 0;
  const avgPenaltiesPerHole = totalHolesPlayed > 0 ? (totalPenalties / totalHolesPlayed).toFixed(1) : 0;
  const SZIRPercentage = totalHolesPlayed > 0 ? (totalSZIR / totalHolesPlayed) * 100 : null;
  const holeoutFromOutside4ftPercentage = totalHolesPlayed > 0 ? (totalHoleoutFromOutside4ft / totalHolesPlayed) * 100 : null;
  const holeoutWithin3ShotsPercentage = totalHolesPlayed > 0 ? (totalHoleoutWithin3Shots / totalHolesPlayed) * 100 : null;

  return (
    <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        3. Round Insights
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, color: 'primary.main' }}>
          📊 Traditional Stats
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Holes Played" value={totalHolesPlayed} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Total Strokes" value={totalScore} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Total Penalties" value={totalPenalties} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Avg Penalties/Hole" value={avgPenaltiesPerHole} />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, color: 'primary.main' }}>
          ⛳ Long Game
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <StatCard 
              label="Scoring Zone in Regulation" 
              value={totalSZIR} 
              percentage={SZIRPercentage} 
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2, color: 'primary.main' }}>
          🏌️ Short Game
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <StatCard label="Total Putts" value={totalPutts} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard label="Avg Putts/Hole" value={avgPuttsPerHole} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard label="Putts within 4ft" value={totalPuttsWithin4ft} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard 
              label="Holeouts within 3 Shots" 
              value={totalHoleoutWithin3Shots} 
              percentage={holeoutWithin3ShotsPercentage} 
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard 
              label="Multiple Putts inside 4ft" 
              value={holesWithMoreThanOnePuttWithin4ft} 
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard 
              label="Holeouts outside 4ft (Luck)" 
              value={totalHoleoutFromOutside4ft} 
              percentage={holeoutFromOutside4ftPercentage} 
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default RoundInsights;