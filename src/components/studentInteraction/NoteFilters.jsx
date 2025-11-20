import React from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Button,
  FormControlLabel,
  Switch,
  Fade,
  Stack,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList,
  ClearAll,
  ArrowUpward,
  ArrowDownward,
  ViewList,
  ViewModule,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const NoteFilters = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  showFavorites,
  setShowFavorites,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  hasActiveFilters,
  handleClearFilters,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        mb: 3,
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
            flex: '1 1 300px',
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ borderRadius: 3, minWidth: 110, textTransform: 'none', flexShrink: 0 }}
          >
            Filters
          </Button>
          <FormControlLabel
            control={<Switch checked={showFavorites} onChange={(e) => setShowFavorites(e.target.checked)} />}
            label="Favorites"
            sx={{ 
              pr: 1,
              mr: 0, // remove default margin
            }}
          />
        </Box>
      </Box>
      <Fade in={showFilters}>
        <Box sx={{ display: showFilters ? 'block' : 'none', pt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2}>
              <InputLabel shrink sx={{ mb: 1, position: 'relative' }}>Filter by</InputLabel>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <DatePicker
                  label="Start Date"
                  value={filterStartDate}
                  onChange={setFilterStartDate}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      fullWidth: true,
                      sx: { 
                        flex: 1,
                        minWidth: '200px',
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }
                    } 
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={filterEndDate}
                  onChange={setFilterEndDate}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      fullWidth: true,
                      sx: { 
                        flex: 1,
                        minWidth: '200px',
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                      }
                    } 
                  }}
                />
              </Box>
              {hasActiveFilters && (
                <Button 
                  onClick={handleClearFilters} 
                  startIcon={<ClearAll />}
                  variant="text"
                  sx={{ 
                    alignSelf: 'flex-start',
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Clear All Filters
                </Button>
              )}
              <Box>
                <InputLabel shrink sx={{ mb: 1, position: 'relative' }}>Sort by</InputLabel>
                <ToggleButtonGroup color="primary" value={sortOrder} exclusive onChange={(e, newOrder) => { if (newOrder) setSortOrder(newOrder); }} aria-label="Sort By" size="small">
                  <ToggleButton value="desc" aria-label="sort descending"><ArrowUpward sx={{ mr: 1 }} /> Newest</ToggleButton>
                  <ToggleButton value="asc" aria-label="sort ascending"><ArrowDownward sx={{ mr: 1 }} /> Oldest</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box>
                <InputLabel shrink sx={{ mb: 1, position: 'relative' }}>Group by</InputLabel>
                <ToggleButtonGroup color="primary" value={viewMode} exclusive onChange={(e, newViewMode) => { if (newViewMode) setViewMode(newViewMode); }} aria-label="view mode" size="small">
                  <ToggleButton value="list" aria-label="list view"><ViewList sx={{ mr: 1 }} /> None</ToggleButton>
                  <ToggleButton value="grouped" aria-label="grouped view"><ViewModule sx={{ mr: 1 }} /> Date</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </LocalizationProvider>
        </Box>
      </Fade>
    </Paper>
  );
};

export default NoteFilters;