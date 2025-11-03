import React from 'react';
import { Box, Fade } from '@mui/material';
import FlippingGolfIcon from './FlippingGolfIcon';

const LoadingScreen = ({ isLoading }) => {
  return (
    <Fade in={isLoading} timeout={300} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: 'white',
        }}
      >
        <FlippingGolfIcon size={80} />
      </Box>
    </Fade>
  );
};

export default LoadingScreen;