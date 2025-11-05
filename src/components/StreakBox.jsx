import React from 'react';
import { Box, Typography } from '@mui/material';

const szirTiers = [
  { name: 'Platinum', min: 72, bgColor: 'linear-gradient(135deg, #E5E4E2 0%, #B8B8B8 50%, #E5E4E2 100%)', borderColor: '#C0C0C0', textColor: '#333', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' },
  { name: 'Gold', min: 45, bgColor: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #FFD700 100%)', borderColor: '#B8860B', textColor: '#333', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)' },
  { name: 'Silver', min: 30, bgColor: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #C0C0C0 100%)', borderColor: '#808080', textColor: '#333', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' },
  { name: 'Bronze', min: 15, bgColor: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 50%, #CD7F32 100%)', borderColor: '#654321', textColor: 'white', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' },
];

const szParTiers = [
  { name: 'Platinum', min: 36, bgColor: 'linear-gradient(135deg, #E5E4E2 0%, #B8B8B8 50%, #E5E4E2 100%)', borderColor: '#C0C0C0', textColor: '#333', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' },
  { name: 'Gold', min: 18, bgColor: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #FFD700 100%)', borderColor: '#B8860B', textColor: '#333', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)' },
  { name: 'Silver', min: 10, bgColor: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #C0C0C0 100%)', borderColor: '#808080', textColor: '#333', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' },
  { name: 'Bronze', min: 5, bgColor: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 50%, #CD7F32 100%)', borderColor: '#654321', textColor: 'white', shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' },
];

const tierConfigs = {
  szir: szirTiers,
  szpar: szParTiers,
};

const getStreakTier = (streak, tiers) => {
  const foundTier = tiers.find(t => streak >= t.min);
  return foundTier || { 
    name: 'Rookie', 
    bgColor: 'linear-gradient(135deg, #6B7280 0%, #4B5563 50%, #6B7280 100%)', 
    borderColor: '#374151',
    textColor: 'white',
    shine: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
  };
};

const StreakBox = ({ streak, type = 'szir' }) => {
  const tiers = tierConfigs[type] || [];
  const tier = getStreakTier(streak, tiers);

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: '140px', // Set a max-width to prevent it from becoming too large
      aspectRatio: '140 / 160', // Maintain the overall shape
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Ribbon */}
      <Box sx={{
        position: 'absolute',
        top: '-5%', // Use percentages for positioning
        width: '100%',
        height: '12.5%', // 20px is 12.5% of 160px
        background: tier.borderColor,
        borderRadius: '10px 10px 0 0',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          width: '12.5%',
          height: '100%',
          background: tier.borderColor,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        },
        '&::before': { left: '-6.25%' }, // Adjust based on percentage
        '&::after': { right: '-6.25%', transform: 'scaleX(-1)' },
      }} />
      
      {/* Medal Body */}
      <Box sx={{ 
        width: '85%', // 120px is ~85% of 140px
        aspectRatio: '1 / 1', // Ensure it's always a circle
        background: tier.bgColor,
        border: `4px solid ${tier.borderColor}`,
        borderRadius: '50%',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 2px 0 rgba(255, 255, 255, 0.4),
          inset 0 -6px 12px rgba(0, 0, 0, 0.2)
        `,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        mt: '12.5%', // 20px is 12.5% of 160px
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '10%',
          right: '10%',
          bottom: '10%',
          border: `2px solid rgba(255,255,255,0.2)`,
          borderRadius: '50%',
        }
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 'bold', 
            color: tier.textColor,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            zIndex: 1,
            fontSize: 'clamp(1.5rem, 15vw, 2.2rem)', // Responsive font size
          }}
        >
          {streak}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold', 
            color: tier.textColor,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            zIndex: 1
          }}
        >
          {tier.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default StreakBox;