import React from 'react';
import { Paper, Box, Typography, Tooltip, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toProperCase } from './utils';

const NoteReply = ({ note, userProfile, onEdit, onDelete }) => {
  const canEdit = note.author_id === userProfile.user_id;
  const canDelete = note.author_id === userProfile.user_id || userProfile.roles.includes('coach');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        backgroundColor: '#f8f9fa',
        borderRadius: 2.5,
        borderWidth: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {toProperCase(note.author?.full_name)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(note.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </Typography>
          {canEdit && (
            <Tooltip title="Edit reply">
              <IconButton size="small" onClick={() => onEdit(note)}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete reply">
              <IconButton size="small" onClick={() => onDelete(note)}><DeleteIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Box component="div" dangerouslySetInnerHTML={{ __html: note.note }} className="tiptap-display" sx={{ fontSize: '0.95rem' }} />
    </Paper>
  );
};

export default NoteReply;