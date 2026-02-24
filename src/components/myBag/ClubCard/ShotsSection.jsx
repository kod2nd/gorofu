import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from "@mui/material";
import {
  Add as Plus,
  Settings,
  ArrowUpward,
  ArrowDownward,
  Sort,
  AutoAwesome as Sparkles,
  TrackChanges as Target,
} from "@mui/icons-material";

import ShotCard from "./ShotCard";


const ShotsSection = ({
    shotsCount,
    sortedShots,
    shotConfig,
    displayUnit,
    club,
    onManageShotTypes,
    onAddShot,
    onEditShot,
    onDeleteShot,
    shotSortOrder,
    setShotSortOrder,
    shotSortDirection,
    setShotSortDirection,
}) => {
    return (
        <Box sx={{ mt: 4 }}>
        <Box
            sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            mb: 4,
            gap: 2,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Sparkles sx={{ width: 20, height: 20, color: "text.secondary" }} />
            <Typography variant="h5" fontWeight="bold">
                Shots ({shotsCount})
            </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Button variant="outlined" startIcon={<Settings />} onClick={onManageShotTypes} sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800 }}>
                Manage Shot Types
            </Button>
            <Button variant="contained" startIcon={<Plus />} onClick={onAddShot} sx={{ borderRadius: 3, textTransform: "none", fontWeight: 900 }}>
                Add Shot
            </Button>
            </Stack>
        </Box>

        {shotsCount > 0 && (
            <Paper
            variant="outlined"
            sx={{
                p: 2,
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
                mb: 2,
                borderRadius: 3,
            }}
            >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Sort color="action" />
                <Typography variant="body2" fontWeight="bold" color="text.secondary">
                Sort Shots By
                </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap", gap: 1, alignItems: { xs: "stretch", sm: "center" } }}>
                <ToggleButtonGroup
                size="small"
                value={shotSortOrder}
                exclusive
                onChange={(e, v) => v && setShotSortOrder(v)}
                sx={{ borderRadius: 2 }}
                >
                <ToggleButton value="distance">Distance</ToggleButton>
                <ToggleButton value="category">Category</ToggleButton>
                <ToggleButton value="category_distance">Cat & Dist</ToggleButton>
                </ToggleButtonGroup>

                <ToggleButtonGroup
                size="small"
                value={shotSortDirection}
                exclusive
                onChange={(e, v) => v && setShotSortDirection(v)}
                sx={{ borderRadius: 2 }}
                >
                <ToggleButton value="desc">
                    <ArrowDownward fontSize="small" />
                </ToggleButton>
                <ToggleButton value="asc">
                    <ArrowUpward fontSize="small" />
                </ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            </Paper>
        )}

        {sortedShots.length ? (
            <Stack spacing={2}>
            {sortedShots.map((shot) => (
                <ShotCard
                key={shot.id}
                shot={shot}
                displayUnit={displayUnit}
                shotConfig={shotConfig}
                onEdit={() => onEditShot(shot)}
                onDelete={() => onDeleteShot(shot.id)}
                />
            ))}
            </Stack>
        ) : (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
            <Target sx={{ width: 48, height: 48, mx: "auto", mb: 2, color: "grey.400" }} />
            <Typography variant="h6" color="text.secondary" fontWeight="medium" sx={{ mb: 2 }}>
                No shots logged yet
            </Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={onAddShot} sx={{ borderRadius: 3, textTransform: "none", fontWeight: 900 }}>
                Add First Shot
            </Button>
            </Paper>
        )}
        </Box>
    );
};

export default ShotsSection;