import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { userService } from '../services/userService';
import { supabase } from '../supabaseClient';
import { elevatedCardStyles } from '../styles/commonStyles';

const InvitationAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    country: 'Singapore',
    handicap: '',
    phone: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      const invitationData = await userService.acceptInvitation(token);
      setInvitation(invitationData);
    } catch (error) {
      setError(error.message || 'Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!invitation) return;

    try {
      setLoading(true);
      
      // 1. Create the user via the admin API without a password.
      // This prevents a confirmation email and lets us control the next step.
      const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: invitation.email,
        email_confirm: true, // Mark email as confirmed since they came from an invite
        user_metadata: { full_name: profileForm.full_name },
      });

      if (createError) throw createError;

      // 2. Create their user profile in your public table.
      if (user) {
        await userService.upsertUserProfile({
          user_id: user.id,
          email: invitation.email,
          full_name: profileForm.full_name,
          role: invitation.role,
          status: 'active',
          country: profileForm.country,
          handicap: profileForm.handicap ? parseFloat(profileForm.handicap) : null,
          phone: profileForm.phone,
          created_by: invitation.invited_by,
          approved_at: new Date().toISOString()
        });

        setSuccess(true);

        // 3. Send the password recovery (setup) email.
        const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(invitation.email, {
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (recoveryError) throw recoveryError;
        
        setTimeout(() => {
          navigate('/'); // Redirect to home page after success
        }, 3000);
      }
    } catch (error) {
      setError('Failed to create account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ maxWidth: 400, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
        <Paper {...elevatedCardStyles} sx={{ maxWidth: 400, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Account created successfully! You will be redirected to login.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Please check your email for a password reset link to set your password.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
      <Paper {...elevatedCardStyles} sx={{ maxWidth: 500 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Welcome to Golf App!
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          You've been invited by {invitation?.invited_by} to join as a {invitation?.role}.
        </Alert>

        <Typography variant="h6" gutterBottom>
          Complete Your Profile
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField
            label="Full Name"
            value={profileForm.full_name}
            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
            required
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={profileForm.country}
              label="Country"
              onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
            >
              <MenuItem value="Singapore">Singapore</MenuItem>
              <MenuItem value="Malaysia">Malaysia</MenuItem>
              <MenuItem value="Thailand">Thailand</MenuItem>
              <MenuItem value="Indonesia">Indonesia</MenuItem>
              <MenuItem value="Philippines">Philippines</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Golf Handicap (optional)"
            type="number"
            value={profileForm.handicap}
            onChange={(e) => setProfileForm({ ...profileForm, handicap: e.target.value })}
            fullWidth
            inputProps={{ step: 0.1, min: -10, max: 54 }}
          />

          <TextField
            label="Phone Number (optional)"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            fullWidth
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSignUp}
          disabled={!profileForm.full_name.trim()}
          sx={{ py: 1.5, fontSize: '1.1rem' }}
        >
          Create Account
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          After creating your account, you'll receive an email to set your password.
        </Typography>
      </Paper>
    </Box>
  );
};

export default InvitationAccept;