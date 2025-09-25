import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  TextField,
  Snackbar,
  Autocomplete,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  SportsGolf as SportsGolfIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { countries } from './countries';

const ProfileDetailItem = ({ icon, primary, secondary }) => (
  <ListItem>
    <Box sx={{ pr: 2, display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <ListItemText primary={primary} secondary={secondary || 'Not set'} />
  </ListItem>
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
    return <Typography>Loading user profile...</Typography>;
  }

  const {
    full_name,
    email,
    role,
  } = userProfile;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Prepare data for submission. Convert empty string for date to null.
      const dataToSave = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
      };

      const updatedProfile = await userService.upsertUserProfile(dataToSave);
      onProfileUpdate(updatedProfile); // Notify parent component of the update
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    setFormData({
      full_name: userProfile.full_name || '',
      country: userProfile.country || '',
      handicap: userProfile.handicap || '',
      phone: userProfile.phone || '',
      date_of_birth: userProfile.date_of_birth || '',
    });
    setIsEditing(false);
  };

  const formattedDate = formData.date_of_birth
    ? new Date(formData.date_of_birth).toLocaleDateString()
    : 'Not set';

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} sm={8}>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Edit Profile' : full_name}
          </Typography>
          {!isEditing && (
            <Typography variant="subtitle1" color="text.secondary">
              {email}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={4} sx={{ textAlign: { sm: 'right' } }}>
          <Chip label={role} color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {isEditing ? (
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField label="Display Name" name="full_name" value={formData.full_name} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" value={email} fullWidth disabled helperText="Email cannot be changed." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Handicap" name="handicap" type="number" value={formData.handicap} onChange={handleInputChange} fullWidth inputProps={{ step: 0.1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={countries}
                getOptionLabel={(option) => option.label}
                value={countries.find(c => c.label === formData.country) || null}
                onChange={(event, newValue) => {
                  handleInputChange({ target: { name: 'country', value: newValue ? newValue.label : '' } });
                }}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                    <img
                      loading="lazy"
                      width="20"
                      src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                      srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                      alt=""
                    />
                    {option.label} ({option.code})
                  </Box>
                )}
                renderInput={(params) => <TextField {...params} label="Country" />}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
            <Button variant="text" onClick={handleCancel}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save Changes</Button>
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Personal Information
            </Typography>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Box>
          <List>
            <ProfileDetailItem icon={<PersonIcon />} primary="Display Name" secondary={userProfile.full_name} />
            <Divider component="li" variant="inset" />
            <ProfileDetailItem icon={<EmailIcon />} primary="Email" secondary={userProfile.email} />
            <Divider component="li" variant="inset" />
            <ProfileDetailItem icon={<PublicIcon />} primary="Country" secondary={userProfile.country} />
            <Divider component="li" variant="inset" />
            <ProfileDetailItem icon={<SportsGolfIcon />} primary="Handicap" secondary={userProfile.handicap != null ? Number(userProfile.handicap).toFixed(1) : null} />
            <Divider component="li" variant="inset" />
            <ProfileDetailItem icon={<PhoneIcon />} primary="Phone" secondary={userProfile.phone} />
            <Divider component="li" variant="inset" />
            <ProfileDetailItem icon={<CakeIcon />} primary="Date of Birth" secondary={userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString() : 'Not set'} />
          </List>
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
    </Paper>
  );
};

export default AccountPage;