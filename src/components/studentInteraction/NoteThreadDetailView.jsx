import React from 'react';
import {
  Box, Button, Card, CardContent, CardActions, Typography,
  Divider, Tooltip, IconButton, Stack
} from '@mui/material';
import {
  ArrowBack, Edit as EditIcon, Delete as DeleteIcon,
  Star, StarBorder, Reply as ReplyIcon, PushPin, PushPinOutlined
} from '@mui/icons-material';
import NoteReply from './NoteReply';
import { toProperCase } from './utils';

const NoteThreadDetailView = ({ note, onBack, userProfile, ...handlers }) => {
  if (!note) return null;

  const canEdit = note.author_id === userProfile.user_id;
  const canDelete = note.author_id === userProfile.user_id || userProfile.roles.includes('coach');
  const canFavorite = !handlers.isViewingSelfAsCoach;
  const canPin = userProfile.roles.includes('coach') && !handlers.isViewingSelfAsCoach;

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to All Notes
      </Button>

      {/* Main Note Post */}
      <Card variant="outlined" sx={{ borderRadius: 3, borderWidth: 2, borderColor: 'primary.main' }}>
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5 }}>
            {canPin && (
              <Tooltip title={note.is_pinned_to_dashboard ? "Remove from Dashboard" : "Add to Dashboard"}>
                <IconButton
                  size="small"
                  onClick={() => handlers.onPin(note)}>
                  {note.is_pinned_to_dashboard ? <PushPin sx={{ color: 'primary.main' }} /> : <PushPinOutlined />}
                </IconButton>
              </Tooltip>
            )}
            {canFavorite && (
              <Tooltip title={note.is_favorited ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                  size="small"
                  onClick={() => handlers.onFavorite(note)}>
                  {note.is_favorited ? <Star sx={{ color: 'warning.main' }} /> : <StarBorder />}
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Edit note">
                <IconButton size="small" onClick={() => handlers.onEdit(note)}><EditIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete note">
                <IconButton size="small" onClick={() => handlers.onDelete(note)}><DeleteIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ pr: 6 }}> {/* Add padding to the right to avoid overlap with buttons */}
            <Typography variant="h4" fontWeight={700} gutterBottom>{note.subject}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              By {toProperCase(note.author?.full_name)} on {new Date(note.lesson_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box component="div" dangerouslySetInnerHTML={{ __html: note.note }} className="tiptap-display" />
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
          {!handlers.isViewingSelfAsCoach && (
            <Button size="small" startIcon={<ReplyIcon />} onClick={() => { /* Logic to show reply form */ }}>
              Reply
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Replies */}
      <Box sx={{ mt: 4, pl: 4, borderLeft: '2px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          {note.replies.length} {note.replies.length === 1 ? 'Reply' : 'Replies'}
        </Typography>
        <Stack spacing={3}>
          {note.replies.map(reply => (
            <NoteReply
              key={reply.id}
              note={reply}
              userProfile={userProfile}
              onEdit={handlers.onEdit}
              onDelete={handlers.onDelete}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default NoteThreadDetailView;