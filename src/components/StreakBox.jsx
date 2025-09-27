import React from 'react';
import { Box, Typography } from '@mui/material';

const szirTiers = [
  { name: 'Platinum', min: 72, bgColor: '#E5E4E2', textColor: '#333' },
  { name: 'Gold', min: 45, bgColor: '#FFD700', textColor: '#333' },
  { name: 'Silver', min: 30, bgColor: '#C0C0C0', textColor: '#333' },
  { name: 'Bronze', min: 15, bgColor: '#CD7F32', textColor: 'white' },
];

const szParTiers = [
  { name: 'Platinum', min: 36, bgColor: '#E5E4E2', textColor: '#333' },
  { name: 'Gold', min: 18, bgColor: '#FFD700', textColor: '#333' },
  { name: 'Silver', min: 10, bgColor: '#C0C0C0', textColor: '#333' },
  { name: 'Bronze', min: 5, bgColor: '#CD7F32', textColor: 'white' },
];

const tierConfigs = {
  szir: szirTiers,
  szpar: szParTiers,
};

const getStreakTier = (streak, tiers) => {
  const foundTier = tiers.find(t => streak >= t.min);
  return foundTier || { name: '', bgColor: 'action.hover', textColor: 'primary.main' };
};

const StreakBox = ({ streak, type = 'szir' }) => {
  const tiers = tierConfigs[type] || [];
  const tier = getStreakTier(streak, tiers);
  return (
    <Box sx={{ 
          width: '140px',
          height: '140px',
          backgroundColor: tier.bgColor,
          border: `5px solid ${tier.bgColor === 'action.hover' ? 'rgba(0,0,0,0.1)' : tier.bgColor}`,
          borderRadius: '15px',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)',
          flexDirection: 'column',
          display: 'flex',
          position: 'relative', 
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 30,
    }}>
      <Typography variant="h2" sx={{ fontWeight: 'bold', color: tier.textColor }}>{streak}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: tier.textColor, opacity: 0.8, textTransform: 'uppercase' }}>{tier.name}</Typography>
    </Box>
  );
};

export default StreakBox;