import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  MenuItem,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { elevatedCardStyles } from '../styles/commonStyles';

const CourseForm = ({ course: initialCourse, onSave, onCancel }) => {
  const [course, setCourse] = useState(
    initialCourse || {
      name: '',
      country: 'Singapore',
      city: '',
      // Restructure state to be hole-centric
      holes: Array.from({ length: 18 }, (_, i) => ({
        hole_number: i + 1,
        par: '',
        par_overrides: {}, // e.g., { 'White': 4, 'Blue': 5 }
        distances: {}, // e.g., { 'White': 350, 'Blue': 380 }
      })),
      tee_boxes: [
        { name: 'Red', yards_or_meters_unit: 'meters' },
        { name: 'White', yards_or_meters_unit: 'meters' },
        { name: 'Blue', yards_or_meters_unit: 'meters' },
      ],
    }
  );

  const handleCourseChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleTeeBoxNameChange = (index, newName) => {
    const newTeeBoxes = [...course.tee_boxes];
    const oldName = newTeeBoxes[index].name;
    newTeeBoxes[index].name = newName;

    // When a tee box name changes, update the keys in the holes' distances
    const newHoles = course.holes.map(hole => {
      const newDistances = { ...hole.distances };
      const newParOverrides = { ...hole.par_overrides };

      if (oldName in newDistances) {
        newDistances[newName] = newDistances[oldName];
        delete newDistances[oldName];
      }

      if (oldName in newParOverrides) {
        newParOverrides[newName] = newParOverrides[oldName];
        delete newParOverrides[oldName];
      }
      return { ...hole, distances: newDistances, par_overrides: newParOverrides };
    });

    setCourse({ ...course, tee_boxes: newTeeBoxes, holes: newHoles });
  };

  const handleTeeBoxUnitChange = (index, newUnit) => {
    const newTeeBoxes = [...course.tee_boxes];
    newTeeBoxes[index].yards_or_meters_unit = newUnit;
    setCourse({ ...course, tee_boxes: newTeeBoxes });
  };

  const handleHoleDataChange = (holeIndex, field, value) => {
    const newHoles = [...course.holes];
    newHoles[holeIndex][field] = value;
    setCourse({ ...course, holes: newHoles });
  };

  const handleDistanceChange = (holeIndex, teeBoxName, value) => {
    const newHoles = [...course.holes];
    newHoles[holeIndex].distances[teeBoxName] = value;
    setCourse({ ...course, holes: newHoles });
  };

  const handleParOverrideChange = (holeIndex, teeBoxName, value) => {
    const newHoles = [...course.holes];
    newHoles[holeIndex].par_overrides[teeBoxName] = value;
    setCourse({ ...course, holes: newHoles });
  };

  const addTeeBox = () => {
    const newTeeBoxName = `Tee ${course.tee_boxes.length + 1}`;
    setCourse({
      ...course,
      tee_boxes: [
        ...course.tee_boxes,
        { name: newTeeBoxName, yards_or_meters_unit: 'meters' },
      ],
    });
  };

  const removeTeeBox = (index) => {
    const teeBoxToRemove = course.tee_boxes[index];
    const newTeeBoxes = course.tee_boxes.filter((_, i) => i !== index);

    // Remove corresponding distances from all holes
    const newHoles = course.holes.map(hole => {
      const newDistances = { ...hole.distances };
      const newParOverrides = { ...hole.par_overrides };
      delete newParOverrides[teeBoxToRemove.name];
      delete newDistances[teeBoxToRemove.name];
      return { ...hole, distances: newDistances, par_overrides: newParOverrides };
    });

    setCourse({ ...course, tee_boxes: newTeeBoxes, holes: newHoles });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Transform state back to the structure the service expects
    const courseDataForSave = {
      ...course,
      tee_boxes: course.tee_boxes.map(tb => ({
        ...tb,
        holes: course.holes.map(h => ({
          hole_number: h.hole_number,
          par: h.par_overrides[tb.name] || h.par, // Use override if it exists, otherwise default
          distance: h.distances[tb.name] || '',
        }))
      }))
    };
    onSave(courseDataForSave);
  };

  // Check for duplicate tee box names to disable the save button
  const hasDuplicateTeeBoxes = useMemo(() => {
    const names = course.tee_boxes.map(tb => tb.name.trim());
    // A name is a duplicate if it's not empty and its first index is not its last index.
    return names.some((name, index) => 
      name !== '' && 
      names.indexOf(name) !== index
    );
  }, [course.tee_boxes]);

  return (
    <Paper {...elevatedCardStyles}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {course.id ? 'Edit Course' : 'Add New Course'}
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Course Details */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 100%', '@media (min-width:600px)': { flex: '1 1 calc(50% - 8px)' } }}>
            <TextField name="name" label="Course Name" value={course.name} onChange={handleCourseChange} fullWidth required />
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', '@media (min-width:600px)': { flex: '1 1 calc(25% - 12px)' } }}>
            <TextField name="country" label="Country" value={course.country} onChange={handleCourseChange} fullWidth />
          </Box>
          <Box sx={{ flex: '1 1 calc(50% - 8px)', '@media (min-width:600px)': { flex: '1 1 calc(25% - 12px)' } }}>
            <TextField name="city" label="City" value={course.city} onChange={handleCourseChange} fullWidth />
          </Box>
        </Box>

        {/* Tee Box Management */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tee Boxes</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {course.tee_boxes.map((teeBox, index) => (
              <Box
                key={index}
                sx={{
                  flex: '1 1 100%',
                  '@media (min-width:600px)': { flex: '1 1 calc(50% - 8px)' },
                  '@media (min-width:900px)': { flex: '1 1 calc(33.33% - 11px)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField 
                    label={`Tee ${index + 1} Name`} 
                    value={teeBox.name} 
                    onChange={(e) => handleTeeBoxNameChange(index, e.target.value)} 
                    fullWidth 
                    error={course.tee_boxes.some((tb, i) => tb.name.trim() === teeBox.name.trim() && i !== index)}
                    helperText={course.tee_boxes.some((tb, i) => tb.name.trim() === teeBox.name.trim() && i !== index) ? 'Duplicate name' : ''}
                  />
                  <IconButton onClick={() => removeTeeBox(index)} color="error"><DeleteIcon /></IconButton>
                </Box>
              </Box>
            ))}
            <Box
              sx={{
                flex: '1 1 100%',
                '@media (min-width:600px)': { flex: '1 1 calc(33.33% - 11px)' },
                '@media (min-width:900px)': { flex: '1 1 calc(25% - 12px)' },
              }}
            >
              <Button startIcon={<AddCircleOutlineIcon />} onClick={addTeeBox} variant="outlined" fullWidth>Add Tee Box</Button>
            </Box>
          </Box>
        </Paper>

        {/* Hole-by-Hole Data Entry */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Hole Information</Typography>
        {course.holes.map((hole, holeIndex) => (
          <Accordion key={hole.hole_number}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: '33%', flexShrink: 0 }}>Hole {hole.hole_number}</Typography>
              <TextField
                label="Par"
                size="small"
                type="number"
                value={hole.par}
                onChange={(e) => handleHoleDataChange(holeIndex, 'par', e.target.value)}
                onClick={(e) => e.stopPropagation()}
                sx={{ width: '80px' }}
              />
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Distance</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {course.tee_boxes.map((teeBox) => (
                    <Box
                      key={teeBox.name}
                      sx={{
                        flex: '1 1 calc(50% - 8px)',
                        '@media (min-width:900px)': { flex: '1 1 calc(25% - 12px)' },
                      }}
                    >
                      <TextField
                        label={`${teeBox.name} Distance`}
                        type="number"
                        value={hole.distances[teeBox.name] || ''}
                        onChange={(e) => handleDistanceChange(holeIndex, teeBox.name, e.target.value)}
                        fullWidth
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Hole Par Override <Typography variant="caption" color="text.secondary">(Optional)</Typography></Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {course.tee_boxes.map((teeBox) => (
                    <Box
                      key={`${teeBox.name}-par`}
                      sx={{
                        flex: '1 1 calc(50% - 8px)',
                        '@media (min-width:900px)': { flex: '1 1 calc(25% - 12px)' },
                      }}
                    >
                      <TextField
                        label={`${teeBox.name} Par`}
                        type="number"
                        value={hole.par_overrides[teeBox.name] || ''}
                        onChange={(e) => handleParOverrideChange(holeIndex, teeBox.name, e.target.value)}
                        fullWidth
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" color="primary" disabled={hasDuplicateTeeBoxes}>
            Save Course
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CourseForm;