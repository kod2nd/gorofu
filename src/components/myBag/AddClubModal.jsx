import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Alert,
  Box,
  Chip,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Autocomplete,
} from '@mui/material';

const clubTypes = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];

const initialClubState = {
    name: '',
    type: '', // e.g., 'Iron'
    make: '', // e.g., 'Titleist'
    model: '', // e.g., 'T100'
    loft: '',
    shaft_make: '',
    shaft_model: '',
    shaft_flex: '',
    shaft_weight: '',
    shaft_length: '',
    grip_make: '',
    grip_model: '',
    grip_size: 'Standard',
    grip_weight: '',
    swing_weight: '',
};

const AddClubModal = ({ open, onClose, onSave, clubToEdit, myClubs = [] }) => {
  const [clubData, setClubData] = useState(initialClubState);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(clubToEdit);

  useEffect(() => {
    if (isEditMode && clubToEdit) {
      setClubData({ ...initialClubState, ...clubToEdit });
    } else {
      setClubData(initialClubState);
    }
  }, [clubToEdit, isEditMode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClubData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setClubData(prev => ({ ...prev, type: newType }));
    }
  };

  const handleCopyFromClub = (event, selectedClub) => {
    if (!selectedClub) return;

    // Destructure to remove fields we don't want to copy (like id, name, etc.)
    const { id, name, created_at, user_id, shots, ...clubToCopy } = selectedClub;

    setClubData(prev => ({
      ...prev,
      ...clubToCopy,
    }));
  };

  const handleSave = async () => {
    if (!clubData.name || !clubData.type) {
      setError('Club Name and Type are required.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await onSave(clubData);
      handleClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the club.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setClubData(initialClubState);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Club' : 'Add New Club'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {!isEditMode && myClubs.length > 0 && (
            <>
              <Autocomplete
                options={myClubs}
                getOptionLabel={(option) => `${option.name} (${option.make || ''} ${option.model || ''})`.trim()}
                onChange={handleCopyFromClub}
                renderInput={(params) => <TextField {...params} label="Copy specs from an existing club" />}
                sx={{ mb: 1 }}
              />
              <Divider><Chip label="OR" size="small" /></Divider>
            </>
          )}

          <Stack spacing={2}>
            <TextField name="name" label="Club Name (e.g., 7 Iron)" value={clubData.name} onChange={handleChange} fullWidth required />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Club Type*</Typography>
              <ToggleButtonGroup
                color="primary"
                value={clubData.type}
                exclusive
                onChange={handleTypeChange}
                aria-label="club type"
                fullWidth
                sx={{ flexWrap: 'wrap' }}
              >
                {clubTypes.map((type) => (
                  <ToggleButton key={type} value={type} sx={{ flex: '1 1 auto' }}>{type}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }}><Chip label="Club Specifications" /></Divider>

          <Stack spacing={3}>
            {/* Head Section */}
            <Typography variant="overline">Head</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: -1 }}>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="make" label="Make (Brand)" value={clubData.make} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="model" label="Model" value={clubData.model} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="loft" label="Loft" value={clubData.loft} onChange={handleChange} fullWidth /></Box>
            </Box>

            {/* Shaft Section */}
            <Typography variant="overline">Shaft</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: -1 }}>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="shaft_make" label="Shaft Make" value={clubData.shaft_make} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="shaft_model" label="Shaft Model" value={clubData.shaft_model} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}><TextField name="shaft_flex" label="Flex" value={clubData.shaft_flex} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}><TextField name="shaft_weight" label="Weight" value={clubData.shaft_weight} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}><TextField name="shaft_length" label="Length" value={clubData.shaft_length} onChange={handleChange} fullWidth /></Box>
            </Box>

            {/* Grip Section */}
            <Typography variant="overline">Grip</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: -1 }}>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="grip_make" label="Grip Make" value={clubData.grip_make} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="grip_model" label="Grip Model" value={clubData.grip_model} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(50% - 8px)' } }}><TextField name="grip_size" label="Size" value={clubData.grip_size} onChange={handleChange} fullWidth /></Box>
              <Box sx={{ flexBasis: { xs: 'calc(50% - 8px)', sm: 'calc(50% - 8px)' } }}><TextField name="grip_weight" label="Weight" value={clubData.grip_weight} onChange={handleChange} fullWidth /></Box>
            </Box>

            {/* Other Section */}
            <Typography variant="overline">Other</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: -1 }}>
              <Box sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField name="swing_weight" label="Swing Weight" value={clubData.swing_weight} onChange={handleChange} fullWidth /></Box>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Club')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClubModal;