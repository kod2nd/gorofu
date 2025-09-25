import { useState, useMemo, useEffect } from 'react';
import { courseService } from './services/courseService';
import { roundService } from './services/roundService';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

// Import the child components
import CourseDetailsForm from './components/CourseDetailsForm';
import HoleDetailsForm from './components/HoleDetailsForm';
import RoundInsights from './components/RoundInsights';
import SectionHeader from './components/SectionHeader';
import { elevatedCardStyles } from './styles/commonStyles';

const initialHoleState = {
  par: '',
  yards_or_meters: '',
  within3shots: false,
  putts: '',
  putts_within4ft: '',
  penalty_shots: '',
  hole_score: '',
  bad_habits: '',
  hole_outside_scoring_zone: false,
  scoring_zone_in_regulation: false,
  holeout_from_outside_4ft: false,
  holeout_within_3_shots_scoring_zone: false,
};

const RoundForm = ({ user, closeForm, roundIdToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [courseDetails, setCourseDetails] = useState({
    course_id: null,
    course_name: '', // For display in the form
    tee_box: '',
    yards_or_meters_unit: 'yards',
    scoring_zone_level: '100m - Novice',
    round_date: new Date().toISOString().split('T')[0],
    round_type: '18_holes',
  });
  const [holes, setHoles] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      ...initialHoleState,
      hole_number: i + 1,
    }))
  );

  useEffect(() => {
    if (roundIdToEdit) {
      const fetchRoundData = async () => {
        setLoading(true);
        try {
          const roundData = await roundService.getRoundById(roundIdToEdit);
          setCourseDetails({
            course_id: roundData.course_id,
            course_name: roundData.courses.name,
            tee_box: roundData.tee_box,
            yards_or_meters_unit: roundData.round_holes[0]?.yards_or_meters_unit || 'yards',
            scoring_zone_level: roundData.scoring_zone_level,
            round_date: roundData.round_date,
            round_type: roundData.round_type,
          });

          // Create a full 18-hole array and fill it with data
          const newHoles = Array.from({ length: 18 }, (_, i) => {
            const existingHole = roundData.round_holes.find(h => h.hole_number === i + 1);
            return existingHole ? { ...existingHole } : { ...initialHoleState, hole_number: i + 1 };
          });
          setHoles(newHoles);

        } catch (error) {
          setSnackbar({ open: true, message: `Failed to load round data: ${error.message}`, severity: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchRoundData();
    }
  }, [roundIdToEdit]);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleHoleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedHoles = [...holes];
    updatedHoles[index] = {
      ...updatedHoles[index],
      [name]: type === 'checkbox' ? checked : value,
    };
    setHoles(updatedHoles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Find or create course_id
    let finalCourseId = courseDetails.course_id;
    if (!finalCourseId) {
      try {
        // This is a simplified search; a real app might need a more robust lookup/creation flow
        const courses = await courseService.searchCourses(courseDetails.course_name);
        if (courses.length > 0) {
          finalCourseId = courses[0].id;
        } else {
          // If course doesn't exist, create it
          const newCourse = await courseService.createCourse({ name: courseDetails.course_name }, user.email);
          finalCourseId = newCourse.id;
        }
      } catch (error) {
        setSnackbar({ open: true, message: `Error finding or creating course: ${error.message}`, severity: 'error' });
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
      total_holes_played: totalHolesPlayed,
      total_score: totalScore,
      total_putts: totalPutts,
      total_penalties: totalPenalties,
    };

    const holesData = holes
      .filter(hole => hole.hole_score || hole.putts) // Only save holes that have been played
      .map(({ id, round_id, created_at, ...hole }) => ({ // Strip fields that shouldn't be inserted/updated
        ...hole,
        bad_habits: typeof hole.bad_habits === 'string'
          ? hole.bad_habits.split(',').map(s => s.trim()).filter(Boolean)
          : hole.bad_habits || [],
      }));

    try {
      if (roundIdToEdit) {
        // Update existing round
        await roundService.updateRound(roundIdToEdit, roundData, holesData);
        setSnackbar({ open: true, message: 'Round updated successfully!', severity: 'success' });
      } else {
        // Create new round
        await roundService.createRound(roundData, holesData);
        setSnackbar({ open: true, message: 'Round added successfully!', severity: 'success' });
      }
      closeForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to save round: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate insights in the parent component
  const totalPutts = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.putts) || 0), 0), [holes]);
  const totalScore = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.hole_score) || 0), 0), [holes]);
  const totalPenalties = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.penalty_shots) || 0), 0), [holes]);
  const totalSZIR = useMemo(() => holes.filter(hole => hole.scoring_zone_in_regulation).length, [holes]);
  const totalHoleoutFromOutside4ft = useMemo(() => holes.filter(hole => hole.holeout_from_outside_4ft).length, [holes]);
  const totalPuttsWithin4ft = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.putts_within4ft) || 0), 0), [holes]);
  const totalHoleoutWithin3Shots = useMemo(() => holes.filter(hole => hole.holeout_within_3_shots_scoring_zone).length, [holes]);
  const totalHolesPlayed = useMemo(() => holes.filter(
    (hole) => hole.hole_score && hole.putts
  ).length, [holes]);
  const holesWithMoreThanOnePuttWithin4ft = useMemo(() => holes.filter(hole => Number(hole.putts_within4ft) > 1).length, [holes]);

  const insightsData = {
    totalScore,
    totalPenalties,
    totalHolesPlayed,
    totalSZIR,
    totalPutts,
    totalPuttsWithin4ft,
    holesWithMoreThanOnePuttWithin4ft,
    totalHoleoutFromOutside4ft,
    totalHoleoutWithin3Shots,
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper {...elevatedCardStyles}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          {roundIdToEdit ? 'Edit Round' : 'Add a New Round'}
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Log your round, including course details and hole-by-hole stats.
        </Typography>
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
          
          <SectionHeader 
            title="Round Details" 
            subtitle="Log your round's hole by hole data"
            step={2}
            totalSteps={2}
          />
          <HoleDetailsForm 
            holes={holes} 
            handleHoleChange={handleHoleChange} 
            roundType={courseDetails.round_type}
          />
          
          <SectionHeader 
            title="Round Insights" 
            subtitle="View the insights from your round"
          />
          <RoundInsights insightsData={insightsData} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={loading}
              sx={{ py: 1.5, px: 6, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (roundIdToEdit ? 'Update Round' : 'Save Round')}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RoundForm;
