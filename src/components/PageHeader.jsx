import React from 'react';
import { Paper, Typography, Box, Stack } from '@mui/material';

const PageHeader = ({ title, subtitle, actions, icon }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 3 }}
        alignItems="center"
        justifyContent="space-between"
      >
        {icon && (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {React.cloneElement(icon, { sx: { fontSize: 40, color: 'rgba(255,255,255,0.8)' } })}
          </Box>
        )}
        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default PageHeader;