import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Switch,
  Typography,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  Checkbox,
  Autocomplete,
  Chip,
  FormHelperText,
} from "@mui/material";

const initialBagState = {
  name: "",
  tags: [],
  is_default: false,
  clubIds: [],
};

const clubTypesOrder = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];

const BagPresetModal = ({ open, onClose, onSave, bagToEdit, myClubs }) => {
  const [bagData, setBagData] = useState(initialBagState);
  const [error, setError] = useState("");

  const isEditMode = Boolean(bagToEdit);
  const clubLimit = 14;

  useEffect(() => {
    if (isEditMode && bagToEdit) {
      setBagData({
        id: bagToEdit.id,
        name: bagToEdit.name || "",
        tags: bagToEdit.tags || [],
        is_default: bagToEdit.is_default || false,
        clubIds: bagToEdit.clubIds || [],
      });
    } else {
      setBagData(initialBagState);
    }
  }, [bagToEdit, isEditMode, open]);

  const groupedClubs = useMemo(() => {
    const groups = {};
    // Initialize groups to maintain order
    clubTypesOrder.forEach(type => {
      groups[type] = [];
    });

    (myClubs || []).forEach(club => {
      const type = club.type && clubTypesOrder.includes(club.type) ? club.type : 'Other';
      groups[type].push(club);
    });

    // Sort specific groups by loft
    ['Iron', 'Wedge', 'Hybrid', 'Woods'].forEach(type => {
      if (groups[type]) {
        groups[type].sort((a, b) => {
          const loftA = parseInt(a.loft) || 999;
          const loftB = parseInt(b.loft) || 999;
          if (loftA !== loftB) {
            return loftA - loftB;
          }
          return a.name.localeCompare(b.name); // Fallback sort
        });
      }
    });

    return groups;
  }, [myClubs]);

  const handleClubToggle = (clubId) => {
    const { clubIds } = bagData;
    const currentIndex = clubIds.indexOf(clubId);
    const newClubIds = [...clubIds];

    if (currentIndex === -1) {
      if (newClubIds.length < clubLimit) {
        newClubIds.push(clubId);
      }
    } else {
      newClubIds.splice(currentIndex, 1);
    }
    setBagData((prev) => ({ ...prev, clubIds: newClubIds }));
  };

  const handleSave = () => {
    if (!bagData.name) {
      setError("Bag Name is required.");
      return;
    }
    setError("");
    onSave(bagData);
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Edit Bag" : "Add Bag"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <FormHelperText error sx={{ ml: 2 }}>
              {error}
            </FormHelperText>
          )}
          <TextField
            autoFocus
            label="Preset Name"
            value={bagData.name}
            onChange={(e) =>
              setBagData((prev) => ({ ...prev, name: e.target.value }))
            }
            fullWidth
          />
          <Autocomplete
            multiple
            freeSolo
            filterSelectedOptions
            options={[]}
            value={bagData.tags}
            onChange={(event, newValue) => {
              setBagData((prev) => ({ ...prev, tags: newValue }));
            }}
            renderTags={(value, getTagProps) => {
              return value.map((option, index) => {
                // Destructure to separate the key from the rest of the props
                const { key, ...chipProps } = getTagProps({ index });
                return <Chip key={key} variant="outlined" label={option} {...chipProps} />;
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags (e.g., Windy, Wet, Links)"
                onBlur={(event) => {
                  const { value } = event.target;
                  if (value && !bagData.tags.includes(value)) {
                    // Add the tag when the input field loses focus
                    setBagData(prev => ({ ...prev, tags: [...prev.tags, value] }));
                  }
                }}
              />
            )}
          />
          <FormControlLabel
            control={
              <Switch
                checked={bagData.is_default}
                onChange={(e) =>
                  setBagData((prev) => ({
                    ...prev,
                    is_default: e.target.checked,
                  }))
                }
              />
            }
            label="Set as default bag"
          />
          <Box>
            <Typography variant="subtitle1">
              Select Clubs ({bagData.clubIds.length}/{clubLimit})
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto" }}>
              <List dense>
                {Object.entries(groupedClubs).map(([type, clubsInGroup]) => {
                  if (clubsInGroup.length === 0) return null;
                  return (
                    <li key={type}>
                      <ul>
                        <ListSubheader>{type}</ListSubheader>
                        {clubsInGroup.map((club) => (
                          <ListItem key={club.id} disablePadding>
                            <ListItemButton
                              onClick={() => handleClubToggle(club.id)}
                              disabled={bagData.clubIds.length >= clubLimit && !bagData.clubIds.includes(club.id)}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={bagData.clubIds.includes(club.id)}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText primary={club.name} secondary={club.loft ? `Loft: ${club.loft}` : null} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </List>
            </Paper>
            {bagData.clubIds.length >= clubLimit && (
              <FormHelperText>
                You have reached the 14 club limit.
              </FormHelperText>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BagPresetModal;
