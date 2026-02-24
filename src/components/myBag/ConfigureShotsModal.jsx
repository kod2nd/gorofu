import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography,
  IconButton, Paper, TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  Tooltip, Slider, Autocomplete, ToggleButtonGroup, ToggleButton, useTheme
} from "@mui/material";
import { Save, Tune } from "@mui/icons-material";
import { createShot, updateShot, deleteShot } from '../../services/myBagService';
import { segmentedSx } from '../../styles/commonStyles';

const initialShotState = {
  shot_type: "",
  carry_min: 130,
  carry_typical: 140,
  carry_max: 150,
  total_min: 140,
  total_typical: 150,
  total_max: 160,
  unit: "meters",
  launch: "",
  roll: "",
  tendency: [],
  swing_key: [],
};

const LAUNCH_OPTIONS = ['Low', 'Medium', 'High'];
const ROLL_OPTIONS = ['Minimal', 'Soft Release', 'Runs'];

// Common tendency options that users can choose from
const COMMON_TENDENCIES = [
  'Draw', 'Fade', 'Hook', 'Slice', 'Pull', 'Push',
  'Thin', 'Fat', 'Topped', 'Heeled', 'Toed',
  'Consistent', 'Variable'
];

// Common swing feel options
const COMMON_SWING_KEYS = [
  'Smooth tempo', 'Aggressive', '3/4 swing', 'Full swing',
  'Hold finish', 'Accelerate through', 'Stay down',
  'High hands', 'Compact swing', 'Wide arc'
];

const DistanceRangeSlider = ({
  label,
  minValue,
  typicalValue,
  maxValue,
  onChange, // (field, value) => void
  unit,
  max = 300,
}) => {
  const clamp = (v) => Math.max(0, Math.min(max, Number(v) || 0));

  const value = [
    clamp(minValue),
    clamp(typicalValue),
    clamp(maxValue),
  ].sort((a, b) => a - b);

  const handleSliderChange = (_, newValue) => {
    // newValue: [min, typical, max]
    const [newMin, newTypical, newMax] = newValue;

    onChange("min", Math.round(newMin));
    onChange("typical", Math.round(newTypical));
    onChange("max", Math.round(newMax));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label} ({value[0]} / {value[1]} / {value[2]} {unit})
      </Typography>

      <Slider
        value={value}
        onChange={handleSliderChange}
        min={0}
        max={max}
        step={1}
        disableSwap
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="caption" color="text.secondary">Min: {value[0]} {unit}</Typography>
        <Typography variant="caption" color="text.secondary">Typical: {value[1]} {unit}</Typography>
        <Typography variant="caption" color="text.secondary">Max: {value[2]} {unit}</Typography>
      </Box>
    </Box>
  );
};

const TagInput = ({ label, value, onChange, options, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (newValue) => {
    if (newValue && !value.includes(newValue)) {
      onChange([...value, newValue]);
    }
    setInputValue('');
  };

  const handleDeleteTag = (tagToDelete) => {
    onChange(value.filter(tag => tag !== tagToDelete));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      handleAddTag(inputValue.trim());
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      
      {/* Selected Tags */}
      <Box sx={{ mb: 1, minHeight: 32 }}>
        {value.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
            size="small"
            sx={{ m: 0.5 }}
          />
        ))}
      </Box>

      {/* Input with suggestions */}
      <Autocomplete
        freeSolo
        options={options}
        inputValue={inputValue}
        onInputChange={(event, newValue) => setInputValue(newValue)}
        onChange={(event, newValue) => {
          if (newValue) handleAddTag(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            size="small"
            onKeyPress={handleKeyPress}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option}>{option}</li>
        )}
      />
    </Box>
  );
};

