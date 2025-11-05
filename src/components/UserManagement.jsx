import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { userService } from '../services/userService';
import { elevatedCardStyles } from '../styles/commonStyles';
import UsersTable from './UsersTable';
import InvitationsList from './InvitationsList';
import AuditLog from './AuditLog';

const UserManagement = ({ currentUser, isActive, onImpersonate }) => {
  const theme = useTheme();
  
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState({ open: false, user: null });
  const [auditDialog, setAuditDialog] = useState({ open: false, userEmail: '' });

  // Form states
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'user' });
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (isActive) {
      loadData();
    }
  }, [isActive]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, auditData] = await Promise.all([
        userService.getAllUsers(),
        userService.getAuditLogs({}, 50)
      ]);
      
      setUsers(usersData);
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
      // Prepare the update payload, converting empty handicap to null
      const updatePayload = {
        ...editForm,
        handicap: editForm.handicap === '' || isNaN(editForm.handicap) ? null : parseFloat(editForm.handicap),
      };

      await userService.updateUserProfile(
        editUserDialog.user.user_id,
        updatePayload,
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
        return <UsersTable 
          users={users} 
          onEditUser={handleEditUser} 
          onChangeUserStatus={handleChangeUserStatus} 
          onViewAuditLog={handleViewAuditLog}
          onImpersonate={onImpersonate}
          currentUser={currentUser} />;
      default:
        return null;
    }
  }

  return (
    <Box sx={{ 
      width: '100%',
      overflow: 'hidden'
    }}>
      <Paper {...elevatedCardStyles} sx={{ p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="standard"
          allowScrollButtonsMobile
        >
          <Tab label={`Users (${users.length})`} />
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
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={editForm.full_name || ''}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              fullWidth              
            />
            
            <FormControl fullWidth>
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

            <FormControl fullWidth>
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
            />

            <TextField
              label="Handicap"
              type="number"
              value={editForm.handicap || ''}
              onChange={(e) => setEditForm({ ...editForm, handicap: parseFloat(e.target.value) })}              fullWidth
            />

            <TextField
              label="Phone"
              value={editForm.phone || ''}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              fullWidth              
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog 
        open={auditDialog.open} 
        onClose={() => setAuditDialog({ open: false, userEmail: '' })} 
        maxWidth="lg" 
        fullWidth        
      >
        <DialogTitle>
          Audit Log for {auditDialog.userEmail}
        </DialogTitle>
        <DialogContent>
          <AuditLog logs={auditLogs} />
        </DialogContent>
        <DialogActions>
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;