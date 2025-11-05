import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Visibility, ExitToApp } from '@mui/icons-material';

const ImpersonationBanner = ({ impersonatedUser, onExit, activePage }) => {
  if (!impersonatedUser) return null;

  // Define which pages are restricted to admin/super_admin roles
  const adminPages = ['userManagement', 'courseManagement'];
  const isViewingAdminPage = adminPages.includes(activePage);
  
  // Check if the impersonated user would have access to the current page
  const canUserSeePage = !(isViewingAdminPage && !impersonatedUser.roles?.some(r => ['admin', 'super_admin'].includes(r)));

  const bannerMessage = canUserSeePage
    ? `Viewing as ${impersonatedUser.full_name || impersonatedUser.email}`
    : `Viewing as ${impersonatedUser.full_name || impersonatedUser.email} (this page is hidden from them)`;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: canUserSeePage ? 'warning.main' : 'secondary.main',
        color: 'white',
        p: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <Visibility />
      <Typography variant="body2" fontWeight="bold">
        {bannerMessage}
      </Typography>
      <Button size="small" variant="outlined" color="inherit" onClick={onExit} startIcon={<ExitToApp />}>
        Exit View
      </Button>
    </Box>
  );
};

export default ImpersonationBanner;