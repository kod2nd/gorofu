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
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  DialogContentText,
  Divider,
  InputAdornment,
  Fade,
  FormControlLabel,
  Switch,
  Tooltip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useDebounce } from '../hooks/useDebounce';
import {
  AddComment, Edit as EditIcon, Close as CloseIcon, Search as SearchIcon,
  Person, Delete as DeleteIcon, ViewList, ViewModule, ArrowDownward, ArrowUpward, Reply as ReplyIcon, PushPin, PushPinOutlined,
  FilterList, ClearAll
} from '@mui/icons-material';
import { elevatedCardStyles } from '../styles/commonStyles';
import { userService } from '../services/userService';
import PageHeader from './PageHeader';
import FlippingGolfIcon from "./FlippingGolfIcon";
import MenuBar from './studentInteraction/MenuBar';
import NoteThreadRow from './studentInteraction/NoteThreadRow';
import NoteThreadDetailView from './studentInteraction/NoteThreadDetailView';
import { toProperCase } from './studentInteraction/utils';
import NoteFilters from './studentInteraction/NoteFilters';


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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const [showFavorites, setShowFavorites] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' or 'personal'
  
  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, note: null });

  // State for forum-style view
  const [viewingThreadId, setViewingThreadId] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      Placeholder.configure({
        placeholder: 'Add your notes here...',
      }),
    ],
    content: noteContent,
    editable: true, // Explicitly set the editor to be editable
    autofocus: 'end', // Focus the editor at the end of the content on load

    onUpdate: ({ editor }) => {
      setNoteContent(editor.getHTML());
    },

    // --- Editor Props ---
    editorProps: {
      attributes: { 
        class: 'tiptap-editor',
        // You can add other attributes like this:
        // spellcheck: 'false',
      },
    },
  });

  const hasLoadedForActiveState = useRef(false);
  const isCoach = userProfile?.roles?.includes('coach');
  const isViewingSelfAsCoach = isCoach && selectedStudentId === userProfile.user_id;

  useEffect(() => {
    if (isActive && userProfile && !hasLoadedForActiveState.current) {
      loadAllStudents(); // Load students for all users to populate dropdowns
      // If user is not a coach, default to their personal notes view.
      // Otherwise, coaches see the student selection.
      if (!isCoach) {
        setActiveTab('personal');
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
    const studentIdToLoad = activeTab === 'personal' ? userProfile.user_id : selectedStudentId;
    if (studentIdToLoad) {
      setNotes([]);
      setCurrentPage(0);
      loadNotesForStudent(studentIdToLoad, 0, true);
      setViewingThreadId(null); // Go back to list view when student changes
    } else {
      setNotes([]);
    }
  }, [selectedStudentId, debouncedSearchTerm, filterStartDate, filterEndDate, sortOrder, showFavorites, activeTab, userProfile.user_id]);

  useEffect(() => {
    // When switching tabs, clear filters and reset view
    handleClearFilters();
  }, [activeTab]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStartDate(null);
    setFilterEndDate(null);
    setShowFavorites(false);
    setSortOrder('desc');
    setViewMode('list');
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
        personalNotesOnly: activeTab === 'personal',
        limit: 10,
      });

      setNotes(prevNotes => isReset ? newNotes : [...prevNotes, ...newNotes]);
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
    loadNotesForStudent(activeTab === 'personal' ? userProfile.user_id : selectedStudentId, nextPage);
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
      setNoteContent(''); // Explicitly clear the state for the editor
      setLessonDate(new Date()); // Reset the date for the new note
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
    const studentIdForNote = activeTab === 'personal' ? userProfile.user_id : selectedStudentId;
    if (!noteSubject.trim() || !noteContent.trim() || !studentIdForNote) return;

    try {
      const noteData = {
        subject: noteSubject,
        note: noteContent,
        lesson_date: lessonDate.toISOString(),
        // The author of any new note is the currently logged-in user.
        author_id: userProfile.user_id,
        student_id: studentIdForNote,
      };

      if (editingNote) {
        // Remove fields that shouldn't be on an update
        delete noteData.coach_id;
        delete noteData.student_id;
        delete noteData.author_id;
        await userService.updateNoteForStudent(editingNote.id, noteData);
      } else {
        await userService.saveNoteForStudent(noteData);
      }
      
      handleCloseForm();
      loadNotesForStudent(studentIdForNote, 0, true);
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
        lesson_date: parentNote.lesson_date,
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
      loadNotesForStudent(activeTab === 'personal' ? userProfile.user_id : selectedStudentId, 0, true); // Refresh notes
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

  const handlePinToDashboard = async (note) => {
    try {
      await userService.updateNoteForStudent(note.id, { is_pinned_to_dashboard: !note.is_pinned_to_dashboard });
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === note.id ? { ...n, is_pinned_to_dashboard: !n.is_pinned_to_dashboard } : n
        )
      );
    } catch (err) {
      setError('Failed to update pin status: ' + err.message);
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
      
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Lesson Notes" value="lesson" />
        <Tab label="My Notes" value="personal" />
      </Tabs>

      <Paper 
        {...elevatedCardStyles} 
        sx={{ 
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        {activeTab === 'lesson' && isCoach && (
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

        {(selectedStudentId || activeTab === 'personal') && (
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
                {activeTab === 'lesson' ? 'Lesson Notes' : 'My Notes'}
              </Typography>
              {!isViewingSelfAsCoach && (
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
              <NoteFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              showFavorites={showFavorites}
              setShowFavorites={setShowFavorites}
              filterStartDate={filterStartDate}
              setFilterStartDate={setFilterStartDate}
              filterEndDate={filterEndDate}
              setFilterEndDate={setFilterEndDate}
              hasActiveFilters={hasActiveFilters}
              handleClearFilters={handleClearFilters}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

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
                  {activeTab === 'personal'
                    ? 'Start by adding your first personal note.'
                    : 'No lesson notes found for this student.'}
                </Typography>
              </Card>
            ) : viewingThread ? (
              <NoteThreadDetailView 
                note={viewingThread}
                onBack={() => setViewingThreadId(null)}
                userProfile={userProfile}
                onReply={handleSaveReply}
                onEdit={handleOpenForm}
                onDelete={handleDeleteRequest}
                onFavorite={handleToggleFavorite}
                onPin={handlePinToDashboard}
                isViewingSelfAsCoach={isViewingSelfAsCoach}
              />
            ) : viewMode === 'grouped' ? (
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
                          <Stack spacing={1.5}>
                            {groupedNotes[year][month].map(note => (
                              <NoteThreadRow key={note.id} note={note} onClick={setViewingThreadId} userProfile={userProfile} onFavorite={handleToggleFavorite} isViewingSelfAsCoach={isViewingSelfAsCoach} />
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : ( // Default to 'list' view
              <Stack spacing={1.5}>
                {threadedNotes.map(note => (
                  <NoteThreadRow 
                    key={note.id}
                    note={note}
                    onClick={setViewingThreadId}
                    userProfile={userProfile}
                    onFavorite={handleToggleFavorite}
                    isViewingSelfAsCoach={isViewingSelfAsCoach}
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
                label="Date"
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
              label="Title"
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
                padding: '8px 16px 16px 16px',
                minHeight: '250px',
                maxHeight: '400px',
                overflow: 'auto',
                backgroundColor: 'white',
              }}
              sx={{
                // Styles for Tiptap placeholder
                '& .tiptap p.is-editor-empty:first-child::before': {
                  content: 'attr(data-placeholder)',
                  float: 'left',
                  color: '#adb5bd',
                  pointerEvents: 'none',
                  height: 0,
                },
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