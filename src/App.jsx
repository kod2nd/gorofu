import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './supabaseClient';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import theme from './theme';
import Drawer from '@mui/material/Drawer';

// Import your components
import MenuIcon from '@mui/icons-material/Menu';
import Auth from './Auth';
import Sidebar from './components/Sidebar';
import AdminRoute from './components/AdminRoute';
import { userService } from './services/userService';
import FlippingGolfIcon from './components/FlippingGolfIcon';
import ImpersonationBanner from './components/ImpersonationBanner';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));
const RoundForm = lazy(() => import('./RoundForm'));
const UserManagement = lazy(() => import('./components/UserManagement'));
const AccountPage = lazy(() => import('./components/AccountPage'));
const RoundsHistoryPage = lazy(() => import('./components/RoundsHistoryPage'));
const RoundDetailsPage = lazy(() => import('./components/RoundDetailsPage'));
const CourseManagementPage = lazy(() => import('./components/CourseManagementPage'));
const CoachManagementPage = lazy(() => import('./components/CoachManagementPage'));
const StudentInteractionsPage = lazy(() => import('./components/StudentInteractionsPage'));

const drawerWidth = 240;
const collapsedWidth = 60;

// PageContainer component to keep components mounted but hidden
const PageContainer = ({ active, children }) => (
  <Box sx={{ display: active ? 'block' : 'none', height: '100%' }}>
    {children}
  </Box>
);

function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [initialProfileLoad, setInitialProfileLoad] = useState(true); // ✅ Separate state for initial load only
  const [editingRoundId, setEditingRoundId] = useState(null);
  const [viewingRoundId, setViewingRoundId] = useState(null);
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile(true); // Pass true for initial load
      } else {
        setInitialProfileLoad(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(false); // Pass false for subsequent loads
      } else {
        setUserProfile(null);
        setInitialProfileLoad(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (isInitial = false) => {
    try {
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (session?.user) {
        try {
          await userService.upsertUserProfile({
            full_name: session.user.user_metadata?.full_name || '',
            status: 'active'
          });
          const newlyCreatedProfile = await userService.getCurrentUserProfile();
          setUserProfile(newlyCreatedProfile);
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
        }
      }
    } finally {
      if (isInitial) {
        setInitialProfileLoad(false); // ✅ Only set this false on initial load
      }
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleImpersonate = async (targetUser) => {
    try {
      await userService.startImpersonation(targetUser.email);
      setImpersonatedUser(targetUser);
      setActivePage('dashboard'); // Go to the user's dashboard
    } catch (error) {
      console.error("Failed to start impersonation:", error);
      // Optionally, show a snackbar error to the admin
    }
  };


  const handleExitImpersonation = async () => {
    try {
      await userService.stopImpersonation();
      setImpersonatedUser(null);
      setActivePage('userManagement'); // Go back to user management
    } catch (error) {
      console.error("Failed to stop impersonation:", error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    await userService.stopImpersonation(); // Ensure impersonation is cleared on sign out
    if (error) console.error('Error signing out:', error.message);
    setImpersonatedUser(null); // Clear impersonation on sign out
  };

  // Determine which user's data to show
  const activeUser = impersonatedUser 
    ? { id: impersonatedUser.user_id, email: impersonatedUser.email } 
    : session?.user;

  const handleEditRound = (roundId) => {
    setEditingRoundId(roundId);
    setActivePage('addRound');
  };

  const handleViewRound = (roundId) => {
    setViewingRoundId(roundId);
    setActivePage('viewRound');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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
      case 'coachManagement':
        return 'Coach Management';
      case 'studentInteractions':
        return 'Notes';
      default:
        return 'GolfStat';
    }
  };

  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <Auth />
      </ThemeProvider>
    );
  }

  // ✅ Show full-screen loading ONLY on very first profile load
  if (initialProfileLoad) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'background.default',
          }}
        >
          <FlippingGolfIcon size={80} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ImpersonationBanner 
        impersonatedUser={impersonatedUser} 
        onExit={handleExitImpersonation} 
        activePage={activePage}
      />
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
                setEditingRoundId(null);
                setViewingRoundId(null);
                setActivePage(page);
                if (isMobile) {
                  setIsDrawerOpen(false);
                }
              }}
              onSignOut={handleSignOut}
              isExpanded={isDrawerOpen}
              handleDrawerToggle={handleDrawerToggle}
              activePage={activePage}
              userRoles={userProfile?.roles}
              isMobile={isMobile}
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
          <AppBar position="static" elevation={1}>
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
              p: { xs: 1, sm: 3 },
              transition: theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
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
              <Suspense fallback={
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '60vh' 
                }}>
                  <FlippingGolfIcon size={60} />
                </Box>
              }>
                {/* ALL components stay mounted, only visibility changes */}
                <PageContainer active={activePage === 'dashboard'}>
                  <Dashboard
                    user={activeUser}
                    onViewRound={handleViewRound} 
                    isActive={activePage === 'dashboard'} 
                    impersonatedUser={impersonatedUser}
                    userProfile={userProfile}
                  />
                </PageContainer>
                
                <PageContainer active={activePage === 'addRound'}>
                  <RoundForm 
                    user={activeUser}
                    userProfile={userProfile}
                    isActive={activePage === 'addRound'}
                    closeForm={() => {
                      setEditingRoundId(null);
                      setActivePage('roundsHistory');
                    }}
                    onSuccess={(message) => showSnackbar(message)}
                    roundIdToEdit={editingRoundId}
                  />
                </PageContainer>
                
                <PageContainer active={activePage === 'account'}>
                  <AccountPage 
                    userProfile={impersonatedUser || userProfile} 
                    onProfileUpdate={handleProfileUpdate}
                    isImpersonating={!!impersonatedUser}
                  />
                </PageContainer>
                
                <PageContainer active={activePage === 'userManagement'}>
                  <AdminRoute userProfile={userProfile}>
                    <UserManagement isActive={activePage === 'userManagement'} onImpersonate={handleImpersonate} />
                  </AdminRoute>
                </PageContainer>
                
                <PageContainer active={activePage === 'courseManagement'}>
                  <AdminRoute userProfile={userProfile}>
                    <CourseManagementPage currentUser={userProfile} onBack={() => setActivePage('dashboard')} />
                  </AdminRoute>
                </PageContainer>

                <PageContainer active={activePage === 'coachManagement'}>
                  <AdminRoute userProfile={userProfile}>
                    <CoachManagementPage currentUser={userProfile} isActive={activePage === 'coachManagement'} />
                  </AdminRoute>
                </PageContainer>
                
                <PageContainer active={activePage === 'roundsHistory'}>
                  <RoundsHistoryPage 
                    user={activeUser}
                    isActive={activePage === 'roundsHistory'}
                    onViewRound={handleViewRound} 
                    onAddRound={() => setActivePage('addRound')} 
                  />
                </PageContainer>
                
                <PageContainer active={activePage === 'viewRound'}>
                  <RoundDetailsPage
                    roundId={viewingRoundId}
                    user={activeUser}
                    onEdit={handleEditRound}
                    onBack={() => { setViewingRoundId(null); setActivePage('roundsHistory'); }}
                  />
                </PageContainer>

                <PageContainer active={activePage === 'studentInteractions'}>
                  <StudentInteractionsPage
                    userProfile={userProfile}
                    isActive={activePage === 'studentInteractions'}
                  />
                </PageContainer>
              </Suspense>
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert 
                  onClose={() => setSnackbar({ ...snackbar, open: false })} 
                  severity={snackbar.severity} sx={{ width: '100%' }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;