const ShotForm = ({ shot, onSave, onCancel, clubId, availableShotTypes, onManageShotTypes }) => {
  const [formData, setFormData] = useState(initialShotState);

  const theme = useTheme();

  useEffect(() => {
    if (shot) {
      // Ensure arrays for tags
      const shotData = {
        ...initialShotState,
        ...shot,
        tendency: Array.isArray(shot.tendency) ? shot.tendency : shot.tendency ? [shot.tendency] : [],
        swing_key: Array.isArray(shot.swing_key) ? shot.swing_key : shot.swing_key ? [shot.swing_key] : [],
      };
      setFormData(shotData);
    } else {
      // Adding a new shot
      const defaultShotType = availableShotTypes[0]?.name || '';
      setFormData({ ...initialShotState, club_id: clubId, shot_type: defaultShotType });
    }
  }, [shot, clubId, availableShotTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDistanceChange = (field, part, newValue) => {
    setFormData((prev) => ({
      ...prev,
      [`${field}_${part}`]: newValue,
    }));
  };

  const handleTagsChange = (field, newTags) => {
    setFormData(prev => ({ ...prev, [field]: newTags }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.shot_type) {
      alert("Shot Type is required.");
      return;
    }
    if (formData.total_typical == null) {
      alert("Total Typical distance is required.");
      return;
    }
    if (formData.carry_typical == null) {
      alert("Carry Typical distance is required.");
      return;
    }
    await onSave(formData);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>{shot?.id ? 'Edit Shot' : 'Add New Shot'}</Typography>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Shot Type</InputLabel>
            <Select 
              name="shot_type" 
              value={formData.shot_type} 
              label="Shot Type" 
              onChange={handleChange}
              error={!formData.shot_type}
            >
              {availableShotTypes.map(type => (
                <MenuItem key={type.id} value={type.name}>{type.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Manage Shot Types">
            <IconButton onClick={onManageShotTypes}>
              <Tune />
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>Distance Unit</Typography>
          <ToggleButtonGroup
            color="primary"
            value={formData.unit}
            exclusive
            onChange={(e, newUnit) => {
              if (newUnit) handleChange({ target: { name: 'unit', value: newUnit } });
            }}
            size="small"
            sx={segmentedSx(theme, { fullWidth: { xs: true, sm: false }, radius: 10 })}
          >
            <ToggleButton value="yards">Yards</ToggleButton>
            <ToggleButton value="meters">Meters</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Total Distance Slider */}
        <DistanceRangeSlider
          label="Total Distance"
          minValue={formData.total_min}
          typicalValue={formData.total_typical}
          maxValue={formData.total_max}
          onChange={(part, v) => handleDistanceChange("total", part, v)}
          unit={formData.unit}
          max={formData.unit === "meters" ? 274 : 300}
        />

        {/* Carry Distance Slider */}
        <DistanceRangeSlider
          label="Carry Distance"
          minValue={formData.carry_min}
          typicalValue={formData.carry_typical}
          maxValue={formData.carry_max}
          onChange={(part, v) => handleDistanceChange("carry", part, v)}
          unit={formData.unit}
          max={formData.unit === "meters" ? 274 : 300}
        />

        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Launch</InputLabel>
            <Select name="launch" value={formData.launch} label="Launch" onChange={handleChange}>
              <MenuItem value=""><em>Select Launch</em></MenuItem>
              {LAUNCH_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Roll Out</InputLabel>
            <Select name="roll" value={formData.roll} label="Roll" onChange={handleChange}>
              <MenuItem value=""><em>Select Roll Out</em></MenuItem>
              {ROLL_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <TagInput
          label="Tendencies / Misses"
          value={formData.tendency}
          onChange={(newTags) => handleTagsChange('tendency', newTags)}
          options={COMMON_TENDENCIES}
          placeholder="Add tendency or miss pattern..."
        />

        <TagInput
          label="Swing Keys / Feel"
          value={formData.swing_key}
          onChange={(newTags) => handleTagsChange('swing_key', newTags)}
          options={COMMON_SWING_KEYS}
          placeholder="Add swing thought or key..."
        />

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>Save Shot</Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

const ConfigureShotsModal = ({ open, onModalClose, club, onDataChange, shotTypes: allShotTypes = [], onManageShotTypes }) => {
  const [editingShot, setEditingShot] = useState(null);

  useEffect(() => {
    if (club) {
      // Reset editing state when club changes or modal opens
      setEditingShot(club.shotToEdit || null);
      // If the modal is opened with the intent to add a shot, set the state immediately.
      if (club.openInAddMode) {
        setEditingShot(true);
      }
    }
  }, [club]);

  const handleSaveShot = async (shotData) => {
    try {
      // Convert arrays back to strings for API if needed, or keep as arrays
      const processedData = {
        ...shotData,
        tendency: shotData.tendency.join(', '), // or keep as array if API supports it
        swing_key: shotData.swing_key.join(', '),
      };

      if (shotData.id) {
        const updatedShot = await updateShot(shotData.id, processedData);
      } else {
        const newShot = await createShot({ ...processedData, club_id: club.id });
      }
      setEditingShot(null);
      onDataChange();
      onModalClose(); // Close the modal on successful save
    } catch (error) {
      console.error("Failed to save shot:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingShot(null);
    onModalClose();
  };

  const shotTypesForNewShot = allShotTypes.filter(st => 
    !club?.shots?.some(s => s.shot_type === st.name)
  );
  
  const getShotTypesForEditing = (shotBeingEdited) => {
    if (!shotBeingEdited) return shotTypesForNewShot;
    
    const currentShotType = allShotTypes.find(st => st.name === shotBeingEdited.shot_type);
    const otherTypes = allShotTypes.filter(st => st.name !== shotBeingEdited.shot_type && !club?.shots?.some(s => s.shot_type === st.name));
    
    return currentShotType ? [currentShotType, ...otherTypes] : otherTypes;
  };

  if (!club) return null;

  return (
    <Dialog open={open} onClose={onModalClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {club.shotToEdit ? `Edit Shot for ${club.name}` : `Add Shot to ${club.name}`}
      </DialogTitle>
      <DialogContent>
        <ShotForm
          shot={editingShot === true ? null : editingShot}
          onSave={handleSaveShot}
          onCancel={handleCancelEdit}
          clubId={club.id}
          onManageShotTypes={onManageShotTypes}
          availableShotTypes={getShotTypesForEditing(editingShot)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConfigureShotsModal;