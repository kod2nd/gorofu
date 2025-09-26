import { 
  tableStyles, 
  switchStyles, 
  textFieldStyles, 
  animationStyles, 
  cellStyles 
} from "../styles/commonStyles";

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
      patternDescription: "Valid range: 2-7",
      tooltip: "The standard number of strokes for a given hole.",
    },
    {
      label: "Dist.",
      name: "distance",
      type: "text",
      inputMode: "numeric",
      pattern: "([1-9][0-9]{0,2})",
      patternDescription: "Valid range: 1-999",
      tooltip:
        "The total distance of the hole in yards or meters. Yards and meters are configured in section 1 Course Details.",
    },
    {
      label: "Score",
      name: "hole_score",
      type: "text",
      inputMode: "numeric",
      pattern: "([1-9]|1[0-9]|20)",
      patternDescription: "Valid range: 1-20",
      tooltip: "The number of strokes taken on the hole.",
    },
    {
      label: "Penalties",
      name: "penalty_shots",
      type: "text",
      inputMode: "numeric",
      pattern: "(0|[1-20])",
      patternDescription: "Valid range: 0-20",
      tooltip: "The number of penalty shots taken on the hole.",
    },
  ],
  longGame: [
    {
      label: "SZIR",
      name: "scoring_zone_in_regulation",
      type: "switch",
      isRelevantForRed: true,
      tooltip:
        "Scoring Zone in regulation. For a Par 4: finished within X yards/meters in 2 shots. For a Par 5: in 3 shots. The specific distance (X) is set in the course settings.",
    },
  ],
  shortGame: [
    {
      label: "SZ Par",
      name: "holeout_within_3_shots_scoring_zone",
      type: "switch",
      isRelevantForRed: true,
      tooltip: "Holed out within 3 shots from the Scoring Zone.",
    },
    {
      label: "Putts",
      name: "putts",
      type: "text",
      inputMode: "numeric",
      pattern: "(0|[1-9]|1[0-9]|20)",
      patternDescription: "Valid range: 0-20",
      tooltip: "The total number of putts on the green.",
    },
    {
      label: "4ft Putts",
      name: "putts_within4ft",
      type: "text",
      inputMode: "numeric",
      pattern: "(0|[1-9]|1[0-9]|20)",
      patternDescription: "Valid range: 0-20",
      tooltip: "The number of putts made from within 4 feet of the hole.",
    },
    {
      label: "Luck",
      name: "holeout_from_outside_4ft",
      type: "checkbox",
      tooltip:
        "Holed out from a distance greater than 4 feet. A great result that involves both skill and a bit of luck.",
    },
  ],
};

// Re-export styles from centralized location with legacy names for compatibility
export { tableStyles, textFieldStyles, animationStyles as invalidInputPulseStyles, cellStyles };

// Legacy style exports for backward compatibility
export const statCellBaseStyles = cellStyles.base;
export const boldTextStyles = cellStyles.bold;
export const cellDividerStyles = cellStyles.divider;

// Table-specific styles using centralized system
export const statLabelCellStyles = {
  minWidth: tableStyles.rowHeaderMinWidth,
  fontSize: "0.75rem",
  marginLeft: "6px",
  cursor: "pointer",
  ...tableStyles.statLabel,
};

export const tableHeaderCellStyles = {
  ...cellStyles.bold,
  ...tableStyles.header,
};

export const gameTypeHeaderStyles = {
  ...tableStyles.gameTypeHeader,
  ...cellStyles.bold,
};

// Switch styles using centralized system
export { switchStyles };
export const redSwitchStyles = switchStyles.warning;
