import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
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
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions
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
import { cardStyles, elevatedCardStyles } from '../styles/commonStyles';

const UserManagement = ({ currentUser }) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const UsersTab = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Country</TableCell>
            <TableCell>Handicap</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.role} 
                  color={getRoleColor(user.role)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.status} 
                  color={getStatusColor(user.status)} 
                  size="small" 
                />
              </TableCell>
              <TableCell>{user.country}</TableCell>
              <TableCell>{user.handicap || 'N/A'}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit User">
                    <IconButton size="small" onClick={() => handleEditUser(user)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {user.status === 'active' ? (
                    <Tooltip title="Suspend User">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleChangeUserStatus(user.user_id, 'suspended')}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Activate User">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleChangeUserStatus(user.user_id, 'active')}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="View Audit Log">
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewAuditLog(user.email)}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const InvitationsTab = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {invitations.map((invitation) => (
          <Grid item xs={12} md={6} lg={4} key={invitation.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {invitation.email}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Role: {invitation.role}
                </Typography>
                <Typography variant="body2">
                  Invited by: {invitation.invited_by}
                </Typography>
                <Typography variant="body2">
                  Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EmailIcon />}>
                  Resend
                </Button>
                <Button size="small" color="error">
                  Cancel
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {invitations.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <Typography color="text.secondary">
            No pending invitations
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const AuditTab = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Target User</TableCell>
            <TableCell>Performed By</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {auditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Chip label={log.action} size="small" />
              </TableCell>
              <TableCell>{log.target_user_email}</TableCell>
              <TableCell>{log.performed_by}</TableCell>
              <TableCell>{log.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Paper {...elevatedCardStyles}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setInviteUserDialog({ open: true })}
          >
            Invite User
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Invitations (${invitations.length})`} />
          <Tab label="Audit Log" />
        </Tabs>

        {tabValue === 0 && <UsersTab />}
        {tabValue === 1 && <InvitationsTab />}
        {tabValue === 2 && <AuditTab />}
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog.open} onClose={() => setEditUserDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
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
              onChange={(e) => setEditForm({ ...editForm, handicap: parseFloat(e.target.value) })}
              fullWidth
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

      {/* Invite User Dialog */}
      <Dialog open={inviteUserDialog.open} onClose={() => setInviteUserDialog({ open: false })} maxWidth="sm" fullWidth>
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
            />
            
            <FormControl fullWidth>
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
        <DialogActions>
          <Button onClick={() => setInviteUserDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleSendInvitation} variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;