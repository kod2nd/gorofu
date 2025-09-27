import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { courseService } from '../services/courseService';
import CourseForm from './CourseForm';
import { elevatedCardStyles } from '../styles/commonStyles';

const CourseManagementPage = ({ user, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Fetch all courses, not just by a single country
      const coursesData = await courseService.searchCourses('');
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load courses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (courseData) => {
    try {
      await courseService.saveCourseWithTeeBoxes(courseData, user.email);
      setIsCreating(false);
      setEditingCourse(null);
      loadCourses();
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

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  if (isCreating || editingCourse) {
    return (
      <CourseForm
        course={editingCourse}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Paper {...elevatedCardStyles}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreating(true)}
        >
          Add New Course
        </Button>
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

export default CourseManagementPage;