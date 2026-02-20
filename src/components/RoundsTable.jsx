import React from "react";
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
  Paper,
  Chip,
  Box,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Visibility as VisibilityIcon, Delete as DeleteIcon } from "@mui/icons-material";

const RoundsTable = ({ rounds, onViewRound, onDelete }) => {
  if (!rounds || rounds.length === 0) {
    return <Typography color="text.secondary">No rounds recorded yet.</Typography>;
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={(theme) => ({
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
        overflow: "hidden",
        background: `linear-gradient(180deg,
          ${alpha(theme.palette.background.paper, 1)} 0%,
          ${alpha(theme.palette.background.default, 0.55)} 100%)`,
        maxHeight: 520,
        overflowX: "auto",
        overflowY: "auto",
        "&::-webkit-scrollbar": { height: 10, width: 10 },
      })}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow
            sx={(theme) => ({
              "& th": {
                backgroundColor: theme.palette.background.paper, // solid background
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: 12,
                color: theme.palette.text.secondary,
                borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                py: 1.25,
              },
            })}
          >
            <TableCell>Date</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Tee</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right">Putts</TableCell>
            <TableCell align="center">SZIR</TableCell>
            <TableCell align="center">SZ Par</TableCell>
            <TableCell align="center">Eligible</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rounds.map((round, idx) => {
            const total = round.total_holes_played || 0;
            const szir = Array.isArray(round.round_holes)
              ? round.round_holes.filter((h) => h.scoring_zone_in_regulation).length
              : 0;
            const szpar = Array.isArray(round.round_holes)
              ? round.round_holes.filter((h) => h.holeout_within_3_shots_scoring_zone).length
              : 0;

            return (
              <TableRow
                key={round.id}
                hover
                sx={(theme) => ({
                  backgroundColor: idx % 2 === 0 ? "transparent" : alpha(theme.palette.primary.main, 0.05),
                  transition: "background-color 150ms ease",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  },
                  "& td": {
                    borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                    py: 1.25,
                  },
                })}
              >
                <TableCell>
                  {round.round_date ? new Date(round.round_date).toLocaleDateString() : "—"}
                </TableCell>

                <TableCell sx={{ fontWeight: 800 }}>
                  {round.courses?.name || "—"}
                </TableCell>

                <TableCell>{round.tee_box || "—"}</TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {round.total_score ?? "—"}
                </TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>{round.total_putts ?? "—"}</TableCell>

                <TableCell align="center">
                  <Chip
                    size="small"
                    label={`${szir} / ${total}`}
                    sx={(theme) => ({
                      borderRadius: 999,
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.10),
                      color: theme.palette.primary.main,
                    })}
                  />
                </TableCell>

                <TableCell align="center">
                  <Chip
                    size="small"
                    label={`${szpar} / ${total}`}
                    sx={(theme) => ({
                      borderRadius: 999,
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                    })}
                  />
                </TableCell>

                <TableCell align="center">
                  <Chip
                    size="small"
                    label={round.is_eligible_round ? '✓' : '✗'}
                    sx={(theme) => ({
                      borderRadius: 999,
                      fontWeight: 900,
                      bgcolor: alpha(
                        round.is_eligible_round ? theme.palette.success.main : theme.palette.error.main,
                        0.14
                      ),
                      color: round.is_eligible_round ? theme.palette.success.dark : theme.palette.error.dark,
                    })}
                  />
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: "inline-flex", gap: 1 }}>
                    <Tooltip title="Round Details">
                      <IconButton
                        onClick={() => onViewRound(round.id)}
                        size="small"
                        sx={(theme) => ({
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                        })}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {onDelete && (
                      <Tooltip title="Delete Round">
                        <IconButton
                          onClick={() => onDelete(round.id)}
                          size="small"
                          sx={(theme) => ({
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                            color: theme.palette.error.main,
                          })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoundsTable;
