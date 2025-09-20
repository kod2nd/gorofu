import { useMemo, useState } from 'react';
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
import { styled, useTheme } from '@mui/system';

// Custom styled TextField for a clean, borderless look
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)', // Show border on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main', // Highlight border on focus
    },
  },
});

const StyledStatCell = styled(TableCell)({
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
  // The ::before pseudo-element for the diagonal line has been removed
});

const HoleDetailsForm = ({ holes, handleHoleChange }) => {
  const theme = useTheme();
  const [focusedCell, setFocusedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [openTooltip, setOpenTooltip] = useState({ stat: '', tableIndex: null });

  const handleTooltipClick = (statName, tableIndex) => {
    setOpenTooltip(prev => ({
      stat: prev.stat === statName && prev.tableIndex === tableIndex ? '' : statName,
      tableIndex: prev.stat === statName && prev.tableIndex === tableIndex ? null : tableIndex,
    }));
  };

  const front9Holes = holes.slice(0, 9);
  const back9Holes = holes.slice(9, 18);

  const statRows = useMemo(() => {
    const traditional = [
      { label: 'Par', name: 'par', type: 'number', tooltip: 'The standard number of strokes for a given hole.' },
      { label: 'Yds/Mtrs', name: 'yards_or_meters', type: 'number', tooltip: 'The total distance of the hole in yards or meters.' },
      { label: 'Score', name: 'hole_score', type: 'number', tooltip: 'The number of strokes taken on the hole.' },
    ];
    const longGame = [
      { label: 'S.Z. Reg', name: 'scoring_zone_in_regulation', type: 'checkbox', tooltip: 'Did the player hit the green or within a designated "scoring zone" in regulation?' },
    ];
    const shortGame = [
      { label: 'Putts', name: 'putts', type: 'number', tooltip: 'The total number of putts on the green.' },
      { label: 'Putts < 4ft', name: 'putts_within4ft', type: 'number', tooltip: 'The number of putts made from within 4 feet of the hole.' },
      { label: 'Holeout > 4ft', name: 'holeout_from_outside_4ft', type: 'checkbox', tooltip: 'Did the player successfully hole out from a distance greater than 4 feet?' },
    ];
    return { traditional, longGame, shortGame };
  }, []);

  const calculateTotal = (holesArray, statName, type) => {
    if (type === 'checkbox') {
      return holesArray.filter(hole => hole[statName]).length;
    }
    return holesArray.reduce((sum, hole) => sum + (Number(hole[statName]) || 0), 0);
  };

  const renderHoleTable = (holesArray, startIndex) => (
    <TableContainer component={Paper} style={{ overflowX: 'auto', marginBottom: '16px' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell colSpan={holesArray.length + 2}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {startIndex === 0 ? 'Front 9 - Score Card' : 'Back 9 - Score Card'}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <StyledStatCell sx={{ minWidth: 120, fontWeight: 'bold', backgroundColor: '#264653', color: 'white' }}>Stat / Hole</StyledStatCell>
            {holesArray.map((_, index) => (
              <TableCell key={index} align="center" sx={{ minWidth: 60, p: 0.5, backgroundColor: '#264653', color: 'white', fontWeight: 'bold' }}>
                {startIndex + index + 1}
              </TableCell>
            ))}
            <TableCell align="center" sx={{ minWidth: 60, fontWeight: 'bold', backgroundColor: '#264653', color: 'white' }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {statRows.traditional.map((stat, statIndex) => (
            <TableRow key={statIndex}>
              <Tooltip
                title={stat.tooltip}
                open={openTooltip.stat === stat.name && openTooltip.tableIndex === startIndex}
                onClose={() => setOpenTooltip({ stat: '', tableIndex: null })}
                arrow
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#fdfbe7',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#e6e4d9', // Slightly darker hover color
                      fontWeight: 'bold', // Bold text on hover
                    },
                  }}
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
                    p: 0.5,
                    backgroundColor:
                      (focusedCell?.statName === stat.name && focusedCell?.holeIndex === holeIndex && focusedCell?.tableIndex === (startIndex / 9)) ||
                      (hoveredCell?.statName === stat.name && hoveredCell?.holeIndex === holeIndex && hoveredCell?.tableIndex === (startIndex / 9))
                        ? 'rgba(0, 0, 0, 0.05)'
                        : 'inherit',
                  }}
                  onFocus={() => setFocusedCell({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
                  onBlur={() => setFocusedCell(null)}
                  onMouseEnter={() => setHoveredCell({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <StyledTextField
                    size="small"
                    type={stat.type}
                    name={stat.name}
                    value={hole[stat.name]}
                    onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                    required={stat.name === 'par' || stat.name === 'hole_score'}
                    sx={{ width: 60 }}
                  />
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#eef1f6' }}>
                {calculateTotal(holesArray, stat.name, stat.type) || '-'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell colSpan={holesArray.length + 2}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Long Game
              </Typography>
            </TableCell>
          </TableRow>
          {statRows.longGame.map((stat, statIndex) => (
            <TableRow key={statIndex}>
              <Tooltip
                title={stat.tooltip}
                open={openTooltip.stat === stat.name && openTooltip.tableIndex === startIndex}
                onClose={() => setOpenTooltip({ stat: '', tableIndex: null })}
                arrow
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#fdfbe7',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#e6e4d9', // Slightly darker hover color
                      fontWeight: 'bold', // Bold text on hover
                    },
                  }}
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
                    p: 0.5,
                    backgroundColor:
                      (focusedCell?.statName === stat.name && focusedCell?.holeIndex === holeIndex && focusedCell?.tableIndex === (startIndex / 9)) ||
                      (hoveredCell?.statName === stat.name && hoveredCell?.holeIndex === holeIndex && hoveredCell?.tableIndex === (startIndex / 9))
                        ? 'rgba(0, 0, 0, 0.05)'
                        : 'inherit',
                  }}
                  onFocus={() => setFocusedCell({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
                  onBlur={() => setFocusedCell(null)}
                  onMouseEnter={() => setHoveredCell({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={stat.name}
                        checked={hole[stat.name]}
                        onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                      />
                    }
                  />
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#eef1f6' }}>
                {calculateTotal(holesArray, stat.name, stat.type) || '-'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell colSpan={holesArray.length + 2}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Short Game
              </Typography>
            </TableCell>
          </TableRow>
          {statRows.shortGame.map((stat, statIndex) => (
            <TableRow key={statIndex}>
              <Tooltip
                title={stat.tooltip}
                open={openTooltip.stat === stat.name && openTooltip.tableIndex === startIndex}
                onClose={() => setOpenTooltip({ stat: '', tableIndex: null })}
                arrow
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#fdfbe7',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#e6e4d9', // Slightly darker hover color
                      fontWeight: 'bold', // Bold text on hover
                    },
                  }}
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
                    p: 0.5,
                    backgroundColor:
                      (focusedCell?.statName === stat.name && focusedCell?.holeIndex === holeIndex && focusedCell?.tableIndex === (startIndex / 9)) ||
                      (hoveredCell?.statName === stat.name && hoveredCell?.holeIndex === holeIndex && hoveredCell?.tableIndex === (startIndex / 9))
                        ? 'rgba(0, 0, 0, 0.05)'
                        : 'inherit',
                  }}
                  onFocus={() => setFocusedCell({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
                  onBlur={() => setFocusedCell(null)}
                  onMouseEnter={() => setHoveredCell({ statName: stat.name, holeIndex, tableIndex: startIndex / 9 })}
                  onMouseLeave={() => setHoveredCell(null)}
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
                    <StyledTextField
                      size="small"
                      type={stat.type}
                      name={stat.name}
                      value={hole[stat.name]}
                      onChange={(e) => handleHoleChange(startIndex + holeIndex, e)}
                      required
                      sx={{ width: 60 }}
                    />
                  )}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#eef1f6' }}>
                {calculateTotal(holesArray, stat.name, stat.type) || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Paper elevation={2} style={{ padding: '16px', marginBottom: '24px' }}>
      <Typography variant="h6" gutterBottom>
        2. Hole-by-Hole Details
      </Typography>
      
      {/* "Floating" Front 9 header has been removed, the text is now in the table title */}
      {renderHoleTable(front9Holes, 0)}

      {/* "Floating" Back 9 header has been removed, the text is now in the table title */}
      {renderHoleTable(back9Holes, 9)}

    </Paper>
  );
};

export default HoleDetailsForm;
