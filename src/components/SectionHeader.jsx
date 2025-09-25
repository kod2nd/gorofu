import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader = ({ 
  title, 
  subtitle, 
  step, 
  totalSteps,
  sx = {} 
}) => {
  // Generate step text if step and totalSteps are provided
  const stepText = step && totalSteps 
    ? `Step ${step} of ${totalSteps} • ${subtitle}`
    : subtitle;

  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{ width: 4, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stepText}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SectionHeader;