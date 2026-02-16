import React from "react";
import { Box, Paper, Typography, TextField, Autocomplete, Divider } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { countries } from "./countries";
import ScoringBiasSlider from "./ScoringBiasSlider";

const inputSx = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.text.primary, 0.03),
    transition: "all 0.15s ease",
    "& fieldset": {
      borderColor: alpha(theme.palette.text.primary, 0.10),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.25),
    },
    "&.Mui-focused": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    "&.Mui-focused fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.55),
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.10)}`,
    },
  },
});

const Section = ({ title, subtitle, children }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        p: { xs: 2, sm: 2.5 },
        background: theme.palette.background.paper,
      }}
    >
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {children}
    </Paper>
  );
};

const ProfileEditForm = ({ formData, email, handleInputChange }) => {
  const theme = useTheme();

  const handleBiasChange = (event, newValue) => {
    if (newValue !== null) {
      handleInputChange({ target: { name: "scoring_bias", value: newValue } });
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Section
        title="Edit profile"
        subtitle="Update your personal details. Email cannot be changed."
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          }}
        >
          <TextField
            label="Display name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            fullWidth
            sx={inputSx(theme)}
          />

          <TextField
            label="Email"
            value={email}
            fullWidth
            disabled
            helperText="Email cannot be changed"
            sx={inputSx(theme)}
          />

          <TextField
            label="Handicap"
            name="handicap"
            type="number"
            value={formData.handicap}
            onChange={handleInputChange}
            fullWidth
            inputProps={{ step: 0.1 }}
            sx={inputSx(theme)}
          />

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
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  py: 1.25,
                  minHeight: 44,
                }}
              >
                <img
                  loading="lazy"
                  width="18"
                  src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                  alt=""
                  style={{ borderRadius: 3 }}
                />
                <Typography noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {option.label}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Country" fullWidth sx={inputSx(theme)} />
            )}
            ListboxProps={{
              sx: {
                maxHeight: 300,
                "& li": { whiteSpace: "normal", wordWrap: "break-word" },
              },
            }}
          />

          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            fullWidth
            sx={inputSx(theme)}
          />

          <TextField
            label="Date of birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={inputSx(theme)}
          />
        </Box>
      </Section>

      <Section
        title="Preferences"
        subtitle='Set your “personal par” to adjust score coloring on scorecards.'
      >
        <Box sx={{ mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Scorecard color bias
          </Typography>

          <ScoringBiasSlider
            currentScoringBias={formData.scoring_bias}
            handleBiasChange={handleBiasChange}
          />
        </Box>
      </Section>
    </Box>
  );
};

export default ProfileEditForm;
