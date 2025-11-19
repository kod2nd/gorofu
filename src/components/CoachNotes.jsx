import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { elevatedCardStyles } from '../styles/commonStyles';
import { userService } from '../services/userService';

const CoachNotes = ({ studentId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      loadNotes();
    }
  }, [studentId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = await userService.getNotesForStudent(studentId);
      // Show the 3 most recent notes
      setNotes(notesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3));
    } catch (err) {
      setError('Failed to load coach notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FlippingGolfIcon size={24} />;
  if (error) return <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
        Coach's Notes
      </Typography>
      {notes.length === 0 ? (
        <Typography color="text.secondary">No recent notes from your coach.</Typography>
      ) : (
        <List disablePadding>
          {notes.map((note, index) => (
            <React.Fragment key={note.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                      {note.note}
                    </Typography>
                  }
                  secondary={`- ${new Date(note.lesson_date).toLocaleDateString()}`}
                />
              </ListItem>
              {index < notes.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default CoachNotes;