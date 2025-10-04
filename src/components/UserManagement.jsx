import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { elevatedCardStyles } from '../styles/commonStyles';
import UsersTable from './UsersTable';
import InvitationsList from './InvitationsList';
import AuditLog from './AuditLog';

const UserManagement = ({ currentUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState({ open: false, user: null });
  const [inviteUserDialog, setInviteUserDialog] = useState({ open: false });
  const [auditDialog, setAuditDialog] = useState({ open: false, userEmail: '' });

  // Form states
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'user' });
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, invitationsData, auditData] = await Promise.all([
        userService.getAllUsers(),
        userService.getPendingInvitations(),
        userService.getAuditLogs({}, 50)
      ]);
      
      setUsers(usersData);
      setInvitations(invitationsData);
      setAuditLogs(auditData);
    } catch (error) {
      showSnackbar('Failed to load data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEditUser = (user) => {
    setEditForm({
      full_name: user.full_name || '',
      role: user.role,
      status: user.status,
      country: user.country || 'Singapore',
      handicap: user.handicap || '',
      phone: user.phone || ''
    });
    setEditUserDialog({ open: true, user });
  };

  const handleSaveUser = async () => {
    try {
      await userService.updateUserProfile(
        editUserDialog.user.user_id,
        editForm,
        currentUser.email
      );
      showSnackbar('User updated successfully');
      setEditUserDialog({ open: false, user: null });
      loadData();
    } catch (error) {
      showSnackbar('Failed to update user: ' + error.message, 'error');
    }
  };

  const handleChangeUserStatus = async (userId, newStatus) => {
    try {
      await userService.changeUserStatus(userId, newStatus, currentUser.email);
      showSnackbar(`User ${newStatus} successfully`);
      loadData();
    } catch (error) {
      showSnackbar('Failed to change user status: ' + error.message, 'error');
    }
  };

  const handleSendInvitation = async () => {
    try {
      const invitation = await userService.sendInvitation(
        inviteForm.email,
        inviteForm.role,
        currentUser.email
      );
      showSnackbar(`Invitation sent to ${inviteForm.email}`);
      setInviteUserDialog({ open: false });
      setInviteForm({ email: '', role: 'user' });
      loadData();
      
      // Show invitation link (in production, this would be sent via email)
      console.log('Invitation link:', invitation.invitation_link);
    } catch (error) {
      showSnackbar('Failed to send invitation: ' + error.message, 'error');
    }
  };

  const handleViewAuditLog = async (userEmail) => {
    try {
      const logs = await userService.getAuditLogs({ target_user_email: userEmail });
      setAuditLogs(logs);
      setAuditDialog({ open: true, userEmail });
    } catch (error) {
      showSnackbar('Failed to load audit logs: ' + error.message, 'error');
    }
  };

  const renderTabContent = () => {
    switch (tabValue) {
      case 0:
        return <UsersTable users={users} onEditUser={handleEditUser} onChangeUserStatus={handleChangeUserStatus} onViewAuditLog={handleViewAuditLog} />;
      case 1:
        return <InvitationsList invitations={invitations} />;
      case 2:
        return <AuditLog logs={auditLogs} />;
      default:
        return null;
    }
  }

  return (
    <Box sx={{ 
      width: '100%',
      overflow: 'hidden',
      px: isMobile ? 1 : 0
    }}>
      <Paper {...elevatedCardStyles} sx={{ 
        p: isMobile ? 2 : 3,
        mx: isMobile ? 0 : 'auto',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 3,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 'bold' }}>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteUserDialog({ open: true })}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Invite User
          </Button>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
        >
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Invitations (${invitations.length})`} />
          <Tab label="Audit Log" />
        </Tabs>
        {renderTabContent()}
      </Paper>

      {/* Edit User Dialog */}
      <Dialog 
        open={editUserDialog.open} 
        onClose={() => setEditUserDialog({ open: false, user: null })} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={editForm.full_name || ''}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
            
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role || 'user'}
                label="Role"
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status || 'pending'}
                label="Status"
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Country"
              value={editForm.country || ''}
              onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              label="Handicap"
              type="number"
              value={editForm.handicap || ''}
              onChange={(e) => setEditForm({ ...editForm, handicap: parseFloat(e.target.value) })}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              label="Phone"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              fullWidth
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1 }}>
          <Button onClick={() => setEditUserDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog 
        open={inviteUserDialog.open} 
        onClose={() => setInviteUserDialog({ open: false })} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Invite New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              fullWidth
              required
              size={isMobile ? "small" : "medium"}
            />
            
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.role}
                label="Role"
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1 }}>
          <Button onClick={() => setInviteUserDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleSendInvitation} variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog 
        open={auditDialog.open} 
        onClose={() => setAuditDialog({ open: false, userEmail: '' })} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Audit Log for {auditDialog.userEmail}
        </DialogTitle>
        <DialogContent>
          <AuditLog logs={auditLogs} />
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1 }}>
          <Button onClick={() => setAuditDialog({ open: false, userEmail: '' })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ 
          vertical: isMobile ? 'top' : 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ 
            width: '100%',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;