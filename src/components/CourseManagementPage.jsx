import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { courseService } from '../services/courseService';
import CourseForm from './CourseForm';
import { elevatedCardStyles } from '../styles/commonStyles';

const CourseManagementPage = ({ currentUser, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [countryFilter, setCountryFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    courseId: null,
    courseName: '',
  });

  useEffect(() => {
    // Load both courses and the list of countries for the filter
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [coursesData, countriesData] = await Promise.all([
          courseService.searchCourses(''), // Initial load with all courses
          courseService.getCountriesWithCourses(),
        ]);
        setCourses(coursesData);
        setAvailableCountries(countriesData);
      } catch (err) {
        setError('Failed to load page data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []); // Runs once on component mount

  const loadCourses = async (country) => {
    try {
      setLoading(true);
      const coursesData = await courseService.searchCourses('', country);
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const country = event.target.value;
    setCountryFilter(country);
    loadCourses(country === 'All' ? null : country);
  };

  const handleSave = async (courseData) => {
    try {
      await courseService.saveCourseWithTeeBoxes(courseData, currentUser.email);
      setIsCreating(false);
      setEditingCourse(null);
      loadCourses(countryFilter === 'All' ? null : countryFilter);
    } catch (err) {
      setError('Failed to save course: ' + err.message);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCourse(null);
  };

  const handleEdit = async (course) => {
    try {
      setLoading(true);
      const fullCourseData = await courseService.getCourseForEditing(course.id);
      setEditingCourse(fullCourseData);
    } catch (err) {
      setError('Failed to load course for editing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (course) => {
    setConfirmDelete({
      open: true,
      courseId: course.id,
      courseName: course.name,
    });
  };

  const handleConfirmDelete = async () => {
    const { courseId } = confirmDelete;
    if (!courseId) return;

    try {
      await courseService.deleteCourse(courseId, currentUser.email);
      setEditingCourse(null);
      loadCourses(countryFilter === 'All' ? null : countryFilter);
    } catch (err) {
      setError('Failed to delete course: ' + err.message);
    } finally {
      setConfirmDelete({ open: false, courseId: null, courseName: '' });
    }
  };

  const renderContent = () => {
    if (isCreating || editingCourse) {
      return (
        <CourseForm
          initialCourse={editingCourse}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDeleteRequest}
        />
      );
    }

    return (
      <Paper {...elevatedCardStyles}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Course Management
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>Filter by Country</InputLabel>
              <Select value={countryFilter} label="Filter by Country" onChange={handleFilterChange}>
                <MenuItem value="All">All Countries</MenuItem>
                {availableCountries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsCreating(true)}>
              Add New Course
            </Button>
          </Box>
        </Box>
        <List>
          {courses.map((course) => (
            <React.Fragment key={course.id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(course)}>
                    <EditIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={course.name} secondary={`${course.city}, ${course.country}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      {renderContent()}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, courseId: null, courseName: '' })}
      >
        <DialogTitle>Delete "{confirmDelete.courseName}"?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this course and all of its associated tee boxes? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, courseId: null, courseName: '' })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseManagementPage;