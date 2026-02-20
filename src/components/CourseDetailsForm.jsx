import React, { useState, useEffect } from "react";
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
  Stack,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { courseService } from "../services/courseService";
import { countries } from "./countries";
import { segmentedSx } from '../styles/commonStyles';

// --- Modern UI helpers -------------------------------------------------------

const SectionCard = ({ title, children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
        background: alpha(theme.palette.text.primary, 0.02),
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 1.5,
          color: "text.secondary",
          fontWeight: 900,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>{children}</Box>
    </Box>
  );
};

const fieldSx = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
  },
});

// --- Component ---------------------------------------------------------------

const CourseDetailsForm = ({
  roundData = {},
  handleCourseChange,
  isEditMode = false,
  isMobile,
}) => {
  const theme = useTheme();

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [teeBoxDialogOpen, setTeeBoxDialogOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [teeBoxOptions, setTeeBoxOptions] = useState([]);
  const [customCourseName, setCustomCourseName] = useState("");
  const [customTeeBox, setCustomTeeBox] = useState("");

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
      courseService
        .getCourseTeeBoxes(roundData.course_id)
        .then((teeBoxes) => setTeeBoxOptions([...teeBoxes, "Add new tee box..."]))
        .catch((err) => console.error("Failed to fetch tee boxes:", err));
    } else {
      setTeeBoxOptions(["Red", "White", "Blue", "Black", "Add new tee box..."]);
    }
  }, [roundData.course_id]);

  const defaults = {
    yards_or_meters_unit: "meters",
    scoring_zone_level: "100m - Novice",
    round_date: new Date().toISOString().split("T")[0],
    round_type: "18_holes",
  };

  const formData = { ...defaults, ...roundData };
  const filter = createFilterOptions();

  const handleFilterOptions = (options, params) => {
    const filtered = filter(options, params);
    const { inputValue } = params;
    const isExisting = options.some((option) => inputValue === option.name);
    if (inputValue !== "" && !isExisting) {
      filtered.push(`Add new course: "${inputValue}"`);
    }
    return filtered;
  };

  const handleCourseSelect = (event, newValue) => {
    if (typeof newValue === "string" && newValue.startsWith("Add new course:")) {
      const newCourseName = newValue.substring(newValue.indexOf('"') + 1, newValue.lastIndexOf('"'));
      handleCourseChange({ target: { name: "course_name", value: newCourseName } });
      handleCourseChange({ target: { name: "course_id", value: null } });
    } else if (newValue && newValue.inputValue) {
      handleCourseChange({ target: { name: "course_name", value: newValue.inputValue } });
      handleCourseChange({ target: { name: "course_id", value: null } });
    } else {
      handleCourseChange({ target: { name: "course_name", value: newValue?.name || "" } });
      handleCourseChange({ target: { name: "course_id", value: newValue?.id || null } });
    }
  };

  const handleSaveCustomCourse = () => {
    if (customCourseName.trim()) {
      handleCourseChange({ target: { name: "course_name", value: customCourseName.trim() } });
      setCustomCourseName("");
      setCourseDialogOpen(false);
    }
  };

  const handleSaveCustomTeeBox = () => {
    if (customTeeBox.trim()) {
      handleCourseChange({ target: { name: "tee_box", value: customTeeBox.trim() } });
      setCustomTeeBox("");
      setTeeBoxDialogOpen(false);
    }
  };

  const handleCloseDialogs = () => {
    setCourseDialogOpen(false);
    setTeeBoxDialogOpen(false);
    setCustomCourseName("");
    setCustomTeeBox("");
  };

  const handleToggleButtonChange = (name, value) => {
    if (value !== null) {
      handleCourseChange({ target: { name, value } });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
        background: `linear-gradient(180deg,
          ${alpha(theme.palette.background.paper, 1)} 0%,
          ${alpha(theme.palette.background.default, 0.7)} 100%)`,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Stack spacing={2.25}>
        <SectionCard title="Date Played">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={formData.round_date ? new Date(formData.round_date) : null}
              onChange={(newValue) => {
                if (!newValue) return;
                handleCourseChange({
                  target: { name: "round_date", value: newValue.toISOString().split("T")[0] },
                });
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: fieldSx(theme),
                },
              }}
            />
          </LocalizationProvider>
        </SectionCard>

        <SectionCard title="Country">
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => option.label || option}
            value={countries.find((c) => c.label === formData.country) || null}
            onChange={(event, newValue) => {
              handleCourseChange({ target: { name: "country", value: newValue ? newValue.label : "" } });
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
                    style={{ marginRight: 10, borderRadius: 4 }}
                  />
                  {option.label} ({option.code})
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Country" required fullWidth sx={fieldSx(theme)} />
            )}
          />
        </SectionCard>

        <SectionCard title="Course Information">
          <Autocomplete
            value={courses.find((c) => c.id === formData.course_id) || formData.course_name || null}
            options={courses || []}
            isOptionEqualToValue={(option, value) => option.id === value.id || option.name === value}
            onChange={handleCourseSelect}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.name || "")}
            filterOptions={handleFilterOptions}
            noOptionsText="No course found"
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;

              if (typeof option === "string" && option.startsWith("Add new course:")) {
                return (
                  <li
                    key={key}
                    {...otherProps}
                    style={{
                      fontWeight: 800,
                      color: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                    {option}
                  </li>
                );
              }
              return <li key={key} {...otherProps}>{option.name}</li>;
            }}
            renderInput={(params) => (
              <TextField {...params} label="Course" required fullWidth disabled={isEditMode} sx={fieldSx(theme)} />
            )}
          />

          <Autocomplete
            value={formData.tee_box || ""}
            options={teeBoxOptions || []}
            onChange={(event, newValue) => {
              if (newValue === "Add new tee box...") setTeeBoxDialogOpen(true);
              else handleCourseChange({ target: { name: "tee_box", value: newValue } });
            }}
            disabled={isEditMode}
            renderInput={(params) => (
              <TextField {...params} label="Tee Box" required fullWidth sx={fieldSx(theme)} />
            )}
          />

          <ToggleButtonGroup
            value={formData.yards_or_meters_unit}
            exclusive
            onChange={(e, value) => handleToggleButtonChange("yards_or_meters_unit", value)}
            aria-label="distance unit"
            sx={segmentedSx(theme)}
          >
            <ToggleButton value="meters">m</ToggleButton>
            <ToggleButton value="yards">yd</ToggleButton>
          </ToggleButtonGroup>
        </SectionCard>

        <SectionCard title="Round Type">
          <ToggleButtonGroup
            value={formData.round_type}
            exclusive
            onChange={(e, value) => handleToggleButtonChange("round_type", value)}
            sx={segmentedSx(theme)}
          >
            <ToggleButton value="18_holes">Full 18</ToggleButton>
            <ToggleButton value="front_9">Front 9</ToggleButton>
            <ToggleButton value="back_9">Back 9</ToggleButton>
          </ToggleButtonGroup>
        </SectionCard>

        <SectionCard title="Scoring Zone">
          <ToggleButtonGroup
            value={formData.scoring_zone_level}
            exclusive
            onChange={(e, value) => handleToggleButtonChange("scoring_zone_level", value)}
            sx={{
              ...segmentedSx(theme),
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                ...segmentedSx(theme)["& .MuiToggleButton-root"],
                flex: "1 1 120px",
              },
            }}
          >
            <ToggleButton value="100m - Novice">100m</ToggleButton>
            <ToggleButton value="75m - Journeyman">75m</ToggleButton>
            <ToggleButton value="50m - Adapt">50m</ToggleButton>
            <ToggleButton value="25m - Expert">25m</ToggleButton>
            <ToggleButton value="OnGreen Professional">On Green</ToggleButton>
          </ToggleButtonGroup>
        </SectionCard>
      </Stack>

      {/* Dialog for Custom Course Name */}
      <Dialog
        open={courseDialogOpen}
        onClose={handleCloseDialogs}
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Enter Custom Course Name</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Course Name"
            fullWidth
            value={customCourseName}
            onChange={(e) => setCustomCourseName(e.target.value)}
            sx={{ mt: 1, ...fieldSx(theme) }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveCustomCourse();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialogs} sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomCourse}
            variant="contained"
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800, px: 2.5 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Custom Tee Box */}
      <Dialog
        open={teeBoxDialogOpen}
        onClose={handleCloseDialogs}
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Enter Custom Tee Box</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Tee Box Name"
            fullWidth
            value={customTeeBox}
            onChange={(e) => setCustomTeeBox(e.target.value)}
            sx={{ mt: 1, ...fieldSx(theme) }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveCustomTeeBox();
            }}
            placeholder="e.g., Gold, Silver, Championship, etc."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialogs} sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCustomTeeBox}
            variant="contained"
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800, px: 2.5 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CourseDetailsForm;
