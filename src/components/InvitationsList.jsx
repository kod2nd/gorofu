import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ContentCopy as ContentCopyIcon, Check as CheckIcon } from '@mui/icons-material';

const InvitationsList = ({ invitations }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (invitation) => {
    const link = `${window.location.origin}/invite/${invitation.invitation_token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(invitation.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // You could show an error snackbar here if you have one available
    });
  };

  if (invitations.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
        <Typography color="text.secondary">No pending invitations</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {invitations.map((invitation) => (
        <Box key={invitation.id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>{invitation.email}</Typography>
              <Typography color="text.secondary" gutterBottom>Role: {invitation.role}</Typography>
              <Typography variant="body2">Invited by: {invitation.invited_by}</Typography>
              <Typography variant="body2">Expires: {new Date(invitation.expires_at).toLocaleDateString()}</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={copiedId === invitation.id ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={() => handleCopyLink(invitation)}
                disabled={copiedId === invitation.id}
                color={copiedId === invitation.id ? 'success' : 'primary'}
              >
                {copiedId === invitation.id ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button size="small" color="error" disabled>Cancel</Button>
            </CardActions>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

export default InvitationsList;