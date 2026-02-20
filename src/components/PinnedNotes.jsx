import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Alert,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { elevatedCardStyles } from '../styles/commonStyles';
import { userService } from '../services/userService';
import FlippingGolfIcon from './FlippingGolfIcon';
import NoteThreadRow from './studentInteraction/NoteThreadRow';
import NoteThreadDetailView from './studentInteraction/NoteThreadDetailView';
const PinnedNotes = ({ studentId, userProfile, onReply, refreshKey, onNoteUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingThread, setViewingThread] = useState(null);

  useEffect(() => {
    if (studentId) { // The refreshKey prop will trigger this effect when a note is pinned/unpinned
      loadNotes();
    }
    // Reset view when student changes
    setViewingThread(null);
  }, [studentId, refreshKey]);

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

  const handleTogglePin = async (note) => {
    try {
      await userService.updateNoteForStudent(note.id, { is_pinned_to_dashboard: !note.is_pinned_to_dashboard });
      // Unpinning should remove the note from this component's view.
      setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
      // Notify the parent (App.jsx) that notes have been updated.
      if (onNoteUpdate) {
        onNoteUpdate();
      }
    } catch (err) {
      setError('Failed to update pin status: ' + err.message);
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
    <Paper {...elevatedCardStyles}>
      <Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.75,
            color: "text.secondary",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Pinned Notes
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        {notes.length === 0 ? (
          <Typography color="text.secondary">No notes have been pinned to the dashboard yet.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {notes.map((note) => (
              <NoteThreadRow
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note)}
                onFavorite={handleToggleFavorite}
                onPin={handleTogglePin}
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
                onReply={onReply}
                isViewingSelfAsCoach={false}
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Paper>
  );
};

export default PinnedNotes;