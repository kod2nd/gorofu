import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { roundService } from '../services/roundService';
import { courseService } from '../services/courseService';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';
import RoundInsights from './RoundInsights';

const StatItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1" fontWeight="bold">{value}</Typography>
  </Box>
);

const RoundDetailsPage = ({ roundId, user, onEdit, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [round, setRound] = useState(null);

  useEffect(() => {
    if (roundId && user) {
      const fetchRound = async () => {
        try {
          setLoading(true);
          setError('');
          const roundData = await roundService.getRoundWithHoles(roundId, user.email);
          setRound(roundData);
        } catch (err) {
          setError('Failed to load round details: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRound();
    }
  }, [roundId, user]);

  const insightsData = useMemo(() => {
    if (!round) return {};
    // A "Scoring Hole" has a score and either putts or a holeout from distance.
    const scoringHoles = round.holes.filter(h => h.hole_score && (h.putts !== null || h.holeout_from_outside_4ft));

    return {
      totalScore: round.total_score,
      totalPenalties: round.total_penalties,
      totalHolesPlayed: scoringHoles.length,
      totalSZIR: round.holes.filter(h => h.scoring_zone_in_regulation).length,
      totalPutts: round.total_putts,
      totalPuttsWithin4ft: round.holes.reduce((sum, h) => sum + (h.putts_within4ft || 0), 0),
      holesWithMoreThanOnePuttWithin4ft: round.holes.filter(h => h.putts_within4ft > 1).length,
      totalHoleoutFromOutside4ft: round.holes.filter(h => h.holeout_from_outside_4ft).length,
      totalHoleoutWithin3Shots: round.holes.filter(h => h.holeout_within_3_shots_scoring_zone).length,
    };
  }, [round]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!round) return <Typography>No round data found.</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper {...elevatedCardStyles}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                {round.courses.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {new Date(round.round_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
                Back to History
              </Button>
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEdit(round.id)}>
                Edit Round
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><StatItem label="Tee Box" value={round.tee_box} /></Grid>
            <Grid item xs={6} sm={3}><StatItem label="Total Score" value={round.total_score} /></Grid>
            <Grid item xs={6} sm={3}><StatItem label="Total Putts" value={round.total_putts} /></Grid>
            <Grid item xs={6} sm={3}><StatItem label="Holes Played" value={round.total_holes_played} /></Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <RoundInsights insightsData={insightsData} />
      </Grid>

      <Grid item xs={12}>
        <Paper {...elevatedCardStyles}>
          <Typography {...sectionHeaderStyles}>Scorecard</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Hole</TableCell>
                  {Array.from({ length: 18 }, (_, i) => <TableCell key={i} align="center">{i + 1}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Par</TableCell>
                  {Array.from({ length: 18 }, (_, i) => {
                    const hole = round.holes.find(h => h.hole_number === i + 1);
                    return <TableCell key={i} align="center">{hole?.par ?? '-'}</TableCell>;
                  })}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                  {Array.from({ length: 18 }, (_, i) => {
                    const hole = round.holes.find(h => h.hole_number === i + 1);
                    return <TableCell key={i} align="center">{hole?.hole_score ?? '-'}</TableCell>;
                  })}
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Putts</TableCell>
                  {Array.from({ length: 18 }, (_, i) => {
                    const hole = round.holes.find(h => h.hole_number === i + 1);
                    return <TableCell key={i} align="center">{hole?.putts ?? '-'}</TableCell>;
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RoundDetailsPage;