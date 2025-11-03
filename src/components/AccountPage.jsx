import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Snackbar,
  Autocomplete,
  Alert,
  Avatar,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  SportsGolf as SportsGolfIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { countries } from './countries';

const InfoCard = ({ icon, label, value, color = 'primary.main' }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent sx={{ pb: 2 }}>
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: 16,
          width: 48,
          height: 48,
          borderRadius: 2,
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: 2,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Box>
      <Box sx={{ mt: 2, pt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, wordBreak: 'break-word', fontSize: '1.1rem' }}>
          {value || 'Not set'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

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
    <Box sx={{ maxWidth: 1200, margin: 'auto' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: 100,
              height: 100,
              fontSize: '2rem',
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              border: '4px solid rgba(255, 255, 255, 0.5)',
            }}
          >
            {getInitials(full_name)}
          </Avatar>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {full_name || 'User'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
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
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Edit Personal Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Display Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={email}
                fullWidth
                disabled
                variant="outlined"
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Handicap"
                name="handicap"
                type="number"
                value={formData.handicap}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={countries}
                getOptionLabel={(option) => option.label}
                value={countries.find(c => c.label === formData.country) || null}
                onChange={(event, newValue) => {
                  handleInputChange({ target: { name: 'country', value: newValue ? newValue.label : '' } });
                }}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box 
                      component="li" 
                      key={key}
                      sx={{ 
                        '& > img': { mr: 2, flexShrink: 0 },
                        py: 1.5,
                      }} 
                      {...otherProps}
                    >
                      <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                        alt=""
                      />
                      {option.label}
                    </Box>
                  );
                }}
                renderInput={(params) => <TextField {...params} label="Country" variant="outlined" />}
                ListboxProps={{
                  sx: {
                    maxHeight: 300,
                    '& li': {
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }
                  }
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2, px: 1 }}>
            Personal Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<PersonIcon />}
                label="Display Name"
                value={userProfile.full_name}
                color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<EmailIcon />}
                label="Email"
                value={userProfile.email}
                color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<PublicIcon />}
                label="Country"
                value={userProfile.country}
                color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<SportsGolfIcon />}
                label="Handicap"
                value={userProfile.handicap != null ? Number(userProfile.handicap).toFixed(1) : null}
                color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<PhoneIcon />}
                label="Phone"
                value={userProfile.phone}
                color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<CakeIcon />}
                label="Date of Birth"
                value={
                  userProfile.date_of_birth
                    ? new Date(userProfile.date_of_birth).toLocaleDateString()
                    : null
                }
                color="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
              />
            </Grid>
          </Grid>
        </>
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