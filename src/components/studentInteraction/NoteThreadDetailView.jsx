import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Chip,
  Divider, Tooltip, IconButton, Stack, alpha,
  useTheme, useMediaQuery, Container
} from '@mui/material';
import {
  ArrowBack, Edit as EditIcon, Delete as DeleteIcon,
  Reply as ReplyIcon, Bookmark, BookmarkBorder,
  Favorite, FavoriteBorder, MoreHoriz,
  CheckCircle, CheckCircleOutline
} from '@mui/icons-material';
import NoteReply from './NoteReply';
import { toProperCase } from './utils';

const NoteThreadDetailView = ({ note, onBack, userProfile, ...handlers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showMobileActions, setShowMobileActions] = useState(false);

  const canEdit = note.author_id === userProfile.user_id;
  const canDelete = note.author_id === userProfile.user_id || userProfile.roles.includes('coach');
  const canFavorite = !handlers.isViewingSelfAsCoach;
  const canPin = userProfile.roles.includes('coach') && !handlers.isViewingSelfAsCoach;
  const isPersonalNote = note.author_id === note.student_id;
  
  if (!note) return null;

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
      {/* Back Navigation - Subtle */}
      <Button
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{
          mb: 3,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: { xs: '0.875rem', sm: '0.95rem' },
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04)
          },
          borderRadius: 1,
          px: 1.5,
          py: 0.5
        }}
      >
        Back to all notes
      </Button>

      {/* Main Content Layout - StackOverflow Style */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 3 
      }}>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header Card - StackOverflow Question Style */}
          <Card 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              mb: 3,
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                              <Chip
                  label={isPersonalNote ? "Personal" : "Lesson"}
                  size="small"
                  color={isPersonalNote ? "secondary" : "primary"}
                  sx={{ 
                    height: 22, 
                    fontSize: '0.7rem',
                    fontWeight: 600 
                  }}
                />
                
                </Box>
              {/* Question Title/Subject */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.75rem' },
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'text.primary',
                  mb: 2,
                  wordBreak: 'break-word'
                }}
              >
                {note.subject}
              </Typography>
                {/* Author Card */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1.5,
                  borderRadius: 1,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    {note.author?.full_name?.charAt(0) || 'U'}
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {toProperCase(note.author?.full_name)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.author?.email}
                    </Typography>
                  </Box>
                </Box>
              {/* Meta Information Row */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Created {new Date(note.created_at).toLocaleDateString('en-UK', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Modified {new Date(note.updated_at || note.created_at).toLocaleDateString('en-UK', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric' 
                    })}
                  </Typography>

                </Box>
                

              </Box>

              {/* Author Info - StackOverflow Style */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                {/* Actions */}
                 <Stack 
              direction="row" 
              spacing={0.5}
              sx={{ mt: 2, mb: 3 }}
            >
              {canPin && (
                <Tooltip title={note.is_pinned_to_dashboard ? "Unpin from dashboard" : "Pin to dashboard"}>
                  <IconButton
                    onClick={() => handlers.onPin(note)}
                    sx={{
                      color: note.is_pinned_to_dashboard ? 'primary.main' : 'text.secondary',
                      backgroundColor: note.is_pinned_to_dashboard ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        color: 'primary.main'
                      }
                    }}
                  >
                    {note.is_pinned_to_dashboard ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </Tooltip>
              )}

              {canFavorite && (
                <Tooltip title={note.is_favorited ? "Remove from favorites" : "Add to favorites"}>
                  <IconButton
                    onClick={() => handlers.onFavorite(note)}
                    sx={{
                      color: note.is_favorited ? 'warning.main' : 'text.secondary',
                      backgroundColor: note.is_favorited ? alpha(theme.palette.warning.main, 0.1) : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.warning.main, 0.2),
                        color: 'warning.main'
                      }
                    }}
                  >
                    {note.is_favorited ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
              )}

              {canEdit && (
                <Tooltip title="Edit note">
                  <IconButton
                    onClick={() => handlers.onEdit(note)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.main, 0.2),
                        color: 'info.main'
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}

              {canDelete && (
                <Tooltip title="Delete note">
                  <IconButton
                    onClick={() => handlers.onDelete(note)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.2),
                        color: 'error.main'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

                
              </Box>
            </CardContent>
          </Card>

          {/* Note Content - StackOverflow Body */}
          <Card 
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              mb: 3,
              position: 'relative'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Content with StackOverflow styling */}
              <Box
                component="div"
                dangerouslySetInnerHTML={{ __html: note.note }}
                className="tiptap-display"
                sx={{
                  '& > *:first-of-type': { mt: 0 },
                  '& > *:last-child': { mb: 0 },
                  
                  // StackOverflow content styling
                  fontSize: '15px',
                  lineHeight: 1.6,
                  color: '#242729',
                  
                  // Headings
                  '& h1': { 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    mt: 2.5, 
                    mb: 1.25,
                    paddingBottom: '0.3rem',
                    borderBottom: `1px solid ${theme.palette.divider}` 
                  },
                  '& h2': { 
                    fontSize: '1.3rem', 
                    fontWeight: 600, 
                    mt: 2, 
                    mb: 1 
                  },
                  '& h3': { 
                    fontSize: '1.15rem', 
                    fontWeight: 600, 
                    mt: 1.75, 
                    mb: 0.75 
                  },
                  '& h4': { 
                    fontSize: '1.05rem', 
                    fontWeight: 600, 
                    mt: 1.5, 
                    mb: 0.5 
                  },
                  
                  // Paragraphs
                  '& p': { 
                    lineHeight: 1
                  },
                  
                  // Code blocks
                  '& pre': {
                    backgroundColor: '#f6f6f6',
                    borderRadius: '3px',
                    padding: '12px',
                    overflowX: 'auto',
                    margin: '1.2rem 0',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    border: '1px solid #e4e6e8'
                  },
                  
                  // Inline code
                  '& code': {
                    backgroundColor: '#f6f6f6',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '13px',
                    fontFamily: 'Consolas, "Courier New", monospace',
                    border: '1px solid #e4e6e8',
                    color: '#d63384'
                  },
                  
                  // Lists
                  '& ul, & ol': {
                    margin: '1.2rem 0',
                    paddingLeft: '2rem',
                    '& li': {
                      marginBottom: '0.25rem', // Reduced margin for tighter list items
                      lineHeight: 1.4, // Reduced line height for list items
                      fontSize: '14px' // Slightly smaller font for list items
                    }
                  },
                  
                  // Blockquotes
                  '& blockquote': {
                    borderLeft: '4px solid #e4e6e8',
                    margin: '1.2rem 0',
                    padding: '0.5rem 0 0.5rem 1rem',
                    color: '#6a737c',
                    backgroundColor: '#f8f9f9'
                  },
                  
                  // Images
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '3px',
                    margin: '1.2rem 0'
                  },
                  
                  // Tables
                  '& table': {
                    borderCollapse: 'collapse',
                    width: '100%',
                    margin: '1.2rem 0',
                    '& th, & td': {
                      border: '1px solid #e4e6e8',
                      padding: '0.5rem 0.75rem',
                      textAlign: 'left'
                    },
                    '& th': {
                      backgroundColor: '#f8f9f9',
                      fontWeight: 600
                    }
                  },
                  
                  // Horizontal rules
                  '& hr': {
                    border: 'none',
                    borderTop: '1px solid #e4e6e8',
                    margin: '2rem 0'
                  },
                  
                  // Links
                  '& a': {
                    color: '#0077cc',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }
                }}
              />
            </CardContent>

            {/* Footer Actions */}
            <Box sx={{ 
              p: { xs: 2, sm: 3 }, 
              pt: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="caption" color="text.secondary">
                Last edit: {new Date(note.updated_at || note.created_at).toLocaleDateString('en-UK', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              
              {!handlers.isViewingSelfAsCoach && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => handlers.onReply(note)}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 1,
                    px: 2,
                    py: 0.75,
                    fontWeight: 500,
                    backgroundColor: '#0a95ff',
                    '&:hover': {
                      backgroundColor: '#0077cc'
                    }
                  }}
                >
                  Add Reply
                </Button>
              )}
            </Box>
          </Card>

          {/* Replies Section - StackOverflow Answers */}
          {note.replies.length > 0 && (
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {note.replies.length} {note.replies.length === 1 ? 'Reply' : 'Replies'}
              </Typography>
              
              <Stack spacing={2}>
                {note.replies.map((reply, index) => (
                  <Card
                    key={reply.id}
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: '#f8f9f9',
                      position: 'relative'
                    }}
                  >
                    {/* Accepted answer indicator */}
                    {reply.is_accepted && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -8,
                          left: 16,
                          backgroundColor: '#48a868',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          px: 1.5,
                          py: 0.25,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <CheckCircle fontSize="small" />
                        Accepted
                      </Box>
                    )}
                    
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <NoteReply
                        note={reply}
                        userProfile={userProfile}
                        onEdit={() => handlers.onEdit && handlers.onEdit(reply)}
                        onDelete={(replyToDelete) => {
                          handlers.onDelete && handlers.onDelete(replyToDelete);
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default NoteThreadDetailView;