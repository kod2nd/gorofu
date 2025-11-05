import React, { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  Paper,
  Box,
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { createFilterOptions } from '@mui/material/Autocomplete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SectionHeader from './SectionHeader';
import { cardStyles } from '../styles/commonStyles';
import { courseService } from '../services/courseService';
import { countries } from './countries';

const FormSection = ({ title, children }) => (
  <Box>
    <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
      {title}
    </Typography>
    <Box sx={{ pl: 1 }}>{children}</Box>
  </Box>
);

const CourseDetailsForm = ({ roundData = {}, handleCourseChange, isEditMode = false }) => {
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [teeBoxDialogOpen, setTeeBoxDialogOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teeBoxOptions, setTeeBoxOptions] = useState([]);
  const [customCourseName, setCustomCourseName] = useState('');
  const [customTeeBox, setCustomTeeBox] = useState('');

  useEffect(() => {
    if (isEditMode || !roundData.country) return;

    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getCoursesByCountry(roundData.country);
        setCourses(coursesData);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, [roundData.country, isEditMode]);

  useEffect(() => {
    if (roundData.course_id) {
      courseService.getCourseTeeBoxes(roundData.course_id).then(teeBoxes => {
        setTeeBoxOptions([...teeBoxes, 'Add new tee box...']);
      }).catch(err => console.error("Failed to fetch tee boxes:", err));
    } else {
      setTeeBoxOptions(['Red', 'White', 'Blue', 'Black', 'Add new tee box...']);
    }
  }, [roundData.course_id]);

  const defaults = {
    yards_or_meters_unit: 'meters',
    scoring_zone_level: '100m - Novice',
    round_date: new Date().toISOString().split('T')[0],
    round_type: '18_holes',
  };

  const formData = { ...defaults, ...roundData };
  const filter = createFilterOptions();

  const handleFilterOptions = (options, params) => {
    const filtered = filter(options, params);
    const { inputValue } = params;
    const isExisting = options.some((option) => inputValue === option.name);
    if (inputValue !== '' && !isExisting) {
      filtered.push(`Add new course: "${inputValue}"`);
    }
    return filtered;
  };

  const handleCourseSelect = (event, newValue) => {
    if (typeof newValue === 'string' && newValue.startsWith('Add new course:')) {
      const newCourseName = newValue.substring(newValue.indexOf('"') + 1, newValue.lastIndexOf('"'));
      handleCourseChange({ target: { name: 'course_name', value: newCourseName } });
      handleCourseChange({ target: { name: 'course_id', value: null } });
    } else if (newValue && newValue.inputValue) {
      handleCourseChange({ target: { name: 'course_name', value: newValue.inputValue } });
      handleCourseChange({ target: { name: 'course_id', value: null } });
    } else {
      handleCourseChange({ target: { name: 'course_name', value: newValue?.name || '' } });
      handleCourseChange({ target: { name: 'course_id', value: newValue?.id || null } });
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

  const handleToggleButtonChange = (name, value) => {
    if (value !== null) {
      handleCourseChange({ target: { name, value } });
    }
  };

  return (
    <Paper {...cardStyles}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormSection title="Date Played">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date Played"
                value={formData.round_date ? new Date(formData.round_date) : null}
                onChange={(newValue) => handleCourseChange({ target: { name: 'round_date', value: newValue.toISOString().split('T')[0] } })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
        </FormSection>

        <FormSection title="Country">
          <Autocomplete
            getOptionLabel={(option) => option.label || option}
            value={countries.find(c => c.label === formData.country) || null}
            onChange={(event, newValue) => {
              handleCourseChange({ target: { name: 'country', value: newValue ? newValue.label : '' } });
            }}
            disabled={isEditMode}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box component="li" key={key} {...otherProps}>
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
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                required
              />
            )}
            fullWidth
        />
        </FormSection>

        <FormSection title="Course Information">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Course Name with Autocomplete - ✅ FIXED */}
            <Autocomplete
              value={courses.find(c => c.id === formData.course_id) || formData.course_name || null}
              options={courses}
              isOptionEqualToValue={(option, value) => option.id === value.id || option.name === value}
              onChange={handleCourseSelect}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name || ''}
              filterOptions={handleFilterOptions}
              noOptionsText="No course found"
              renderOption={(props, option) => {
                // ✅ Extract key from props properly
                const { key, ...otherProps } = props;
                
                if (typeof option === 'string' && option.startsWith('Add new course:')) {
                  return (
                    <li key={key} {...otherProps} style={{ color: 'primary.main', fontWeight: 'bold' }}>
                      <AddCircleOutlineIcon sx={{ mr: 1 }} />
                      {option}
                    </li>
                  );
                }
                return <li key={key} {...otherProps}>{option.name}</li>;
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
            <Autocomplete
              value={formData.tee_box || ''}
              options={teeBoxOptions}
              onChange={(event, newValue) => {
                if (newValue === 'Add new tee box...') {
                  setTeeBoxDialogOpen(true);
                } else {
                  handleCourseChange({ target: { name: 'tee_box', value: newValue } });
                }
              }}
              disabled={isEditMode}
              renderInput={(params) => (
                <TextField {...params} label="Tee Box Played" required fullWidth />
              )}
            />

            {/* Units */}
            <ToggleButtonGroup
              color="primary"
              value={formData.yards_or_meters_unit}
              exclusive
              fullWidth
              onChange={(e, value) => handleToggleButtonChange('yards_or_meters_unit', value)}
            >
              <ToggleButton value="meters">Meters</ToggleButton>
              <ToggleButton value="yards">Yards</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </FormSection>

        <FormSection title="Round Type">
            <ToggleButtonGroup
              color="primary"
              value={formData.round_type}
              exclusive
              fullWidth
              onChange={(e, value) => handleToggleButtonChange('round_type', value)}
            >
              <ToggleButton value="18_holes">Full 18</ToggleButton>
              <ToggleButton value="front_9">Front 9</ToggleButton>
              <ToggleButton value="back_9">Back 9</ToggleButton>
            </ToggleButtonGroup>
        </FormSection>

        <FormSection title="Scoring Zone Details">
            <ToggleButtonGroup
              color="primary"
              value={formData.scoring_zone_level}
              exclusive
              fullWidth
              onChange={(e, value) => handleToggleButtonChange('scoring_zone_level', value)}
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="100m - Novice">100m</ToggleButton>
              <ToggleButton value="75m - Journeyman">75m</ToggleButton>
              <ToggleButton value="50m - Adapt">50m</ToggleButton>
              <ToggleButton value="25m - Expert">25m</ToggleButton>
              <ToggleButton value="OnGreen Professional">On Green</ToggleButton>
            </ToggleButtonGroup>
        </FormSection>
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