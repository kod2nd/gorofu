import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';

const InvitationsList = ({ invitations }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (invitations.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
        <Typography color="text.secondary">No pending invitations</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {invitations.map((invitation) => (
          <Grid item xs={12} sm={6} key={invitation.id}>
            <Card>
              <CardContent>
                <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>{invitation.email}</Typography>
                <Typography color="text.secondary" gutterBottom>Role: {invitation.role}</Typography>
                <Typography variant="body2">Invited by: {invitation.invited_by}</Typography>
                <Typography variant="body2">Expires: {new Date(invitation.expires_at).toLocaleDateString()}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<EmailIcon />}>Resend</Button>
                <Button size="small" color="error">Cancel</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InvitationsList;