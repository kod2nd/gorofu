import React, { useState, useEffect } from "react";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Tooltip,
  Switch,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import {
  statDefinitions,
  tableStyles,
  textFieldStyles,
  statCellBaseStyles,
  statLabelCellStyles,
  tableHeaderCellStyles,
  gameTypeHeaderStyles,
  boldTextStyles,
  cellDividerStyles,
  switchStyles,
  redSwitchStyles,
  invalidInputPulseStyles,
} from "./holeDetailsTableHelper";

const StatRow = ({
  stat,
  holesArray,
  startIndex,
  handleHoleChange,
  focusedCell,
  hoveredCell,
  handleCellFocus,
  handleCellHover,
  openTooltip,
  handleTooltipClick,
}) => {
  const [invalidValue, setInvalidValue] = useState('');
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    let tooltipTimeout;
    if (isTooltipOpen) {
      tooltipTimeout = setTimeout(() => {
        setIsTooltipOpen(false);
        setInvalidValue('');
      }, 3000); // Tooltip disappears after 3 seconds
    }
    return () => clearTimeout(tooltipTimeout);
  }, [isTooltipOpen]);

  const getPatternDescription = (statName) => {
    switch (statName) {
        case 'par':
            return 'Valid range: 2-7';
        case 'Distance':
            return 'Valid range: 1-999';
        case 'hole_score':
        case 'putts':
        case 'putts_within4ft':
            return 'Valid range: 0-20';
        default:
            return 'Invalid input';
    }
  };

  return (
    <TableRow>
      <Tooltip
        title={stat.tooltip}
        open={
          openTooltip.stat === stat.name && openTooltip.tableIndex === startIndex
        }
        onClose={() => handleTooltipClick("", null)}
        arrow
      >
        <TableCell
          component="th"
          scope="row"
          sx={statLabelCellStyles}
          onClick={() => handleTooltipClick(stat.name, startIndex)}
        >
          <Box display="flex" alignItems="center">
            {stat.label}
          </Box>
        </TableCell>
      </Tooltip>
      {holesArray.map((hole, holeIndex) => {
        const isHolePlayed = hole.hole_score > 0;
        const isRelevantStat = stat.name === 'scoring_zone_in_regulation' || stat.name === 'holeout_within_3_shots_scoring_zone';
        const isUnchecked = !hole[stat.name];
        const shouldBeRed = isHolePlayed && isRelevantStat && isUnchecked;

        return (
          <TableCell
            key={holeIndex}
            align="center"
            sx={{
              ...cellDividerStyles,
              p: tableStyles.cellPadding,
              backgroundColor:
                (focusedCell?.statName === stat.name &&
                focusedCell?.holeIndex === holeIndex &&
                focusedCell?.tableIndex === startIndex / 9) ||
                (hoveredCell?.statName === stat.name &&
                hoveredCell?.holeIndex === holeIndex &&
                hoveredCell?.tableIndex === startIndex / 9)
                  ? tableStyles.focusedCellBg
                  : "inherit",
              ...statCellBaseStyles,
              ...(pulseAnimation && pulseAnimation.holeIndex === holeIndex && pulseAnimation.statName === stat.name && invalidInputPulseStyles)
            }}
            onFocus={() =>
              handleCellFocus({
                statName: stat.name,
                holeIndex,
                tableIndex: startIndex / 9,
              })
            }
            onBlur={() => handleCellFocus(null)}
            onMouseEnter={() =>
              handleCellHover({
                statName: stat.name,
                holeIndex,
                tableIndex: startIndex / 9,
              })
            }
            onMouseLeave={() => handleCellHover(null)}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {stat.type === "checkbox" ? (
                <Checkbox
                  name={stat.name}
                  checked={!!hole[stat.name]}
                  onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                />
              ) : stat.type === "switch" ? (
                <Switch
                  name={stat.name}
                  checked={!!hole[stat.name]}
                  onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                  sx={{
                    ...switchStyles,
                    ...(shouldBeRed && redSwitchStyles)
                  }}
                />
              ) : (
                <Tooltip
                  title={getPatternDescription(stat.name)}
                  open={isTooltipOpen && invalidValue !== '' && focusedCell?.statName === stat.name && focusedCell?.holeIndex === holeIndex}
                  arrow
                >
                  <TextField
                    size="small"
                    type={stat.type}
                    inputMode={stat.inputMode}
                    pattern={stat.pattern}
                    name={stat.name}
                    value={hole[stat.name]}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const regex = new RegExp(`^${stat.pattern}$`);
                      if (newValue === '' || regex.test(newValue)) {
                        handleHoleChange(startIndex + holeIndex, e);
                        setIsTooltipOpen(false);
                        setInvalidValue('');
                      } else {
                        setInvalidValue(newValue);
                        setIsTooltipOpen(true);
                        setPulseAnimation({ holeIndex, statName: stat.name });
                        setTimeout(() => setPulseAnimation(false), 500); // Animation duration
                      }
                    }}
                    required={stat.name === "par" || stat.name === "hole_score"}
                    sx={{ ...textFieldStyles, width: 60 }}
                    inputProps={{ style: { textAlign: 'center' } }}
                  />
                </Tooltip>
              )}
            </Box>
          </TableCell>
        );
      })}
      <TableCell
        align="center"
        sx={{ ...boldTextStyles, backgroundColor: tableStyles.totalColumnBg }}
      >
        {holesArray.reduce(
          (sum, hole) => {
            const value = hole[stat.name];
            let increment = 0;
            if (stat.type === 'checkbox' || stat.type === 'switch') {
              increment = value ? 1 : 0;
            } else {
              increment = Number(value) || 0;
            }
            return sum + increment;
          },
          0
        ) || "-"}
      </TableCell>
    </TableRow>
  );
};

