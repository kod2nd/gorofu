import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { Download, UploadFile } from '@mui/icons-material';
import { elevatedCardStyles } from '../styles/commonStyles';
import { countries } from './countries';

const CourseForm = ({ initialCourse, onSave, onCancel, onDelete }) => {
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
        { name: 'Black', yards_or_meters_unit: 'meters' },
      ],
    }
  );
  const [showParOverrides, setShowParOverrides] = useState({});

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
    if (!newUnit) return; // Prevent unselecting both
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

  const handleDownloadTemplate = () => {
    const headers = ['hole_number', 'par'];
    course.tee_boxes.forEach(tb => {
      headers.push(`${tb.name}_distance`);
      headers.push(`${tb.name}_par`);
    });

    const rows = Array.from({ length: 18 }, (_, i) => {
      const row = { hole_number: i + 1, par: '' };
      course.tee_boxes.forEach(tb => {
        row[`${tb.name}_distance`] = '';
        row[`${tb.name}_par`] = '';
      });
      return headers.map(header => row[header]).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'course_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      const newHoles = [...course.holes];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});

        const holeNumber = parseInt(rowData.hole_number, 10);
        if (holeNumber >= 1 && holeNumber <= 18) {
          const holeIndex = holeNumber - 1;
          const hole = newHoles[holeIndex];

          if (rowData.par) {
            hole.par = rowData.par;
          }

          course.tee_boxes.forEach(tb => {
            const distKey = `${tb.name}_distance`;
            const parKey = `${tb.name}_par`;
            if (rowData[distKey]) {
              hole.distances[tb.name] = rowData[distKey];
            }
            if (rowData[parKey]) {
              hole.par_overrides[tb.name] = rowData[parKey];
            }
          });
        }
      }
      setCourse(prev => ({ ...prev, holes: newHoles }));
    };
    reader.readAsText(file);
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
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        {course.id ? "Edit Course" : "Add New Course"}
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Course Details */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Box
            sx={{
              flex: "1 1 100%",
              "@media (min-width:600px)": { flex: "1 1 calc(50% - 8px)" },
            }}
          >
            <TextField
              name="name"
              label="Course Name"
              value={course.name}
              onChange={handleCourseChange}
              fullWidth
              required
            />
          </Box>
          <Box
            sx={{
              flex: "1 1 calc(50% - 8px)",
              "@media (min-width:600px)": { flex: "1 1 calc(25% - 12px)" },
            }}
          >
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => option.label}
              value={countries.find((c) => c.label === course.country) || null}
              onChange={(event, newValue) => {
                handleCourseChange({
                  target: {
                    name: "country",
                    value: newValue ? newValue.label : "",
                  },
                });
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <img
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                    alt=""
                    style={{ marginRight: "10px" }}
                  />
                  {option.label}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  fullWidth
                  required
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: "new-password", // disable autocomplete and autofill
                  }}
                />
              )}
            />
          </Box>
          <Box
            sx={{
              flex: "1 1 calc(50% - 8px)",
              "@media (min-width:600px)": { flex: "1 1 calc(25% - 12px)" },
            }}
          >
            <TextField
              name="city"
              label="City"
              value={course.city}
              onChange={handleCourseChange}
              fullWidth
            />
          </Box>
        </Box>

        {/* Tee Box Management */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Tee Boxes
            </Typography>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              onClick={addTeeBox}
              variant="outlined"
            >
              Add Tee Box
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {course.tee_boxes.map((teeBox, index) => (
              <Box
                key={index}
                sx={{
                  flexBasis: "100%",
                  "@media (min-width:600px)": { flexBasis: "calc(50% - 8px)" },
                  "@media (min-width:900px)": {
                    flexBasis: "calc(33.33% - 11px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <TextField
                      label={`Tee ${index + 1} Name`}
                      value={teeBox.name}
                      onChange={(e) =>
                        handleTeeBoxNameChange(index, e.target.value)
                      }
                      fullWidth
                      error={course.tee_boxes.some(
                        (tb, i) =>
                          tb.name.trim() === teeBox.name.trim() && i !== index
                      )}
                      helperText={
                        course.tee_boxes.some(
                          (tb, i) =>
                            tb.name.trim() === teeBox.name.trim() && i !== index
                        )
                          ? "Duplicate name"
                          : ""
                      }
                    />
                    <ToggleButtonGroup
                      color="primary"
                      value={teeBox.yards_or_meters_unit}
                      exclusive
                      onChange={(e, value) =>
                        handleTeeBoxUnitChange(index, value)
                      }
                      size="small"
                      sx={{
                        mt: 1,
                        width: "100%",
                        "& .MuiToggleButton-root": {
                          flexGrow: 1,
                          "&.Mui-selected": {
                            color: "white",
                            backgroundColor: "primary.dark",
                            "&:hover": {
                              backgroundColor: "primary.dark",
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="meters">Meters</ToggleButton>
                      <ToggleButton value="yards">Yards</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <IconButton onClick={() => removeTeeBox(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* CSV Import/Export */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Import / Export
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFile />}
            >
              Upload CSV
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Paper>

        {/* Hole-by-Hole Data Entry */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Hole Information
        </Typography>
        {course.holes.map((hole, holeIndex) => (
          <Accordion key={hole.hole_number}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Typography sx={{ flexShrink: 0, fontWeight: "medium" }}>
                  Hole {hole.hole_number}
                </Typography>
                <Box onClick={(e) => e.stopPropagation()}>
                  <ToggleButtonGroup
                    color="primary"
                    value={hole.par?.toString()} // Ensure it's a string
                    exclusive
                    size="small"
                    onChange={(e, value) => {
                      if (value !== null) {
                        handleHoleDataChange(holeIndex, "par", value);
                      }
                    }}
                    sx={{
                      // Target the selected button specifically
                      "& .MuiToggleButton-root": {
                        "&.Mui-selected": {
                          color: "white",
                          backgroundColor: "primary.dark",
                          "&:hover": {
                            backgroundColor: "primary.dark",
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="2">2</ToggleButton>
                    <ToggleButton value="3">3</ToggleButton>
                    <ToggleButton value="4">4</ToggleButton>
                    <ToggleButton value="5">5</ToggleButton>
                    <ToggleButton value="6">6</ToggleButton>
                    <ToggleButton value="7">7</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: "bold" }}
                >
                  Distances
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {course.tee_boxes.map((teeBox) => (
                    <Box
                      key={teeBox.name}
                      sx={{
                        flexBasis: "calc(50% - 8px)",
                        "@media (min-width:600px)": {
                          flexBasis: "calc(33.33% - 11px)",
                        },
                        "@media (min-width:900px)": {
                          flexBasis: "calc(25% - 12px)",
                        },
                      }}
                    >
                      <TextField
                        label={`${teeBox.name} Distance`}
                        type="number"
                        value={hole.distances[teeBox.name] || ""}
                        onChange={(e) =>
                          handleDistanceChange(
                            holeIndex,
                            teeBox.name,
                            e.target.value
                          )
                        }
                        fullWidth
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
              <Button
                size="small"
                onClick={() =>
                  setShowParOverrides((prev) => ({
                    ...prev,
                    [holeIndex]: !prev[holeIndex],
                  }))
                }
                sx={{ mt: 2 }}
              >
                {showParOverrides[holeIndex] ? "Hide" : "Show"} Par Overrides
              </Button>
              {showParOverrides[holeIndex] && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 2, fontWeight: "bold" }}
                  >
                    Par Overrides{" "}
                    <Typography variant="caption" color="text.secondary">
                      (Optional)
                    </Typography>
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {course.tee_boxes.map((teeBox) => (
                      <Box
                        key={`${teeBox.name}-par`}
                        sx={{
                          flexBasis: "calc(50% - 8px)",
                          "@media (min-width:600px)": {
                            flexBasis: "calc(33.33% - 11px)",
                          },
                          "@media (min-width:900px)": {
                            flexBasis: "calc(25% - 12px)",
                          },
                        }}
                      >
                        <TextField
                          label={`${teeBox.name} Par`}
                          type="number"
                          value={hole.par_overrides[teeBox.name] || ""}
                          onChange={(e) =>
                            handleParOverrideChange(
                              holeIndex,
                              teeBox.name,
                              e.target.value
                            )
                          }
                          fullWidth
                          size="small"
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                hasDuplicateTeeBoxes ||
                course.tee_boxes.some((tb) => tb.name.trim() === "")
              }
            >
              Save Course
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          </Box>
          {initialCourse && (
            <Button
              variant="text"
              color="error"
              onClick={() => onDelete(course)}
            >
              Delete Course
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default CourseForm;