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
  useTheme,
  useMediaQuery,
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
  <Card sx={{ 
    height: '100%', 
    position: 'relative', 
    overflow: 'visible',
    minHeight: { xs: 140, sm: 160 }, // Consistent minimum height
    display: 'flex',
    flexDirection: 'column',
  }}>
    <CardContent sx={{ 
      pb: 2, 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }}>
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
          zIndex: 1,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Box>
      <Box sx={{ 
        mt: 2, 
        pt: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 500, 
            textTransform: 'uppercase', 
            letterSpacing: 0.5,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 1, 
            wordBreak: 'break-word', 
            fontSize: { xs: '1rem', sm: '1.1rem' },
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Edit Personal Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} sx={{ width: '100%'}}>
              <TextField
                label="Display Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: '100%'}}>
              <TextField
                label="Email"
                value={email}
                fullWidth
                disabled
                variant="outlined"
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: '100%'}}>
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
            <Grid item xs={12} sm={6} sx={{ width: '100%'}}>
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
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
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
                      <Typography noWrap sx={{ flex: 1, minWidth: 0 }}>
                        {option.label}
                      </Typography>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Country" 
                    variant="outlined" 
                    sx={{
                      '& .MuiAutocomplete-inputRoot': {
                        paddingRight: '32px', // Ensure space for dropdown arrow
                      }
                    }}
                  />
                )}
                sx={{
                  '& .MuiAutocomplete-input': {
                    minWidth: '120px', // Ensure input field has enough width
                  },
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: '100%'}}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: '100%'}}>
              <TextField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value="{formData.date_of_birth}"
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 4, px: 1 }}>
            Personal Information
          </Typography>
          <Grid container spacing={4} >
            <Grid xs={12} sm={6} md={4} sx={{ width: '45%'}}>
              <InfoCard
                icon={<PersonIcon />}
                label="Display Name"
                value={userProfile.full_name}
                color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4} sx={{ width: '45%'}}>
              <InfoCard
                icon={<EmailIcon />}
                label="Email"
                value={userProfile.email}
                color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4} sx={{ width: '45%'}}>
              <InfoCard
                icon={<PublicIcon />}
                label="Country"
                value={userProfile.country}
                color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4} sx={{ width: '45%'}}>
              <InfoCard
                icon={<SportsGolfIcon />}
                label="Handicap"
                value={userProfile.handicap != null ? Number(userProfile.handicap).toFixed(1) : null}
                color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ width: '45%'}}>
              <InfoCard
                icon={<PhoneIcon />}
                label="Phone"
                value={userProfile.phone}
                color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ width: '45%'}}>
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