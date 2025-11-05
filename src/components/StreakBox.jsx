import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

const szirTiers = [
  { name: 'Platinum', min: 72, bgColor: 'linear-gradient(135deg, #e5e4e2, #b8b8b8)', borderColor: '#c0c0c0', textColor: '#212121' },
  { name: 'Gold', min: 45, bgColor: 'linear-gradient(135deg, #ffd700, #d4af37)', borderColor: '#b8860b', textColor: '#212121' },
  { name: 'Silver', min: 30, bgColor: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)', borderColor: '#808080', textColor: '#212121' },
  { name: 'Bronze', min: 15, bgColor: 'linear-gradient(135deg, #cd7f32, #8b4513)', borderColor: '#654321', textColor: 'white' },
];

const szParTiers = [
  { name: 'Platinum', min: 36, bgColor: 'linear-gradient(135deg, #e5e4e2, #b8b8b8)', borderColor: '#c0c0c0', textColor: '#212121' },
  { name: 'Gold', min: 18, bgColor: 'linear-gradient(135deg, #ffd700, #d4af37)', borderColor: '#b8860b', textColor: '#212121' },
  { name: 'Silver', min: 10, bgColor: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)', borderColor: '#808080', textColor: '#212121' },
  { name: 'Bronze', min: 5, bgColor: 'linear-gradient(135deg, #cd7f32, #8b4513)', borderColor: '#654321', textColor: 'white' },
];

const tierConfigs = {
  szir: szirTiers,
  szpar: szParTiers,
};

const getStreakTier = (streak, tiers) => {
  const foundTier = tiers.find(t => streak >= t.min);
  return (
    foundTier || {
      name: 'Rookie',
      bgColor: 'linear-gradient(135deg, #6b7280, #4b5563)',
      borderColor: '#374151',
      textColor: 'white',
    }
  );
};

const StreakBox = ({ streak, type = 'szir', size = 'medium' }) => {
  const tiers = tierConfigs[type] || [];
  const tier = getStreakTier(streak, tiers);
  const iconSize = size === 'small' ? 24 : 32;

  return (
    <Tooltip title={`${tier.name} Tier`} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant={size === 'small' ? 'h6' : 'h4'} 
          fontWeight="bold" 
          color="primary.main"
        >
          {streak}
        </Typography>
        <EmojiEvents sx={{ color: tier.borderColor, fontSize: iconSize }} />
      </Box>
    </Tooltip>
  );
};

export default StreakBox;
