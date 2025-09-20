// This file centralizes all data definitions and styling objects for the HoleDetailsForm component,
// making the main component cleaner and more focused on its logic.
import theme from '../theme';

// statDefinitions: Defines the structure and properties of each golf statistic.
// This data is used to dynamically render the rows and form inputs in the scorecard tables.
export const statDefinitions = {
  traditional: [
    {
      label: "Par",
      name: "par",
      type: "text",
      inputMode: "numeric",
      pattern: "[2-7]",
      tooltip: "The standard number of strokes for a given hole.",
    },
    {
      label: "Dist.",
      name: "Distance",
      type: "text",
      inputMode: "numeric",
      pattern: "([1-9][0-9]{0,2})",
      tooltip:
        "The total distance of the hole in yards or meters. Yards and meters are configured in section 1 Course Details.",
    },
    {
      label: "Score",
      name: "hole_score",
      type: "text",
      inputMode: "numeric",
      pattern: "([1-9]|1[0-9]|20)",
      tooltip: "The number of strokes taken on the hole.",
    },
  ],
  longGame: [
    {
      label: "S.Z. Reg",
      name: "scoring_zone_in_regulation",
      type: "switch",
      tooltip:
        'Did the player hit the green or within a designated "scoring zone" in regulation? Tap the tick for yes, cross for no.',
    },
  ],
  shortGame: [
    {
      label: "Hole Out < 3 Shots S.Z.",
      name: "holeout_within_3_shots_scoring_zone",
      type: "switch",
      tooltip:
        "Did the player hole out within 3 shots while inside the scoring zone?",
    },
    {
      label: "Putts",
      name: "putts",
      type: "text",
      inputMode: "numeric",
      pattern: "(0|[1-9]|1[0-9]|20)",
      tooltip: "The total number of putts on the green.",
    },
    {
      label: "Putts < 4ft",
      name: "putts_within4ft",
      type: "text",
      inputMode: "numeric",
      pattern: "(0|[1-9]|1[0-9]|20)",
      tooltip: "The number of putts made from within 4 feet of the hole.",
    },
    {
      label: "Hole Out > 4ft",
      name: "holeout_from_outside_4ft",
      type: "checkbox",
      tooltip:
        "Did the player successfully hole out from a distance greater than 4 feet?",
    },
  ],
};

// tableStyles: Contains a unified color palette and sizing for the scorecard tables.
export const tableStyles = {
  headerBg: "rgba(38, 70, 83, 1)",
  headerColor: "rgba(255, 255, 255, 1)",
  statLabelBg: "rgba(253, 251, 231, 1)",
  statLabelHoverBg: "rgba(230, 228, 217, 1)",
  totalColumnBg: "rgba(238, 241, 246, 1)",
  focusedCellBg: "rgba(0, 0, 0, 0.05)",
  rowHeaderMinWidth: 120,
  cellMinWidth: 60,
  cellPadding: 0.5,
};

// textFieldStyles: Defines the styles for the text input fields, including removing the default border
// and adding visual feedback on hover and focus.
export const textFieldStyles = {
  textAlign: "center",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0, 0, 0, 0.23)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.75rem", // Corrected font size for text input
    },
  },
};

// statCellBaseStyles: Provides foundational styles for table cells that display statistics,
// ensuring consistent padding and text alignment.
export const statCellBaseStyles = {
  position: "relative",
  overflow: "hidden",
  textAlign: "center",
  padding: "8px",
  "& .stat-label": {
    display: "block",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "0.75rem",
  },
  "& .hole-label": {
    display: "block",
    fontWeight: "bold",
    textAlign: "right",
    fontSize: "0.75rem",
  },
};

// statLabelCellStyles: Combines base styles with specific styles for the row header cells that
// contain the statistic labels, adding a pointer cursor and hover effects.
export const statLabelCellStyles = {
  minWidth: tableStyles.rowHeaderMinWidth,
  backgroundColor: tableStyles.statLabelBg,
  fontSize: "0.75rem",
  marginLeft: "6px",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: tableStyles.statLabelHoverBg,
    fontWeight: "bold",
  },
};

// Styles for bold text.
export const boldTextStyles = {
  fontWeight: "bold",
};

// New styles for the table header cells, making them consistent and easy to update.
export const tableHeaderCellStyles = {
  ...boldTextStyles,
  backgroundColor: tableStyles.headerBg,
  color: tableStyles.headerColor,
};

// New styles for the game type stats (traditional stats, Long game, short game) header rows.
export const gameTypeHeaderStyles = {
  backgroundColor: "action.hover",
  ...boldTextStyles,
};
// Styles for the faint vertical lines between cells.
export const cellDividerStyles = {
  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
};

// Styles for the switch component
export const switchStyles = {
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: theme.palette.custom.pastelGreen,
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: theme.palette.custom.pastelGreen,
  },
};

// Styles for the red switch component when a relevant stat is not checked.
export const redSwitchStyles = {
  '& .MuiSwitch-track': {
    backgroundColor: '#ffb3ba !important',
    opacity: '1 !important',
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: 'rgba(255, 255, 255, 0.8) !important',
  },
};

export const invalidInputPulseStyles = {
  animation: 'pulse 0.5s ease-in-out',
  '@keyframes pulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)' },
    '70%': { boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)' },
  },
};
