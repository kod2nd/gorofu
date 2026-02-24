import React from "react";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  Collapse,
  IconButton,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  TrendingUp,
  TrendingDown,
  Check,
  ExpandMore as ExpandMoreIcon,
  GolfCourse,
  Explore,
  Air,
  Bolt,
} from "@mui/icons-material";
import { convertDistance } from "../../utils/utils";

const RangeRow = ({ label, min, typical, max, unitLabel }) => {
  // Small, consistent row: label left, numbers right (wrap-safe)
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1.5}
      sx={{ minWidth: 0 }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 800, flexShrink: 0 }}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}
      >
        <Chip
          size="small"
          label={`${Math.round(min)}${unitLabel}`}
          sx={(t) => ({
            borderRadius: 999,
            fontWeight: 700,
            bgcolor: alpha(t.palette.text.primary, 0.06),
            color: alpha(t.palette.text.primary, 0.65),
          })}
        />
        <Chip
          size="small"
          label={`${Math.round(typical)}${unitLabel}`}
          sx={(t) => ({
            borderRadius: 999,
            fontWeight: 900,
            bgcolor: alpha(t.palette.info.main, 0.18),
          })}
        />
        <Chip
          size="small"
          label={`${Math.round(max)}${unitLabel}`}
          sx={(t) => ({
            borderRadius: 999,
            fontWeight: 700,
            bgcolor: alpha(t.palette.text.primary, 0.06),
            color: alpha(t.palette.text.primary, 0.65),
          })}
        />
      </Stack>
    </Stack>
  );
};

const BadgeRow = ({ shot }) => {
  const labelChip =
    shot.label === "Nearest Longer" ? (
      <Chip
        icon={<TrendingUp />}
        label="Nearest Longer"
        color="info"
        size="small"
        sx={{ fontWeight: 900 }}
      />
    ) : shot.label === "Nearest Shorter" ? (
      <Chip
        icon={<TrendingDown />}
        label="Nearest Shorter"
        color="info"
        size="small"
        sx={{ fontWeight: 900 }}
      />
    ) : null;

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
      {labelChip}
      {shot.isExact && (
        <Chip
          icon={<Check />}
          color="success"
          size="small"
          sx={{ fontWeight: 900 }}
        />
      )}
    </Stack>
  );
};

export const SuggestedShotCard = ({ shot, displayUnit }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = React.useState(!isXs); // open by default on desktop

  const unitLabel = displayUnit === "meters" ? "m" : "yd";

  // Use ONE displayUnit consistently (your snippet mixed shot.displayUnit & displayUnit)
  const carryMin = convertDistance(shot.carry_min, shot.unit, displayUnit);
  const carryTyp = convertDistance(shot.carry_typical, shot.unit, displayUnit);
  const carryMax = convertDistance(shot.carry_max, shot.unit, displayUnit);

  const totalMin = convertDistance(shot.total_min, shot.unit, displayUnit);
  const totalTyp = convertDistance(shot.total_typical, shot.unit, displayUnit);
  const totalMax = convertDistance(shot.total_max, shot.unit, displayUnit);

  const hasMeta =
    !!shot.launch || !!shot.roll || !!shot.tendency || !!shot.swing_key;
  const hasBags = Array.isArray(shot.bags) && shot.bags.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.25}>
        {/* Top row: badges + expand toggle (mobile) */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
        >
          <BadgeRow shot={shot} />

          {(hasMeta || hasBags) && isXs && (
            <IconButton
              size="small"
              onClick={() => setOpen((v) => !v)}
              aria-label="toggle details"
              sx={{
                border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                borderRadius: 2,
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transition: "transform 180ms ease",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </IconButton>
          )}
        </Stack>

        {/* Title */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 950, lineHeight: 1.15 }}
            noWrap={!isXs}
          >
            {shot.clubName} {shot.clubLoft ? `(${shot.clubLoft})` : ""} —{" "}
            {shot.shot_type}
          </Typography>
          {shot.courseContext && (
            <Typography variant="body2" color="text.secondary" noWrap={!isXs}>
              {shot.courseContext}
            </Typography>
          )}
        </Box>

        {/* Ranges: always visible */}
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          <RangeRow
            label="Carry"
            min={carryMin}
            typical={carryTyp}
            max={carryMax}
            unitLabel={unitLabel}
          />
          <RangeRow
            label="Total"
            min={totalMin}
            typical={totalTyp}
            max={totalMax}
            unitLabel={unitLabel}
          />
        </Stack>

        {(hasMeta || hasBags) && <Divider sx={{ my: 0.5 }} />}

        {/* Details: collapsible on mobile */}
        <Collapse in={open || !isXs} timeout={200} unmountOnExit>
          <Stack spacing={1.25}>
            {hasMeta && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 0.75 }}
              >
                {shot.launch && (
                  <Chip
                    icon={<TrendingUp />}
                    label={`Launch: ${shot.launch}`}
                    size="small"
                  />
                )}
                {shot.roll && (
                  <Chip
                    icon={<Explore />}
                    label={`Roll: ${shot.roll}`}
                    size="small"
                    color="success"
                  />
                )}
                {shot.tendency && (
                  <Chip
                    icon={<Air />}
                    label={`Tendency: ${shot.tendency}`}
                    size="small"
                    color="warning"
                  />
                )}
                {shot.swing_key && (
                  <Chip
                    icon={<Bolt />}
                    label={`Key: ${shot.swing_key}`}
                    size="small"
                    color="info"
                  />
                )}
              </Stack>
            )}

            {hasBags && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  gap: 0.75,
                  pt: 0.5,
                }}
              >
                {shot.bags.map((bag) => (
                  <Chip
                    key={bag.id}
                    icon={<GolfCourse />}
                    label={bag.name}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
};