import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import FlagIcon from "@mui/icons-material/Flag";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import { courseService } from "../services/courseService";
import { useDebounce } from "../hooks/useDebounce";
import CourseForm from "./CourseForm";
import { elevatedCardStyles } from "../styles/commonStyles";
import { countries } from "./countries";
import PageHeader from "./PageHeader";

const toProperCase = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const CourseManagementPage = ({ currentUser, onBack }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    courseId: null,
    courseName: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadCourses();
  }, [countryFilter, debouncedSearchTerm]);

  useEffect(() => {
    // Fetch available countries only once
    courseService.getCountriesWithCourses().then(setAvailableCountries).catch(err => {
      setError("Failed to load country filter: " + err.message);
    });
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.searchCoursesWithStats(
        debouncedSearchTerm,
        countryFilter === "All Countries" ? null : countryFilter
      );
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load courses: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (courseData) => {
    try {
      await courseService.saveCourseWithTeeBoxes(courseData, currentUser.email);
      setSnackbar({
        open: true,
        message: "Course saved successfully!",
        severity: "success",
      });
      setIsCreating(false);
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to save course: ${err.message}`,
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCourse(null);
  };

const getTeeBoxColor = (teeBoxName, index) => {
    const name = teeBoxName.trim().toLowerCase();

    // Map common tee box names/keywords to specific colors
    const colorMap = {
      red: "#ef4444",
      blue: "#3b82f6",
      white: "#dfdfdfff", // A mid-gray for visibility on a white background
      black: "#1f2937",
      gold: "#f59e0b",
      yellow: "#eab308",
      green: "#16a34a",
      silver: "#9ca3af",
      championship: "#1f2937", // Often black or gold
      ladies: "#ef4444", // Often red
      forward: "#ef4444",
      tips: "#1f2937",
    };

    for (const key in colorMap) {
      if (name.includes(key)) {
        return colorMap[key];
      }
    }

    // Fallback to a rotating palette for uncommon names
    const fallbackColors = [
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#10b981", // teal
      "#6366f1", // indigo
    ];
    return fallbackColors[index % fallbackColors.length];
  };

  const handleEdit = async (course) => {
    try {
      setLoading(true);
      const fullCourseData = await courseService.getCourseForEditing(course.id);
      setEditingCourse(fullCourseData);
    } catch (err) {
      setError("Failed to load course for editing: " + err.message);
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
      setSnackbar({
        open: true,
        message: "Course deleted successfully.",
        severity: "info",
      });
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to delete course: ${err.message}`,
        severity: "error",
      });
    } finally {
      setConfirmDelete({ open: false, courseId: null, courseName: "" });
    }
  };

  const groupedCourses = useMemo(() => {
    if (countryFilter !== 'All Countries' || debouncedSearchTerm) return null;
    return courses.reduce((acc, course) => {
      const country = course.country || 'Uncategorized';
      if (!acc[country]) acc[country] = [];
      acc[country].push(course);
      return acc;
    }, {});
  }, [courses, countryFilter, debouncedSearchTerm]);

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
      <>
        <PageHeader
          title="Course Management"
          actions={
            <Box sx={{ display: "flex", flexWrap: 'wrap', gap: 2, alignItems: "center" }}>
              <TextField
                size="small"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 220, backgroundColor: "white", borderRadius: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EditIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Autocomplete
                size="small"
                options={["All Countries", ...availableCountries]}
                value={countryFilter}
                onChange={(event, newValue) => {
                  setCountryFilter(newValue || "All Countries");
                }}
                sx={{ width: 220, backgroundColor: "white", borderRadius: 1 }}
                renderInput={(params) => <TextField {...params} />}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreating(true)}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                }}
              >
                Add New Course
              </Button>
            </Box>
          }
        />
        <Paper {...elevatedCardStyles}>
          {courses.length > 0 ? (groupedCourses ? (
            // Render grouped by country
            Object.entries(groupedCourses).sort(([a], [b]) => {
              if (a === currentUser?.country) return -1;
              if (b === currentUser?.country) return 1;
              return a.localeCompare(b);
            }).map(([country, coursesInCountry]) => {
              const countryData = countries.find(c => c.label === country);
              const countryCode = countryData ? countryData.code.toLowerCase() : '';
              return (
              <Box key={country} sx={{ p: 3, '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1 }}>
                  {countryCode && (
                    <img
                      loading="lazy"
                      width="30"
                      src={`https://flagcdn.com/w40/${countryCode}.png`}
                      alt={`${country} flag`}
                      style={{ borderRadius: '4px' }}
                    />
                  )}
                  <Typography variant="h5" fontWeight="bold">{country}</Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {coursesInCountry.map(course => (
                    <Card
                      key={course.id}
                      sx={{
                        flexBasis: { xs: "100%", sm: "calc(50% - 12px)", lg: "calc(33.33% - 16px)" },
                        display: "flex", flexDirection: "column", transition: "all 0.2s ease-in-out",
                        border: "1px solid", borderColor: "divider",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", borderColor: "primary.light" },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1.2, mb: 0.5 }}>{course.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><PlaceIcon fontSize="small" />{course.city}, {course.country}</Typography>
                          </Box>
                          <Chip label={`${course.tee_box_stats?.length || 0} tee boxes`} size="small" variant="outlined" color="primary" />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          {course.tee_box_stats?.length > 0 ? (
                            [...course.tee_box_stats].sort((a, b) => b.total_distance - a.total_distance).map((tb, index) => (
                              <Paper key={tb.tee_box} variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderLeft: `4px solid ${getTeeBoxColor(tb.tee_box, index)}`, backgroundColor: "grey.50" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                  <Typography variant="subtitle2" fontWeight="600" sx={{ textTransform: "capitalize" }}>{toProperCase(tb.tee_box)}</Typography>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <FlagIcon fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
                                    <Typography variant="caption" fontWeight="500">
                                      {tb.yards_or_meters_unit === 'yards'
                                        ? `${tb.total_distance} yds (${Math.round(tb.total_distance * 0.9144)} m)`
                                        : `${tb.total_distance} m (${Math.round(tb.total_distance * 1.09361)} yds)`
                                      }
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" sx={{ backgroundColor: "primary.main", color: "white", px: 1, py: 0.25, borderRadius: 1, fontWeight: "600", fontSize: "0.7rem" }}>Par {tb.total_par}</Typography>
                                    <Typography variant="caption" color="text.secondary">{tb.hole_count} holes</Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            ))
                          ) : (
                            <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                              <Typography variant="body2" color="text.secondary">No tee box data</Typography>
                            </Paper>
                          )}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(course)} variant="outlined" fullWidth sx={{ borderRadius: 2, py: 1, textTransform: "none", fontWeight: "600" }}>Edit Course</Button>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              </Box>
              )
            })
          ) : (
            // Render flat list (when filtering by country or searching)
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, p: 3 }}>
              {courses.map((course) => (
                <Card key={course.id} sx={{ flexBasis: { xs: "100%", sm: "calc(50% - 12px)", lg: "calc(33.33% - 16px)" }, display: "flex", flexDirection: "column", transition: "all 0.2s ease-in-out", border: "1px solid", borderColor: "divider", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", borderColor: "primary.light" } }}>
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="600" sx={{ lineHeight: 1.2, mb: 0.5 }}>{course.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><PlaceIcon fontSize="small" />{course.city}, {course.country}</Typography>
                      </Box>
                      <Chip label={`${course.tee_box_stats?.length || 0} tee boxes`} size="small" variant="outlined" color="primary" />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {course.tee_box_stats?.length > 0 ? (
                        [...course.tee_box_stats].sort((a, b) => b.total_distance - a.total_distance).map((tb, index) => (
                          <Paper key={tb.tee_box} variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderLeft: `4px solid ${getTeeBoxColor(tb.tee_box, index)}`, backgroundColor: "grey.50" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight="600" sx={{ textTransform: "capitalize" }}>{toProperCase(tb.tee_box)}</Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <FlagIcon fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
                                <Typography variant="caption" fontWeight="500">
                                  {tb.yards_or_meters_unit === 'yards'
                                    ? `${tb.total_distance} yds (${Math.round(tb.total_distance * 0.9144)} m)`
                                    : `${tb.total_distance} m (${Math.round(tb.total_distance * 1.09361)} yds)`
                                  }
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="caption" sx={{ backgroundColor: "primary.main", color: "white", px: 1, py: 0.25, borderRadius: 1, fontWeight: "600", fontSize: "0.7rem" }}>Par {tb.total_par}</Typography>
                                <Typography variant="caption" color="text.secondary">{tb.hole_count} holes</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" fontWeight="500">
                                Avg: {tb.yards_or_meters_unit === 'yards'
                                  ? `${Math.round(tb.total_distance / tb.hole_count)} yds`
                                  : `${Math.round(tb.total_distance / tb.hole_count)} m`
                                }
                              </Typography>
                            </Box>
                          </Paper>
                        ))
                      ) : (
                        <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">No tee box data</Typography>
                        </Paper>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(course)} variant="outlined" fullWidth sx={{ borderRadius: 2, py: 1, textTransform: "none", fontWeight: "600" }}>Edit Course</Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Box sx={{ mb: 2, opacity: 0.5 }}>
                <GolfCourseIcon
                  sx={{ fontSize: 64, color: "text.secondary" }}
                />
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No courses found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? `No courses match your search for "${searchTerm}".`
                  : countryFilter === "All Countries" ? "Create your first course to get started!"
                  : `No courses found in ${countryFilter}.`}
              </Typography>
            </Box>
          )}
        </Paper>
      </>
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
        onClose={() =>
          setConfirmDelete({ open: false, courseId: null, courseName: "" })
        }
      >
        <DialogTitle>Delete "{confirmDelete.courseName}"?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this course and all of
            its associated tee boxes? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDelete({ open: false, courseId: null, courseName: "" })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CourseManagementPage;
