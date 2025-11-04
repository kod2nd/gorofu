import React, { useState } from "react";
import {
  Box,
  ButtonGroup,
  Typography,
  IconButton,
  Button,
  Paper,
  Grid,
  TextField,
  Switch,
  Checkbox,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import { Check, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { statDefinitions } from "./holeDetailsTableHelper";
import {
  boldTextStyles,
  switchStyles,
  textFieldStyles,
} from "./holeDetailsTableHelper";

const QuickSelector = ({ stat, holeData, onHoleChange, primaryOptions, extendedOptions }) => {
  const [showExtended, setShowExtended] = useState(false);

  const handleChange = (value) => {
    onHoleChange({
      target: { name: stat.name, value: value },
    });
  };

  return (
    <Box>
      <Tooltip title={stat.tooltip} placement="top-start">
        <Typography variant="body2" color="text.secondary" mb={1}>
          {stat.label}
        </Typography>
      </Tooltip>
      <ButtonGroup fullWidth>
        {primaryOptions.map((option) => (
          <Button
            key={option}
            variant={holeData[stat.name] === option ? "contained" : "outlined"}
            onClick={() => handleChange(option)}
            disabled={!holeData.played}
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
      {extendedOptions && showExtended && (
        <ButtonGroup fullWidth sx={{ mt: 1 }}>
          {extendedOptions.map((option) => (
            <Button
              key={option}
              variant={holeData[stat.name] === option ? "contained" : "outlined"}
              onClick={() => handleChange(option)}
              disabled={!holeData.played}
            >
              {option}
            </Button>
          ))}
        </ButtonGroup>
      )}
      {extendedOptions && (
        <Box sx={{ textAlign: "right" }}>
          <Button onClick={() => setShowExtended((prev) => !prev)} variant="text" size="small" sx={{ color: "text.secondary", textTransform: "none", mt: 0.5, p: 0.5 }}>
            {showExtended ? "less..." : "more..."}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const PuttSelector = ({ stat, holeData, onHoleChange }) => {
  const [showExtended, setShowExtended] = useState(false);
  const primaryOptions = [0, 1, 2, 3, 4];
  const extendedOptions = [5, 6, 7, 8, 9];

  const handlePuttChange = (puttCount) => {
    onHoleChange({
      target: { name: stat.name, value: puttCount },
    });
  };

  return (
    <Box>
      <Tooltip title={stat.tooltip} placement="top-start">
        <Typography variant="body2" color="text.secondary" mb={1}>
          {stat.label}
        </Typography>
      </Tooltip>
      <ButtonGroup fullWidth>
        {primaryOptions.map((putt) => (
          <Button
            key={putt}
            variant={holeData[stat.name] === putt ? "contained" : "outlined"}
            onClick={() => handlePuttChange(putt)}
            disabled={!holeData.played}
          >
            {putt}
          </Button>
        ))}
      </ButtonGroup>
      {showExtended && (
        <ButtonGroup fullWidth sx={{ mt: 1 }}>
          {extendedOptions.map((putt) => (
            <Button
              key={putt}
              variant={holeData[stat.name] === putt ? "contained" : "outlined"}
              onClick={() => handlePuttChange(putt)}
              disabled={!holeData.played}
            >
              {putt}
            </Button>
          ))}
        </ButtonGroup>
      )}
      <Box sx={{ textAlign: "right" }}>
        <Button
          onClick={() => setShowExtended((prev) => !prev)}
          variant="text"
          size="small"
          sx={{
            color: "text.secondary",
            textTransform: "none",
            mt: 0.5,
            p: 0.5,
          }}
        >
          {showExtended ? "less..." : "more..."}
        </Button>
      </Box>
    </Box>
  );
};

const StatInput = ({ stat, holeData, onHoleChange, isEditMode }) => {
  const isDNP = !holeData.played;
  const shouldBeRed =
    holeData.hole_score > 0 && stat.isRelevantForRed && !holeData[stat.name];

  const createChangeHandler = (e) => {
    // The parent expects the hole index and the event, but here we only have the event.
    // The parent `HoleDetailsForm` will need to wrap this to provide the index.
    onHoleChange(e);
  };

  if (stat.name === "hole_score") {
    return (
      <QuickSelector
        stat={stat}
        holeData={holeData}
        onHoleChange={onHoleChange}
        primaryOptions={[2, 3, 4, 5, 6, 7]}
        extendedOptions={[1, 8, 9, 10, 11, 12]}
      />
    );
  }

  if (stat.name === "penalty_shots") {
    return (
      <QuickSelector
        stat={stat}
        holeData={holeData}
        onHoleChange={onHoleChange}
        primaryOptions={[0, 1, 2, 3, 4]}
        extendedOptions={[5, 6, 7, 8, 9]}
      />
    );
  }

  if (stat.name === "putts" || stat.name === "putts_within4ft") {
    return (
      <PuttSelector
        stat={stat}
        holeData={holeData}
        onHoleChange={onHoleChange}
      />
    );
  };

  if (stat.type === "switch") {
    return (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
        <Tooltip title={stat.tooltip} placement="top-start">
        <Typography variant="body2" color="text.secondary" mb={1}>
          {stat.label}
        </Typography>
        </Tooltip>
        <Switch
          name={stat.name}
          checked={!!holeData[stat.name]}
          disabled={isDNP}
          onChange={createChangeHandler}
          sx={{
            ...switchStyles.default,
            ...(shouldBeRed && switchStyles.warning),
          }}
        />
      </Box>
    );
  }

  if (stat.type === "checkbox") {
    return (
      <Button
        fullWidth
        variant={holeData[stat.name] ? "contained" : "outlined"}
        onClick={() =>
          onHoleChange({
            target: {
              name: stat.name,
              value: !holeData[stat.name],
              type: "checkbox",
            },
          })
        }
        disabled={isDNP}
        sx={{
          justifyContent: "space-between",
          p: 1.5,
          color: holeData[stat.name] ? "white" : "text.primary",
          backgroundColor: holeData[stat.name] ? "primary.main" : "grey.100",
          "&:hover": {
            backgroundColor: holeData[stat.name] ? "primary.dark" : "grey.200",
          },
        }}
      >
        <Tooltip title={stat.tooltip} placement="top-start">
          <Typography
            variant="body1"
            fontWeight="medium"
            sx={{ textAlign: "left" }}
          >
            {stat.label}
          </Typography>
        </Tooltip>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: holeData[stat.name]
              ? "rgba(255,255,255,0.2)"
              : "grey.300",
          }}
        >
          {holeData[stat.name] && <Check fontSize="small" />}
        </Box>
      </Button>
    );
  }

  return (
    <Box>
      <Tooltip title={stat.tooltip} placement="top-start">
        <Typography variant="body2" color="text.secondary" mb={1}>
          {stat.label}
        </Typography>
      </Tooltip>
      <TextField
        fullWidth
        size="small"
        type={stat.type}
        inputMode={stat.inputMode}
        autoComplete="off"
        pattern={stat.pattern}
        name={stat.name}
        value={holeData[stat.name] || ""}
        placeholder={stat.placeholder || ""}
        disabled={
          isDNP ||
          (["par", "distance"].includes(stat.name) ? isEditMode : false)
        }
        onChange={createChangeHandler}
        required={["par", "hole_score"].includes(stat.name)}
        sx={textFieldStyles}
        slotProps={{
          // Use slotProps.input for props passed to the underlying Input component
          // and slotProps.htmlInput for props passed to the <input> element.
          style: { textAlign: "left", ...boldTextStyles, fontSize: "0.8rem" },
        }}
      />
    </Box>
  );
};

const MobileHoleEntry = ({
  holes,
  currentHoleIndex,
  setCurrentHoleIndex,
  handleHoleChange,
  isEditMode,
  distanceUnit = "meters",
  roundType = "18_holes",
  isMobile,
}) => {
  const currentHoleData = holes[currentHoleIndex];
  const [showExtendedParOptions, setShowExtendedParOptions] = useState(false);
  
  // Wrapper to inject the current hole index into the parent handler
  const onHoleChange = (e) => {
    handleHoleChange(currentHoleIndex, e);
  };

  const goToHole = (index) => {
    if (index >= 0 && index < holes.length) {
      setCurrentHoleIndex(index);
    }
  };

  const handleQuickParChange = (par) => {
    onHoleChange({
      target: { name: "par", value: par },
    });
  };

  const { traditional, longGame, shortGame } = statDefinitions;

  const activeNine = currentHoleIndex < 9 ? "front" : "back";
  const nineStartIndex = activeNine === "front" ? 0 : 9;

  const getScoreBadge = () => {
    if (!currentHoleData.hole_score || !currentHoleData.par) return null;
    const diff = currentHoleData.hole_score - currentHoleData.par;
    if (diff < -1) return { label: "Eagle/Better", color: "info.main" };
    if (diff === -1) return { label: "Birdie", color: "success.main" };
    if (diff === 0) return { label: "Par", color: "text.secondary" };
    if (diff === 1) return { label: "Bogey", color: "warning.main" };
    if (diff > 1) return { label: "Dbl Bogey+", color: "error.main" };
    return null;
  };
  const scoreBadge = getScoreBadge();

  const parOptions = showExtendedParOptions ? [2, 3, 4, 5, 6, 7] : [3, 4, 5];

  // Separate hole details from player stats for better UI grouping
  const holeDetailStats = traditional.filter((s) =>
    ["par", "distance"].includes(s.name)
  );
  const playerStats = traditional.filter(
    (s) => !["par", "distance"].includes(s.name)
  );  
  
  // Determine which holes to show in the quick selector
  let holesToDisplay, startIndex, gridItemSize;
  if (isMobile) {
    const activeNine = currentHoleIndex < 9 ? "front" : "back";
    startIndex = activeNine === "front" ? 0 : 9;
    holesToDisplay = Array.from({ length: 9 });
    gridItemSize = 1.33;
  } else {
    if (roundType === 'front_9') {
      startIndex = 0;
      holesToDisplay = Array.from({ length: 9 });
    } else if (roundType === 'back_9') {
      startIndex = 9;
      holesToDisplay = Array.from({ length: 9 });
    } else { // 18_holes
      startIndex = 0;
      holesToDisplay = Array.from({ length: 18 });
    }
    gridItemSize = 12 / holesToDisplay.length;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Nine Selector */}
      {isMobile && roundType === '18_holes' && (
        <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
        <Button
          variant={activeNine === "front" ? "contained" : "outlined"}
          onClick={() => goToHole(0)}
          sx={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          Front 9
        </Button>
        <Button
          variant={activeNine === "back" ? "contained" : "outlined"}
          onClick={() => goToHole(9)}
          sx={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          Back 9
        </Button>
        </Box>
      )}

      {/* Hole Quick Selector */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        {holesToDisplay.map((_, idx) => {
          const holeNum = nineStartIndex + idx;
          const isActive = currentHoleIndex === holeNum;
          const hasScore = holes[holeNum].hole_score > 0;
          return (
            <Button
                key={holeNum}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => goToHole(holeNum)}
                sx={{
                  p: 1,
                  width: { xs: 36, sm: 40 }, // Fixed width
                  height: { xs: 36, sm: 40 }, // Fixed height
                  minWidth: 0, // Override default minWidth
                  fontWeight: "bold",
                  backgroundColor: isActive
                    ? "primary.dark"
                    : hasScore
                    ? "success.light"
                    : "background.paper",
                  borderColor: "divider",
                  transform: isActive ? "scale(1.1)" : "none",
                  transition: "transform 0.2s",
                  flex: { xs: '1 1 9%', sm: '0 0 auto' }, // Adjust flex behavior
                }}
              >
                {holeNum + 1}
              </Button>
          );
        })}
      </Box>

      {/* Main Card */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 2,
            textAlign: "center",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              color="inherit"
              onClick={() => goToHole(currentHoleIndex - 1)}
              disabled={currentHoleIndex === 0}
            >
              <ChevronLeft />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Hole {currentHoleIndex + 1}
              </Typography>
              <Typography>Par {currentHoleData.par || "-"}</Typography>
            </Box>
            <IconButton
              color="inherit"
              onClick={() => goToHole(currentHoleIndex + 1)}
              disabled={currentHoleIndex === holes.length - 1}
            >
              <ChevronRight />
            </IconButton>
          </Box>
          {scoreBadge && (
            <Chip
              label={scoreBadge.label}
              size="small"
              sx={{
                mt: 1,
                bgcolor: scoreBadge.color,
                color: "white",
                fontWeight: "bold",
              }}
            />
          )}
        </Box>

        {/* Body */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
        <Typography variant="body2" color="text.secondary" mb={1}>
          Hole Played
        </Typography>
              <Switch
                name="played"
                checked={currentHoleData.played}
                onChange={onHoleChange}
                sx={{
                  ...switchStyles.default,
                  transform: 'scale(1.2)',
                }}
              />
            </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          
            {/* Hole Details Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  ...boldTextStyles,
                  color: "text.secondary",
                  display: "block",
                  mb: 1.5,
                }}
              >
                HOLE DETAILS
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Tooltip title="Par for this hole" placement="top-start">
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Par
                  </Typography>
                </Tooltip>
                <ButtonGroup fullWidth>
                  {parOptions.map((par) => (
                    <Button
                      key={par}
                      variant={
                        currentHoleData.par === par ? "contained" : "outlined"
                      }
                      onClick={() => handleQuickParChange(par)}
                      disabled={isEditMode}
                    >
                      {par}
                    </Button>
                  ))}
                </ButtonGroup>
                <Box sx={{ textAlign: "right" }}>
                  <Button
                    onClick={() => setShowExtendedParOptions((prev) => !prev)}
                    variant="text"
                    size="small"
                    sx={{
                      color: "text.secondary",
                      textTransform: "none",
                      mt: 0.5,
                      p: 0.5,
                    }}
                  >
                    {showExtendedParOptions ? "less..." : "more..."}
                  </Button>
                </Box>
              </Box>

              <StatInput
                stat={{
                  ...holeDetailStats.find((s) => s.name === "distance"),
                  label: `Dist. (${distanceUnit === "meters" ? "m" : "y"})`,
                }}
                holeData={currentHoleData}
                onHoleChange={onHoleChange}
                isEditMode={isEditMode}
              />
            </Box>

            {/* Player Stats Section */}

            <Box sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="overline"
                sx={{
                  ...boldTextStyles,
                  color: "text.secondary",
                  display: "block",
                  mb: 1.5,
                }}
              >
                YOUR STATS
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {playerStats.map((stat) => (
                  <Box key={stat.name} sx={{ flex: '1 1 calc(50% - 8px)' }}>
                    <StatInput
                      stat={stat}
                      holeData={currentHoleData}
                      onHoleChange={onHoleChange}
                      isEditMode={isEditMode}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Long Game Stats */}
            <Box sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="overline"
                sx={{
                  ...boldTextStyles,
                  color: "text.secondary",
                  display: "block",
                  mb: 1.5,
                }}
              >
                LONG GAME
              </Typography>

              {/* ✅ Removed Grid item misuse — just stack full-width boxes */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                {longGame.map((stat) => (
                  <StatInput
                    key={stat.name}
                    stat={stat}
                    holeData={currentHoleData}
                    onHoleChange={onHoleChange}
                    isEditMode={isEditMode}
                  />
                ))}
              </Box>
            </Box>
            {/* Short Game Stats */}
            <Box sx={{ mb: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="overline"
                sx={{
                  ...boldTextStyles,
                  color: "text.secondary",
                  display: "block",
                  mb: 1.5,
                }}
              >
                SHORT GAME
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  width: "100%",
                }}
              >
                {shortGame.map((stat) => (
                  <StatInput
                    key={stat.name}
                    stat={stat}
                    holeData={currentHoleData}
                    onHoleChange={onHoleChange}
                    isEditMode={isEditMode}
                  />
                ))}
              </Box>
            </Box>
        
        </Box>
      </Paper>
    </Box>
  );
};

export default MobileHoleEntry;
