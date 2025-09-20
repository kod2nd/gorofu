import React, { useState } from 'react';
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
} from '@mui/material';
import { statDefinitions, tableStyles, textFieldStyles, statCellBaseStyles, statLabelCellStyles, tableHeaderCellStyles, gameTypeHeaderStyles, boldTextStyles } from './holeDetailsTableHelper';

const StatRow = ({ stat, holesArray, startIndex, handleHoleChange, focusedCell, hoveredCell, handleCellFocus, handleCellHover, openTooltip, handleTooltipClick }) => (
  <TableRow>
    <Tooltip
      title={stat.tooltip}
      open={openTooltip.stat === stat.name && openTooltip.tableIndex === startIndex}
      onClose={() => handleTooltipClick('', null)}
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
    {holesArray.map((hole, holeIndex) => (
      <TableCell
        key={holeIndex}
        align="center"
        sx={{
          p: tableStyles.cellPadding,
          backgroundColor:
            (focusedCell?.statName === stat.name && focusedCell?.holeIndex === holeIndex && focusedCell?.tableIndex === (startIndex / 9)) ||
            (hoveredCell?.statName === stat.name && hoveredCell?.holeIndex === holeIndex && hoveredCell?.tableIndex === (startIndex / 9))
              ? tableStyles.focusedCellBg
              : 'inherit',
        }}
        onFocus={() => handleCellFocus({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
        onBlur={() => handleCellFocus(null)}
        onMouseEnter={() => handleCellHover({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
        onMouseLeave={() => handleCellHover(null)}
      >
        {stat.type === 'checkbox' ? (
          <FormControlLabel
            control={
              <Checkbox
                name={stat.name}
                checked={hole[stat.name]}
                onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
              />
            }
          />
        ) : (
          <TextField
            size="small"
            type={stat.type}
            name={stat.name}
            value={hole[stat.name]}
            onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
            required={stat.name === 'par' || stat.name === 'hole_score'}
            sx={{ ...textFieldStyles, width: 60 }}
          />
        )}
      </TableCell>
    ))}
    <TableCell align="center" sx={{ ...boldTextStyles, backgroundColor: tableStyles.totalColumnBg }}>
      {holesArray.reduce((sum, hole) => sum + (stat.type === 'checkbox' ? (hole[stat.name] ? 1 : 0) : (Number(hole[stat.name]) || 0)), 0) || '-'}
    </TableCell>
  </TableRow>
);

const HoleTable = ({ holes, startIndex, handleHoleChange }) => {
  const [focusedCell, setFocusedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [openTooltip, setOpenTooltip] = useState({ stat: '', tableIndex: null });

  const handleTooltipClick = (statName, tableIndex) => {
    setOpenTooltip(prev => ({
      stat: prev.stat === statName && prev.tableIndex === tableIndex ? '' : statName,
      tableIndex: prev.stat === statName && prev.tableIndex === tableIndex ? null : tableIndex,
    }));
  };

  const holeNumbers = Array.from({ length: 9 }, (_, i) => startIndex + i + 1);

  return (
    <TableContainer component={Paper} style={{ overflowX: 'auto', marginBottom: '16px' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={gameTypeHeaderStyles}>
            <TableCell colSpan={11}>
              <Typography variant="caption" sx={boldTextStyles}>
                {startIndex === 0 ? 'Front 9 - Score Card' : 'Back 9 - Score Card'}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              sx={{ ...statCellBaseStyles, ...tableHeaderCellStyles, minWidth: tableStyles.rowHeaderMinWidth }}
            >
              Stat / Hole
            </TableCell>
            {holeNumbers.map((holeNumber) => (
              <TableCell key={holeNumber} align="center" sx={{ ...tableHeaderCellStyles, minWidth: tableStyles.cellMinWidth, p: tableStyles.cellPadding }}>
                {holeNumber}
              </TableCell>
            ))}
            <TableCell align="center" sx={{ ...tableHeaderCellStyles, minWidth: tableStyles.cellMinWidth }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(statDefinitions).map(([gameType, stats]) => (
            <React.Fragment key={gameType}>
              <TableRow sx={gameTypeHeaderStyles}>
                <TableCell colSpan={11}>
                  <Typography variant="caption" sx={boldTextStyles}>
                    {gameType === 'traditional' ? 'Traditional' : gameType === 'longGame' ? 'Long Game' : 'Short Game'}
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
                  handleCellFocus={setFocusedCell}
                  handleCellHover={setHoveredCell}
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
    <Paper elevation={2} style={{ padding: '16px', marginBottom: '24px' }}>
      <Typography variant="h6" gutterBottom>
        2. Hole-by-Hole Details
      </Typography>
      
      <HoleTable holes={front9Holes} startIndex={0} handleHoleChange={handleHoleChange} />
      <HoleTable holes={back9Holes} startIndex={9} handleHoleChange={handleHoleChange} />

    </Paper>
  );
};

export default HoleDetailsForm;
