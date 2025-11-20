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
  FormatListBulleted, FormatListNumbered, AddComment, Edit as EditIcon, 
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

const NoteCard = React.forwardRef(({ note, userProfile, onReply, onEdit, onDelete, onFavorite, isTopLevel = false, isViewingSelfAsCoach }, ref) => {
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
      sx={{
        borderRadius: 2,
        borderWidth: isTopLevel ? 2 : 1,
        transition: 'all 0.2s',
        '&:hover': { boxShadow: 3, borderColor: 'primary.main' },
        backgroundColor: isTopLevel ? 'white' : '#f8f9fa',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            {isTopLevel && (
              <Typography variant="h6" fontWeight={600} color="primary.main">
                {new Date(note.lesson_date).toLocaleDateString('en-UK', { year: '2-digit', month: 'short', day: 'numeric' })} - {note.subject || 'No Subject'}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              By: {toProperCase(note.author?.full_name) || 'Unknown User'} on {new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Typography>
          </Box>
          <Box>
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
        <Box component="div" dangerouslySetInnerHTML={{ __html: note.note }} sx={{ my: 2, lineHeight: 1.7, '& p': { m: 0, mb: 1 }, '& ul, & ol': { pl: 3, my: 1 }, '& a': { color: 'primary.main', textDecoration: 'underline' }, color: 'text.secondary' }} className="tiptap-display" />
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
        {canReply && (
          <Button size="small" startIcon={<ReplyIcon />} onClick={() => setShowReplyForm(!showReplyForm)}>
            {showReplyForm ? 'Cancel' : 'Reply'}
          </Button>
        )}
      </CardActions>
      {showReplyForm && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <EditorContent editor={editor} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', minHeight: '100px', marginBottom: '8px' }} />
          <Button variant="contained" size="small" onClick={handleReplySubmit}>Submit Reply</Button>
        </Box>
      )}
      {note.replies && note.replies.length > 0 && (
        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, borderTop: '1px solid', borderColor: 'divider' }}>
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
              Select a Student
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudentId}
                label="Student"
                onChange={(e) => setSelectedStudentId(e.target.value)}
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

        {isCoach && selectedStudentId && (
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              borderWidth: 2,
              borderColor: 'divider',
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <CardContent>
              <Typography 
                variant="overline" 
                color="text.secondary" 
                sx={{ fontWeight: 600, letterSpacing: 1 }}
              >
                Assigned Coaches
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                {getAssignedCoaches(selectedStudentId).length > 0 ? (
                  getAssignedCoaches(selectedStudentId).map(coach => (
                    <Chip 
                      key={coach.user_id} 
                      label={toProperCase(coach.full_name)} 
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 500,
                        borderRadius: 2,
                        borderWidth: 2,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No coaches assigned.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {selectedStudentId && (
          <>
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ borderRadius: 3, minWidth: 120, textTransform: 'none' }}
                >
                  Filters
                </Button>
                <FormControlLabel
                  control={<Switch checked={showFavorites} onChange={(e) => setShowFavorites(e.target.checked)} />}
                  label="Favorites"
                  sx={{ pr: 1 }}
                />
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
                  Add Note
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

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
            ) : (
              <Stack spacing={4}>
                {Object.keys(groupedNotes).map(year => (
                  <Box key={year}>
                    <Divider sx={{ mb: 2, '&::before, &::after': { borderWidth: '2px' } }}>
                      <Chip label={year} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
                    </Divider>
                    <Stack spacing={3}>
                      {Object.keys(groupedNotes[year]).map(month => (
                        <Box key={month}>
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 2, ml: 1, fontWeight: 500 }}>
                            {month}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {groupedNotes[year][month].map((note, index) => (
                              <Fade in key={note.id} timeout={300 * (index % 5)}>
                                <NoteCard 
                                  note={note} 
                                  userProfile={userProfile}
                                  onReply={handleSaveReply}
                                  onEdit={handleOpenForm}
                                  onDelete={handleDeleteRequest}
                                  onFavorite={handleToggleFavorite}
                                  isTopLevel={true}
                                  isViewingSelfAsCoach={isViewingSelfAsCoach}
                                />
                              </Fade>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
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
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {editingNote ? 'Edit Note' : 'Add New Note'}
          </Typography>
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
          <Box sx={{ mb: 3 }}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, note: null })}
      >
        <DialogTitle>Delete Note?</DialogTitle>
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