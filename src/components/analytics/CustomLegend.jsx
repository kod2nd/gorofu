import React from 'react';
import { Box, Typography } from '@mui/material';

const CustomLegend = ({ payload, colors }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 3,
        mt: 2,
        flexWrap: "wrap",
      }}
    >
      {payload.map((entry, index) => (
        <Box
          key={`legend-${entry.dataKey || entry.value}-${index}`} // Use dataKey + index for unique key
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 1,
              backgroundColor: colors ? colors[entry.dataKey || entry.value] : entry.color,
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