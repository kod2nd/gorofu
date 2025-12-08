import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, CardActions, Typography, Chip,
  Divider, Tooltip, IconButton, Stack, Avatar, Fab, alpha,
  useTheme, useMediaQuery, Container
} from '@mui/material';
import {
  ArrowBack, Edit as EditIcon, Delete as DeleteIcon,
  Star, StarBorder, Reply as ReplyIcon, PushPin, PushPinOutlined,
  MoreVert, PersonOutline, School, Favorite, FavoriteBorder,
  Bookmark, BookmarkBorder
} from '@mui/icons-material';
import NoteReply from './NoteReply';
import { toProperCase } from './utils';

const NoteThreadDetailView = ({ note, onBack, userProfile, ...handlers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showMobileActions, setShowMobileActions] = useState(false);

  if (!note) return null;

  const canEdit = note.author_id === userProfile.user_id;
  const canDelete = note.author_id === userProfile.user_id || userProfile.roles.includes('coach');
  const canFavorite = !handlers.isViewingSelfAsCoach;
  const canPin = userProfile.roles.includes('coach') && !handlers.isViewingSelfAsCoach;
  const isPersonalNote = note.author_id === note.student_id;

  const authorInitials = note.author?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  // Floating Action Button for mobile
  const FloatingActionMenu = () => (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 24, 
      right: 24, 
      zIndex: 1000,
      display: { xs: 'block', sm: 'none' } 
    }}>
      <Fab
        color="primary"
        size="medium"
        onClick={() => setShowMobileActions(!showMobileActions)}
        sx={{
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        }}
      >
        <MoreVert />
      </Fab>
      
      {showMobileActions && (
        <Stack
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: 60,
            right: 0,
            minWidth: 180,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            animation: 'slideUp 0.3s ease'
          }}
        >
          {canPin && (
            <Button
              fullWidth
              size="small"
              startIcon={note.is_pinned_to_dashboard ? <Bookmark /> : <BookmarkBorder />}
              onClick={() => {
                handlers.onPin(note);
                setShowMobileActions(false);
              }}
              sx={{ 
                justifyContent: 'flex-start',
                borderRadius: 2,
                px: 2,
                py: 1
              }}
            >
              {note.is_pinned_to_dashboard ? "Unpin" : "Pin to Dashboard"}
            </Button>
          )}
          
          {canFavorite && (
            <Button
              fullWidth
              size="small"
              startIcon={note.is_favorited ? <Favorite /> : <FavoriteBorder />}
              onClick={() => {
                handlers.onFavorite(note);
                setShowMobileActions(false);
              }}
              sx={{ 
                justifyContent: 'flex-start',
                borderRadius: 2,
                px: 2,
                py: 1
              }}
            >
              {note.is_favorited ? "Unfavorite" : "Favorite"}
            </Button>
          )}
          
          {canEdit && (
            <Button
              fullWidth
              size="small"
              startIcon={<EditIcon />}
              onClick={() => {
                handlers.onEdit(note);
                setShowMobileActions(false);
              }}
              sx={{ 
                justifyContent: 'flex-start',
                borderRadius: 2,
                px: 2,
                py: 1
              }}
            >
              Edit Note
            </Button>
          )}
          
          {canDelete && (
            <Button
              fullWidth
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => {
                handlers.onDelete(note);
                setShowMobileActions(false);
              }}
              sx={{ 
                justifyContent: 'flex-start',
                borderRadius: 2,
                px: 2,
                py: 1,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08)
                }
              }}
            >
              Delete
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, py: 3 }}>
      {/* Back Navigation */}
      <Button
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{
          mb: 4,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: { xs: '0.875rem', sm: '1rem' },
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          },
          borderRadius: 2,
          px: 2,
          py: 1
        }}
      >
        Back to Notes
      </Button>

      {/* Main Note Card */}
      <Card 
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'visible',
          position: 'relative',
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.paper} 100%)`,
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Decorative Corner */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 80,
            height: 80,
            borderTopRightRadius: 4,
            borderBottomLeftRadius: 80,
            backgroundColor: alpha(isPersonalNote ? theme.palette.secondary.main : theme.palette.primary.main, 0.1),
            zIndex: 0
          }}
        />

        <CardContent sx={{ p: { xs: 2.5, sm: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
            <Avatar
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                bgcolor: isPersonalNote ? 'secondary.main' : 'primary.main',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            >
              {authorInitials}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography
                  variant="h6"
                  // fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2.5rem' },
                    lineHeight: 1.1,
                    background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {note.subject}
                </Typography>
                
                <Chip
                  icon={isPersonalNote ? <PersonOutline /> : <School />}
                  label={isPersonalNote ? "Personal Note" : "Lesson Note"}
                  color={isPersonalNote ? "secondary" : "primary"}
                  size="medium"
                  sx={{
                    height: 32,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    '& .MuiChip-icon': { fontSize: '1rem' }
                  }}
                />
              </Box>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box component="span" fontWeight={600}>
                  {toProperCase(note.author?.full_name)}
                </Box>
                • 
                {new Date(note.lesson_date).toLocaleDateString('en-UK', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>

            {/* Desktop Actions */}
            <Stack 
              direction="row" 
              spacing={0.5}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                alignSelf: 'flex-start'
              }}
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

          <Divider sx={{ mb: 4, borderColor: 'divider', borderWidth: 1 }} />

          {/* Note Content */}
          <Box
            component="div"
            dangerouslySetInnerHTML={{ __html: note.note }}
            className="tiptap-display"
            sx={{
              '& > *:first-of-type': { mt: 0 },
              '& > *:last-child': { mb: 0 },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                my: 3
              },
              '& pre': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderRadius: 2,
                p: 3,
                overflowX: 'auto',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                fontFamily: 'Monaco, monospace',
                fontSize: '0.875rem',
                my: 3
              },
              '& h1': { fontSize: '2rem', fontWeight: 800, mt: 4, mb: 2 },
              '& h2': { fontSize: '1.75rem', fontWeight: 700, mt: 3, mb: 1.5 },
              '& h3': { fontSize: '1.5rem', fontWeight: 600, mt: 2.5, mb: 1 },
              '& p': { 
                fontSize: '1.125rem', 
                lineHeight: 1.7, 
                mb: 2,
                color: 'text.primary'
              },
              '& ul, & ol': { 
                pl: 3, 
                mb: 2,
                '& li': { mb: 1, fontSize: '1.125rem', lineHeight: 1.6 }
              }
            }}
          />
        </CardContent>

        <CardActions sx={{ 
          p: { xs: 2.5, sm: 4 }, 
          pt: 0,
          justifyContent: 'space-between',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date(note.updated_at || note.created_at).toLocaleDateString('en-UK', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
          
          {!handlers.isViewingSelfAsCoach && (
            <Button
              variant="contained"
              startIcon={<ReplyIcon />}
              onClick={() => handlers.onReply(note)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Reply
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Replies Section */}
      {note.replies.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 4,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }}
            />
            <Box component="span">
              {note.replies.length} {note.replies.length === 1 ? 'Reply' : 'Replies'}
            </Box>
          </Typography>
          
          <Stack spacing={3}>
            {note.replies.map((reply, index) => (
              <Box
                key={reply.id}
                sx={{
                  animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              >
                <NoteReply
                  note={reply}
                  userProfile={userProfile}
                  onEdit={handlers.onEdit}
                  onDelete={handlers.onDelete}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Mobile Floating Action Menu */}
      <FloatingActionMenu />
    </Container>
  );
};

export default NoteThreadDetailView;