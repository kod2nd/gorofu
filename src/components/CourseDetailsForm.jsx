import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Box,
  Avatar,
  Divider,  
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
import SectionHeader from './SectionHeader';

const CourseDetailsForm = ({ roundData = {}, handleCourseChange }) => {
  // State for dialogs and custom inputs
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [teeBoxDialogOpen, setTeeBoxDialogOpen] = useState(false);
  const [customCourseName, setCustomCourseName] = useState('');
  const [customTeeBox, setCustomTeeBox] = useState('');

  // Course options including "Other"
  const courseOptions = [
    'Augusta National Golf Club',
    'Pebble Beach Golf Links',
    'Pine Valley Golf Club',
    'Cypress Point Club',
    'Royal Melbourne Golf Club',
    'Other course...'
  ];

  // Tee box options
  const teeBoxOptions = [
    'Red',
    'White',
    'Blue',
    'Black',
    'Other tee box...'
  ];

  // Set default values
  const defaults = {
    yards_or_meters_unit: 'yards',
    scoring_zone_level: '100m - Novice',
    round_date: new Date().toISOString().split('T')[0],
  };

  // Merge provided data with defaults
  const formData = { ...defaults, ...roundData };

  const handleCourseSelect = (event, newValue) => {
    if (newValue === 'Other course...') {
      setCourseDialogOpen(true);
    } else {
      handleCourseChange({ target: { name: 'course_name', value: newValue } });
    }
  };

  const handleTeeBoxSelect = (e) => {
    if (e.target.value === 'Other tee box...') {
      setTeeBoxDialogOpen(true);
    } else {
      handleCourseChange(e);
    }
  };

  const handleSaveCustomCourse = () => {
    if (customCourseName.trim()) {
      handleCourseChange({ target: { name: 'course_name', value: customCourseName.trim() } });
      setCustomCourseName('');
      setCourseDialogOpen(false);
    }
  };

  const handleSaveCustomTeeBox = () => {
    if (customTeeBox.trim()) {
      handleCourseChange({ target: { name: 'tee_box', value: customTeeBox.trim() } });
      setCustomTeeBox('');
      setTeeBoxDialogOpen(false);
    }
  };

  const handleCloseDialogs = () => {
    setCourseDialogOpen(false);
    setTeeBoxDialogOpen(false);
    setCustomCourseName('');
    setCustomTeeBox('');
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        width: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Date Played Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
            Date Played
          </Typography>
          <Box sx={{ pl: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date Played"
                value={formData.round_date ? new Date(formData.round_date) : null}
                onChange={(newValue) => handleCourseChange({ target: { name: 'round_date', value: newValue.toISOString().split('T')[0] } })}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* Course Information Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
            Course Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1 }}>
            {/* Course Name with Autocomplete */}
            <Autocomplete
              freeSolo
              options={courseOptions}
              value={formData.course_name || ''}
              onChange={handleCourseSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Course Name"
                  required
                  fullWidth
                />
              )}
            />
            
            {/* Tee Box as Select */}
            <FormControl fullWidth>
              <InputLabel>Tee Box Played</InputLabel>
              <Select
                name="tee_box"
                value={formData.tee_box || ''}
                label="Tee Box Played"
                onChange={handleTeeBoxSelect}
                required
              >
                {teeBoxOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Units */}
            <FormControl fullWidth>
              <InputLabel>Units</InputLabel>
              <Select
                name="yards_or_meters_unit"
                value={formData.yards_or_meters_unit}
                label="Units"
                onChange={handleCourseChange}
              >
                <MenuItem value="meters">Meters</MenuItem>
                <MenuItem value="yards">Yards</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Scoring Zone Details Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
            Scoring Zone Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Scoring Zone Level</InputLabel>
              <Select
                name="scoring_zone_level"
                value={formData.scoring_zone_level}
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
          </Box>
        </Box>
      </Box>

      {/* Dialog for Custom Course Name */}
      <Dialog open={courseDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Enter Custom Course Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Course Name"
            fullWidth
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            sx={{ mt: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveCustomCourse();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveCustomCourse} variant="contained">
            Save Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Custom Tee Box */}
      <Dialog open={teeBoxDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Enter Custom Tee Box</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Tee Box Name"
            fullWidth
            value={customTeeBox}
            onChange={(e) => setCustomTeeBox(e.target.value)}
            sx={{ mt: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveCustomTeeBox();
              }
            }}
            placeholder="e.g., Gold, Silver, Championship, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveCustomTeeBox} variant="contained">
            Save Tee Box
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CourseDetailsForm;