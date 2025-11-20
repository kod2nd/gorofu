import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Alert,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { elevatedCardStyles } from '../styles/commonStyles';
import { userService } from '../services/userService';
import FlippingGolfIcon from './FlippingGolfIcon';
import NoteThreadRow from './studentInteraction/NoteThreadRow';
import NoteThreadDetailView from './studentInteraction/NoteThreadDetailView';

const CoachNotes = ({ studentId, userProfile }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingThread, setViewingThread] = useState(null);

  useEffect(() => {
    if (studentId) {
      loadNotes();
    }
    // Reset view when student changes
    setViewingThread(null);
  }, [studentId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      // Fetch only notes that are pinned to the dashboard
      const { notes: notesData } = await userService.getNotesForStudent({
        studentId,
        pinnedOnly: true,
      });

      // We need to get the full thread for each pinned note
      const fullNoteThreads = await Promise.all(
        notesData.map(note => userService.getNoteThread(note.id))
      );

      setNotes(fullNoteThreads);
    } catch (err) {
      setError('Failed to load coach notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      await userService.updateNoteForStudent(note.id, { is_favorited: !note.is_favorited });
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === note.id ? { ...n, is_favorited: !n.is_favorited } : n
        )
      );
      if (viewingThread && viewingThread.id === note.id) {
        setViewingThread(prev => ({ ...prev, is_favorited: !prev.is_favorited }));
      }
    } catch (err) {
      setError('Failed to update favorite status: ' + err.message);
    }
  };

  const handleNoteClick = (note) => {
    setViewingThread(note);
  };

  const handleCloseDialog = () => {
    setViewingThread(null);
  };

  if (loading) return <FlippingGolfIcon size={24} />;
  if (error) return <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
        Pinned Notes
      </Typography>
      {notes.length === 0 ? (
        <Typography color="text.secondary">No notes have been pinned to your dashboard yet.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {notes.map((note) => (
            <NoteThreadRow
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note)}
              onFavorite={handleToggleFavorite}
              onPin={() => {}} // Students can't pin from dashboard, so pass a no-op
              isViewingSelfAsCoach={false} // Student is never viewing self as coach on their dashboard
              userProfile={userProfile}
            />
          ))}
        </Stack>
      )}

      <Dialog open={!!viewingThread} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogContent sx={{ position: 'relative', p: { xs: 2, sm: 4 } }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {viewingThread && (
            <NoteThreadDetailView
              note={viewingThread}
              onBack={handleCloseDialog}
              userProfile={userProfile}
              onFavorite={handleToggleFavorite}
              isViewingSelfAsCoach={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CoachNotes;