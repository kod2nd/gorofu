import React, { useState, useEffect } from "react";
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
        {isEditMode ? "Edit Bag Preset" : "Create Bag Preset"}
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
            options={[]}
            value={bagData.tags}
            onChange={(event, newValue) => {
              setBagData((prev) => ({ ...prev, tags: newValue }));
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Tags (e.g., Windy, Wet, Links)" />
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
                {myClubs.map((club) => (
                  <ListItem key={club.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleClubToggle(club.id)}
                      disabled={
                        bagData.clubIds.length >= clubLimit &&
                        !bagData.clubIds.includes(club.id)
                      }
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={bagData.clubIds.includes(club.id)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText primary={club.name} secondary={club.type} />
                    </ListItemButton>
                  </ListItem>
                ))}
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
          Save Preset
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BagPresetModal;
