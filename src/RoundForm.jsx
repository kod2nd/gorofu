import { useState, useMemo, useEffect } from "react";
import { courseService } from "./services/courseService";
import { roundService } from "./services/roundService";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// Import the child components
import CourseDetailsForm from "./components/CourseDetailsForm";
import HoleDetailsForm from "./components/HoleDetailsForm";
import MobileHoleEntry from "./components/MobileHoleEntry";
import ViewListIcon from "@mui/icons-material/ViewList";
import ScorecardTable from "./components/ScorecardTable";
import PageHeader from "./components/PageHeader";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import RoundInsights from "./components/RoundInsights";
import SectionHeader from "./components/SectionHeader";
import { elevatedCardStyles } from "./styles/commonStyles";

const initialHoleState = {
  played: true,
  par: "",
  within3shots: false,
  distance: "",
  putts: "",
  putts_within4ft: "",
  penalty_shots: 0,
  hole_score: "",
  hole_outside_scoring_zone: false,
  scoring_zone_in_regulation: false,
  holeout_from_outside_4ft: false,
  holeout_within_3_shots_scoring_zone: false,
};

const RoundForm = ({
  user,
  userProfile,
  closeForm,
  roundIdToEdit,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [courseDetails, setCourseDetails] = useState({
    course_id: null,
    course_name: "", // For display in the form
    tee_box: "",
    country: "Singapore", // Set a base default
    yards_or_meters_unit: "meters",
    scoring_zone_level: "100m - Novice",
    round_date: new Date().toISOString().split("T")[0],
    round_type: "18_holes",
  });
  const [holes, setHoles] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      ...initialHoleState,
      hole_number: i + 1,
    }))
  );
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [viewMode, setViewMode] = useState("hole-by-hole");

  const handleViewChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  useEffect(() => {
    // Set country from user profile once it's loaded, but only on initial form load.
    if (userProfile && !roundIdToEdit) {
      setCourseDetails((prev) => ({
        ...prev,
        country: userProfile.country || "Singapore",
      }));
    }
  }, [userProfile, roundIdToEdit]);
  useEffect(() => {
    if (roundIdToEdit) {
      const fetchRoundData = async () => {
        setLoading(true);
        try {
          const roundData = await roundService.getRoundWithHoles(
            roundIdToEdit,
            user.email
          );

          setCourseDetails({
            course_id: roundData.course_id,
            course_name: roundData.courses.name,
            tee_box: roundData.tee_box,
            country: roundData.courses.country,
            yards_or_meters_unit:
              roundData.holes?.[0]?.yards_or_meters_unit || "meters",
            scoring_zone_level: roundData.scoring_zone_level,
            round_date: roundData.round_date,
            round_type: roundData.round_type,
          });

          // Create a full 18-hole array and fill it with data
          const newHoles = Array.from({ length: 18 }, (_, i) => {
            const holeNumber = i + 1;
            const userPlayedHole =
              roundData.holes.find((h) => h.hole_number === holeNumber) || {};

            return {
              ...initialHoleState,
              ...userPlayedHole,
              distance: userPlayedHole.distance || "",
            };
          });
          setHoles(newHoles);
        } catch (error) {
          setSnackbar({
            open: true,
            message: `Failed to load round data: ${error.message}`,
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchRoundData();
    }
  }, [roundIdToEdit, user.email]); // Add user.email dependency

  useEffect(() => {
    // Automatically toggle the 'played' status of holes based on the round type.
    // This should not run when editing an existing round, to preserve its saved state.
    if (roundIdToEdit) return;

    setHoles((currentHoles) =>
      currentHoles.map((hole, index) => {
        let isPlayed = true;
        if (courseDetails.round_type === "front_9" && index >= 9) {
          isPlayed = false;
        } else if (courseDetails.round_type === "back_9" && index < 9) {
          isPlayed = false;
        }

        // If the hole is being marked as not played, clear its data.
        if (!isPlayed) {
          return {
            ...initialHoleState,
            hole_number: hole.hole_number,
            played: false,
          };
        }
        return { ...hole, played: true };
      })
    );
  }, [courseDetails.round_type, roundIdToEdit]);

  useEffect(() => {
    const fetchTeeBoxData = async () => {
      // Only run for new rounds when both course and tee box are selected
      if (roundIdToEdit || !courseDetails.course_id || !courseDetails.tee_box) {
        return;
      }

      try {
        const teeBoxHoles = await courseService.getTeeBoxData(
          courseDetails.course_id,
          courseDetails.tee_box
        );

        if (teeBoxHoles && teeBoxHoles.length > 0) {
          // Auto-set the yards/meters unit based on the first hole's data
          const unit = teeBoxHoles[0].yards_or_meters_unit;
          if (unit) {
            handleCourseChange({
              target: { name: "yards_or_meters_unit", value: unit },
            });
          }

          setHoles((currentHoles) =>
            currentHoles.map((hole) => {
              const matchingTeeBoxHole = teeBoxHoles.find(
                (tbh) => tbh.hole_number === hole.hole_number
              );
              return matchingTeeBoxHole
                ? {
                    ...hole,
                    par: matchingTeeBoxHole.par || "",
                    distance: matchingTeeBoxHole.distance || "",
                  }
                : hole;
            })
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch tee box data for auto-population:",
          error
        );
      }
    };

    fetchTeeBoxData();
  }, [courseDetails.course_id, courseDetails.tee_box, roundIdToEdit]);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleHoleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newHoles = [...holes];
    const currentHole = newHoles[index];

    let updatedHole = {
      ...currentHole,
      [name]: type === "checkbox" ? checked : value,
    };

    // If par is changed and score hasn't been set, default score to par.
    if (name === "par" && !currentHole.hole_score) {
      updatedHole.hole_score = value;
    }

    // UX Logic: If putts is 0, then putts_within4ft must be 0, and it must be a holeout from outside 4ft.
    if (name === "putts" && Number(value) === 0) {
      updatedHole.putts_within4ft = 0;
      updatedHole.holeout_from_outside_4ft = true;
    }

    if (name === "putts_within4ft" && Number(value) === 0) {
      updatedHole.holeout_from_outside_4ft = true;
    }

    // If a hole is marked as not played, clear its data.
    if (name === "played" && !checked) {
      updatedHole = {
        ...updatedHole,
        hole_score: "",
        putts: "",
        penalty_shots: 0,
      };
    }

    newHoles[index] = updatedHole;
    setHoles(newHoles);
  };

  // Calculate insights in the parent component
  const totalPutts = useMemo(
    () => holes.reduce((sum, hole) => sum + (Number(hole.putts) || 0), 0),
    [holes]
  );
  const totalScore = useMemo(
    () => holes.reduce((sum, hole) => sum + (Number(hole.hole_score) || 0), 0),
    [holes]
  );
  const totalPenalties = useMemo(
    () =>
      holes.reduce((sum, hole) => sum + (Number(hole.penalty_shots) || 0), 0),
    [holes]
  );
  const totalSZIR = useMemo(
    () => holes.filter((hole) => hole.scoring_zone_in_regulation).length,
    [holes]
  );
  const totalHoleoutFromOutside4ft = useMemo(
    () => holes.filter((hole) => hole.holeout_from_outside_4ft).length,
    [holes]
  );
  const totalPuttsWithin4ft = useMemo(
    () =>
      holes.reduce((sum, hole) => sum + (Number(hole.putts_within4ft) || 0), 0),
    [holes]
  );
  const totalHoleoutWithin3Shots = useMemo(
    () =>
      holes.filter(
        (hole) => hole.played && hole.holeout_within_3_shots_scoring_zone
      ).length,
    [holes]
  );
  // Renamed for clarity: "Scoring Holes" are holes with enough data for stats.
  const totalScoringHoles = useMemo(
    () =>
      holes.filter(
        (h) => h.hole_score && (h.putts !== "" || h.holeout_from_outside_4ft)
      ).length,
    [holes]
  );
  const holesWithMoreThanOnePuttWithin4ft = useMemo(
    () => holes.filter((hole) => Number(hole.putts_within4ft) > 1).length,
    [holes]
  );

  const insightsData = {
    totalScore,
    totalPenalties,
    totalHolesPlayed: totalScoringHoles, // Pass the new calculation to insights
    totalSZIR,
    totalPutts,
    totalPuttsWithin4ft,
    holesWithMoreThanOnePuttWithin4ft,
    totalHoleoutFromOutside4ft,
    totalHoleoutWithin3Shots,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine if it's an "eligible" round (>=7 holes for 9, >=14 for 18)
    let is_eligible_round = false;
    const playedHolesWithData = holes.filter(
      (h) => h.hole_score && (h.putts !== "" || h.holeout_from_outside_4ft)
    );
    if (
      courseDetails.round_type === "18_holes" &&
      playedHolesWithData.length >= 14
    ) {
      is_eligible_round = true;
    } else if (
      (courseDetails.round_type === "front_9" ||
        courseDetails.round_type === "back_9") &&
      playedHolesWithData.length >= 7
    ) {
      is_eligible_round = true;
    }

    // Find or create course_id
    let finalCourseId = courseDetails.course_id;
    if (!finalCourseId) {
      try {
        // This is a simplified search; a real app might need a more robust lookup/creation flow
        const courses = await courseService.searchCourses(
          courseDetails.course_name
        );
        if (courses.length > 0) {
          finalCourseId = courses[0].id;
        } else {
          // If course doesn't exist, create it
          const newCourse = await courseService.createCourse(
            { name: courseDetails.course_name, country: courseDetails.country },
            user.email
          );
          finalCourseId = newCourse.id;
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Error finding or creating course: ${error.message}`,
          severity: "error",
        });
        setLoading(false);
        return;
      }
    }

    // Check if tee box data exists, if not, create it.
    // This should only happen for new rounds, not when editing.
    if (!roundIdToEdit) {
      try {
        // Map form's 'yards_or_meters' to 'distance' and filter for holes with data.
        const teeBoxHolesData = holes
          .filter((h) => h.par || h.distance)
          .map((h) => ({
            hole_number: h.hole_number,
            par: h.par,
            distance: h.distance,
            // We only need the properties relevant to course_tee_boxes
          }));

        await courseService.createTeeBoxData(
          finalCourseId,
          courseDetails.tee_box,
          teeBoxHolesData,
          user.email,
          courseDetails.yards_or_meters_unit
        );
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Error saving tee box data: ${error.message}`,
          severity: "error",
        });
        setLoading(false);
        return;
      }
    }

    const roundData = {
      user_email: user.email,
      course_id: finalCourseId,
      tee_box: courseDetails.tee_box,
      round_date: courseDetails.round_date,
      round_type: courseDetails.round_type,
      scoring_zone_level: courseDetails.scoring_zone_level,
      total_holes_played: totalScoringHoles,
      total_score: totalScore,
      total_putts: totalPutts,
      total_penalties: totalPenalties,
      is_eligible_round,
    };

    const holesData = holes
      .filter((hole) => hole.played && (hole.hole_score || hole.putts)) // Only save holes that have been played
      .map(({ id, round_id, created_at, ...hole }) => ({
        // Strip fields that shouldn't be inserted/updated
        ...hole,
      }));

    try {
      if (roundIdToEdit) {
        // Update existing round
        await roundService.updateRound(
          roundIdToEdit,
          roundData,
          holesData,
          user.email
        );
        // Use the callback for consistency
        if (onSuccess) onSuccess("Round updated successfully!");
      } else {
        // Create new round
        await roundService.createRound(roundData, holesData, user.email);
        if (onSuccess) onSuccess("Round added successfully!");
      }
      closeForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to save round: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderViewSwitcher = () => {
    if (isMobile) return null;

    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
        >
          <Tooltip title="Hole-by-Hole View">
            <ToggleButton value="hole-by-hole" aria-label="hole-by-hole view">
              <SportsGolfIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Scorecard View">
            <ToggleButton value="scorecard" aria-label="scorecard view">
              <ViewListIcon />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <PageHeader
        title={roundIdToEdit ? "Edit Round" : "Add a New Round"}
        subtitle="Log your round, including course details and hole-by-hole stats."
      />
      <Paper {...elevatedCardStyles}>
        <form onSubmit={handleSubmit}>
          <SectionHeader
            title="Course Details"
            subtitle="Enter your round's course information"
            step={1}
            totalSteps={2}
          />
          <CourseDetailsForm
            roundData={courseDetails}
            handleCourseChange={handleCourseChange}
            isEditMode={!!roundIdToEdit}
          />

          <Box sx={{ mt: 4 }}>
            <SectionHeader
              title="Round Details"
              subtitle="Log your round's hole by hole data"
              step={2}
              totalSteps={2}
            />
            {renderViewSwitcher()}
            {viewMode === "hole-by-hole" ? (
              <MobileHoleEntry
                holes={holes}
                currentHoleIndex={currentHoleIndex}
                setCurrentHoleIndex={setCurrentHoleIndex}
                handleHoleChange={handleHoleChange}
                isEditMode={!!roundIdToEdit}
                roundType={courseDetails.round_type}
                distanceUnit={courseDetails.yards_or_meters_unit}
                isMobile={isMobile}
              />
            ) : (
              <HoleDetailsForm
                holes={holes}
                handleHoleChange={handleHoleChange}
                roundType={courseDetails.round_type}
                isEditMode={!!roundIdToEdit}
              />
            )}
          </Box>
          {/* Real-time Scorecard */}
          <Box sx={{ mt: 4 }}>
            <SectionHeader title="Live Scorecard" />
            <ScorecardTable holes={holes} />
          </Box>
          <Box sx={{ mt: 4 }}>
            <SectionHeader
              title="Round Insights"
              subtitle="View the insights from your round"
            />
            <RoundInsights insightsData={insightsData} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={loading}
              sx={{ py: 1.5, px: 6, fontSize: "1.1rem" }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : roundIdToEdit ? (
                "Update Round"
              ) : (
                "Save Round"
              )}
            </Button>
            {roundIdToEdit && (
              <Button variant="outlined" onClick={closeForm}>Cancel</Button>
            )}
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoundForm;
