import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import theme from './theme';
import Drawer from '@mui/material/Drawer';

// Import your components
import Auth from './Auth';
import Dashboard from './components/Dashboard';
import RoundForm from './RoundForm';
import Sidebar from './components/Sidebar';

const drawerWidth = 240;
const collapsedWidth = 60;

function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'addRound':
        return 'Add Round';
      case 'account':
        return 'Account';
      default:
        return 'GolfStat';
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={session.user} />;
      case 'addRound':
        return <RoundForm user={session.user} />;
      default:
        return <Dashboard user={session.user} />;
    }
  };

  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <Auth />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${isDrawerOpen ? drawerWidth : collapsedWidth}px)`,
            ml: `${isDrawerOpen ? drawerWidth : collapsedWidth}px`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              {getPageTitle(activePage)}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{
            width: isDrawerOpen ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="permanent"
            open={isDrawerOpen}
            onClose={handleDrawerToggle}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: isDrawerOpen ? drawerWidth : collapsedWidth,
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
          >
            <Sidebar
              onNavClick={setActivePage}
              onSignOut={handleSignOut}
              isExpanded={isDrawerOpen}
              handleDrawerToggle={handleDrawerToggle}
              activePage={activePage}
            />
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: isDrawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
            {renderContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
