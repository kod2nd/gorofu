// src/components/CourseDetailsForm.jsx
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Box,
} from '@mui/material';

const CourseDetailsForm = ({ courseDetails, handleCourseChange }) => {
  return (
    <Paper elevation={2} style={{ padding: '16px', marginBottom: '24px' }}>
      <Typography variant="h6" gutterBottom>
        1. General Course Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Course Name"
          name="course_name"
          value={courseDetails.course_name}
          onChange={handleCourseChange}
          required
        />
        <TextField
          fullWidth
          label="Tee Box Played"
          name="tee_box"
          value={courseDetails.tee_box}
          onChange={handleCourseChange}
          required
        />
        <FormControl fullWidth>
          <InputLabel>Units</InputLabel>
          <Select
            name="yards_or_meters_unit"
            value={courseDetails.yards_or_meters_unit}
            label="Units"
            onChange={handleCourseChange}
          >
            <MenuItem value="yards">Yards</MenuItem>
            <MenuItem value="meters">Meters</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Scoring Zone Level</InputLabel>
          <Select
            name="scoring_zone_level"
            value={courseDetails.scoring_zone_level}
            label="Scoring Zone Level"
            onChange={handleCourseChange}
            required
          >
            <MenuItem value="100m - Novice">100m - Novice</MenuItem>
            <MenuItem value="75m - Journeyman">75m - Journeyman</MenuItem>
            <MenuItem value="50m - Adapt">50m - Adapt</MenuItem>
            <MenuItem value="25m - Expert">25m - Expert</MenuItem>
            <MenuItem value="OnGreen Professional">OnGreen Professional</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          type="date"
          label="Date Played"
          name="date"
          value={courseDetails.date}
          onChange={handleCourseChange}
          required
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </Paper>
  );
};

export default CourseDetailsForm;