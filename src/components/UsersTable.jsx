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
  Card,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {  
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon,
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
    case 'coach': return 'info';
    case 'user': return 'primary';
    default: return 'default';
  }
};

const roleOrder = {
  'super_admin': 1,
  'admin': 2,
  'coach': 3,
  'user': 4,
};

const toProperCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const UsersTable = ({ users, onEditUser, onChangeUserStatus, onViewAuditLog, onImpersonate, currentUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {users.map((user) => {
          const sortedRoles = user.roles?.slice().sort((a, b) => (roleOrder[a] || 99) - (roleOrder[b] || 99));
          return (
          <Card key={user.id} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {toProperCase(user.full_name) || 'N/A'}
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
                {currentUser?.roles?.includes('super_admin') && user.user_id !== currentUser.user_id && (
                      <Tooltip title="View as User"> 
                        <IconButton size="small" color="secondary" onClick={() => onImpersonate(user)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 4px)' }}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                {sortedRoles?.map(role => (
                  <Chip key={role} label={role} color={getRoleColor(role)} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 4px)' }}><Typography variant="body2" color="text.secondary">Status</Typography><Chip label={user.status} color={getStatusColor(user.status)} size="small" /></Box>
              <Box sx={{ flex: '1 1 calc(50% - 4px)' }}><Typography variant="body2" color="text.secondary">Country</Typography><Typography variant="body2">{user.country}</Typography></Box>
              <Box sx={{ flex: '1 1 calc(50% - 4px)' }}><Typography variant="body2" color="text.secondary">Handicap</Typography><Typography variant="body2">{user.handicap || 'N/A'}</Typography></Box>
              <Box sx={{ flex: '1 1 100%' }}><Typography variant="body2" color="text.secondary">Created</Typography><Typography variant="body2">{new Date(user.created_at).toLocaleDateString()}</Typography></Box>
            </Box>

            <Button size="small" startIcon={<HistoryIcon />} onClick={() => onViewAuditLog(user.email)} fullWidth>
              View Audit Log
            </Button>
          </Card>
          );
        })}
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
              <TableRow key={user.id} hover>
                <TableCell>{toProperCase(user.full_name) || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {/* Sort roles by importance before mapping */}
                    {user.roles?.slice().sort((a, b) => (roleOrder[a] || 99) - (roleOrder[b] || 99)).map(role => (
                      <Chip key={role} label={role} color={getRoleColor(role)} size="small" />
                    ))}
                  </Box>
                </TableCell>
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
                    {currentUser?.roles?.includes('super_admin') && user.user_id !== currentUser.user_id && (
                      <Tooltip title="View as User">
                        <IconButton size="small" color="secondary" onClick={() => onImpersonate(user)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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