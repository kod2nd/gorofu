// src/components/Dashboard.js
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Dashboard = ({ user }) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="h3" sx={{ color: theme.palette.text.primary, mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Historical Stats
            </Typography>
            <Typography variant="body1" color="text.secondary">
              (This is where charts and historical data will be displayed.)
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, bgcolor: theme.palette.background.paper }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Round Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              (This is where your round-by-round insights and tips will go.)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;