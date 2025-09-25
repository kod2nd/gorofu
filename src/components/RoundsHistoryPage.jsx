import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { roundService } from '../services/roundService';
import { elevatedCardStyles } from '../styles/commonStyles';

const RoundsHistoryPage = ({ user, onEditRound, onAddRound }) => {
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
      const roundsData = await roundService.getUserRounds(user.email);
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Tee Box</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Putts</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rounds.map((round) => (
                <TableRow key={round.id} hover>
                  <TableCell>{new Date(round.round_date).toLocaleDateString()}</TableCell>
                  <TableCell>{round.courses.name}</TableCell>
                  <TableCell>{round.tee_box}</TableCell>
                  <TableCell align="right">{round.total_score}</TableCell>
                  <TableCell align="right">{round.total_putts}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit Round">
                      <IconButton onClick={() => onEditRound(round.id)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Round">
                      <IconButton onClick={() => handleDeleteClick(round.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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