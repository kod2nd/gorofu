// src/RoundForm.jsx
import { useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Button, Grid, Paper, Typography } from '@mui/material';

// Import the new child components
import CourseDetailsForm from './components/CourseDetailsForm';
import HoleDetailsForm from './components/HoleDetailsForm';
import RoundInsights from './components/RoundInsights';

const initialHoleState = {
  par: '',
  yards_or_meters: '',
  within3shots: false,
  putts: '',
  putts_within4ft: '',
  penalties: '',
  hole_score: '',
  bad_habits: '',
  hole_outside_scoring_zone: false,
  scoring_zone_in_regulation: false,
  holeout_from_outside_4ft: false,
};

const RoundForm = ({ user, closeForm }) => {
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState({
    course_name: '',
    tee_box: '',
    yards_or_meters_unit: 'yards',
    scoring_zone_level: '',
    date: new Date().toISOString().split('T')[0],
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

      alert('Round data added successfully!');
      closeForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate insights in the parent component
  const totalPutts = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.putts) || 0), 0), [holes]);
  const totalScore = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.hole_score) || 0), 0), [holes]);
  const totalPenalties = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.penalties) || 0), 0), [holes]);
  const totalSZIR = useMemo(() => holes.filter(hole => hole.scoring_zone_in_regulation).length, [holes]);
  const totalHoleoutFromOutside4ft = useMemo(() => holes.filter(hole => hole.holeout_from_outside_4ft).length, [holes]);
  const totalPuttsWithin4ft = useMemo(() => holes.reduce((sum, hole) => sum + (Number(hole.putts_within4ft) || 0), 0), [holes]);
  const totalHolesPlayed = useMemo(() => holes.filter(
    (hole) => hole.hole_score && hole.putts && hole.scoring_zone_in_regulation
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
  };

  return (
    <div style={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Add a New Round
      </Typography>
      <form onSubmit={handleSubmit}>
        <CourseDetailsForm courseDetails={courseDetails} handleCourseChange={handleCourseChange} />
        <HoleDetailsForm holes={holes} handleHoleChange={handleHoleChange} />
        <RoundInsights insightsData={insightsData} />
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Button variant="outlined" onClick={closeForm}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button type="submit" variant="contained" color="success" disabled={loading}>
              {loading ? 'Saving Round...' : 'Save Round'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default RoundForm;