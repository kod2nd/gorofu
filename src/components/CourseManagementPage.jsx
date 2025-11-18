import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import FlagIcon from "@mui/icons-material/Flag";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import { courseService } from "../services/courseService";
import CourseForm from "./CourseForm";
import { elevatedCardStyles } from "../styles/commonStyles";
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
    // Load both courses and the list of countries for the filter
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [coursesData, countriesData] = await Promise.all([
          courseService.searchCoursesWithStats("", null), // Use the new function
          courseService.getCountriesWithCourses(),
        ]);
        setCourses(coursesData);
        setAvailableCountries(countriesData);
      } catch (err) {
        setError("Failed to load page data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []); // Runs once on component mount

  const loadCourses = async (country) => {
    try {
      setLoading(true);
      const coursesData = await courseService.searchCoursesWithStats(
        "",
        country
      ); // Use the new function
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load courses: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const country = event.target.value;
    setCountryFilter(country);
    loadCourses(country === "All Countries" ? null : country);
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
      loadCourses(countryFilter === "All Countries" ? null : countryFilter);
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
      loadCourses(countryFilter === "All Countries" ? null : countryFilter);
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
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Autocomplete
                size="small"
                options={["All Countries", ...availableCountries]}
                value={countryFilter}
                onChange={(event, newValue) => {
                  handleFilterChange({
                    target: { value: newValue || "All Countries" },
                  });
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
          {courses.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
                p: 3,
              }}
            >
              {courses.map((course) => (
                <Card
                  key={course.id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease-in-out",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      borderColor: "primary.light",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    {/* Course Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          sx={{ lineHeight: 1.2, mb: 0.5 }}
                        >
                          {course.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <PlaceIcon fontSize="small" />
                          {course.city}, {course.country}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${course.tee_box_stats?.length || 0} tee boxes`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>

                    {/* Tee Boxes */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      {course.tee_box_stats?.length > 0 ? (
                        [...course.tee_box_stats]
                          .sort((a, b) => b.total_distance - a.total_distance)
                          .map((tb, index) => (
                            <Paper
                              key={tb.tee_box}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                borderLeft: `4px solid ${getTeeBoxColor(
                                  tb.tee_box,
                                  index
                                )}`,
                                backgroundColor: "grey.50",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="600"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {toProperCase(tb.tee_box)}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <FlagIcon
                                    fontSize="small"
                                    sx={{
                                      color: "text.secondary",
                                      fontSize: 16,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    fontWeight="500"
                                  >
                                    {tb.total_distance}{" "}
                                    {tb.yards_or_meters_unit === "yards"
                                      ? "yds"
                                      : "m"}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      backgroundColor: "primary.main",
                                      color: "white",
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                      fontWeight: "600",
                                      fontSize: "0.7rem",
                                    }}
                                  >
                                    Par {tb.total_par}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {tb.hole_count} holes
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontWeight="500"
                                >
                                  {Math.round(
                                    tb.total_distance / tb.hole_count
                                  )}
                                  /
                                  {tb.yards_or_meters_unit === "yards"
                                    ? "yds"
                                    : "m"}
                                </Typography>
                              </Box>
                            </Paper>
                          ))
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{ p: 3, textAlign: "center", borderRadius: 2 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No tee box data
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(course)}
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        py: 1,
                        textTransform: "none",
                        fontWeight: "600",
                      }}
                    >
                      Edit Course
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
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
                {countryFilter === "All Countries"
                  ? "Create your first course to get started!"
                  : `No courses found in ${countryFilter}`}
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
