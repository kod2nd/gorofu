import React from 'react';
import { Box } from '@mui/material';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';

const FlippingGolfIcon = ({ size = 64 }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        p: 4,
        '@keyframes flip': {
          '0%': {
            transform: 'perspective(120px) rotateY(0deg)',
          },
          '50%': {
            transform: 'perspective(120px) rotateY(180deg)',
          },
          '100%': {
            transform: 'perspective(120px) rotateY(360deg)',
          },
        },
      }}
    >
      <SportsGolfIcon
        sx={{ fontSize: size, animation: 'flip 2s linear infinite' }}
      />
    </Box>
  );
};

export default FlippingGolfIcon;