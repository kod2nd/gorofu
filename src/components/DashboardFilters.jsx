import React from 'react';
import {
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { elevatedCardStyles } from '../styles/commonStyles';

const DashboardFilters = ({ roundLimit, setRoundLimit, showEligibleRoundsOnly, setShowEligibleRoundsOnly, isFiltering }) => (
  <Paper {...elevatedCardStyles} sx={{ p: 2 }}>
    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Filters</Typography>
    <FormControl fullWidth size="small">
      <Select value={roundLimit} onChange={(e) => setRoundLimit(e.target.value)} disabled={isFiltering}>
        <MenuItem value={5}>Last 5 Rounds</MenuItem>
        <MenuItem value={10}>Last 10 Rounds</MenuItem>
        <MenuItem value={20}>Last 20 Rounds</MenuItem>
        <MenuItem value={0}>All-Time</MenuItem>
      </Select>
    </FormControl>
    <FormControlLabel
      control={<Switch checked={showEligibleRoundsOnly} onChange={(e) => setShowEligibleRoundsOnly(e.target.checked)} disabled={isFiltering} />}
      label="Eligible Rounds Only"
      sx={{ mt: 1 }}
    />
  </Paper>
);

export default DashboardFilters;