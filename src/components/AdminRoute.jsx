import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { userService } from '../services/userService';

const AdminRoute = ({ children, requireSuperAdmin = false, ...rest }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [requireSuperAdmin]);

  const checkAccess = async () => {
    try {
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
      
      if (!profile) {
        setHasAccess(false);
        return;
      }

      if (requireSuperAdmin) {
        setHasAccess(profile.role === 'super_admin');
      } else {
        setHasAccess(['admin', 'super_admin'].includes(profile.role));
      }
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {!userProfile 
            ? "Please complete your profile setup to access this area."
            : `Access denied. ${requireSuperAdmin ? 'Super admin' : 'Admin'} privileges required.`
          }
        </Alert>
      </Box>
    );
  }

  return React.cloneElement(children, { ...rest, currentUser: userProfile });
};

export default AdminRoute;