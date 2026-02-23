import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography,
  IconButton, Paper, TextField, Divider, Chip, Avatar, useTheme, useMediaQuery,
  Card, CardContent, CardActions, Tooltip, alpha
} from '@mui/material';
import {
  Add, Edit, Delete, Save, Cancel, SportsGolf,
  DriveEta, Flag, Close
} from '@mui/icons-material';
import { createShotType, updateShotType, deleteShotType } from '../../services/myBagService';
import ConfirmationDialog from './ConfirmationDialog';

const categories = [
  { id: 'cat_long', name: 'Long', icon: <DriveEta />, color: '#3b82f6' },
  { id: 'cat_approach', name: 'Appr', icon: <Flag />, color: '#10b981' },
  { id: 'cat_short', name: 'Short', icon: <SportsGolf />, color: '#8b5cf6' },
];

const getCategoryIcon = (catId) => {
  const cat = categories.find(c => c.id === catId);
  return cat?.icon || <SportsGolf />;
};

const getCategoryColor = (catId) => {
  const cat = categories.find(c => c.id === catId);
  return cat?.color || '#6b7280';
};

const ShotTypeCard = ({ shotType, onEdit, onDelete, isDefault }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
        },
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
            <SportsGolf />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {shotType.name}
            </Typography>
            {isDefault && (
              <Chip
                label="Default"
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: 'info.main',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            )}
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {shotType.category_ids.map(catId => {
            const category = categories.find(c => c.id === catId);
            return (
              <Chip
                key={catId}
                icon={getCategoryIcon(catId)}
                label={category?.name}
                size="small"
                sx={{
                  bgcolor: alpha(getCategoryColor(catId), 0.1),
                  color: getCategoryColor(catId),
                  border: `1px solid ${alpha(getCategoryColor(catId), 0.3)}`,
                  mb: 0.5,
                }}
              />
            );
          })}
        </Stack>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => onEdit(shotType)}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        {!isDefault && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete(shotType)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

const ShotTypeForm = ({ shotType, onSave, onCancel }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (shotType) {
      setName(shotType.name || '');
      setSelectedCategories(shotType.category_ids || []);
    } else {
      setName('');
      setSelectedCategories([]);
    }
  }, [shotType]);

  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a shot type name');
      return;
    }
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    onSave({ ...shotType, name: name.trim(), category_ids: selectedCategories });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        mt: 2,
        borderRadius: 3,
        border: '2px solid',
        borderColor: 'primary.light',
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {shotType?.id ? 'Edit Shot Type' : 'Add New Shot Type'}
        </Typography>
        <IconButton
          size="small"
          onClick={onCancel}
          sx={{ color: 'text.secondary' }}
        >
          <Close />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        <TextField
          label="Shot Type Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          disabled={shotType?.is_default}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Select Categories
          </Typography>
          <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
            {categories.map(cat => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <Chip
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.name}
                  clickable
                  onClick={() => handleCategoryToggle(cat.id)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: isSelected ? alpha(cat.color, 0.1) : 'transparent',
                    color: isSelected ? cat.color : 'text.secondary',
                    borderColor: isSelected ? cat.color : 'divider',
                    borderWidth: isSelected ? 2 : 1,
                    '&:hover': {
                      bgcolor: alpha(cat.color, 0.15),
                    },
                    flex: isMobile ? 'none' : 1,
                    justifyContent: 'flex-start',
                    height: 48,
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            onClick={onCancel}
            startIcon={<Cancel />}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            sx={{ borderRadius: 2 }}
          >
            Save Shot Type
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

const ManageShotTypesModal = ({ open, onClose, shotTypes, onDataChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editingShotType, setEditingShotType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateShotType(data.id, { name: data.name, category_ids: data.category_ids });
      } else {
        await createShotType({ name: data.name, category_ids: data.category_ids });
      }
      setEditingShotType(null);
      onDataChange();
    } catch (error) {
      console.error("Failed to save shot type", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteRequest = (shotType) => {
    setDeleteConfirm({ open: true, id: shotType.id, name: shotType.name });
  };

  const handleConfirmDelete = async () => {
    const { id } = deleteConfirm;
    if (!id) return;
    try {
      await deleteShotType(id);
      onDataChange();
    } catch (error) {
      console.error("Failed to delete shot type", error);
      alert(`Error: ${error.message}`);
    } finally {
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          minHeight: isMobile ? '100vh' : 'auto',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: { xs: '1.25rem', sm: '1.5rem' }, // Adjust font size
        fontWeight: 700,
        lineHeight: 1.2,
      }}>
        Manage Shot Types
        {isMobile && (
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {shotTypes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SportsGolf sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Shot Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add your first custom shot type to get started
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              {shotTypes.length} shot type{shotTypes.length !== 1 ? 's' : ''}
            </Typography>
            {shotTypes.map(st => (
              <ShotTypeCard
                key={st.id}
                shotType={st}
                onEdit={setEditingShotType}
                onDelete={handleDeleteRequest}
                isDefault={st.is_default}
              />
            ))}
          </Box>
        )}

        {!editingShotType && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setEditingShotType(true)}
            fullWidth={isMobile}
            sx={{
              mt: 2,
              borderRadius: 2,
              py: 1.5,
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                borderStyle: 'dashed',
              }
            }}
          >
            Add Custom Shot Type
          </Button>
        )}

        {editingShotType && (
          <ShotTypeForm
            shotType={editingShotType === true ? null : editingShotType}
            onSave={handleSave}
            onCancel={() => setEditingShotType(null)}
          />
        )}
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Done
          </Button>
        </DialogActions>
      )}

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleConfirmDelete}
        title={`Delete "${deleteConfirm.name}"?`}
        contentText="Are you sure you want to permanently delete this shot type? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
      />
    </Dialog>
  );
};

export default ManageShotTypesModal;