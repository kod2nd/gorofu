import React, { useState } from 'react';
import { 
  Paper, Box, Typography, Tooltip, IconButton, Chip,
  Avatar, Stack, useTheme, useMediaQuery, alpha
} from '@mui/material';
import { 
  Star, StarBorder, PushPin, PushPinOutlined, 
  ChatBubbleOutline, KeyboardArrowRight,
  PersonOutline, School
} from '@mui/icons-material';
import { toProperCase, stripHtmlAndTruncate } from './utils';

const NoteThreadRow = ({ note, onClick, onFavorite, onPin, isViewingSelfAsCoach, userProfile }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);
  
  const canFavorite = !isViewingSelfAsCoach;
  const canPin = userProfile.roles.includes('coach') && !isViewingSelfAsCoach;
  const isPersonalNote = note.author_id === note.student_id;

  return (
    <Paper
      onClick={() => onClick(note.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      elevation={isHovered ? 4 : 1}
      sx={{
        display: 'flex',
        alignItems: 'flex-start', // Align items to the top
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: isHovered ? 'primary.light' : 'divider',
        backgroundColor: isHovered ? alpha(theme.palette.primary.light, 0.03) : 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: isPersonalNote ? 'secondary.main' : 'primary.main',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.7)',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1.5, sm: 2 }, 
        flex: 1,
        minWidth: 0 
      }}>
        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={700}
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' },
              color: 'text.primary',
              mb: 1,
              lineHeight: 1.3,
              wordBreak: 'break-word', // Allow long subjects to wrap
            }}
          >
            {note.subject || 'No Subject'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip 
              icon={isPersonalNote ? <PersonOutline /> : <School />}
              label={isPersonalNote ? "Personal" : "Lesson"} 
              size="small"
              variant="filled"
              color={isPersonalNote ? "secondary" : "primary"}
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                '& .MuiChip-icon': { fontSize: '0.875rem' }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', flexShrink: 0 }}>
              {toProperCase(note.author?.full_name)}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'divider', display: { xs: 'none', sm: 'block' } }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: { xs: 'none', sm: 'block' } }}>
              {new Date(note.lesson_date).toLocaleDateString('en-UK', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'divider' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <ChatBubbleOutline sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {note.replies?.length || 0}
              </Typography>
            </Box>
          </Stack>

          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.813rem', sm: '0.875rem' },
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word', // Ensure long words wrap
            }}
          >
            {stripHtmlAndTruncate(note.note, 80)}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0, sm: 0.5 },
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.2s ease',
        }}>
          {/* Pin and Favorite buttons are removed as per user feedback in another thread, keeping it clean */}
          {canPin && (
            <Tooltip title={note.is_pinned_to_dashboard ? "Unpin from dashboard" : "Pin to dashboard"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(note);
                }}
                sx={{
                  color: note.is_pinned_to_dashboard ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main'
                  }
                }}
              >
                <PushPin sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }} />
              </IconButton>
            </Tooltip>
          )}
          
          {canFavorite && (
            <Tooltip title={note.is_favorited ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(note);
                }}
                sx={{
                  color: note.is_favorited ? 'warning.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    color: 'warning.main'
                  }
                }}
              >
                <Star sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }} />
              </IconButton>
            </Tooltip>
          )}
          
          <KeyboardArrowRight 
            sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              color: 'text.secondary',
              ml: { xs: 0, sm: 0.5 },
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'translateX(4px)' : 'none'
            }} 
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default NoteThreadRow;