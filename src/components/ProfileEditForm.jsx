import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete,
} from "@mui/material";
import { countries } from "./countries";
import ScoringBiasSlider from "./ScoringBiasSlider";

const ProfileEditForm = ({ formData, email, handleInputChange }) => {
  const handleBiasChange = (event, newValue) => {
    if (newValue !== null) {
      handleInputChange({ target: { name: 'scoring_bias', value: newValue } });
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Edit Personal Information
      </Typography>
      {/* Use flexbox with gap for consistent spacing */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          '& > *': {
            flexBasis: { xs: '100%', sm: 'calc(50% - 12px)' }, // 50% minus half the gap
          }
        }}
      >
        {/* Display Name */}
        <TextField
          label="Display Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        
        {/* Email */}
        <TextField
          label="Email"
          value={email}
          fullWidth
          disabled
          variant="outlined"
          helperText="Email cannot be changed"
        />
        
        {/* Handicap */}
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
        
        {/* Country */}
        <Autocomplete
          options={countries}
          getOptionLabel={(option) => option.label}
          value={countries.find((c) => c.label === formData.country) || null}
          onChange={(event, newValue) => {
            handleInputChange({
              target: {
                name: "country",
                value: newValue ? newValue.label : "",
              },
            });
          }}
          renderOption={(props, option) => {
            return (
              <Box
                component="li"
                {...props}
                sx={{
                  "& > img": { mr: 2, flexShrink: 0 },
                  py: 1.5,
                  minHeight: 47,
                  display: "flex",
                  alignItems: "center",
                }}
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
                "& .MuiAutocomplete-inputRoot": {
                  paddingRight: "32px !important",
                },
              }}
            />
          )}
          ListboxProps={{
            sx: {
              maxHeight: 300,
              "& li": {
                whiteSpace: "normal",
                wordWrap: "break-word",
                minHeight: 48,
                display: "flex",
                alignItems: "center",
              },
            },
          }}
          sx={{
            "& .MuiAutocomplete-input": {
              minWidth: "120px !important",
            },
          }}
          fullWidth
        />
        
        {/* Phone */}
        <TextField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          fullWidth
          variant="outlined"
        />
        
        {/* Date of Birth */}
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
      </Box>

      {/* Preferences Section */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Preferences
      </Typography>
      <Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          Scorecard Color Bias
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set your "Personal Par" to adjust score coloring on scorecards.
        </Typography>
        <ScoringBiasSlider
          currentScoringBias={formData.scoring_bias}
          handleBiasChange={handleBiasChange}
        />
      </Box>

    </Paper>
  );
};

export default ProfileEditForm;