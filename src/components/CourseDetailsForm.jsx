import React, { useState, useEffect } from 'react';
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
import { createFilterOptions } from '@mui/material/Autocomplete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SectionHeader from './SectionHeader';
import { cardStyles } from '../styles/commonStyles';
import { courseService } from '../services/courseService';
import { countries } from './countries';

const CourseDetailsForm = ({ roundData = {}, handleCourseChange, isEditMode = false }) => {
  // State for dialogs and custom inputs
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [teeBoxDialogOpen, setTeeBoxDialogOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [customCourseName, setCustomCourseName] = useState('');
  const [customTeeBox, setCustomTeeBox] = useState('');

  useEffect(() => {
    // Do not fetch if editing, as the course is already set.
    if (isEditMode || !roundData.country) return;

    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getCoursesByCountry(roundData.country);
        setCourses(coursesData.map(c => c.name));
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, [roundData.country, isEditMode]);

  // Tee box options
  const teeBoxOptions = [
    'Red',
    'White',
    'Blue',
    'Black',
    'Add new tee box...'
  ];

  // Set default values
  const defaults = {
    yards_or_meters_unit: 'meters',
    scoring_zone_level: '100m - Novice',
    round_date: new Date().toISOString().split('T')[0],
    round_type: '18_holes',
  };

  // Merge provided data with defaults
  const formData = { ...defaults, ...roundData };

  const filter = createFilterOptions();

  const handleFilterOptions = (options, params) => {
    const filtered = filter(options, params);

    // Suggest the creation of a new value
    const { inputValue } = params;
    const isExisting = options.some((option) => inputValue === option);
    if (inputValue !== '' && !isExisting) {
      filtered.push(`Add new course: "${inputValue}"`);
    }

    return filtered;
  };


  const handleCourseSelect = (event, newValue) => {
    if (newValue && newValue.startsWith('Add new course:')) {
      // Extract the course name from the "Add new..." string
      const newCourseName = newValue.substring(newValue.indexOf('"') + 1, newValue.lastIndexOf('"'));
      handleCourseChange({ target: { name: 'course_name', value: newCourseName } });
    } else if (newValue === 'Add new course') {
      setCourseDialogOpen(true);
    } else {
      handleCourseChange({ target: { name: 'course_name', value: newValue } });
    }
  };

  const handleTeeBoxSelect = (e) => {
    if (e.target.value === 'Add new tee box...') {
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
    <Paper {...cardStyles}>
      
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
        {/* Country Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
            Country
          </Typography>
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => option.label || option}
            value={countries.find(c => c.label === formData.country) || null}
            onChange={(event, newValue) => {
              handleCourseChange({ target: { name: 'country', value: newValue ? newValue.label : '' } });
            }}
            disabled={isEditMode}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <img
                  loading="lazy"
                  width="20"
                  src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                  alt=""
                  style={{ marginRight: '10px' }}
                />
                {option.label} ({option.code})
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                required
              />
            )}
            sx={{ pl: 1 }}
          />
        </Box>

        {/* Course Information Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
            Course Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1 }}>
            {/* Course Name with Autocomplete */}
            <Autocomplete
              options={courses}
              value={formData.course_name || ''}
              onChange={handleCourseSelect}
              filterOptions={handleFilterOptions}
              noOptionsText="No course found"
              renderOption={(props, option) => {
                if (option.startsWith('Add new course:')) {
                  return (
                    <li {...props} style={{ color: 'primary.main', fontWeight: 'bold' }}>
                      <AddCircleOutlineIcon sx={{ mr: 1 }} />
                      {option}
                    </li>
                  );
                }
                return (
                  <li {...props}>{option}</li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Course Name"
                  required
                  fullWidth
                  disabled={isEditMode}
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
                disabled={isEditMode}
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

        {/* Round Type Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
            Round Type
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Holes to Play</InputLabel>
              <Select
                name="round_type"
                value={formData.round_type || '18_holes'}
                label="Holes to Play"
                onChange={handleCourseChange}
              >
                <MenuItem value="front_9">Front 9 Only</MenuItem>
                <MenuItem value="back_9">Back 9 Only</MenuItem>
                <MenuItem value="18_holes">18 Holes</MenuItem>
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