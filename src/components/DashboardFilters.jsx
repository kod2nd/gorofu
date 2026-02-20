import React from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Tooltip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { elevatedCardStyles } from "../styles/commonStyles";

const DashboardFilters = ({
  roundLimit,
  setRoundLimit,
  showEligibleRoundsOnly,
  setShowEligibleRoundsOnly,
  isFiltering,
}) => {
  const theme = useTheme();

  const selectSx = {
    borderRadius: 3,
    background: alpha(theme.palette.text.primary, 0.02),
    border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
    transition: "all 0.18s ease",
    "&:hover": {
      borderColor: alpha(theme.palette.primary.main, 0.22),
      background: alpha(theme.palette.primary.main, 0.04),
    },
    "& .MuiSelect-select": { py: 1.1 },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" }, // we draw our own border above
  };

  const switchSx = {
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: theme.palette.primary.main,
      "& + .MuiSwitch-track": {
        backgroundColor: alpha(theme.palette.primary.main, 0.55),
      },
    },
    "& .MuiSwitch-track": {
      backgroundColor: alpha(theme.palette.text.primary, 0.25),
    },
  };

  return (
    <Paper
      {...elevatedCardStyles}
      sx={{
        ...elevatedCardStyles.sx,
        p: 2.25,
        borderRadius: 4,
        transition: "all 0.18s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.10)}`,
        },
      }}
    >
      {/* Controls */}
      <Box sx={{ display: "grid", gap: 1.5 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              color: "text.secondary",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Round Filter
          </Typography>

          <FormControl fullWidth size="small">
            <Select
              value={roundLimit}
              onChange={(e) => setRoundLimit(e.target.value)}
              disabled={isFiltering}
              sx={selectSx}
            >
              <MenuItem value={5}>Last 5 Rounds</MenuItem>
              <MenuItem value={10}>Last 10 Rounds</MenuItem>
              <MenuItem value={20}>Last 20 Rounds</MenuItem>
              <MenuItem value={0}>All-Time</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Tooltip title="Only include rounds that meet the eligibility criteria." arrow placement="top">
          <Box
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
              background: alpha(theme.palette.text.primary, 0.02),
              px: 1.25,
              py: 0.75,
              transition: "all 0.18s ease",
              "&:hover": {
                borderColor: alpha(theme.palette.primary.main, 0.22),
                background: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <FormControlLabel
              sx={{
                m: 0,
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                gap: 1,
                "& .MuiFormControlLabel-label": {
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                },
              }}
              control={
                <Switch
                  checked={showEligibleRoundsOnly}
                  onChange={(e) => setShowEligibleRoundsOnly(e.target.checked)}
                  disabled={isFiltering}
                  sx={switchSx}
                />
              }
              label="Eligible rounds only"
              labelPlacement="start"
            />
          </Box>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default DashboardFilters;
