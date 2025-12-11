import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry, index) => (
        <Box key={`tooltip-${entry.dataKey}-${index}`} sx={{ display: "flex", alignItems: "center", gap: 1 }}> {/* Add unique key */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: entry.color,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {entry.name}:
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {typeof entry.value === "number"
              ? entry.value.toFixed(2)
              : entry.value}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default CustomTooltip;