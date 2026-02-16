import React from "react";
import { Box, Typography, Slider } from "@mui/material";

const ScoringBiasSlider = ({ currentScoringBias, handleBiasChange }) => {
  const marks = [
    { value: 0, label: "Par" },
    { value: 1, label: "Bogey (Par +1)" },
    { value: 2, label: "Dbl Bogey (Par +2)" },
  ];

  return (
    <Box sx={{mb: 2 }}>
      <Typography
        variant="subtitle2"
        fontSize={"0.75rem"}
        fontWeight="600"
        color="text.primary"
        sx={{ mb: 2 }}
      >
        Score Bias
      </Typography>
      <Slider
        value={currentScoringBias}
        onChange={handleBiasChange}
        step={1}
        marks={marks}
        min={0}
        max={2}
        valueLabelDisplay="off"
        sx={{
          color: "primary.main",
          height: 4,
          "& .MuiSlider-mark": {
            display: "none",
          },
          "& .MuiSlider-markLabel": {
            fontSize: "0.75rem  ",
            fontWeight: 500,
            color: "text.secondary",
            mt: 1,
            // Adjust label positions
            '&[data-index="0"]': { transform: "translateX(0%)" },
            '&[data-index="1"]': { transform: "translateX(-50%)" },
            '&[data-index="2"]': { transform: "translateX(-100%)" },
          },
          "& .MuiSlider-thumb": {
            width: 20,
            height: 20,
            backgroundColor: "white",
            border: "2px solid currentColor",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(25, 118, 210, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            border: "none",
          },
          "& .MuiSlider-rail": {
            opacity: 0.3,
          },
        }}
      />
    </Box>
  );
};

export default ScoringBiasSlider;
