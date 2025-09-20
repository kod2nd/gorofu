// This file centralizes all data definitions and styling objects for the HoleDetailsForm component,
// making the main component cleaner and more focused on its logic.

// statDefinitions: Defines the structure and properties of each golf statistic.
// This data is used to dynamically render the rows and form inputs in the scorecard tables.
export const statDefinitions = {
  traditional: [
    { label: 'Par', name: 'par', type: 'number', tooltip: 'The standard number of strokes for a given hole.' },
    { label: 'Yds/Mtrs', name: 'yards_or_meters', type: 'number', tooltip: 'The total distance of the hole in yards or meters.' },
    { label: 'Score', name: 'hole_score', type: 'number', tooltip: 'The number of strokes taken on the hole.' },
  ],
  longGame: [
    { label: 'S.Z. Reg', name: 'scoring_zone_in_regulation', type: 'checkbox', tooltip: 'Did the player hit the green or within a designated "scoring zone" in regulation?' },
  ],
  shortGame: [
    { label: 'Putts', name: 'putts', type: 'number', tooltip: 'The total number of putts on the green.' },
    { label: 'Putts < 4ft', name: 'putts_within4ft', type: 'number', tooltip: 'The number of putts made from within 4 feet of the hole.' },
    { label: 'Holeout > 4ft', name: 'holeout_from_outside_4ft', type: 'checkbox', tooltip: 'Did the player successfully hole out from a distance greater than 4 feet?' },
  ],
};

// tableStyles: Contains a unified color palette and sizing for the scorecard tables.
export const tableStyles = {
  headerBg: 'rgba(38, 70, 83, 1)',
  headerColor: 'rgba(255, 255, 255, 1)',
  statLabelBg: 'rgba(253, 251, 231, 1)',
  statLabelHoverBg: 'rgba(230, 228, 217, 1)',
  totalColumnBg: 'rgba(238, 241, 246, 1)',
  focusedCellBg: 'rgba(0, 0, 0, 0.05)',
  rowHeaderMinWidth: 120,
  cellMinWidth: 60,
  cellPadding: 0.5,
};

// textFieldStyles: Defines the styles for the text input fields, including removing the default border
// and adding visual feedback on hover and focus.
export const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
};

// statCellBaseStyles: Provides foundational styles for table cells that display statistics,
// ensuring consistent padding and text alignment.
export const statCellBaseStyles = {
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'center',
  padding: '8px',
  '& .stat-label': {
    display: 'block',
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: '0.75rem',
  },
  '& .hole-label': {
    display: 'block',
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: '0.75rem',
  },
};

// statLabelCellStyles: Combines base styles with specific styles for the row header cells that
// contain the statistic labels, adding a pointer cursor and hover effects.
export const statLabelCellStyles = {
  minWidth: tableStyles.rowHeaderMinWidth,
  backgroundColor: tableStyles.statLabelBg,
  fontSize: '0.8rem',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: tableStyles.statLabelHoverBg,
    fontWeight: 'bold',
  },
};

// Styles for bold text.
export const boldTextStyles = {
  fontWeight: 'bold',
};

// New styles for the table header cells, making them consistent and easy to update.
export const tableHeaderCellStyles = {
  ...boldTextStyles,
  backgroundColor: tableStyles.headerBg,
  color: tableStyles.headerColor,
};

// New styles for the game type stats (traditional stats, Long game, short game) header rows.
export const gameTypeHeaderStyles = {
  backgroundColor: 'action.hover',
  ...boldTextStyles,
};
