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
  Card,
  useTheme,
  useMediaQuery
} from '@mui/material';

const AuditLog = ({ logs }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box sx={{ mt: 2 }}>
        {logs.map((log) => (
          <Card key={log.id} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Chip label={log.action} size="small" />
              <Typography variant="caption" color="text.secondary">
                {new Date(log.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Target:</strong> {log.target_user_email}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>By:</strong> {log.performed_by}
            </Typography>
            {log.notes && (
              <Typography variant="body2">
                <strong>Notes:</strong> {log.notes}
              </Typography>
            )}
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
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Target User</TableCell>
              <TableCell>Performed By</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell><Chip label={log.action} size="small" /></TableCell>
                <TableCell>{log.target_user_email}</TableCell>
                <TableCell>{log.performed_by}</TableCell>
                <TableCell>{log.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditLog;