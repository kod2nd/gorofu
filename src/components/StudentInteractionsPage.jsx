import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogContentText,
  IconButton,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Fade,
  FormControlLabel,
  Switch,
  Tooltip,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useDebounce } from '../hooks/useDebounce';
import {
  FormatBold, FormatItalic, FormatUnderlined, Link as LinkIcon,
  FormatListBulleted, FormatListNumbered, AddComment, Edit as EditIcon, ArrowBack,
  Close as CloseIcon, Search as SearchIcon, CalendarToday, Person, Star, StarBorder, Delete as DeleteIcon, Reply as ReplyIcon,
  ExpandMore, FilterList, ClearAll
} from '@mui/icons-material';
import { elevatedCardStyles } from '../styles/commonStyles';
import { userService } from '../services/userService';
import PageHeader from './PageHeader';
import FlippingGolfIcon from "./FlippingGolfIcon";

const toProperCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const buttonStyle = {
    minWidth: '40px',
    height: '40px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    '&.is-active': {
      backgroundColor: 'primary.main',
      color: 'white',
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
    },
  };
  

  return (
    <Box sx={{ 
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      borderBottom: 0,
      borderRadius: '12px 12px 0 0',
      p: 1.5,
      display: 'flex',
      gap: 0.5,
      flexWrap: 'wrap'
    }}>
      <Tooltip title="Bold">
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={editor.isActive('bold') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatBold fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic">
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={editor.isActive('italic') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline">
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          className={editor.isActive('underline') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Link">
        <IconButton 
          size="small" 
          onClick={setLink} 
          className={editor.isActive('link') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <LinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Bullet List">
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Numbered List">
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          sx={buttonStyle}
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const NoteCard = React.forwardRef(({ note, userProfile, onReply, onEdit, onDelete, onFavorite, onView, isTopLevel = false, isViewingSelfAsCoach }, ref) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: replyContent,
    editable: showReplyForm,
    onUpdate: ({ editor }) => {
      setReplyContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(showReplyForm);
    }
  }, [showReplyForm, editor]);

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(note, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
    if (editor) editor.commands.clearContent();
  };

  const canEdit = note.author_id === userProfile.user_id;
  const canDelete = note.author_id === userProfile.user_id || userProfile.roles.includes('coach');
  const canFavorite = isTopLevel && !isViewingSelfAsCoach;
  const canReply = !isViewingSelfAsCoach;

  return (
    <Card 
      ref={ref}
      variant="outlined"
      onClick={(e) => {
        // Prevent dialog from opening if an icon button, the reply form, or the reply accordion was clicked
        if (e.target.closest('button, .MuiAccordionSummary-root, .tiptap-editor')) {
          return;
        }
        if (onView) onView(note);
      }}
      sx={{
        borderRadius: 2,
        borderWidth: isTopLevel ? 2 : 1,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 3, borderColor: 'primary.main', cursor: onView ? 'pointer' : 'default' },
        backgroundColor: isTopLevel ? 'white' : '#f8f9fa',
        height: '280px', // Fixed height for all cards
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ pb: 1, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            {isTopLevel && (
              <Typography variant="h6" fontWeight={600} color="primary.main" noWrap>
                {new Date(note.lesson_date).toLocaleDateString('en-UK', { year: '2-digit', month: 'short', day: 'numeric' })} - {note.subject || 'No Subject'}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" fontWeight={500} noWrap>
              By: {toProperCase(note.author?.full_name) || 'Unknown User'} on {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {canFavorite && (
              <Tooltip title={note.is_favorited ? "Remove from favorites" : "Add to favorites"}>
                <IconButton size="small" onClick={() => onFavorite(note)}>
                  {note.is_favorited ? <Star sx={{ color: 'warning.main' }} /> : <StarBorder />}
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Edit note">
                <IconButton size="small" onClick={() => onEdit(note)} sx={{ ml: 1 }}><EditIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete note">
                <IconButton size="small" onClick={() => onDelete(note)} sx={{ ml: 1 }}><DeleteIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box sx={{ position: 'relative', overflow: 'hidden', flexGrow: 1, mt: 2 }}>
          <Box 
            component="div" 
            dangerouslySetInnerHTML={{ __html: note.note }} 
            sx={{ 
              lineHeight: 1.7, 
              '& p': { m: 0, mb: 1 }, 
              '& ul, & ol': { pl: 3, my: 1 }, 
              '& a': { color: 'primary.main', textDecoration: 'underline' }, 
              color: 'text.secondary' 
            }} 
            className="tiptap-display" 
          />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: `linear-gradient(to bottom, transparent, ${isTopLevel ? 'white' : '#f8f9fa'})` }} />
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0, flexShrink: 0 }}>
        {canReply && (
          <Button size="small" startIcon={<ReplyIcon />} onClick={() => setShowReplyForm(!showReplyForm)}>
            {showReplyForm ? 'Cancel' : 'Reply'}
          </Button>
        )}
      </CardActions>
      {showReplyForm && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <EditorContent editor={editor} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', minHeight: '100px', marginBottom: '8px' }} />
          <Button variant="contained" size="small" onClick={handleReplySubmit}>Submit Reply</Button>
        </Box>
      )}
      {note.replies && note.replies.length > 0 && (
        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ '& .MuiAccordionSummary-content': { my: 1 } }}>
            <Typography variant="body2" color="primary.main" fontWeight="bold">
              {note.replies.length} {note.replies.length > 1 ? 'Replies' : 'Reply'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, pt: 0, backgroundColor: '#fafafa' }}>
            {note.replies.map(reply => (
              <Box key={reply.id} sx={{ mt: 2 }}>
                <NoteCard 
                  note={reply} 
                  userProfile={userProfile}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onFavorite={onFavorite}
                  onView={null} // Nested cards are not clickable to open a dialog
                  isViewingSelfAsCoach={isViewingSelfAsCoach}
                />
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  );
});

// We create a specific NoteCard for the dialog that doesn't have height restrictions or truncation.
  const FullNoteCard = () => (
    <Card 
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderWidth: 0, // No border inside dialog
        boxShadow: 'none',
        backgroundColor: 'transparent'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {new Date(note.lesson_date).toLocaleDateString('en-UK', { year: '2-digit', month: 'short', day: 'numeric' })} - {note.subject || 'No Subject'}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              By: {toProperCase(note.author?.full_name) || 'Unknown User'} on {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>
        <Box component="div" dangerouslySetInnerHTML={{ __html: note.note }} sx={{ my: 2, lineHeight: 1.7, '& p': { m: 0, mb: 1 }, '& ul, & ol': { pl: 3, my: 1 }, '& a': { color: 'primary.main', textDecoration: 'underline' }, color: 'text.secondary' }} className="tiptap-display" />
      </CardContent>
      {/* We render the original NoteCard here just for its reply/action logic, but hide its main content */}
      <NoteCard 
        note={note} 
        userProfile={userProfile}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onFavorite={onFavorite}
        isTopLevel={true}
        isViewingSelfAsCoach={isViewingSelfAsCoach}
        onView={null} // Not clickable
        sx={{ height: 'auto', '& > .MuiCardContent-root': { display: 'none' } }} // Hide original content
      />
    </Card>
  );

const NoteViewDialog = ({ note, open, onClose, userProfile, onReply, onEdit, onDelete, onFavorite, isViewingSelfAsCoach }) => {
  if (!note) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
        <Typography variant="h6" component="h2" fontWeight={600}>Note Details</Typography>
        <IconButton onClick={onClose} sx={{ '&:hover': { backgroundColor: 'error.light', color: 'white' } }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}><FullNoteCard /></DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
};

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

const NoteThreadRow = ({ note, onClick, userProfile }) => {
  const lastReply = note.replies && note.replies.length > 0 ? note.replies[note.replies.length - 1] : null;
  const lastActivityDate = lastReply ? lastReply.created_at : note.updated_at;
  const lastActivityAuthor = lastReply ? lastReply.author : note.author;

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
        <AddComment color="action" sx={{ opacity: 0.6 }} />
        <Box>
          <Typography variant="body1" fontWeight={600}>
            {note.subject || 'No Subject'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Started by {toProperCase(note.author?.full_name)} on {new Date(note.lesson_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {note.replies?.length || 0} {note.replies?.length === 1 ? 'Reply' : 'Replies'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const NoteThreadDetailView = ({ note, onBack, userProfile, ...handlers }) => {
  if (!note) return null;

  const canEdit = note.author_id === userProfile.user_id;
  const canDelete = note.author_id === userProfile.user_id || userProfile.roles.includes('coach');

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
        {/* Render only the actions and replies section of NoteCard, not the whole card */}
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

const StudentInteractionsPage = ({ userProfile, isActive }) => {
  const [students, setStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allMappings, setAllMappings] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteSubject, setNoteSubject] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [lessonDate, setLessonDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for recent first, 'asc' for oldest first
  const [showFavorites, setShowFavorites] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  
  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, note: null });

  // State for viewing a note
  const [viewingNote, setViewingNote] = useState(null);

  // State for forum-style view
  const [viewingThreadId, setViewingThreadId] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: noteContent,
    onUpdate: ({ editor }) => {
      setNoteContent(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
  });

  const hasLoadedForActiveState = useRef(false);
  const isCoach = userProfile?.roles?.includes('coach');
  const isViewingSelfAsCoach = isCoach && selectedStudentId === userProfile.user_id;

  useEffect(() => {
    if (isActive && userProfile && !hasLoadedForActiveState.current) {
      if (isCoach) {
        loadAllStudents();
      } else {
        setSelectedStudentId(userProfile.user_id);
      }
      hasLoadedForActiveState.current = true;
    } else if (!isActive) {
      hasLoadedForActiveState.current = false;
    }
  }, [userProfile, isCoach, isActive]);

  useEffect(() => {
    if (editor && editor.isEditable) {
      if (editor.getHTML() !== noteContent) {
        editor.commands.setContent(noteContent, false);
      }
    }
  }, [noteContent, editor]);

  useEffect(() => {
    if (selectedStudentId) {
      setNotes([]);
      setCurrentPage(0);
      loadNotesForStudent(selectedStudentId, 0, true);
      setViewingThreadId(null); // Go back to list view when student changes
    } else {
      setNotes([]);
    }
  }, [selectedStudentId, debouncedSearchTerm, filterStartDate, filterEndDate, sortOrder, showFavorites]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setShowFavorites(false);
    setSortOrder('desc');
    setViewingThreadId(null);
  };

  const loadAllStudents = async () => {
    try {
      setLoading(true);
      const [studentsData, usersData, mappingsData] = await Promise.all([
        userService.getAllStudents(),
        userService.getAllUsers(),
        userService.getAllCoachStudentMappings(),
      ]);
      setAllUsers(usersData);
      setAllMappings(mappingsData);
      setStudents(studentsData);
    } catch (err) {
      setError('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadNotesForStudent = async (studentId, pageToLoad, isReset = false) => {
    try {
      setNotesLoading(true);
      const { notes: newNotes, hasMore: moreNotesExist } = await userService.getNotesForStudent({
        studentId,
        searchTerm: debouncedSearchTerm,
        startDate: filterStartDate,
        endDate: filterEndDate,
        page: pageToLoad,
        sortOrder: sortOrder,
        showFavoritesOnly: showFavorites,
        limit: 10,
      });

      setNotes(prevNotes => isReset ? newNotes : [...prevNotes, ...newNotes]);
      console.log("Fetched notes with coach info:", newNotes); // Add this line to inspect data
      setHasMore(moreNotesExist);
      setCurrentPage(pageToLoad);
    } catch (err) {
      setError('Failed to load notes: ' + err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    loadNotesForStudent(selectedStudentId, nextPage);
  };

  const handleOpenForm = (noteToEdit = null) => {
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setNoteSubject(noteToEdit.subject || '');
      setNoteContent(noteToEdit.note || '');
      setLessonDate(new Date(noteToEdit.lesson_date));
    } else {
      setEditingNote(null);
      setNoteSubject('');
      setNoteContent('');
      setLessonDate(new Date());
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingNote(null);
      setNoteSubject('');
      setNoteContent('');
      setLessonDate(new Date());
    }, 300);
  };

  const handleSaveNote = async () => {
    if (!noteSubject.trim() || !noteContent.trim() || !selectedStudentId) return;

    try {
      const noteData = {
        subject: noteSubject,
        note: noteContent,
        lesson_date: lessonDate.toISOString(),
      };

      if (editingNote) {
        await userService.updateNoteForStudent(editingNote.id, noteData);
      } else {
        await userService.saveNoteForStudent({
          ...noteData,
          coach_id: userProfile.user_id,
          student_id: selectedStudentId,
        });
      }
      
      handleCloseForm();
      loadNotesForStudent(selectedStudentId, 0, true);
    } catch (err) {
      setError('Failed to save note: ' + err.message);
    }
  };

  const getAssignedCoaches = (studentId) => {
    if (!studentId || allMappings.length === 0 || allUsers.length === 0) {
      return [];
    }
    const coachIds = allMappings
      .filter(m => m.student_user_id === studentId)
      .map(m => m.coach_user_id);
    
    return allUsers.filter(u => coachIds.includes(u.user_id));
  };

    const handleSaveReply = async (parentNote, content) => {
    try {
      const replyData = {
        author_id: userProfile.user_id,
        student_id: parentNote.student_id,
        parent_note_id: parentNote.id,
        note: content,
        subject: null, // Replies don't have subjects
        lesson_date: null, // Or inherit from parent if needed
      };
      await userService.saveNoteForStudent(replyData);
      // Refresh the entire thread to show the new reply
      loadNotesForStudent(selectedStudentId, 0, true);
    } catch (err) {
      setError('Failed to save reply: ' + err.message);
    }
  };

    const handleDeleteRequest = (note) => {
    setDeleteConfirm({ open: true, note: note });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.note) return;
    try {
      await userService.deleteNote(deleteConfirm.note.id);
      setDeleteConfirm({ open: false, note: null });
      loadNotesForStudent(selectedStudentId, 0, true); // Refresh notes from the beginning
    } catch (err) {
      setError('Failed to delete note: ' + err.message);
      setDeleteConfirm({ open: false, note: null });
    }
  };
    const handleViewNote = (note) => {
    // Find the full note object from state to ensure we have all replies
    const fullNote = threadedNotes.find(n => n.id === note.id);
    setViewingNote(fullNote);
  };

  const handleCloseViewNote = () => {
    setViewingNote(null);
  };

  // Add this function before the return statement
  const handleToggleFavorite = async (note) => {
    try {
      await userService.updateNoteForStudent(note.id, { is_favorited: !note.is_favorited });
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.id === note.id ? { ...n, is_favorited: !n.is_favorited } : n
        )
      );
    } catch (err) {
      setError('Failed to update favorite status: ' + err.message);
    }
  };

    const threadedNotes = useMemo(() => {
    const noteMap = {};
    const topLevelNotes = [];
    notes.forEach(note => {
      noteMap[note.id] = { ...note, replies: [] };
    });
    notes.forEach(note => {
      if (note.parent_note_id && noteMap[note.parent_note_id]) {
        noteMap[note.parent_note_id].replies.push(noteMap[note.id]);
      } else {
        topLevelNotes.push(noteMap[note.id]);
      }
    });
    Object.values(noteMap).forEach(note => note.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    return topLevelNotes;
  }, [notes]);

  const groupedNotes = useMemo(() => {
    const groups = {};
    // The order of months is important, so we define it here.
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    threadedNotes.forEach(note => {
      const date = new Date(note.lesson_date);
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'long' });

      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(note);
    });

    return groups;
  }, [threadedNotes]);

  const viewingThread = useMemo(() => {
    if (!viewingThreadId) return null;
    return threadedNotes.find(note => note.id === viewingThreadId);
  }, [viewingThreadId, threadedNotes]);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <FlippingGolfIcon size={60} />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;

  const hasActiveFilters = searchTerm || filterStartDate || filterEndDate || showFavorites;

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="Student Interactions"
        subtitle="Manage lesson notes and takeaways for your students."
        icon={<AddComment />}
      />
      
      <Paper 
        {...elevatedCardStyles} 
        sx={{ 
          p: 4, 
          mt: 3,
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        {isCoach && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 600,
                mb: 2
              }}
            >
              <Person color="primary" />
              Student
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudentId}
                label="Student"
                onChange={(e) => setSelectedStudentId(e.target.value)}
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>-- Select a Student --</em>;
                  }
                  const student = students.find(s => s.user_id === selected);
                  if (!student) return null;

                  const coaches = getAssignedCoaches(selected);

                  return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography fontWeight={500}>{toProperCase(student.full_name)}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                        {coaches.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Coach{coaches.length > 1 ? 'es' : ''}:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {coaches.map(coach => (
                              <Chip 
                                key={coach.user_id} 
                                label={toProperCase(coach.full_name)} 
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      </Box>
                    </Box>
                  );
                }}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                  },
                }}
              >
                <MenuItem value=""><em>-- Select a Student --</em></MenuItem>
                {students.map((student) => (
                  <MenuItem 
                    key={student.user_id} 
                    value={student.user_id}
                    sx={{ 
                      py: 1.5,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography fontWeight={500}>
                        {toProperCase(student.full_name) || 'Unnamed Student'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {selectedStudentId && (
          <>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <AddComment color="primary" />
                Lesson Notes
              </Typography>
              {isCoach && !isViewingSelfAsCoach && (
                <Button 
                  variant="contained" 
                  startIcon={<AddComment />} 
                  onClick={() => handleOpenForm()}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  New
                </Button>
              )}
            </Box>
              {/* Filters Section */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                mb: 3,
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                    flex: '1 1 300px',
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ borderRadius: 3, minWidth: 110, textTransform: 'none', flexShrink: 0 }}
                  >
                    Filters
                  </Button>
                  <FormControlLabel
                    control={<Switch checked={showFavorites} onChange={(e) => setShowFavorites(e.target.checked)} />}
                    label="Favorites"
                    sx={{ 
                      pr: 1,
                      mr: 0, // remove default margin
                    }}
                  />
                </Box>
              </Box>
              <Fade in={showFilters}>
                <Box sx={{ display: showFilters ? 'block' : 'none', pt: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl 
                          size="small" 
                          sx={{ 
                            flex: 1, 
                            minWidth: '200px',
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                          }}
                        >
                          <InputLabel>Sort By</InputLabel>
                          <Select
                            value={sortOrder}
                            label="Sort By"
                            onChange={(e) => setSortOrder(e.target.value)}
                          >
                            <MenuItem value="desc">Most Recent</MenuItem>
                            <MenuItem value="asc">Oldest</MenuItem>
                          </Select>
                        </FormControl>
                        <DatePicker
                          label="Start Date"
                          value={filterStartDate}
                          onChange={setFilterStartDate}
                          slotProps={{ 
                            textField: { 
                              size: 'small',
                              fullWidth: true,
                              sx: { 
                                flex: 1,
                                minWidth: '200px',
                                '& .MuiOutlinedInput-root': { borderRadius: 2 }
                              }
                            } 
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={filterEndDate}
                          onChange={setFilterEndDate}
                          slotProps={{ 
                            textField: { 
                              size: 'small',
                              fullWidth: true,
                              sx: { 
                                flex: 1,
                                minWidth: '200px',
                                '& .MuiOutlinedInput-root': { borderRadius: 2 }
                              }
                            } 
                          }}
                        />
                      </Box>
                      {hasActiveFilters && (
                        <Button 
                          onClick={handleClearFilters} 
                          startIcon={<ClearAll />}
                          variant="text"
                          sx={{ 
                            alignSelf: 'flex-start',
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </Stack>
                  </LocalizationProvider>
                </Box>
              </Fade>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {notesLoading && currentPage === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <FlippingGolfIcon />
              </Box>
            ) : notes.length === 0 ? (
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  borderRadius: 2,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <AddComment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notes found
                </Typography>
                <Typography color="text.secondary">
                  {isCoach 
                    ? 'Start by adding your first lesson note for this student.' 
                    : 'You have no lesson notes from your coach yet.'}
                </Typography>
              </Card>
            ) : viewingThread ? (
              <NoteThreadDetailView 
                note={viewingThread}
                onBack={() => setViewingThreadId(null)}
                userProfile={userProfile}
                // Pass handlers
                onReply={handleSaveReply}
                onEdit={(noteToEdit) => { handleCloseViewNote(); handleOpenForm(noteToEdit); }}
                onDelete={handleDeleteRequest}
                onFavorite={handleToggleFavorite}
                isViewingSelfAsCoach={isViewingSelfAsCoach}
              />
            ) : (
              <Stack spacing={1.5}>
                {threadedNotes.map(note => (
                  <NoteThreadRow 
                    key={note.id}
                    note={note}
                    onClick={setViewingThreadId}
                    userProfile={userProfile}
                  />
                ))}
              </Stack>
            )}

            {hasMore && !notesLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  onClick={handleLoadMore}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Load More Notes
                </Button>
              </Box>
            )}

            {notesLoading && currentPage > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <FlippingGolfIcon size={32} />
              </Box>
            )}
          </>
        )}
      </Paper>

      <Dialog 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        fullWidth 
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
          transition: {
            onExited: () => editor?.destroy(),
          }
        }}
      >
        <DialogTitle
          component="div"
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" component="h2" fontWeight={600}>{editingNote ? 'Edit Note' : 'Add New Note'}</Typography>
          <IconButton 
            onClick={handleCloseForm}
            sx={{
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Removed Stack to use explicit Box margins for better control */}
          <Box sx={{ mb: 3, mt: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Lesson Date"
                value={lessonDate}
                onChange={(newValue) => setLessonDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Subject / Summary"
              value={noteSubject}
              onChange={(e) => setNoteSubject(e.target.value)}
              variant="outlined"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
          
          <Box> {/* Tiptap editor section */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Notes
            </Typography>
            <MenuBar editor={editor} />
            <EditorContent 
              editor={editor} 
              style={{ 
                border: '1px solid #e0e0e0',
                borderTop: 'none',
                borderRadius: '0 0 12px 12px',
                padding: '16px',
                minHeight: '250px',
                maxHeight: '400px',
                overflow: 'auto',
                backgroundColor: 'white',
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '2px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseForm}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={!noteSubject.trim() || !noteContent.trim()}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            {editingNote ? 'Update Note' : 'Save Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note View Dialog */}
      <NoteViewDialog
        open={!!viewingNote}
        onClose={handleCloseViewNote}
        note={viewingNote}
        userProfile={userProfile}
        // Pass down handlers
        onReply={handleSaveReply}
        onEdit={(noteToEdit) => { handleCloseViewNote(); handleOpenForm(noteToEdit); }}
        onDelete={handleDeleteRequest}
        onFavorite={handleToggleFavorite}
        isViewingSelfAsCoach={isViewingSelfAsCoach}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, note: null })}
      >
        <DialogTitle component="h2">Delete Note?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the note with the subject "{deleteConfirm.note?.subject}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, note: null })}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
      </Box>
  );
};

export default StudentInteractionsPage;