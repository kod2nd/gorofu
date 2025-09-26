import React, { useState, useEffect } from 'react';
import {
  TextField,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import { cardStyles, hoverEffects } from "../styles/commonStyles";

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
  isEditMode,
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
        const isDNP = !hole.played;
        const isRelevantStat = stat.isRelevantForRed;
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
                  ? tableStyles.focusedCell.backgroundColor
                  : "inherit",
              ...statCellBaseStyles,
              ...(isDNP && { backgroundColor: 'grey.400' }),
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
                  disabled={isDNP}
                  onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                />
              ) : stat.type === "switch" ? (
                <Switch
                  name={stat.name}
                  checked={!!hole[stat.name]}
                  disabled={isDNP}
                  onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                  sx={{
                    ...switchStyles.default,
                    ...(shouldBeRed && switchStyles.warning)
                  }}
                />
              ) : (
                <Tooltip
                  title={stat.patternDescription || 'Invalid input'}
                  open={isTooltipOpen && invalidValue !== '' && focusedCell?.statName === stat.name && focusedCell?.holeIndex === holeIndex}
                  arrow
                >
                  <TextField
                    size="small"
                    type={stat.type}
                    inputMode={stat.inputMode}
                    autoComplete='off'
                    pattern={stat.pattern}
                    name={stat.name}
                    value={hole[stat.name]}
                    disabled={isDNP || (stat.name === 'par' || stat.name === 'yards_or_meters' ? isEditMode : false)}
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
        sx={{ ...boldTextStyles, ...tableStyles.totalColumn }}
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

const HoleTable = ({ holes, startIndex, handleHoleChange, isEditMode }) => {
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
      // component={Paper} and styles are removed as AccordionDetails will handle scrolling and spacing
    >
      <Table size="small">
        <TableHead>
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
          {/* DNP Row */}
          <TableRow>
            <TableCell component="th" scope="row" sx={statLabelCellStyles}>
              Hole Played
            </TableCell>
            {holes.map((hole, holeIndex) => (
              <TableCell
                key={holeIndex}
                align="center"
                sx={{
                  ...cellDividerStyles,
                  p: tableStyles.cellPadding,
                  ...statCellBaseStyles,
                  ...(!hole.played && { backgroundColor: 'grey.200' }),
                }}
              >
                <Tooltip title="Toggle off if you did not play this hole">
                  <Switch
                    name="played"
                    checked={hole.played}
                    onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                    sx={{
                      ...switchStyles.default,
                    }}
                  />
                </Tooltip>
              </TableCell>
            ))}
            <TableCell align="center" sx={{ ...boldTextStyles, ...tableStyles.totalColumn }}>
              {holes.filter(h => h.played).length || "-"}
            </TableCell>
          </TableRow>
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
                  isEditMode={isEditMode}
                />
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const HoleDetailsForm = ({ holes, handleHoleChange, roundType = '18_holes', isEditMode }) => {
  // Always show both tables. The played status is controlled in the parent RoundForm.
  const tablesData = [
    { holes: holes.slice(0, 9), startIndex: 0, title: "Front 9 - Score Card", panelId: "front9" },
    { holes: holes.slice(9, 18), startIndex: 9, title: "Back 9 - Score Card", panelId: "back9" },
  ];

  // Determine which panels should be expanded based on round type
  const getInitialExpanded = () => {
    const panelIds = tablesData.map(table => table.panelId);
    return panelIds; // Expand all visible tables
  };

  const [expanded, setExpanded] = useState(getInitialExpanded());

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((currentExpanded) => {
      if (isExpanded) {
        return [...currentExpanded, panel]; // Add panel to the array
      } else {
        return currentExpanded.filter((p) => p !== panel); // Remove panel from the array
      }
    });
  };

  // Update expanded state when roundType changes
  React.useEffect(() => {
    setExpanded(getInitialExpanded());
  }, [roundType]);

  return (
    <Box sx={cardStyles.sx}>
      {tablesData.map(({ holes: tableHoles, startIndex, title, panelId }, index) => (
        <Accordion
          key={startIndex}
          elevation={3}
          disableGutters
          expanded={expanded.includes(panelId)}
          onChange={handleAccordionChange(panelId)}
          sx={{
            '&:not(:last-child)': {
              mb: 2,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
            sx={{
              backgroundColor: 'grey.300',
              color: 'text.primary',
              minHeight: { xs: 48, sm: 48 },
              '&.Mui-expanded': { minHeight: { xs: 48, sm: 48 } },
              ...hoverEffects.button,
              '&.Mui-focused': {
                outline: 'none',
                boxShadow: 'none',
              },
            }}
          >
            <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 'bold' }}>
              {title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, overflowX: 'auto' }}>
            <HoleTable holes={tableHoles} startIndex={startIndex} handleHoleChange={handleHoleChange} isEditMode={isEditMode} />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default HoleDetailsForm;
