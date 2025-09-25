import { useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
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

const RoundForm = ({ user, closeForm }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [courseDetails, setCourseDetails] = useState({
    course_name: '',
    tee_box: '',
    yards_or_meters_unit: 'meters',
    scoring_zone_level: '100m - Novice',
    round_date: new Date().toISOString().split('T')[0],
  });
  const [holes, setHoles] = useState(
    Array.from({ length: 18 }, (_, i) => ({
      ...initialHoleState,
      hole_number: i + 1,
    }))
  );

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

    try {
      const dataToInsert = holes.map((hole) => ({
        ...courseDetails,
        ...hole,
        user_email: user.email,
        yards_or_meters_unit: courseDetails.yards_or_meters_unit,
        scoring_zone_level: courseDetails.scoring_zone_level,
        bad_habits: hole.bad_habits.split(',').map((s) => s.trim()).filter(Boolean),
      }));

      const { error } = await supabase.from('Rounds').insert(dataToInsert);

      if (error) {
        throw error;
      }

      setSnackbar({ open: true, message: 'Round data added successfully!', severity: 'success' });
      closeForm();
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to save round: ${error.message}`, severity: 'error' });
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
          Add a New Round
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
          <CourseDetailsForm roundData={courseDetails} handleCourseChange={handleCourseChange} />
          
          <SectionHeader 
            title="Round Details" 
            subtitle="Log your round's hole by hole data"
            step={2}
            totalSteps={2}
          />
          <HoleDetailsForm holes={holes} handleHoleChange={handleHoleChange} />
          
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Round'}
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
