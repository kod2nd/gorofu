// src/Auth.jsx
import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import GoogleIcon from '@mui/icons-material/Google';

const Auth = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.custom.primaryDarkBlue,
        p: 2,
        color: theme.palette.custom.white,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <SportsGolfIcon sx={{ fontSize: 100, mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          Improve Gorofu
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}>
          Sign in to track your golf stats and improve your game with data-driven insights.
        </Typography>

        <Button
          variant="contained"
          onClick={handleGoogleSignIn}
          disabled={loading}
          startIcon={<GoogleIcon />}
          sx={{
            mt: 4,
            bgcolor: theme.palette.secondary.main,
            '&:hover': { bgcolor: theme.palette.secondary.dark },
            color: theme.palette.custom.white,
            py: 1.8,
            px: 4,
            fontSize: '1.1rem',
            borderRadius: '8px',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </Box>
    </Box>
  );
};

export default Auth;