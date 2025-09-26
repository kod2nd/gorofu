import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';

const RoundsTable = ({ rounds, onViewRound, onDelete }) => {
  if (!rounds || rounds.length === 0) {
    return <Typography color="text.secondary">No rounds recorded yet.</Typography>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Tee Box</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Putts</TableCell>
            <TableCell align="center">SZIR</TableCell>
            <TableCell align="center">SZ Par</TableCell>
            <TableCell align="center">Eligible</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rounds.map((round) => (
            <TableRow key={round.id} hover>
              <TableCell>{new Date(round.round_date).toLocaleDateString()}</TableCell>
              <TableCell>{round.courses.name}</TableCell>
              <TableCell>{round.tee_box}</TableCell>
              <TableCell align="right">{round.total_score}</TableCell>
              <TableCell align="right">{round.total_putts}</TableCell>
              <TableCell align="center">
                {`${round.round_holes.filter(h => h.scoring_zone_in_regulation).length} / ${round.total_holes_played}`}
              </TableCell>
              <TableCell align="center">
                {`${round.round_holes.filter(h => h.holeout_within_3_shots_scoring_zone).length} / ${round.round_holes.filter(h => h.scoring_zone_in_regulation).length}`}
              </TableCell>
              <TableCell align="center">{round.is_eligible_round ? '✓' : '✗'}</TableCell>
              <TableCell align="center">
                <Tooltip title="View Details">
                  <IconButton onClick={() => onViewRound(round.id)} size="small">
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                {onDelete && (
                  <Tooltip title="Delete Round">
                    <IconButton onClick={() => onDelete(round.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoundsTable;