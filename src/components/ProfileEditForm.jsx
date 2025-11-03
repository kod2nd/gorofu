import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Autocomplete,
} from '@mui/material';
import { countries } from './countries';

const ProfileEditForm = ({ formData, email, handleInputChange }) => {
  return (
    <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
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
                    paddingRight: '32px !important',
                  }
                }}
              />
            )}
            ListboxProps={{
              sx: {
                maxHeight: 300,
                '& li': {
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  minHeight: 48,
                  display: 'flex',
                  alignItems: 'center',
                }
              }
            }}
            sx={{
              '& .MuiAutocomplete-input': {
                minWidth: '120px !important',
              },
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
  );
};

export default ProfileEditForm;