const HoleTable = ({ holes, startIndex, handleHoleChange }) => {
  const [focusedCell, setFocusedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [openTooltip, setOpenTooltip] = useState({
    stat: "",
    tableIndex: null,
  });

  const handleTooltipClick = (statName, tableIndex) => {
    setOpenTooltip((prev) => ({
      stat:
        prev.stat === statName && prev.tableIndex === tableIndex
          ? ""
          : statName,
      tableIndex:
        prev.stat === statName && prev.tableIndex === tableIndex
          ? null
          : tableIndex,
    }));
  };

  const handleCellFocus = (cell) => setFocusedCell(cell);
  const handleCellHover = (cell) => setHoveredCell(cell);

  const holeNumbers = Array.from({ length: 9 }, (_, i) => startIndex + i + 1);

  return (
    <TableContainer
      component={Paper}
      style={{ overflowX: "auto", marginBottom: "16px" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={gameTypeHeaderStyles}>
            <TableCell colSpan={11}>
              <Typography variant="caption" sx={boldTextStyles}>
                {startIndex === 0
                  ? "Front 9 - Score Card"
                  : "Back 9 - Score Card"}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              sx={{
                ...statCellBaseStyles,
                ...tableHeaderCellStyles,
                minWidth: tableStyles.rowHeaderMinWidth,
              }}
            >
              Stat / Hole
            </TableCell>
            {holeNumbers.map((holeNumber) => (
              <TableCell
                key={holeNumber}
                align="center"
                sx={{
                  ...tableHeaderCellStyles,
                  minWidth: tableStyles.cellMinWidth,
                  p: tableStyles.cellPadding,
                }}
              >
                {holeNumber}
              </TableCell>
            ))}
            <TableCell
              align="center"
              sx={{
                ...tableHeaderCellStyles,
                minWidth: tableStyles.cellMinWidth,
              }}
            >
              Total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(statDefinitions).map(([gameType, stats]) => (
            <React.Fragment key={gameType}>
              <TableRow sx={gameTypeHeaderStyles}>
                <TableCell colSpan={11}>
                  <Typography variant="caption" sx={boldTextStyles}>
                    {gameType === "traditional"
                      ? "Traditional"
                      : gameType === "longGame"
                      ? "Long Game"
                      : "Short Game"}
                  </Typography>
                </TableCell>
              </TableRow>
              {stats.map((stat, statIndex) => (
                <StatRow
                  key={statIndex}
                  stat={stat}
                  holesArray={holes}
                  startIndex={startIndex}
                  handleHoleChange={handleHoleChange}
                  focusedCell={focusedCell}
                  hoveredCell={hoveredCell}
                  handleCellFocus={handleCellFocus}
                  handleCellHover={handleCellHover}
                  openTooltip={openTooltip}
                  handleTooltipClick={handleTooltipClick}
                />
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const HoleDetailsForm = ({ holes, handleHoleChange }) => {
  const front9Holes = holes.slice(0, 9);
  const back9Holes = holes.slice(9, 18);

  return (
    <Paper elevation={2} style={{ padding: "16px", marginBottom: "24px" }}>
      <Typography variant="h6" gutterBottom>
        2. Hole-by-Hole Details
      </Typography>

      <HoleTable
        holes={front9Holes}
        startIndex={0}
        handleHoleChange={handleHoleChange}
      />
      <HoleTable
        holes={back9Holes}
        startIndex={9}
        handleHoleChange={handleHoleChange}
      />
    </Paper>
  );
};

export default HoleDetailsForm;
