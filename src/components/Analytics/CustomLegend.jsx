import React from 'react';
import { Box, Typography } from '@mui/material';

const CustomLegend = ({ payload, colors }) => {
  // Define a potential desired order for specific charts like Score Distribution
  const desiredOrder = ['Birdie+', 'Par', 'Bogey', 'Dbl Bogey', 'Triple+'];
  
  // Check if the payload seems to match the desired order keys
  const shouldSort = payload.every(p => desiredOrder.includes(p.value));

  // Sort the payload only if it matches the specific score distribution keys
  const sortedPayload = shouldSort
    ? [...payload].sort((a, b) => desiredOrder.indexOf(a.value) - desiredOrder.indexOf(b.value))
    : payload;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
      {sortedPayload.map((entry, index) => (
      <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box 
          sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: 1,
            backgroundColor: colors ? colors[entry.value] : entry.color 
          }} 
        />
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {entry.value}
        </Typography>
      </Box>
    ))}
    </Box>
  );
};

export default CustomLegend;