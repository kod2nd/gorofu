import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
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
  Autocomplete,
  Chip,
  FormHelperText,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  Search,
  Close,
  CheckCircle,
  Cancel,
  SportsGolf,
  Add,
  Remove,
  Star,
  StarBorder,
} from "@mui/icons-material";

const initialBagState = {
  name: "",
  tags: [],
  is_default: false,
  clubIds: [],
};

const clubTypesOrder = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];

const BagPresetModal = ({ open, onClose, onSave, bagToEdit, myClubs }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [bagData, setBagData] = useState(initialBagState);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter clubs based on search
  const filteredClubs = useMemo(() => {
    if (!searchTerm.trim()) return myClubs || [];
    
    const searchLower = searchTerm.toLowerCase();
    return (myClubs || []).filter(club => 
      club.name?.toLowerCase().includes(searchLower) ||
      club.make?.toLowerCase().includes(searchLower) ||
      club.model?.toLowerCase().includes(searchLower) ||
      club.type?.toLowerCase().includes(searchLower)
    );
  }, [myClubs, searchTerm]);

  const groupedClubs = useMemo(() => {
    const groups = {};
    clubTypesOrder.forEach(type => {
      groups[type] = [];
    });

    filteredClubs.forEach(club => {
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
          return a.name.localeCompare(b.name);
        });
      }
    });

    return groups;
  }, [filteredClubs]);

  const selectedClubs = useMemo(() => {
    return (myClubs || []).filter(club => bagData.clubIds.includes(club.id));
  }, [myClubs, bagData.clubIds]);

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
    if (!bagData.name.trim()) {
      setError("Bag name is required");
      return;
    }
    setError("");
    onSave(bagData);
  };

  const handleClose = () => {
    setError("");
    setSearchTerm("");
    onClose();
  };

  const ClubCard = ({ club }) => {
    const isSelected = bagData.clubIds.includes(club.id);
    const isDisabled = !isSelected && bagData.clubIds.length >= clubLimit;

    return (
      <Paper
        variant="outlined"
        onClick={() => !isDisabled && handleClubToggle(club.id)}
        sx={{
          p: 1.5,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          bgcolor: isSelected ? 'primary.50' : 'transparent',
          borderColor: isSelected ? 'primary.main' : 'divider',
          opacity: isDisabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: isDisabled ? 'transparent' : (isSelected ? 'primary.100' : 'action.hover'),
            transform: isDisabled ? 'none' : 'translateY(-2px)',
            boxShadow: isDisabled ? 'none' : 1,
          }
        }}
      >
        <Stack spacing={0.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight={600}
                noWrap
                sx={{ 
                  color: isSelected ? 'primary.main' : 'text.primary',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                }}
              >
                {club.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {club.make} {club.model}
                {club.loft && ` • ${club.loft}°`}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5,
              flexShrink: 0 
            }}>
              <Chip
                label={club.type}
                size="small"
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                  height: 20,
                  bgcolor: 'grey.100'
                }}
              />
              {isSelected ? (
                <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
              ) : (
                <Add sx={{ fontSize: 20, color: 'text.secondary' }} />
              )}
            </Box>
          </Box>
        </Stack>
      </Paper>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
    >
      <DialogTitle sx={{ 
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        fontWeight: 600 
      }}>
        {isEditMode ? "Edit Bag" : "Create New Bag"}
        {error && (
          <FormHelperText error sx={{ mt: 1, mb: 0 }}>
            {error}
          </FormHelperText>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Bag Info Section */}
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
            <Stack spacing={2}>
              <TextField
                autoFocus
                label="Bag Name"
                value={bagData.name}
                onChange={(e) =>
                  setBagData((prev) => ({ ...prev, name: e.target.value }))
                }
                fullWidth
                size="small"
                placeholder="e.g., Tournament Setup, Practice Bag"
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
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        variant="outlined"
                        label={option}
                        size="small"
                        {...tagProps}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          height: 28 
                        }}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    size="small"
                    placeholder="Add tags like windy, wet, links..."
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
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {bagData.is_default ? (
                      <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                    ) : (
                      <StarBorder sx={{ fontSize: 18 }} />
                    )}
                    <Typography variant="body2">
                      Set as default bag
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>

          {/* Selected Clubs Counter */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1 
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Select Clubs
            </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedClubs.length} / {clubLimit} Clubs
              </Typography>

          </Box>

          {/* Selected Clubs Preview */}
          {selectedClubs.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                Selected Clubs ({selectedClubs.length})
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                '& .MuiChip-root': {
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  height: 32,
                }
              }}>
                {selectedClubs.map(club => (
                  <Chip
                    key={club.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SportsGolf sx={{ fontSize: 14 }} />
                        {club.name}
                        {club.loft && ` (${club.loft}°)`}
                      </Box>
                    }
                    onDelete={() => handleClubToggle(club.id)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          )}

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search clubs by name, make, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchTerm && (
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm("")}
                  sx={{ mr: -1 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 2,
              }
            }}
          />

          {/* Clubs Grid */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {Object.entries(groupedClubs).map(([type, clubsInGroup]) => {
              if (clubsInGroup.length === 0) return null;
              
              return (
                <Box 
                  key={type} 
                  sx={{ 
                    flexGrow: 1,
                    flexBasis: { xs: '100%', sm: 'calc(50% - 6px)' } 
                  }}
                >
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        borderRadius: 2 
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600} 
                        color="text.secondary"
                        sx={{ 
                          mb: 2,
                          pb: 1,
                          borderBottom: `2px solid ${theme.palette.divider}`,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                        }}
                      >
                        {type} ({clubsInGroup.length})
                      </Typography>
                      <Stack spacing={1}>
                        {clubsInGroup.map(club => (
                          <ClubCard key={club.id} club={club} />
                        ))}
                      </Stack>
                    </Paper>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 }
      }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          fullWidth={isMobile}
          sx={{ 
            order: { xs: 2, sm: 1 }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          fullWidth={isMobile}
          disabled={!bagData.name.trim()}
          sx={{ 
            order: { xs: 1, sm: 2 },
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {isEditMode ? "Update Bag" : "Create Bag"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BagPresetModal;