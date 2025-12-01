import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Star } from '@mui/icons-material';
import BagGappingChart from './BagGappingChart';

const BagDetailsModal = ({ open, onClose, bag, myClubs, shotConfig, displayUnit }) => {
  if (!bag) return null;

  const clubsInBag = bag.clubIds.map(clubId => myClubs.find(club => club.id === clubId)).filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" fontWeight="bold">{bag.name}</Typography>
          {bag.is_default && <Chip icon={<Star />} label="Default" size="small" color="success" variant="outlined" />}
        </Stack>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">Tags</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {bag.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
            </Stack>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Club Gapping ({clubsInBag.length}/14)
            </Typography>
            <BagGappingChart clubs={clubsInBag} displayUnit={displayUnit} shotConfig={shotConfig} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BagDetailsModal;