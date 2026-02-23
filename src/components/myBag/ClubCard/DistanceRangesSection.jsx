import {
  Box,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,

} from "@mui/icons-material";

import RangeDisplay from "./RangeDisplay";

const DistanceRangesSection = ({
    showRanges,
    onToggleRanges,
    distanceView,
    setDistanceView,
    theme,
    segmentedSx,
    safeCategories,
    shotsByCategoryId,
    safeShotConfig,
    displayUnit,
    overallChartMin,
    overallChartMax,
  }) => {
    return (
      <Box>
        <Box
            onClick={onToggleRanges}
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: { xs: 1, sm: 1.5 },
                cursor: "pointer",
                p: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
            }}
            >
            {/* Row 1: title + chevron */}
            <Box
                sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: 0,
                gap: 1,
                }}
            >
                <Typography
                sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: 800,
                    minWidth: 0,
                    // allow wrap instead of colliding with controls
                    whiteSpace: "normal",
                    lineHeight: 1.15,
                }}
                >
                Distance Ranges
                </Typography>

                <ExpandMoreIcon
                sx={{
                    flexShrink: 0,
                    transform: showRanges ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                }}
                />
            </Box>

            {/* Row 2 on mobile, right-side on desktop: toggle */}
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                display: "flex",
                justifyContent: { xs: "stretch", sm: "flex-end" },
                width: { xs: "100%", sm: "auto" },
                }}
            >
                <ToggleButtonGroup
                size="small"
                value={distanceView}
                exclusive
                onChange={(e, v) => v && setDistanceView(v)}
                sx={segmentedSx(theme, {
                    // IMPORTANT: don't make it fullWidth inside a row layout on sm+
                    fullWidth: { xs: true, sm: false },
                    radius: 10,
                })}
                >
                <ToggleButton value="carry">Carry</ToggleButton>
                <ToggleButton value="total">Total</ToggleButton>
                <ToggleButton value="both">Both</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            </Box>

        <Collapse in={showRanges}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {safeCategories.map((category) => {
              if (!category?.id) return null;

              const categoryShots = shotsByCategoryId[category.id] || [];
              if (!categoryShots.length) return null;

              return (
                <Paper key={category.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 1, display: "block", mb: 1 }}>
                    {category.name || "Unknown Category"}
                  </Typography>

                  <Stack spacing={2}>
                    {(distanceView === "total" || distanceView === "both") && (
                      <RangeDisplay
                        title="Total"
                        shots={categoryShots}
                        displayUnit={displayUnit}
                        distanceMetric="total"
                        shotConfig={safeShotConfig}
                        overallChartMin={overallChartMin}
                        overallChartMax={overallChartMax}
                      />
                    )}

                    {(distanceView === "carry" || distanceView === "both") && (
                      <RangeDisplay
                        title="Carry"
                        shots={categoryShots}
                        displayUnit={displayUnit}
                        distanceMetric="carry"
                        shotConfig={safeShotConfig}
                        overallChartMin={overallChartMin}
                        overallChartMax={overallChartMax}
                      />
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Collapse>
      </Box>
    );
  };

export default DistanceRangesSection;
