import React from 'react';
import { Paper, Box, Typography, Tooltip, IconButton, Chip } from '@mui/material';
import { Star, StarBorder, AddComment, PushPin, PushPinOutlined } from '@mui/icons-material';
import { toProperCase, stripHtmlAndTruncate } from './utils';

const NoteThreadRow = ({ note, onClick, onFavorite, onPin, isViewingSelfAsCoach, userProfile }) => {
  
  const canFavorite = !isViewingSelfAsCoach;
  // A user can pin if they are a coach, AND they are not viewing their own notes,
  // AND they are not a student viewing their own dashboard (where isViewingSelfAsCoach is false).
  const canPin = userProfile.roles.includes('coach') && !isViewingSelfAsCoach;
  const isPersonalNote = note.author_id === note.student_id;

  return (
    <Paper
      onClick={() => onClick(note.id)}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
          cursor: 'pointer',
        },
      }}
    >
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {canPin && (
            <Tooltip title={note.is_pinned_to_dashboard ? "Remove from Dashboard" : "Add to Dashboard"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(note);
                }}
              >
                {note.is_pinned_to_dashboard ? <PushPin sx={{ color: 'primary.main' }} /> : <PushPinOutlined />}
              </IconButton>
            </Tooltip>
          )}
          {canFavorite && (
            <Tooltip title={note.is_favorited ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click from firing
                  onFavorite(note);
                }}
              >
                {note.is_favorited ? <Star sx={{ color: 'warning.main' }} /> : <StarBorder />}
              </IconButton>
            </Tooltip>
          )}
          {!canFavorite && !canPin && <AddComment color="action" sx={{ opacity: 0.6, ml: 1 }} />}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body1" fontWeight={600}>
              {note.subject || 'No Subject'}
            </Typography>
            <Chip label={isPersonalNote ? "Personal Note" : "Lesson Note"} size="small" variant="outlined" color={isPersonalNote ? "secondary" : "primary"} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Started by {toProperCase(note.author?.full_name)} on {new Date(note.lesson_date).toLocaleDateString('en-UK', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {note.replies?.length || 0} {note.replies?.length === 1 ? 'Reply' : 'Replies'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
            {stripHtmlAndTruncate(note.note, 50)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default NoteThreadRow;