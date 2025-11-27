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

const clubTypesOrder = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];

const MyBagsSection = ({ myBags, myClubs, handleOpenBagModal, handleDeleteBagRequest, onViewBagDetails }) => {
  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">My Bags</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenBagModal(null)}>Add Bag</Button>
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

          const groupedClubsInBag = clubTypesOrder.reduce((acc, type) => {
            const clubsOfType = clubsInBag.filter(club => club.type === type);
            if (clubsOfType.length > 0) {
              acc[type] = clubsOfType;
            }
            return acc;
          }, {});
          
          // Handle clubs that don't match the ordered types
          const otherClubs = clubsInBag.filter(club => !clubTypesOrder.includes(club.type));
          if (otherClubs.length > 0) groupedClubsInBag['Other'] = otherClubs;

          return (
            <Paper
              key={bag.id}
              variant="outlined"
              onClick={() => onViewBagDetails(bag)}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{bag.name}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    {bag.tags && bag.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
                  </Stack>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {bag.is_default && <Chip icon={<Star />} label="Default" size="small" color="success" variant="outlined" />}
                  <IconButton aria-label="edit preset" onClick={(e) => { e.stopPropagation(); handleOpenBagModal(bag); }}><Edit fontSize="small" /></IconButton>
                  <IconButton aria-label="delete preset" onClick={(e) => { e.stopPropagation(); handleDeleteBagRequest(bag.id); }}><Delete fontSize="small" /></IconButton>
                </Stack>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">Clubs ({clubsInBag.length}/14)</Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {Object.entries(groupedClubsInBag).map(([type, clubsInGroup]) => (
                    <Box key={type}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">{type}</Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {clubsInGroup.map(club => {
                           const specDetails = [
                            club.make,
                            club.model,
                            club.loft ? `(${club.loft})` : ''
                          ].filter(Boolean).join(' ');
                          
                          return (
                            <Chip
                              key={club.id}
                              label={
                                <Typography component="span" variant="body2">{club.name} <Typography component="span" variant="caption" color="text.secondary">{specDetails}</Typography></Typography>
                              }
                              variant="outlined"
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  ))}
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