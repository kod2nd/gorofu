import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Alert,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Stack,
  Divider,
  Chip,
  Avatar,
  useTheme
} from "@mui/material";
import {
  Search,
  GolfCourse,
  MyLocation,
  Adjust,
  TrendingUp,
  TrendingDown,
  Air,
  Explore,
  Bolt,
  EmojiEvents,
} from "@mui/icons-material";
import { elevatedCardStyles, segmentedSx } from "../../styles/commonStyles";
import { convertDistance } from "../utils/utils";
import { SuggestedShotCard } from "./ClubCard/SuggestedShotCard";

const DistanceLookup = ({ myBags, myClubs, displayUnit }) => {
  const [carryQuery, setCarryQuery] = useState("");
  const [totalQuery, setTotalQuery] = useState("");
  const [suggestedShots, setSuggestedShots] = useState([]);
  const [lookupSelectedBagId, setLookupSelectedBagId] = useState("all");
  const [activeInput, setActiveInput] = useState(null);
  const theme = useTheme();

  // Use useCallback to memoize the handleSearch function
  // This prevents it from being recreated on every render, which is important for the useEffect dependency array.
  const handleSearch = useCallback((carryVal, totalVal) => {
    const carryDist = parseInt(carryVal, 10);
    const totalDist = parseInt(totalVal, 10);

    const hasCarryQuery = !isNaN(carryDist) && carryDist > 0;
    const searchDistance = hasCarryQuery ? carryDist : totalDist;
    const hasTotalQuery = !isNaN(totalDist) && totalDist > 0;

    if (!hasCarryQuery && !hasTotalQuery) {
      setSuggestedShots([]);
      return;
    }

    const clubsToSearch = lookupSelectedBagId === 'all'
      ? myClubs
      : myClubs.filter(club => myBags.find(b => b.id === lookupSelectedBagId)?.clubIds.includes(club.id));

    const exactMatches = [];
    const allShotsWithDiff = [];

    clubsToSearch.forEach(club => {
      club.shots.forEach(shot => {
        const carry = convertDistance(shot.carry_typical, shot.unit, displayUnit);
        const bagsContainingClub = myBags.filter(bag =>
          bag.clubIds.includes(club.id)
        );

        const carryMin = convertDistance(shot.carry_min, shot.unit, displayUnit);
        const carryMax = convertDistance(shot.carry_max, shot.unit, displayUnit);
        const total = convertDistance(shot.total_typical, shot.unit, displayUnit);
        const totalMin = convertDistance(shot.total_min, shot.unit, displayUnit);
        const totalMax = convertDistance(shot.total_max, shot.unit, displayUnit);

        const medianToCompare = hasCarryQuery ? carry : total;

        let isExactMatch = false;
        if (hasCarryQuery) {
          isExactMatch = (carryDist >= carryMin && carryDist <= carryMax);
        } else if (hasTotalQuery) {
          isExactMatch = (totalDist >= totalMin && totalDist <= totalMax);
        }

        const suggestion = { clubName: club.name, clubLoft: club.loft, bags: bagsContainingClub, ...shot, displayUnit, medianToCompare };

        if (isExactMatch) {
          exactMatches.push(suggestion);
        }

        // For nearby logic, calculate difference from the relevant median
        const diff = Math.abs(searchDistance - medianToCompare);
        allShotsWithDiff.push({ ...suggestion, diff });
      });
    });

    if (exactMatches.length > 0) {
      setSuggestedShots(exactMatches.map(shot => ({ ...shot, isExact: true })));
    } else {
      // No exact matches, find the nearest higher and lower options.
      const shotsAbove = allShotsWithDiff.filter(s => s.medianToCompare > searchDistance).sort((a, b) => a.diff - b.diff);
      const shotsBelow = allShotsWithDiff.filter(s => s.medianToCompare < searchDistance).sort((a, b) => a.diff - b.diff);

      const nearbyShots = [];
      if (shotsBelow.length > 0) nearbyShots.push({ ...shotsBelow[0], isNearby: true, label: 'Nearest Shorter' });
      if (shotsAbove.length > 0) nearbyShots.push({ ...shotsAbove[0], isNearby: true, label: 'Nearest Longer' });

      setSuggestedShots(nearbyShots);
    }
  }, [myBags, myClubs, displayUnit, lookupSelectedBagId]);

  // This useEffect will re-run the search whenever the display unit or bag filter changes.
  useEffect(() => {
    handleSearch(carryQuery, totalQuery);
  }, [displayUnit, lookupSelectedBagId, handleSearch]);

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Distance Lookup</Typography>
          <Typography variant="body2" color="text.secondary">Find your perfect club for any distance.</Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          value={lookupSelectedBagId}
          exclusive
          onChange={(e, newId) => { if (newId) setLookupSelectedBagId(newId); }}
          sx={segmentedSx(theme, { fullWidth: { xs: true, sm: false } })}
        >
          <ToggleButton value="all">All Clubs</ToggleButton>
          {myBags.map((bag) => (
            <ToggleButton key={bag.id} value={bag.id}>
              {bag.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Search Inputs */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 2,
            borderWidth: 2,
            borderColor: activeInput === "carry" ? "primary.main" : "divider",
            transition: "border-color 0.3s ease",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.light" }}><MyLocation /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">Carry</Typography>
              <Typography variant="caption" color="text.secondary">Where the ball lands</Typography>
            </Box>
          </Stack>
          <TextField
            fullWidth
            label={`Search by Carry (${displayUnit})`}
            type="number"
            value={carryQuery}
            onChange={(e) => {
              setCarryQuery(e.target.value);
              setTotalQuery("");
              handleSearch(e.target.value, "");
            }}
            onFocus={() => setActiveInput("carry")}
            onBlur={() => setActiveInput(null)}
            variant="filled"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              disableUnderline: true,
            }}
          />
        </Paper>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 2,
            borderWidth: 2,
            borderColor: activeInput === "total" ? "success.main" : "divider",
            transition: "border-color 0.3s ease",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "success.light" }}><Adjust /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="caption" color="text.secondary">Including roll</Typography>
            </Box>
          </Stack>
          <TextField
            fullWidth
            label={`Search by Total (${displayUnit})`}
            type="number"
            value={totalQuery}
            onChange={(e) => {
              setTotalQuery(e.target.value);
              setCarryQuery("");
              handleSearch("", e.target.value);
            }}
            onFocus={() => setActiveInput("total")}
            onBlur={() => setActiveInput(null)}
            variant="filled"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              disableUnderline: true,
            }}
          />
        </Paper>
      </Stack>

      {/* Results Section */}
      {suggestedShots.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <EmojiEvents color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              {suggestedShots[0]?.isExact ? "Matches Found" : "Nearby Options"}
            </Typography>
          </Stack>

          {!suggestedShots[0]?.isExact && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              No exact matches for this distance. Here are your closest options:
            </Alert>
          )}

          <Stack spacing={2}>
            {suggestedShots.map((shot) => (
              <SuggestedShotCard
                key={`${shot.clubName}-${shot.id}`}
                shot={shot}
                displayUnit={displayUnit}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Empty State */}
      {!carryQuery && !totalQuery && suggestedShots.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: "grey.200", color: "grey.500", mx: "auto", mb: 3 }}>
            <Search sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>Ready to find your club?</Typography>
          <Typography color="text.secondary">Enter a distance above to get started.</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DistanceLookup;