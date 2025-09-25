import React from 'react';
import { Box, Button, Typography, Divider, Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const Sidebar = ({ onNavClick, onSignOut, isExpanded, handleDrawerToggle, activePage, userRole }) => {
  const theme = useTheme();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, page: "dashboard" },
    { text: "Add Round", icon: <AddCircleIcon />, page: "addRound" },
    { text: "Rounds History", icon: <HistoryIcon />, page: "roundsHistory" },
    { text: "Account", icon: <AccountCircleIcon />, page: "account" },
  ];

  // Add admin menu items for admin users
  if (userRole && ['admin', 'super_admin'].includes(userRole)) {
    menuItems.push({
      text: "User Management",
      icon: <AdminPanelSettingsIcon />,
      page: "userManagement"
    });
  }

  return (
    <Box
      sx={{
        width: isExpanded ? 240 : 60,
        height: '100vh',
        backgroundColor: theme.palette.custom.primaryDarkBlue,
        color: 'white',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Box sx={{ my: 3, textAlign: isExpanded ? 'center' : 'left', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'space-between' : 'center' }}>
        {isExpanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 1 }}>
            <SportsGolfIcon sx={{ fontSize: 40, color: 'white', mr: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              Gorufu
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      {isExpanded && (
        <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{textAlign: 'center', mt: -2, mb: 2}}>
          Improve your game.
        </Typography>
      )}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.5)', mb: 2 }} />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => onNavClick(item.page)}
              sx={{
                borderRadius: theme.shape.borderRadius,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                justifyContent: isExpanded ? 'initial' : 'center',
                px: 2.5,
              }}
              selected={item.page === activePage}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 0, mr: isExpanded ? 3 : 'auto' }}>
                {item.icon}
              </ListItemIcon>
              {isExpanded && <ListItemText primary={item.text} sx={{ color: 'white' }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.5)', mt: 2 }} />
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={onSignOut}
            sx={{
              borderRadius: theme.shape.borderRadius,
              width: '100%',
              color: 'white',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              px: 2.5,
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 0, mr: isExpanded ? 3 : 'auto' }}>
              <LogoutIcon />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Sign Out" sx={{ color: 'white' }} />}
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );
};

export default Sidebar;
