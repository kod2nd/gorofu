import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography,
  IconButton, Paper, TextField, List, ListItem, ListItemText, ListItemSecondaryAction,
  Checkbox, FormGroup, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { createShotType, updateShotType, deleteShotType } from '../../services/myBagService';

const categories = [
  { id: 'cat_long', name: 'Long Game' },
  { id: 'cat_approach', name: 'Approach' },
  { id: 'cat_short', name: 'Short Game' },
];

const ShotTypeForm = ({ shotType, onSave, onCancel }) => {
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

  const handleCategoryChange = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSave = () => {
    if (!name || selectedCategories.length === 0) {
      alert('Name and at least one category are required.');
      return;
    }
    onSave({ ...shotType, name, category_ids: selectedCategories });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>{shotType?.id ? 'Edit Shot Type' : 'Add New Shot Type'}</Typography>
      <Stack spacing={2}>
        <TextField
          label="Shot Type Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          disabled={shotType?.is_default}
        />
        <Typography variant="subtitle2">Categories</Typography>
        <FormGroup sx={{ flexDirection: 'row' }}>
          {categories.map(cat => (
            <FormControlLabel
              key={cat.id}
              control={<Checkbox checked={selectedCategories.includes(cat.id)} onChange={() => handleCategoryChange(cat.id)} />}
              label={cat.name}
            />
          ))}
        </FormGroup>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={onCancel} startIcon={<Cancel />}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} startIcon={<Save />}>Save</Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

const ManageShotTypesModal = ({ open, onClose, shotTypes, onDataChange }) => {
  const [editingShotType, setEditingShotType] = useState(null); // null, true (for new), or an object

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

  const handleDelete = async (shotTypeId) => {
    if (window.confirm('Are you sure you want to delete this shot type? This cannot be undone.')) {
      try {
        await deleteShotType(shotTypeId);
        onDataChange();
      } catch (error) {
        console.error("Failed to delete shot type", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Shot Types</DialogTitle>
      <DialogContent>
        <List>
          {shotTypes.map(st => (
            <ListItem key={st.id} divider>
              <ListItemText
                primary={st.name}
                secondary={categories.filter(c => st.category_ids.includes(c.id)).map(c => c.name).join(', ')}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="edit" onClick={() => setEditingShotType(st)}>
                  <Edit />
                </IconButton>
                {!st.is_default && (
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(st.id)}>
                    <Delete />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {editingShotType === null && (
          <Button startIcon={<Add />} onClick={() => setEditingShotType(true)} sx={{ mt: 2 }}>
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
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageShotTypesModal;