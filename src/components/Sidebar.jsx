// src/components/Sidebar.js
import { Box, Button, Typography, Divider, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Sidebar = ({ onNavClick, onSignOut }) => {
  const theme = useTheme();

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', icon: <DashboardIcon /> },
    { label: 'Add Round', page: 'addRound', icon: <AddCircleIcon /> },
    { label: 'Account', page: 'account', icon: <AccountCircleIcon /> },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        width: 280,
        flexShrink: 0,
        p: 3,
        bgcolor: theme.palette.custom.white,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: theme.palette.custom.primaryDarkBlue,
            mb: 1,
          }}
        >
          Golf Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Improve your game.
        </Typography>
      </Box>

      <Box>
        {navItems.map((item) => (
          <Button
            key={item.page}
            startIcon={item.icon}
            onClick={() => onNavClick(item.page)}
            sx={{
              justifyContent: 'flex-start',
              width: '100%',
              mb: 1,
              color: theme.palette.text.primary,
              '&:hover': {
                bgcolor: theme.palette.custom.lightGrey,
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      <Button
        startIcon={<LogoutIcon />}
        onClick={onSignOut}
        sx={{
          justifyContent: 'flex-start',
          color: theme.palette.text.secondary,
        }}
      >
        Sign Out
      </Button>
    </Paper>
  );
};

export default Sidebar;