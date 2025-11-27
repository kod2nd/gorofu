import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete, Star } from '@mui/icons-material';
import { elevatedCardStyles } from '../../styles/commonStyles';

const MyBagsSection = ({ myBags, myClubs, handleOpenBagModal, handleDeleteBagRequest }) => {
  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">My Bags</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenBagModal(null)}>Create Preset</Button>
        </Stack>
      </Box>
      <Stack spacing={2}>
        {myBags.map(bag => {
          const clubsInBag = bag.clubIds
            .map(clubId => myClubs.find(club => club.id === clubId))
            .filter(Boolean)
            .sort((a, b) => {
              const loftA = parseInt(a.loft) || 999; // Clubs without loft go to the end
              const loftB = parseInt(b.loft) || 999;
              if (loftA !== loftB) {
                return loftA - loftB; // Sort by loft ascending
              }
              return a.name.localeCompare(b.name); // Fallback to name
            });
          return (
            <Paper key={bag.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{bag.name}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    {bag.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
                  </Stack>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {bag.is_default && <Chip icon={<Star />} label="Default" size="small" color="success" variant="outlined" />}
                  <IconButton aria-label="edit preset" onClick={() => handleOpenBagModal(bag)}><Edit fontSize="small" /></IconButton>
                  <IconButton aria-label="delete preset" onClick={() => handleDeleteBagRequest(bag.id)}><Delete fontSize="small" /></IconButton>
                </Stack>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">Clubs ({clubsInBag.length}/14)</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {clubsInBag.map(club => <Chip key={club.id} label={club.name} size="small" variant="outlined" />)}
                </Stack>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default MyBagsSection;