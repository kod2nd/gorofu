import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
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
  Divider,
  Stack,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useDebounce } from "../hooks/useDebounce";
import { AddComment, Close as CloseIcon, Person } from "@mui/icons-material";
import { elevatedCardStyles, buttonStyles, noteStyles } from "../styles/commonStyles";
import { userService } from "../services/userService";
import PageHeader from "./PageHeader";
import FlippingGolfIcon from "./FlippingGolfIcon";
import MenuBar from "./studentInteraction/MenuBar";
import NoteThreadRow from "./studentInteraction/NoteThreadRow";
import NoteThreadDetailView from "./studentInteraction/NoteThreadDetailView";
import { toProperCase } from "./studentInteraction/utils";
import ConfirmationDialog from "./myBag/ConfirmationDialog";
import NoteFilters from "./studentInteraction/NoteFilters";

const StudentInteractionsPage = forwardRef(({ user, isActive, onNoteUpdate }, ref) => {
  const [students, setStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allMappings, setAllMappings] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteSubject, setNoteSubject] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [lessonDate, setLessonDate] = useState(new Date());

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("list");
  const [showFavorites, setShowFavorites] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState("lesson"); // 'lesson' or 'personal'

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, type: "" });

  const [replyingToNote, setReplyingToNote] = useState(null);
  const [viewingThreadId, setViewingThreadId] = useState(null);
  const [currentThreadData, setCurrentThreadData] = useState(null);

  // ✅ Normalize ID to support both profile-shape (user_id) and auth-shape (id)
  const userId = user?.user_id ?? user?.id ?? null;
  const isCoach = (user?.roles || []).includes("coach");
  const isViewingOwnNotes = selectedStudentId === userId || activeTab === "personal";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      Placeholder.configure({
        placeholder: "Add your notes here...",
      }),
    ],
    content: noteContent,
    editable: true,
    autofocus: "end",
    onUpdate: ({ editor }) => setNoteContent(editor.getHTML()),
    editorProps: {
      attributes: { class: "tiptap-editor" },
    },
  });

  const hasLoadedForActiveState = useRef(false);
  const lastUserIdRef = useRef(null);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStartDate(null);
    setFilterEndDate(null);
    setShowFavorites(false);
    setSortOrder("desc");
    setViewMode("list");
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
      setError("Failed to load students: " + err.message);
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
        sortOrder,
        showFavoritesOnly: showFavorites,
        personalNotesOnly: activeTab === "personal",
        limit: 10,
      });

      setNotes((prev) => (isReset ? newNotes : [...prev, ...newNotes]));
      setHasMore(moreNotesExist);
      setCurrentPage(pageToLoad);
    } catch (err) {
      setError("Failed to load notes: " + err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  // ✅ Load/reset when page becomes active OR impersonated user changes
  useEffect(() => {
    if (!isActive) {
      hasLoadedForActiveState.current = false;
      lastUserIdRef.current = null;
      return;
    }
    if (!userId) return;

    const userChanged = lastUserIdRef.current && lastUserIdRef.current !== userId;

    if (!hasLoadedForActiveState.current || userChanged) {
      // reset identity-dependent state
      setStudents([]);
      setAllUsers([]);
      setAllMappings([]);
      setSelectedStudentId("");
      setNotes([]);
      setCurrentPage(0);
      setViewingThreadId(null);
      setCurrentThreadData(null);
      handleClearFilters();

      loadAllStudents();

      // If user is not a coach, default to their personal notes view.
      if (!isCoach) {
        setActiveTab("personal");
        setSelectedStudentId(userId);
      } else {
        // For coaches, default to lesson tab (keep selection empty until they choose)
        setActiveTab("lesson");
      }

      hasLoadedForActiveState.current = true;
      lastUserIdRef.current = userId;
    }
  }, [isActive, userId, isCoach]);

  // Keep editor content in sync
  useEffect(() => {
    if (!editor || !editor.isEditable) return;
    if (editor.getHTML() !== noteContent) {
      editor.commands.setContent(noteContent, false);
    }
  }, [noteContent, editor]);

  // Load notes when filters / selection changes
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      return;
    }

    const studentIdToLoad = activeTab === "personal" ? userId : selectedStudentId;

    if (studentIdToLoad) {
      setNotes([]);
      setCurrentPage(0);
      loadNotesForStudent(studentIdToLoad, 0, true);
      setViewingThreadId(null);
    } else {
      setNotes([]);
    }
  }, [
    selectedStudentId,
    debouncedSearchTerm,
    filterStartDate,
    filterEndDate,
    sortOrder,
    showFavorites,
    activeTab,
    userId,
  ]);

  // Clear filters when switching tabs
  useEffect(() => {
    handleClearFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const studentIdToLoad = activeTab === "personal" ? userId : selectedStudentId;
    if (!studentIdToLoad) return;
    loadNotesForStudent(studentIdToLoad, nextPage);
  };

  const handleOpenForm = (noteToEdit = null) => {
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setNoteSubject(noteToEdit.subject || "");
      setNoteContent(noteToEdit.note || "");
      setLessonDate(new Date(noteToEdit.lesson_date));
    } else {
      setEditingNote(null);
      setNoteSubject("");
      setNoteContent("");
      setLessonDate(new Date());
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setEditingNote(null);
      setNoteSubject("");
      setNoteContent("");
      setLessonDate(new Date());
    }, 300);
    setReplyingToNote(null);
  };

  const handleSaveNote = async () => {
    const studentIdForNote = activeTab === "personal" ? userId : selectedStudentId;
    if (!noteSubject.trim() || !noteContent.trim() || !studentIdForNote || !userId) return;

    try {
      if (replyingToNote) {
        const replyData = {
          author_id: userId,
          student_id: replyingToNote.student_id,
          parent_note_id: replyingToNote.id,
          note: noteContent,
          subject: noteSubject,
          lesson_date: replyingToNote.lesson_date,
        };
        await userService.saveNoteForStudent(replyData);
      } else if (editingNote) {
        const noteData = {
          subject: noteSubject,
          note: noteContent,
          lesson_date: lessonDate.toISOString(),
        };
        await userService.updateNoteForStudent(editingNote.id, noteData);
      } else {
        const noteData = {
          subject: noteSubject,
          note: noteContent,
          lesson_date: lessonDate.toISOString(),
          author_id: userId,
          student_id: studentIdForNote,
        };
        await userService.saveNoteForStudent(noteData);
      }

      handleCloseForm();
      loadNotesForStudent(studentIdForNote, 0, true);
    } catch (err) {
      setError("Failed to save note: " + err.message);
    }
  };

  const getAssignedCoaches = (studentId) => {
    if (!studentId || allMappings.length === 0 || allUsers.length === 0) return [];
    const coachIds = allMappings
      .filter((m) => m.student_user_id === studentId)
      .map((m) => m.coach_user_id);

    return allUsers.filter((u) => coachIds.includes(u.user_id));
  };

  const handleReplyClick = (parentNote) => {
    setReplyingToNote(parentNote);
    setEditingNote(null);
    setNoteSubject(`Re: ${parentNote.subject}`);
    setNoteContent("");
    setLessonDate(new Date(parentNote.lesson_date));
    setIsFormOpen(true);
  };

  useImperativeHandle(ref, () => ({
    handleReplyClick,
  }));

  const handleDeleteRequest = (item) => {
    const type = item.parent_note_id ? "reply" : "note";
    setDeleteConfirm({ open: true, item, type });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.item) return;

    const { item, type } = deleteConfirm;
    try {
      await userService.deleteNote(item.id);
      setDeleteConfirm({ open: false, item: null, type: "" });

      if (type === "reply" && viewingThreadId) {
        const updatedThread = await userService.getNoteThread(viewingThreadId);
        setCurrentThreadData(updatedThread);
      } else {
        setViewingThreadId(null);
        const studentIdToLoad = activeTab === "personal" ? userId : selectedStudentId;
        if (studentIdToLoad) loadNotesForStudent(studentIdToLoad, 0, true);
      }
    } catch (err) {
      console.error("[StudentInteractionsPage] Failed to delete note:", err);
      setError("Failed to delete note: " + err.message);
      setDeleteConfirm({ open: false, item: null, type: "" });
    }
  };

  const handleToggleFavorite = async (note) => {
    try {
      await userService.updateNoteForStudent(note.id, { is_favorited: !note.is_favorited });
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, is_favorited: !n.is_favorited } : n))
      );
    } catch (err) {
      setError("Failed to update favorite status: " + err.message);
    }
  };

  const handlePinToDashboard = async (note) => {
    try {
      await userService.updateNoteForStudent(note.id, {
        is_pinned_to_dashboard: !note.is_pinned_to_dashboard,
      });
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, is_pinned_to_dashboard: !n.is_pinned_to_dashboard } : n
        )
      );
      if (onNoteUpdate) onNoteUpdate();
    } catch (err) {
      setError("Failed to update pin status: " + err.message);
    }
  };

  const threadedNotes = useMemo(() => {
    const noteMap = {};
    const topLevelNotes = [];

    notes.forEach((n) => {
      noteMap[n.id] = { ...n, replies: [] };
    });

    notes.forEach((n) => {
      if (n.parent_note_id && noteMap[n.parent_note_id]) {
        noteMap[n.parent_note_id].replies.push(noteMap[n.id]);
      } else {
        topLevelNotes.push(noteMap[n.id]);
      }
    });

    Object.values(noteMap).forEach((n) =>
      n.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    );

    return topLevelNotes;
  }, [notes]);

  const groupedNotes = useMemo(() => {
    const groups = {};
    threadedNotes.forEach((n) => {
      const date = new Date(n.lesson_date);
      const year = date.getFullYear();
      const month = date.toLocaleString("en-US", { month: "long" });

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      groups[year][month].push(n);
    });
    return groups;
  }, [threadedNotes]);

  useMemo(() => {
    if (!viewingThreadId) return null;
    const thread = threadedNotes.find((n) => n.id === viewingThreadId);
    if (thread) setCurrentThreadData(thread);
    return thread;
  }, [viewingThreadId, threadedNotes]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
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

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Coach Notes" value="lesson" />
        <Tab label="My Notes" value="personal" />
      </Tabs>

      <Paper
        {...elevatedCardStyles}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        {activeTab === "lesson" && isCoach && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 600,
                mb: 2,
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
                  if (!selected) return <em>-- Select a Student --</em>;
                  const student = students.find((s) => s.user_id === selected);
                  if (!student) return null;

                  const coaches = getAssignedCoaches(selected);

                  return (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <Box>
                        <Typography fontWeight={500}>{toProperCase(student.full_name)}</Typography>
                        <Typography variant="caption" color="text.secondary">{student.email}</Typography>

                        {coaches.length > 0 && (
                          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Coach{coaches.length > 1 ? "es" : ""}:
                            </Typography>
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              {coaches.map((coach) => (
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
                  "& .MuiOutlinedInput-notchedOutline": { borderWidth: 2 },
                }}
              >
                <MenuItem value="">
                  <em>-- Select a Student --</em>
                </MenuItem>
                {students.map((student) => (
                  <MenuItem
                    key={student.user_id}
                    value={student.user_id}
                    sx={{
                      py: 1.5,
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <Typography fontWeight={500}>{toProperCase(student.full_name) || "Unnamed Student"}</Typography>
                      <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {(selectedStudentId || activeTab === "personal") && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
              >
                <AddComment color="primary" />
                {activeTab === "lesson" ? "Coach Notes" : "My Notes"}
              </Typography>

              {(activeTab === "personal" || (activeTab === "lesson" && selectedStudentId && !isViewingOwnNotes)) && (
                <Button
                  variant="contained"
                  startIcon={<AddComment />}
                  onClick={() => handleOpenForm()}
                  sx={buttonStyles.action}
                >
                  New Note
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
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <FlippingGolfIcon />
              </Box>
            ) : notes.length === 0 ? (
              <Card variant="outlined" sx={noteStyles.card.sx}>
                <AddComment sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No notes found
                </Typography>
                <Typography color="text.secondary">
                  {activeTab === "personal"
                    ? "Start by adding your first personal note."
                    : "No lesson notes found for this student."}
                </Typography>
              </Card>
            ) : viewingThreadId && currentThreadData ? (
              <NoteThreadDetailView
                note={currentThreadData}
                onBack={() => {
                  setViewingThreadId(null);
                  setCurrentThreadData(null);
                }}
                user={user}
                onReply={handleReplyClick}
                onEdit={handleOpenForm}
                onDelete={handleDeleteRequest}
                onFavorite={handleToggleFavorite}
                onPin={handlePinToDashboard}
                isViewingSelfAsCoach={false}
              />
            ) : viewMode === "grouped" ? (
              <Stack spacing={4}>
                {Object.keys(groupedNotes).map((year) => (
                  <Box key={year}>
                    <Divider sx={{ mb: 2, "&::before, &::after": { borderWidth: "2px" } }}>
                      <Chip label={year} sx={{ fontWeight: "bold", fontSize: "1.1rem" }} />
                    </Divider>

                    <Stack spacing={3}>
                      {Object.keys(groupedNotes[year]).map((month) => (
                        <Box key={month}>
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 2, ml: 1, fontWeight: 500 }}>
                            {month}
                          </Typography>

                          <Stack spacing={1.5}>
                            {groupedNotes[year][month].map((note) => (
                              <NoteThreadRow
                                key={note.id}
                                note={note}
                                onClick={setViewingThreadId}
                                user={user}
                                onFavorite={handleToggleFavorite}
                                isViewingSelfAsCoach={isViewingOwnNotes}
                                onPin={handlePinToDashboard}
                              />
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {threadedNotes.map((note) => (
                  <NoteThreadRow
                    key={note.id}
                    note={note}
                    onClick={setViewingThreadId}
                    user={user}
                    onFavorite={handleToggleFavorite}
                    onPin={handlePinToDashboard}
                    isViewingSelfAsCoach={isViewingOwnNotes}
                  />
                ))}
              </Stack>
            )}

            {hasMore && !notesLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  onClick={handleLoadMore}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    borderWidth: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Load More Notes
                </Button>
              </Box>
            )}

            {notesLoading && currentPage > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
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
          paper: { sx: { borderRadius: 3 } },
          transition: { onExited: () => editor?.destroy() },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" component="h2" fontWeight={600}>
            {editingNote ? "Edit Note" : replyingToNote ? "Add Reply" : "Add New Note"}
          </Typography>

          <IconButton
            onClick={handleCloseForm}
            sx={{
              "&:hover": {
                backgroundColor: "error.light",
                color: "white",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {!replyingToNote && (
            <>
              <Box sx={{ mb: 3, mt: 3 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={lessonDate}
                    onChange={(newValue) => setLessonDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Box>
            </>
          )}

          <Box
            sx={{
              "& .ProseMirror p": { margin: 0, lineHeight: 1.6 },
              "& .ProseMirror:focus": { outline: "none" },
              "& .ProseMirror:focus-visible": { outline: "none" },
              "& .ProseMirror h1, & .ProseMirror h2, & .ProseMirror h3, & .ProseMirror h4, & .ProseMirror h5, & .ProseMirror h6": {
                marginTop: "0.75rem",
                marginBottom: "0.25rem",
              },
              "& .ProseMirror ul, & .ProseMirror ol": {
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
                paddingLeft: "1.5rem",
              },
              "& .ProseMirror pre": { marginTop: "0.75rem", marginBottom: "0.75rem" },
              "& .ProseMirror p.is-editor-empty:first-child::before": {
                content: "attr(data-placeholder)",
                float: "left",
                color: "#adb5bd",
                pointerEvents: "none",
                height: 0,
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {replyingToNote ? "Your Reply" : "Notes"}
            </Typography>

            <MenuBar editor={editor} />

            <EditorContent
              editor={editor}
              style={{
                border: "1px solid #e0e0e0",
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                padding: "8px 16px 16px 16px",
                minHeight: "250px",
                maxHeight: "400px",
                overflow: "auto",
                backgroundColor: "white",
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: "2px solid", borderColor: "divider" }}>
          <Button
            onClick={handleCloseForm}
            sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={!noteSubject.trim() || !noteContent.trim()}
            sx={buttonStyles.action}
          >
            {editingNote ? "Update Note" : replyingToNote ? "Post Reply" : "Save Note"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, item: null, type: "" })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteConfirm.type}?`}
        contentText={
          deleteConfirm.type === "reply"
            ? "Are you sure you want to permanently delete this reply? This action cannot be undone."
            : `Are you sure you want to permanently delete the note with the subject "${deleteConfirm.item?.subject}"? This action cannot be undone.`
        }
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
});

export default StudentInteractionsPage;
