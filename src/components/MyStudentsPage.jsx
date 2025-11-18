import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon, Person as PersonIcon } from '@mui/icons-material';
import { userService } from '../services/userService';
import { elevatedCardStyles } from '../styles/commonStyles';

const toProperCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const MyStudentsPage = ({ currentUser, onImpersonate, isActive }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Refs to prevent re-fetching data unnecessarily on tab switches
  const hasFetched = useRef(false);
  const lastFetchedUserId = useRef(null);

  useEffect(() => {
    // Only fetch if the page is active and the user has changed, or it's the first load.
    if (isActive && currentUser && (!hasFetched.current || lastFetchedUserId.current !== currentUser.user_id)) {
      loadStudents();
    }
  }, [currentUser, isActive]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await userService.getStudentsForCoach(currentUser.user_id);
      setStudents(studentsData);
      // Mark that we've fetched data for this user
      hasFetched.current = true;
      lastFetchedUserId.current = currentUser.user_id;
    } catch (err) {
      setError('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper {...elevatedCardStyles}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          My Students
        </Typography>
      </Box>
      {students.length === 0 ? (
        <Typography color="text.secondary">You have no students assigned.</Typography>
      ) : (
        <List>
          {students.map((student) => (
            <React.Fragment key={student.user_id}>
              <ListItem
                secondaryAction={
                  <Tooltip title="View as Student">
                    <IconButton
                      edge="end"
                      aria-label="view-as-student"
                      onClick={() => onImpersonate(student)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={toProperCase(student.full_name) || 'N/A'}
                  secondary={student.email}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MyStudentsPage;