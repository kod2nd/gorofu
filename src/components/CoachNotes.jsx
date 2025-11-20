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
import FlippingGolfIcon from './FlippingGolfIcon';

const CoachNotes = ({ studentId }) => {
  console.log('CoachNotes studentId:', studentId)
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
      // Fetch only notes that are pinned to the dashboard
      const { notes: notesData } = await userService.getNotesForStudent({
        studentId,
        pinnedOnly: true,
      });

      console.log('Fetched notes:', notesData)
      setNotes(notesData);
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
        Pinned Notes
      </Typography>
      {notes.length === 0 ? (
        <Typography color="text.secondary">No notes have been pinned to your dashboard yet.</Typography>
      ) : (
        <List disablePadding>
          {notes.map((note, index) => (
            <React.Fragment key={note.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemText
                  primary={note.subject || 'No Subject'}
                  secondary={
                    <Typography
                      component="div"
                      variant="body2"
                      color="text.secondary"
                      dangerouslySetInnerHTML={{ __html: note.note }}
                      className="tiptap-display"
                    />
                  }
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