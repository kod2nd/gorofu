import React from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Box,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const CourseDetailsForm = ({ roundData = {}, handleCourseChange }) => {
  return (
    <Paper elevation={2} style={{ padding: '16px', marginBottom: '24px' }}>
      <Typography variant="h6" gutterBottom>
        1. Course Details
      </Typography>
      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Course Name"
            name="course_name"
            value={roundData.course_name || ''}
            onChange={handleCourseChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Tee Box Played"
            name="tee_box"
            value={roundData.tee_box || ''}
            onChange={handleCourseChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Units</InputLabel>
            <Select
              name="yards_or_meters_unit"
              value={roundData.yards_or_meters_unit || ''}
              label="Units"
              onChange={handleCourseChange}
            >
              <MenuItem value="yards">Yards</MenuItem>
              <MenuItem value="meters">Meters</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Scoring Zone Level</InputLabel>
            <Select
              name="scoring_zone_level"
              value={roundData.scoring_zone_level || ''}
              label="Scoring Zone Level"
              onChange={handleCourseChange}
            >
              <MenuItem value="100m - Novice">100m - Novice</MenuItem>
              <MenuItem value="75m - Journeyman">75m - Journeyman</MenuItem>
              <MenuItem value="50m - Adapt">50m - Adapt</MenuItem>
              <MenuItem value="25m - Expert">25m - Expert</MenuItem>
              <MenuItem value="OnGreen Professional">OnGreen Professional</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date Played"
              value={roundData.round_date ? new Date(roundData.round_date) : null}
              onChange={(newValue) => handleCourseChange({ target: { name: 'round_date', value: newValue.toISOString().split('T')[0] } })}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CourseDetailsForm;
