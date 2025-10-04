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
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ArrowBack as ArrowBackIcon,
  GolfCourse as GolfCourseIcon,
  Score as ScoreIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles, sectionHeaderStyles } from '../styles/commonStyles';
import RoundInsights from './RoundInsights';

const StatItem = ({ label, value, size = 'medium' }) => (
  <Box sx={{ textAlign: 'center', p: 1 }}>
    <Typography variant={size === 'small' ? 'caption' : 'body2'} color="text.secondary">
      {label}
    </Typography>
    <Typography 
      variant={size === 'small' ? 'h6' : 'h5'} 
      fontWeight="bold" 
      color="primary.main"
    >
      {value}
    </Typography>
  </Box>
);

const HoleCard = ({ hole, holeNumber }) => {
  if (!hole.played) {
    return (
      <Card sx={{ opacity: 0.5, height: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" color="text.secondary">
            Hole {holeNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Not Played
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Hole {holeNumber}
          </Typography>
          <Chip 
            label={`Par ${hole.par}`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>

        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Score</Typography>
            <Typography variant="h6" fontWeight="bold" color={
              hole.hole_score < hole.par ? 'success.main' : 
              hole.hole_score > hole.par ? 'error.main' : 'text.primary'
            }>
              {hole.hole_score}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Putts</Typography>
            <Typography variant="h6" fontWeight="bold">
              {hole.putts}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {hole.scoring_zone_in_regulation && (
            <Chip label="SZIR" size="small" color="success" variant="outlined" />
          )}
          {hole.holeout_within_3_shots_scoring_zone && (
            <Chip label="SZ Par" size="small" color="primary" variant="outlined" />
          )}
          {hole.holeout_from_outside_4ft && (
            <Chip label="Lucky" size="small" color="warning" variant="outlined" />
          )}
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Putts &lt;4ft
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {hole.putts_within4ft || '0'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Penalties
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="medium"
              color={hole.penalty_shots > 0 ? 'error.main' : 'text.primary'}
            >
              {hole.penalty_shots || '0'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const RoundDetailsPage = ({ roundId, user, onEdit, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [round, setRound] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!round) return <Typography>No round data found.</Typography>;

  const playedHoles = round.holes.filter(hole => hole.played);
  const frontNine = round.holes.slice(0, 9);
  const backNine = round.holes.slice(9, 18);

  return (
    <Box sx={{ pb: 2 }}>
      {/* Header Section */}
      <Paper {...elevatedCardStyles} sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={onBack}
            size={isMobile ? "small" : "medium"}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => onEdit(round.id)}
            size={isMobile ? "small" : "medium"}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            {round.courses.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {new Date(round.round_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quick Stats */}
        <Grid container spacing={1} sx={{ textAlign: 'center' }}>
          <Grid item xs={4} sm={2}>
            <StatItem 
              label="Score" 
              value={round.total_score} 
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid item xs={4} sm={2}>
            <StatItem 
              label="Putts" 
              value={round.total_putts} 
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid item xs={4} sm={2}>
            <StatItem 
              label="Holes" 
              value={round.total_holes_played} 
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatItem 
              label="Tee Box" 
              value={round.tee_box} 
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatItem 
              label="Eligible" 
              value={round.is_eligible_round ? '✓' : '✗'} 
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for Mobile Navigation */}
      {isMobile && (
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab icon={<TrendingUpIcon />} label="Insights" />
            <Tab icon={<GolfCourseIcon />} label="Scorecard" />
            <Tab icon={<ScoreIcon />} label="Details" />
          </Tabs>
        </Paper>
      )}

      {/* Content based on active tab (mobile) or all content (desktop) */}
      <Box sx={{ display: isMobile ? 'block' : 'grid', gap: 2 }}>
        {/* Insights - Always show on desktop, conditional on mobile */}
        {(isMobile ? activeTab === 0 : true) && (
          <Paper {...elevatedCardStyles}>
            <Typography {...sectionHeaderStyles}>Round Insights</Typography>
            <RoundInsights insightsData={insightsData} />
          </Paper>
        )}

        {/* Scorecard - Always show on desktop, conditional on mobile */}
        {(isMobile ? activeTab === 1 : true) && (
          <Paper {...elevatedCardStyles}>
            <Typography {...sectionHeaderStyles}>Scorecard</Typography>
            
            {isMobile ? (
              // Mobile: Card-based layout
              <Box>
                {/* Front 9 */}
                <Typography variant="h6" sx={{ mb: 2, mt: 1, color: 'primary.main' }}>
                  Front 9
                </Typography>
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {frontNine.map((hole, index) => (
                    <Grid item xs={6} key={hole.hole_number}>
                      <HoleCard hole={hole} holeNumber={index + 1} />
                    </Grid>
                  ))}
                </Grid>

                {/* Back 9 */}
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Back 9
                </Typography>
                <Grid container spacing={1}>
                  {backNine.map((hole, index) => (
                    <Grid item xs={6} key={hole.hole_number}>
                      <HoleCard hole={hole} holeNumber={index + 10} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              // Desktop: Grid layout
              <Grid container spacing={1}>
                {round.holes.map((hole) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={hole.hole_number}>
                    <HoleCard hole={hole} holeNumber={hole.hole_number} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        )}

        {/* Round Details - Always show on desktop, conditional on mobile */}
        {(isMobile ? activeTab === 2 : true) && (
          <Paper {...elevatedCardStyles}>
            <Typography {...sectionHeaderStyles}>Round Details</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Scoring Zone Level</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {round.scoring_zone_level}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Round Type</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {round.round_type?.replace('_', ' ').toUpperCase() || '18 Holes'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Total Penalties</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {round.total_penalties}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Played Holes</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {playedHoles.length} / 18
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RoundDetailsPage;