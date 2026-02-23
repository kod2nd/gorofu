import {
  Box,
  Typography,
  Stack,
  AccordionSummary,
} from "@mui/material";
import {
  Edit,
  Delete,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

import { alpha } from "@mui/material/styles";
 
const ClubCardSummary = ({
    safeClub,
    isPutter,
    hasSummaryData,
    summaryCarryRange,
    summaryTotalRange,
    unitLabel,
    onEdit,
    onDelete,
  }) => {
    return (
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${safeClub.id}-content`}
        id={`panel-${safeClub.id}-header`}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          "& .MuiAccordionSummary-content": { my: 0, minWidth: 0 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }} sx={{ width: "100%", minWidth: 0 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={{ xs: 1, md: 4 }}
              sx={{ minWidth: 0 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, letterSpacing: "-0.02em" }} noWrap>
                  {safeClub.name || "Unnamed Club"}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap sx={{ fontWeight: 500 }}>
                  {[safeClub.type, safeClub.make, safeClub.model].filter(Boolean).join(" • ")}
                  {safeClub.loft && ` • ${safeClub.loft}°`}
                </Typography>
              </Box>

              {!isPutter && hasSummaryData && (
                <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: { xs: 2, sm: 3 } }}>
                  {summaryCarryRange && (
                    <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: "0.12em" }}>
                        CARRY
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {summaryCarryRange.lowerBound} - {summaryCarryRange.median} - {summaryCarryRange.upperBound}{" "}
                        <Typography component="span" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {unitLabel}
                        </Typography>
                      </Typography>
                    </Box>
                  )}

                  {summaryTotalRange && (
                    <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: "0.12em" }}>
                        TOTAL
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {summaryTotalRange.lowerBound} - {summaryTotalRange.median} - {summaryTotalRange.upperBound}{" "}
                        <Typography component="span" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {unitLabel}
                        </Typography>
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Actions */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: { xs: 0, sm: 0.5 }, flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              component="div"
              onClick={onEdit}
              sx={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                color: "text.primary",
                "&:hover": { bgcolor: alpha("#000", 0.06) },
              }}
              aria-label="edit club"
            >
              <Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </Box>

            <Box
              component="div"
              onClick={onDelete}
              sx={{
                display: "grid",
                placeItems: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                color: "error.main",
                "&:hover": { bgcolor: alpha("#f00", 0.06) },
              }}
              aria-label="delete club"
            >
              <Delete sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </Box>
          </Box>
        </Stack>
      </AccordionSummary>
    );
  };

export default ClubCardSummary;