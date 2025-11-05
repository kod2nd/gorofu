import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Fab,
  AppBar,
  Toolbar,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Group as GroupIcon,
  Search,
  Person,
  Phone,
  Close,
  Add,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { elevatedCardStyles } from '../styles/commonStyles';

const CoachManagementPage = ({ currentUser, isActive }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [coaches, setCoaches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [assignedStudentIds, setAssignedStudentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isActive) {
      loadData();
    }
  }, [isActive]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coachesData, usersData] = await Promise.all([
        userService.getUsersByRole('coach'),
        userService.getAllUsers(),
      ]);
      setCoaches(coachesData);
      setAllUsers(usersData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = async (coach) => {
    setSelectedCoach(coach);
    try {
      const students = await userService.getStudentsForCoach(coach.user_id);
      setAssignedStudentIds(students.map(s => s.user_id));
      setEditDialogOpen(true);
    } catch (err) {
      setError('Failed to load students for coach: ' + err.message);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedCoach(null);
    setAssignedStudentIds([]);
  };

  const handleSaveAssignments = async () => {
    if (!selectedCoach) return;
    try {
      await userService.assignStudentsToCoach(selectedCoach.user_id, assignedStudentIds, currentUser.email);
      handleCloseEditDialog();
      // Show success message or refresh data if needed
    } catch (err) {
      setError('Failed to save assignments: ' + err.message);
    }
  };

  // Filter potential students based on search
  const potentialStudents = allUsers.filter(u => 
    u.user_id !== selectedCoach?.user_id && // A coach cannot be their own student
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          m: 2,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <Button color="inherit" size="small" onClick={loadData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: isMobile ? 2 : 3, 
          mb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              fontWeight="bold"
              sx={{ color: 'primary.main' }}
            >
              Coach Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {coaches.length} coach{coaches.length !== 1 ? 'es' : ''} found. Data is refreshed on page load.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Coaches List */}
      {coaches.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Coaches Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no coaches in the system yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {coaches.map((coach) => (
            <Grid item xs={12} sm={6} md={4} key={coach.user_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar
                      sx={{ 
                        width: isMobile ? 40 : 48, 
                        height: isMobile ? 40 : 48,
                        bgcolor: 'primary.main',
                        mr: 2
                      }}
                    >
                      <Person />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        fontWeight="600"
                        noWrap
                      >
                        {coach.full_name || 'Unnamed Coach'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        noWrap
                        sx={{ mt: 0.5 }}
                      >
                        {coach.email}
                      </Typography>
                    </Box>
                  </Box>

                  {coach.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {coach.phone}
                      </Typography>
                    </Box>
                  )}

                  <Chip
                    label="Coach"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
                <CardActions sx={{ p: isMobile ? 2 : 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditDialog(coach)}
                    size={isMobile ? "small" : "medium"}
                  >
                    Manage Students
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Assignments Dialog - Responsive */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog} 
        fullWidth 
        maxWidth="sm"
        fullScreen={isSmallMobile}
        PaperProps={{
          sx: {
            m: isSmallMobile ? 0 : 2,
            height: isSmallMobile ? '100%' : 'auto',
            maxHeight: isSmallMobile ? '100%' : '80vh'
          }
        }}
      >
        {isSmallMobile && (
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleCloseEditDialog}
                aria-label="close"
              >
                <Close />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
                Manage Students
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {!isSmallMobile && (
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon color="primary" />
              Manage Students for {selectedCoach?.full_name}
            </Box>
          </DialogTitle>
        )}

        <DialogContent sx={{ p: isSmallMobile ? 2 : 3 }}>
          {/* Search for students on mobile */}
          {isMobile && (
            <TextField
              fullWidth
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              size="small"
            />
          )}

          <FormControl fullWidth>
            <InputLabel shrink={assignedStudentIds.length > 0}>
              Assign Students
            </InputLabel>
            <Select
              multiple
              value={assignedStudentIds}
              onChange={(e) => setAssignedStudentIds(e.target.value)}
              input={<OutlinedInput label="Assign Students" notched />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((userId) => {
                    const user = allUsers.find(u => u.user_id === userId);
                    return (
                      <Chip 
                        key={userId} 
                        label={user?.full_name || 'Unknown'} 
                        size="small"
                        onDelete={() => {
                          setAssignedStudentIds(prev => 
                            prev.filter(id => id !== userId)
                          );
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300
                  }
                }
              }}
            >
              {potentialStudents.length === 0 ? (
                <MenuItem disabled>
                  No students found
                </MenuItem>
              ) : (
                potentialStudents.map((student) => (
                  <MenuItem key={student.user_id} value={student.user_id}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {student.full_name || 'Unnamed Student'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {assignedStudentIds.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {assignedStudentIds.length} student{assignedStudentIds.length !== 1 ? 's' : ''} selected
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: isSmallMobile ? 2 : 3,
          flexDirection: isSmallMobile ? 'column' : 'row',
          gap: 1
        }}>
          {isSmallMobile ? (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveAssignments}
                size="large"
              >
                Save Assignments
              </Button>
              <Button
                fullWidth
                onClick={handleCloseEditDialog}
                size="large"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCloseEditDialog}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveAssignments}
              >
                Save Assignments
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoachManagementPage;