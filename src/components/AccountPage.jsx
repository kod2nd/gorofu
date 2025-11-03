import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Stack,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import ProfileDisplay from './ProfileDisplay';
import ProfileEditForm from './ProfileEditForm';

const AccountPage = ({ userProfile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        country: userProfile.country || '',
        handicap: userProfile.handicap || '',
        phone: userProfile.phone || '',
        date_of_birth: userProfile.date_of_birth || '',
      });
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading user profile...</Typography>
      </Box>
    );
  }

  const { full_name, email, role } = userProfile;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        handicap: formData.handicap === '' || isNaN(formData.handicap) ? null : parseFloat(formData.handicap),
        date_of_birth: formData.date_of_birth || null,
      };

      const updatedProfile = await userService.upsertUserProfile(dataToSave);
      onProfileUpdate(updatedProfile);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: userProfile.full_name || '',
      country: userProfile.country || '',
      handicap: userProfile.handicap || '',
      phone: userProfile.phone || '',
      date_of_birth: userProfile.date_of_birth || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'error';
      case 'premium': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    if (role?.toLowerCase() === 'admin') return <AdminIcon fontSize="small" />;
    return null;
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              fontSize: { xs: '1.5rem', sm: '2rem' },
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              border: '4px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            {getInitials(full_name)}
          </Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
              {full_name || 'User'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, wordBreak: 'break-word' }}>
              {email}
            </Typography>
            <Chip
              icon={getRoleIcon(role)}
              label={role}
              color={getRoleColor(role)}
              size="small"
              sx={{
                fontWeight: 600,
                textTransform: 'capitalize',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          </Box>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={handleCancel}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                }}
              >
                <CloseIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                }}
              >
                Save
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Content Section */}
      {isEditing ? (
        <ProfileEditForm
          formData={formData}
          email={email}
          handleInputChange={handleInputChange}
        />
      ) : (
        <ProfileDisplay userProfile={userProfile} />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountPage;