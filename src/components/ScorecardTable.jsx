import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const ScorecardTable = ({ holes }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const rowDefinitions = [
    {
      key: "par",
      label: "Par",
      getValue: (hole) => hole?.par || "-",
      icon: "⛳",
    },
    {
      key: "hole_score",
      label: "Score",
      getValue: (hole) => hole?.hole_score || "-",
      icon: "🎯",
    },
    {
      key: "putts",
      label: "Putts",
      getValue: (hole) => hole?.putts ?? "-",
      icon: "🏌️",
    },
    {
      key: "scoring_zone_in_regulation",
      label: "SZIR",
      getValue: (hole) =>
        hole?.hole_score ? (hole.scoring_zone_in_regulation ? "✓" : "✗") : "-",
      icon: "🎪",
    },
    {
      key: "holeout_within_3_shots_scoring_zone",
      label: "SZ Par",
      getValue: (hole) =>
        hole?.hole_score
          ? hole.holeout_within_3_shots_scoring_zone
            ? "✓"
            : "✗"
          : "-",
      icon: "⭐",
    },
    {
      key: "putts_within4ft",
      label: "Putts <4ft",
      getValue: (hole) => hole?.putts_within4ft ?? "-",
      icon: "📏",
    },
    {
      key: "holeout_from_outside_4ft",
      label: "Luck",
      getValue: (hole) =>
        hole?.hole_score ? (hole.holeout_from_outside_4ft ? "✓" : "-") : "-",
      icon: "🍀",
    },
    {
      key: "penalty_shots",
      label: "Penalties",
      getValue: (hole) => hole?.penalty_shots || "-",
      icon: "⚠️",
    },
  ];

  const calculateTotal = (holes, key, start, end) => {
    return holes.slice(start, end).reduce((sum, hole) => {
      if (!hole) return sum;
      const value = hole[key];
      if (key === 'scoring_zone_in_regulation' || key === 'holeout_within_3_shots_scoring_zone' || key === 'holeout_from_outside_4ft') {
        return sum + (value ? 1 : 0);
      }
      return sum + (Number(value) || 0);
    }, 0);
  };

  // Ensure we have exactly 18 holes, filling with empty objects if needed
  const normalizedHoles = Array.from({ length: 18 }, (_, i) => {
    return holes.find(h => h.hole_number === i + 1) || { hole_number: i + 1 };
  });

  const totals = {
    out: rowDefinitions.map(rd => ({ key: rd.key, value: calculateTotal(normalizedHoles, rd.key, 0, 9) })),
    in: rowDefinitions.map(rd => ({ key: rd.key, value: calculateTotal(normalizedHoles, rd.key, 9, 18) })),
    total: rowDefinitions.map(rd => ({ key: rd.key, value: calculateTotal(normalizedHoles, rd.key, 0, 18) })),
  };

  return (
    <Box
      sx={{
        height: isMobile ? "60vh" : "70vh",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
      }}
    >
      <TableContainer
        sx={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          "&::-webkit-scrollbar": {
            width: 8,
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: theme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.primary.main,
            borderRadius: 4,
          },
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            "& .MuiTableCell-root": {
              padding: "10px 6px",
              fontSize: "0.75rem",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              fontWeight: "bold",
              fontSize: "0.75rem",
              borderRight: `1px solid ${theme.palette.primary.dark}`,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 20,
                  backgroundColor: theme.palette.primary.main,
                  minWidth: 90,
                  textAlign: "center",
                  borderRight: `2px solid ${theme.palette.primary.dark}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <span>🏌️‍♂️</span>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", color: "white" }}
                  >
                    Hole
                  </Typography>
                </Box>
              </TableCell>
              {/* Holes 1-9 */}
              {Array.from({ length: 9 }, (_, i) => (
                <TableCell
                  key={i}
                  align="center"
                  sx={{
                    minWidth: 52,
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    borderRight: `1px solid ${theme.palette.divider}`,
                    background: `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[100]} 100%)`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", lineHeight: 1 }}
                    >
                      {i + 1}
                    </Typography>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.primary.main,
                        mt: 0.25,
                        opacity: 0.6,
                      }}
                    />
                  </Box>
                </TableCell>
              ))}
              {/* OUT Column */}
              <TableCell align="center" sx={{ minWidth: 52, backgroundColor: theme.palette.warning.main, color: 'white', fontWeight: 'bold', borderRight: `2px solid ${theme.palette.warning.dark}` }}>
                OUT
              </TableCell>
              {/* Holes 10-18 */}
              {Array.from({ length: 9 }, (_, i) => (
                <TableCell
                  key={i + 9}
                  align="center"
                  sx={{
                    minWidth: 52,
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    borderRight: `1px solid ${theme.palette.divider}`,
                    background: `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[100]} 100%)`,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", lineHeight: 1 }}
                    >
                      {i + 10}
                    </Typography>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.primary.main,
                        mt: 0.25,
                        opacity: 0.6,
                      }}
                    />
                  </Box>
                </TableCell>
              ))}
              {/* IN Column */}
              <TableCell align="center" sx={{ minWidth: 52, backgroundColor: theme.palette.info.main, color: 'white', fontWeight: 'bold', borderRight: `2px solid ${theme.palette.info.dark}` }}>
                IN
              </TableCell>
                            {/* OUT Column */}
              <TableCell align="center" sx={{ minWidth: 52, backgroundColor: theme.palette.warning.main, color: 'white', fontWeight: 'bold', borderRight: `2px solid ${theme.palette.warning.dark}` }}>
                OUT
              </TableCell>
              {/* TOTAL Column */}
              <TableCell align="center" sx={{ minWidth: 52, backgroundColor: theme.palette.success.main, color: 'white', fontWeight: 'bold' }}>
                TOT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowDefinitions.map((rowDef, rowIndex) => (
              <TableRow
                key={rowDef.key}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&:hover": {
                    backgroundColor: theme.palette.action.selected,
                  },
                }}
              >
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 15,
                    backgroundColor:
                      rowIndex % 2 === 0
                        ? "background.paper"
                        : theme.palette.action.hover,
                    fontWeight: "bold",
                    borderRight: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: "3px 0 6px rgba(0,0,0,0.1)",
                    minWidth: 90,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}10 0%, ${theme.palette.grey[100]} 100%)`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.9rem",
                        opacity: 0.8,
                      }}
                    >
                      {rowDef.icon}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.text.primary,
                        fontSize: "0.75rem",
                        textAlign: "left",
                        flex: 1,
                      }}
                    >
                      {rowDef.label}
                    </Typography>
                  </Box>
                </TableCell>
                {/* Holes 1-9 */}
                {normalizedHoles.slice(0, 9).map((hole, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{
                      minWidth: 52,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      ...(rowDef.key === "hole_score" &&
                        hole?.hole_score && {
                          color:
                            hole.hole_score < hole.par
                              ? "success.main"
                              : hole.hole_score > hole.par
                              ? "error.main"
                              : "inherit",
                          fontWeight: "bold",
                          backgroundColor:
                            hole.hole_score < hole.par
                              ? theme.palette.success.light + "40"
                              : hole.hole_score > hole.par
                              ? theme.palette.error.light + "40"
                              : "inherit",
                        }),
                      ...(rowDef.key === "penalty_shots" &&
                        hole?.penalty_shots > 0 && {
                          color: "error.main",
                          fontWeight: "bold",
                          backgroundColor: theme.palette.error.light + "40",
                        }),
                      ...(rowDef.key === "scoring_zone_in_regulation" &&
                        hole?.scoring_zone_in_regulation && {
                          backgroundColor: theme.palette.success.light + "30",
                        }),
                      ...(rowDef.key === "holeout_within_3_shots_scoring_zone" &&
                        hole?.holeout_within_3_shots_scoring_zone && {
                          backgroundColor: theme.palette.info.light + "30",
                        }),
                      ...(rowDef.key === "holeout_from_outside_4ft" &&
                        hole?.holeout_from_outside_4ft && {
                          backgroundColor: theme.palette.warning.light + "30",
                        }),
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                      }}
                    >
                      {rowDef.getValue(hole)}
                    </Typography>
                  </TableCell>
                ))}
                {/* OUT Total */}
                <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.warning.light, borderRight: `2px solid ${theme.palette.warning.main}` }}>
                  {
                    (() => {
                      const total = totals.out.find(t => t.key === rowDef.key)?.value;
                      if (['scoring_zone_in_regulation', 'holeout_within_3_shots_scoring_zone', 'holeout_from_outside_4ft'].includes(rowDef.key)) {
                        return total > 0 ? total : '-';
                      }
                      return total ?? '-';
                    })()
                  }
                </TableCell>
                {/* Holes 10-18 */}
                {normalizedHoles.slice(9, 18).map((hole, i) => (
                  <TableCell
                    key={i + 9}
                    align="center"
                    sx={{
                      minWidth: 52,
                      borderRight: `1px solid ${theme.palette.divider}`,
                      ...(rowDef.key === "hole_score" &&
                        hole?.hole_score && {
                          color:
                            hole.hole_score < hole.par
                              ? "success.main"
                              : hole.hole_score > hole.par
                              ? "error.main"
                              : "inherit",
                          fontWeight: "bold",
                          backgroundColor:
                            hole.hole_score < hole.par
                              ? theme.palette.success.light + "40"
                              : hole.hole_score > hole.par
                              ? theme.palette.error.light + "40"
                              : "inherit",
                        }),
                      ...(rowDef.key === "penalty_shots" &&
                        hole?.penalty_shots > 0 && {
                          color: "error.main",
                          fontWeight: "bold",
                          backgroundColor: theme.palette.error.light + "40",
                        }),
                      ...(rowDef.key === "scoring_zone_in_regulation" &&
                        hole?.scoring_zone_in_regulation && {
                          backgroundColor: theme.palette.success.light + "30",
                        }),
                      ...(rowDef.key === "holeout_within_3_shots_scoring_zone" &&
                        hole?.holeout_within_3_shots_scoring_zone && {
                          backgroundColor: theme.palette.info.light + "30",
                        }),
                      ...(rowDef.key === "holeout_from_outside_4ft" &&
                        hole?.holeout_from_outside_4ft && {
                          backgroundColor: theme.palette.warning.light + "30",
                        }),
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                      {rowDef.getValue(hole)}
                    </Typography>
                  </TableCell>
                ))}
                {/* IN Total */}
                <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.info.light, borderRight: `2px solid ${theme.palette.info.main}` }}>
                  {
                    (() => {
                      const total = totals.in.find(t => t.key === rowDef.key)?.value;
                      if (['scoring_zone_in_regulation', 'holeout_within_3_shots_scoring_zone', 'holeout_from_outside_4ft'].includes(rowDef.key)) {
                        return total > 0 ? total : '-';
                      }
                      return total ?? '-';
                    })()
                  }
                </TableCell>
                {/* GRAND Total Cell */}
                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', backgroundColor: theme.palette.success.main }}>
                  {
                    (() => {
                      const total = totals.total.find(t => t.key === rowDef.key)?.value;
                      if (rowDef.key === 'hole_score') {
                        const parTotal = totals.total.find(t => t.key === 'par')?.value;
                        const diff = total - parTotal;
                        if (parTotal > 0 && total > 0) return `${total} (${diff > 0 ? '+' : ''}${diff})`;
                        return total ?? '-';
                      }
                      if (['scoring_zone_in_regulation', 'holeout_within_3_shots_scoring_zone', 'holeout_from_outside_4ft'].includes(rowDef.key)) {
                        return total > 0 ? total : '-';
                      }
                      return total ?? '-';
                    })()
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Legend Footer */}
      <Box
        sx={{
          padding: 1.5,
          backgroundColor: theme.palette.grey[50],
          borderTop: `2px solid ${theme.palette.divider}`,
          fontSize: "0.7rem",
          color: theme.palette.text.secondary,
          textAlign: "center",
          background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">
              OUT:
            </Typography>
            <Typography variant="caption">
              Front 9
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">
              IN:
            </Typography>
            <Typography variant="caption">Back 9</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" fontWeight="bold">
              TOT:
            </Typography>
            <Typography variant="caption">Total 18</Typography>
          </Box>
          <Typography variant="caption">
            | Scroll horizontally →
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ScorecardTable;