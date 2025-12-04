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
  useTheme,
  useMediaQuery,
} from '@mui/material';

const clubTypes = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];

// Ensure all values start as empty strings, not null/undefined
const initialClubState = {
  name: '',
  type: '', // e.g., 'Iron'
  make: '', // e.g., 'Titleist'
  model: '', // e.g., 'T100'
  loft: '',
  bounce: '',
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [clubData, setClubData] = useState(initialClubState);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(clubToEdit);

  useEffect(() => {
    if (isEditMode && clubToEdit) {
      // Ensure all values are strings, not null/undefined
      const sanitizedClubData = Object.keys(initialClubState).reduce((acc, key) => {
        acc[key] = clubToEdit[key] !== null && clubToEdit[key] !== undefined 
          ? String(clubToEdit[key]) 
          : '';
        return acc;
      }, {});
      setClubData(sanitizedClubData);
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

    // Sanitize all copied values to ensure they're strings
    const sanitizedCopy = Object.keys(clubToCopy).reduce((acc, key) => {
      acc[key] = clubToCopy[key] !== null && clubToCopy[key] !== undefined 
        ? String(clubToCopy[key]) 
        : '';
      return acc;
    }, {});

    setClubData(prev => ({
      ...prev,
      ...sanitizedCopy,
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
    >
      <DialogTitle sx={{ 
        py: 2,
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        fontWeight: 600 
      }}>
        {isEditMode ? 'Edit Club' : 'Add New Club'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

          {!isEditMode && myClubs.length > 0 && (
            <>
              <Autocomplete
                options={myClubs}
                getOptionLabel={(option) => `${option.name} (${option.make || ''} ${option.model || ''})`.trim()}
                onChange={handleCopyFromClub}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Copy specs from an existing club" 
                    size="small"
                  />
                )}
                sx={{ mb: 1 }}
              />
              <Divider>
                <Chip label="OR" size="small" />
              </Divider>
            </>
          )}

          <Stack spacing={2}>
            <TextField 
              name="name" 
              label="Club Name (e.g., 7 Iron)" 
              value={clubData.name} 
              onChange={handleChange} 
              fullWidth 
              required
              size="small"
            />
            
            <Box>
  <Typography 
    variant="body2" 
    color="text.secondary" 
    sx={{ mb: 1.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
  >
    Club Type*
  </Typography>
  <Box sx={{ 
    display: 'grid',
    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(7, 1fr)' },
    gap: 1,
  }}>
    {clubTypes.map((type) => (
      <Button
        key={type}
        size="small"
        onClick={() => handleTypeChange(null, type)}
        variant={clubData.type === type ? 'contained' : 'outlined'}
        sx={{
          py: { xs: 0.75, sm: 0.5 },
          px: { xs: 0.5, sm: 1 },
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          minWidth: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {type}
      </Button>
    ))}
  </Box>
</Box>
          </Stack>

          <Divider sx={{ my: 2 }}>
            <Chip label="Club Specifications" size="small" />
          </Divider>

          <Stack spacing={3}>
            {/* Head Section */}
            <Typography 
              variant="overline" 
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
            >
              Head
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mt: -1 
            }}>
              {[
                { name: 'make', label: 'Make (Brand)', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'model', label: 'Model', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'loft', label: 'Loft', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'bounce', label: 'Bounce', xs: '100%', sm: 'calc(50% - 8px)' },
              ].map((field) => (
                <Box 
                  key={field.name}
                  sx={{ 
                    flexBasis: { xs: field.xs, sm: field.sm },
                    minWidth: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <TextField
                    name={field.name}
                    label={field.label}
                    value={clubData[field.name]}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Box>
              ))}
            </Box>

            {/* Shaft Section */}
            <Typography 
              variant="overline" 
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
            >
              Shaft
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mt: -1 
            }}>
              {[
                { name: 'shaft_make', label: 'Shaft Make', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'shaft_model', label: 'Shaft Model', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'shaft_flex', label: 'Flex', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'shaft_weight', label: 'Weight', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'shaft_length', label: 'Length', xs: '100%', sm: 'calc(50% - 8px)' },
              ].map((field) => (
                <Box 
                  key={field.name}
                  sx={{ 
                    flexBasis: { xs: field.xs, sm: field.sm },
                    minWidth: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <TextField
                    name={field.name}
                    label={field.label}
                    value={clubData[field.name]}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Box>
              ))}
            </Box>

            {/* Grip Section */}
            <Typography 
              variant="overline" 
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
            >
              Grip
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mt: -1 
            }}>
              {[
                { name: 'grip_make', label: 'Grip Make', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'grip_model', label: 'Grip Model', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'grip_size', label: 'Size', xs: '100%', sm: 'calc(50% - 8px)' },
                { name: 'grip_weight', label: 'Weight', xs: '100%', sm: 'calc(50% - 8px)' },
              ].map((field) => (
                <Box 
                  key={field.name}
                  sx={{ 
                    flexBasis: { xs: field.xs, sm: field.sm },
                    minWidth: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <TextField
                    name={field.name}
                    label={field.label}
                    value={clubData[field.name]}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                  />
                </Box>
              ))}
            </Box>

            {/* Other Section */}
            <Typography 
              variant="overline" 
              sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
            >
              Other
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              mt: -1 
            }}>
              <Box sx={{ 
                flexBasis: { xs: '100%', sm: 'calc(50% - 8px)' },
                minWidth: { xs: '100%', sm: 'auto' }
              }}>
                <TextField
                  name="swing_weight"
                  label="Swing Weight"
                  value={clubData.swing_weight}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Button 
          onClick={handleClose} 
          disabled={isSaving}
          fullWidth={isMobile}
          variant="outlined"
          sx={{ 
            mb: { xs: 1, sm: 0 },
            order: { xs: 2, sm: 1 }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isSaving}
          fullWidth={isMobile}
          sx={{ 
            order: { xs: 1, sm: 2 },
            mb: { xs: 1, sm: 0 }
          }}
        >
          {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Save Club')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClubModal;