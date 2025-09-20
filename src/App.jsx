// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container } from '@mui/material';
import theme from './theme';

// Import your components
import Auth from './Auth';
import Dashboard from './components/Dashboard';
import RoundForm from './RoundForm';
import Sidebar from './components/Sidebar';

function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={session.user} />;
      case 'addRound':
        return <RoundForm user={session.user} />;
      // You can add other pages here as needed
      default:
        return <Dashboard user={session.user} />;
    }
  };

  // If there is no session, show the Auth page and nothing else.
  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <Auth />
      </ThemeProvider>
    );
  }

  // If a session exists, render the full app layout.
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
        <Sidebar onNavClick={setActivePage} onSignOut={handleSignOut} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center' }}>
          <Container maxWidth="lg">
            {renderContent()}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;