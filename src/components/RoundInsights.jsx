import { Typography, Paper, Box, Tooltip } from "@mui/material";
import { cardStyles, sectionHeaderStyles, hoverEffects } from "../styles/commonStyles";

const StatCard = ({ label, value, percentage, tooltip }) => (
  <Tooltip title={tooltip || ''} arrow placement="top">
    <Box sx={{ 
    p: 2, 
    height: '100%',
    border: '1px solid',
    borderColor: 'divider', 
    borderRadius: 2,
    backgroundColor: 'background.paper',
    ...hoverEffects.card,
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
  </Tooltip>
);

const RoundInsights = ({ insightsData, isMobile }) => {
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
  const multiPuttRatio = totalHolesPlayed > 0 ? (holesWithMoreThanOnePuttWithin4ft / totalHolesPlayed) * 100 : null;
  const holeoutFromOutside4ftPercentage = totalHolesPlayed > 0 ? (totalHoleoutFromOutside4ft / totalHolesPlayed) * 100 : null;
  const holeoutWithin3ShotsPercentage = totalSZIR > 0 ? (totalHoleoutWithin3Shots / totalHolesPlayed) * 100 : null;

  return (
    <Paper sx={{
            cardStyles,
          }}>
      
      <Box sx={{ mb: 4 }}>
        <Typography {...sectionHeaderStyles}>
          📊 Traditional Stats
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
            <StatCard label="Holes Played" value={totalHolesPlayed} tooltip="Total number of holes with hole-by-hole data."/>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
            <StatCard label="Total Strokes" value={totalScore} tooltip="Sum of all strokes for the round(s)."/>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
            <StatCard label="Total Penalties" value={totalPenalties} tooltip="Total penalty strokes recorded."/>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}>
            <StatCard label="Avg Penalties/Hole" value={avgPenaltiesPerHole} tooltip="Average number of penalty strokes per hole."/>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography {...sectionHeaderStyles}>
          ⛳ Long Game
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
            <StatCard
                label="Scoring Zone in Regulation (SZIR)"
                value={`${totalSZIR} / ${totalHolesPlayed}`}
                percentage={SZIRPercentage}
                tooltip="Getting inside the Scoring Zone within Par-2 shots. This shows you the number of times you have given yourself a change to score"
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography {...sectionHeaderStyles}>
          🏌️ Short Game
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
            <StatCard label="Total Putts" value={totalPutts} tooltip="Total number of putts."/>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
            <StatCard label="Avg Putts/Hole" value={avgPuttsPerHole} tooltip="Average number of putts per hole."/>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
            <StatCard label="Putts within 4ft" value={totalPuttsWithin4ft} tooltip="Total number of putts taken from within 4 feet of the hole."/>
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
            <StatCard
                label="SZ Par (Holeout in 3)"
                value={`${totalHoleoutWithin3Shots} / ${totalHolesPlayed}`}
                percentage={holeoutWithin3ShotsPercentage}
                tooltip="Holing out in 3 or fewer shots once inside the Scoring Zone. This is your conversion rate for scoring opportunities."
            />
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
            <StatCard
                label="Holes w/ Short Misses (<4ft)"
                value={holesWithMoreThanOnePuttWithin4ft}
                percentage={multiPuttRatio}
                tooltip="Number of holes where you took more than one putt from inside 4 feet."
            />
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
            <StatCard
                label="Luck / Strokes Gained (Holeout >4ft)"
                value={totalHoleoutFromOutside4ft}
                percentage={holeoutFromOutside4ftPercentage}
                tooltip="Number of times you holed out from outside 4 feet!"
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default RoundInsights;