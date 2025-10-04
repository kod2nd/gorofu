import React from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon
} from '@mui/icons-material';

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

const UsersTable = ({ users, onEditUser, onChangeUserStatus, onViewAuditLog }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {users.map((user) => (
          <Card key={user.id} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {user.full_name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit User">
                  <IconButton size="small" onClick={() => onEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                {user.status === 'active' ? (
                  <Tooltip title="Suspend User">
                    <IconButton size="small" color="error" onClick={() => onChangeUserStatus(user.user_id, 'suspended')}>
                      <BlockIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Activate User">
                    <IconButton size="small" color="success" onClick={() => onChangeUserStatus(user.user_id, 'active')}>
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Role</Typography><Chip label={user.role} color={getRoleColor(user.role)} size="small" /></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Status</Typography><Chip label={user.status} color={getStatusColor(user.status)} size="small" /></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Country</Typography><Typography variant="body2">{user.country}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Handicap</Typography><Typography variant="body2">{user.handicap || 'N/A'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">Created</Typography><Typography variant="body2">{new Date(user.created_at).toLocaleDateString()}</Typography></Grid>
            </Grid>

            <Button size="small" startIcon={<HistoryIcon />} onClick={() => onViewAuditLog(user.email)} fullWidth>
              View Audit Log
            </Button>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', overflow: 'auto', mt: 2 }}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
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
                <TableCell><Chip label={user.role} color={getRoleColor(user.role)} size="small" /></TableCell>
                <TableCell><Chip label={user.status} color={getStatusColor(user.status)} size="small" /></TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>{user.handicap || 'N/A'}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit User">
                      <IconButton size="small" onClick={() => onEditUser(user)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {user.status === 'active' ? (
                      <Tooltip title="Suspend User">
                        <IconButton size="small" color="error" onClick={() => onChangeUserStatus(user.user_id, 'suspended')}>
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Activate User">
                        <IconButton size="small" color="success" onClick={() => onChangeUserStatus(user.user_id, 'active')}>
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View Audit Log">
                      <IconButton size="small" onClick={() => onViewAuditLog(user.email)}>
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
    </Box>
  );
};

export default UsersTable;