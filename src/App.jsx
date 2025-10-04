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
  useMediaQuery,
  IconButton,
} from '@mui/material';
import theme from './theme';
import Drawer from '@mui/material/Drawer';

// Import your components
import MenuIcon from '@mui/icons-material/Menu';
import Auth from './Auth';
import Dashboard from './components/Dashboard';
import RoundForm from './RoundForm';
import Sidebar from './components/Sidebar';
import UserManagement from './components/UserManagement';
import AdminRoute from './components/AdminRoute';
import AccountPage from './components/AccountPage';
import RoundsHistoryPage from './components/RoundsHistoryPage';
import RoundDetailsPage from './components/RoundDetailsPage';
import CourseManagementPage from './components/CourseManagementPage';
import { userService } from './services/userService';

const drawerWidth = 240;
const collapsedWidth = 60;

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingRoundId, setEditingRoundId] = useState(null);
  const [viewingRoundId, setViewingRoundId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile();
      } else {
        setProfileLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile();
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // If no profile exists, create a basic one
      if (session?.user) {
        try {
          // Create a profile with basic info from the auth user
          await userService.upsertUserProfile({
            full_name: session.user.user_metadata?.full_name || '',
            status: 'active'
          });
          // Immediately re-fetch the newly created profile to get all DB defaults
          const newlyCreatedProfile = await userService.getCurrentUserProfile();
          setUserProfile(newlyCreatedProfile);
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
        }
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    // Update the userProfile state in the App component
    setUserProfile(updatedProfile);
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const handleEditRound = (roundId) => {
    setEditingRoundId(roundId);
    setActivePage('addRound'); // Navigate to the form for editing
  };

  const handleViewRound = (roundId) => {
    setViewingRoundId(roundId);
    setActivePage('viewRound');
  };

  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'addRound':
        return 'Add Round';
      case 'account':
        return 'Account';
      case 'roundsHistory':
        return 'Rounds History';
      case 'userManagement':
        return 'User Management';
      case 'viewRound':
        return 'Round Details';
      case 'courseManagement':
        return 'Course Management';
      default:
        return 'GolfStat';
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={session.user} onViewRound={handleViewRound} />;
      case 'addRound':
        return <RoundForm 
          user={session.user} 
          userProfile={userProfile}
          closeForm={() => {
            setEditingRoundId(null);
            setActivePage('roundsHistory');
          }}
          roundIdToEdit={editingRoundId}
        />;
      case 'account':
        return <AccountPage userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      case 'userManagement':
        return (
          <AdminRoute userProfile={userProfile}>
            <UserManagement />
          </AdminRoute>
        );
      case 'courseManagement':
        return (
          <AdminRoute userProfile={userProfile}>
            <CourseManagementPage user={session.user} onBack={() => setActivePage('dashboard')} />
          </AdminRoute>
        );
      case 'roundsHistory':
        return <RoundsHistoryPage 
          user={session.user}
          onViewRound={handleViewRound} 
          onAddRound={() => setActivePage('addRound')} 
        />;
      case 'viewRound':
        return <RoundDetailsPage
          roundId={viewingRoundId}
          user={session.user}
          onEdit={handleEditRound}
          onBack={() => {
            setViewingRoundId(null);
            setActivePage('roundsHistory');
          }}
        />;
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

  // Show loading while profile is being loaded
  if (profileLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <Typography>Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Box
          component="nav"
          sx={{
            width: isMobile ? 0 : isDrawerOpen ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? isDrawerOpen : true}
            onClose={handleDrawerToggle}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: isMobile
                  ? drawerWidth
                  : isDrawerOpen
                  ? drawerWidth
                  : collapsedWidth,
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              },
            }}
          >
            <Sidebar
              onNavClick={(page) => {
                setEditingRoundId(null); // Clear any editing state when navigating
                setViewingRoundId(null);
                setActivePage(page);
                if (isMobile) {
                  setIsDrawerOpen(false); // Close drawer on mobile after navigation
                }
              }}
              onSignOut={handleSignOut}
              isExpanded={isDrawerOpen}
              handleDrawerToggle={handleDrawerToggle}
              activePage={activePage}
              userRole={userProfile?.role}
            />
          </Drawer>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <AppBar
            position="static" // Changed to static as it's now part of the flex flow
            elevation={1}
            sx={
              {
                // No more complex width/margin calculations needed
              }
            }
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" noWrap component="div">
                {getPageTitle(activePage)}
              </Typography>
            </Toolbar>
          </AppBar>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: { xs: 1, sm: 3 }, // Use responsive padding
              transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              width: {
                xs: "100%",
                md: `calc(100% - ${
                  isDrawerOpen ? drawerWidth : collapsedWidth
                }px)`,
              },
              ml: {
                xs: 0,
                md: `${isDrawerOpen ? drawerWidth : collapsedWidth}px`,
              },
            }}
          >
            <Container
              maxWidth="lg"
              sx={{
                pt: { xs: 1, sm: 2 },
                pb: { xs: 2, sm: 4 },
                px: { xs: 1, sm: 2 },
              }}
              disableGutters={isMobile}
            >
              {renderContent()}
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
