import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles } from '../styles/commonStyles';
import RoundsTable from './RoundsTable';

const RoundsHistoryPage = ({ user, onViewRound, onAddRound }) => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, roundId: null });

  useEffect(() => {
    if (user) {
      loadRounds();
    }
  }, [user]);

  const loadRounds = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch all rounds for the history page
      const roundsData = await roundService.getUserRounds(user.email, 999);
      setRounds(roundsData);
    } catch (err) {
      setError('Failed to load rounds history. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (roundId) => {
    setConfirmDelete({ open: true, roundId });
  };

  const handleConfirmDelete = async () => {
    const { roundId } = confirmDelete;
    if (!roundId) return;

    try {
      await roundService.deleteRound(roundId, user.email);
      setRounds(rounds.filter((round) => round.id !== roundId));
    } catch (err) {
      setError('Failed to delete round. ' + err.message);
    } finally {
      setConfirmDelete({ open: false, roundId: null });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper {...elevatedCardStyles}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Rounds History
        </Typography>
        <Button variant="contained" onClick={onAddRound}>
          Add New Round
        </Button>
      </Box>

      {rounds.length === 0 ? (
        <Typography>You haven't recorded any rounds yet.</Typography>
      ) : (
        <RoundsTable rounds={rounds} onViewRound={onViewRound} onDelete={handleDeleteClick} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, roundId: null })}>
        <DialogTitle>Delete Round?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this round? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, roundId: null })}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RoundsHistoryPage;