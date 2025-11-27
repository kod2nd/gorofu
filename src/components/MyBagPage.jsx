import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Search, Straighten as StraightenIcon, Settings, CheckCircle, GolfCourse } from '@mui/icons-material';
import PageHeader from './PageHeader';
import { elevatedCardStyles } from '../styles/commonStyles';
import { getMyBagData, createClub, updateClub, deleteClub, createBag, updateBag, deleteBag, syncClubInBags, deleteShot } from '../services/myBagService';
import AddClubModal from './myBag/AddClubModal';
import ConfigureShotsModal from './myBag/ConfigureShotsModal';
import ManageShotTypesModal from './myBag/ManageShotTypesModal';
import DistanceLookup from './myBag/DistanceLookup';
import BagPresetModal from './myBag/BagPresetModal';
import MyBagsSection from './myBag/MyBagsSection';
import ConfirmationDialog from './myBag/ConfirmationDialog';
import ClubCard from './myBag/ClubCard';

// Mock user-defined shot configuration. In a real app, this would be fetched from the database.
const mockUserShotConfig = {
  categories: [
    { id: 'cat_long', name: 'Long Game' },
    { id: 'cat_approach', name: 'Approach' },
    { id: 'cat_short', name: 'Short Game' },
  ],
  shotTypes: [
    // This will be populated from the API
  ],
};

// Helper to get shot type details from config
const getShotTypeDetails = (shotTypeName, shotConfig) => {
  return shotConfig.shotTypes.find(st => st.name === shotTypeName);
};
 
const YARDS_TO_METERS = 0.9144;
const METERS_TO_YARDS = 1.09361;

const convertDistance = (distance, fromUnit, toUnit) => {
  if (typeof distance !== 'number') return 0; // Gracefully handle undefined or non-numeric inputs
  if (fromUnit === toUnit) return distance;
  if (fromUnit === 'yards' && toUnit === 'meters') return distance * YARDS_TO_METERS;
  if (fromUnit === 'meters' && toUnit === 'yards') return distance * METERS_TO_YARDS;
  return distance; // Fallback
};

const BagGappingChart = ({ clubs, displayUnit, shotConfig }) => {
  const [distanceMetric, setDistanceMetric] = useState('total');  
  const allCategoryIds = useMemo(() => {
    if (!shotConfig || !shotConfig.categories) {
      return [];
    }
    return shotConfig.categories.map(c => c.id);
  }, [shotConfig]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(allCategoryIds);

  useEffect(() => {
    // When the available categories change (e.g., on initial load), reset the selection to all.
    setSelectedCategoryIds(allCategoryIds);
  }, [allCategoryIds]);

  const clubRanges = useMemo(() => {
    if (!clubs || selectedCategoryIds.length === 0) return [];

    const distanceKey = `${distanceMetric}_distance`;
    const varianceKey = `${distanceMetric}_variance`;

    return clubs.map(club => {
      if (!club.shots || club.shots.length === 0) {
        return { id: club.id, name: club.name, min: 0, max: 0, avg: 0 };
      }

      const filteredShots = club.shots.filter(shot => {
        const shotDetails = getShotTypeDetails(shot.shot_type, shotConfig);
        // Check if shot has categories and if any match the selected categories
        return shotDetails?.category_ids?.some(catId => selectedCategoryIds.includes(catId));
      });

      // If no shots match the filter, return empty range
      if (filteredShots.length === 0) {
        return { id: club.id, name: club.name, min: 0, max: 0, avg: 0 };
      }

      const ranges = filteredShots.map(shot => {
        const median = convertDistance(shot[distanceKey], shot.unit, displayUnit);
        const variance = convertDistance(shot[varianceKey], shot.unit, displayUnit);
        return { min: median - variance, max: median + variance };
      });

      const min = Math.min(...ranges.map(r => r.min));
      const max = Math.max(...ranges.map(r => r.max));
      const avg = (min + max) / 2;

      return { id: club.id, name: club.name, min, max, avg };
    }).filter(club => club.min > 0 && club.max > 0) // Filter out clubs with no valid ranges
      .sort((a, b) => b.max - a.max); // Sort from longest to shortest club
  }, [clubs, distanceMetric, displayUnit, selectedCategoryIds, shotConfig]);

  const maxDistanceOverall = Math.max(...clubRanges.map(c => c.max), 300);
  const unitLabel = displayUnit === 'meters' ? 'm' : 'yd';

  const handleCategoryToggle = (catId) => {
    const newIds = selectedCategoryIds.includes(catId)
      ? selectedCategoryIds.filter(id => id !== catId)
      : [...selectedCategoryIds, catId];

    // Ensure at least one category is always selected
    if (newIds.length > 0) {
      setSelectedCategoryIds(newIds);
    }
  };

  const areAllCategoriesSelected = selectedCategoryIds.length === allCategoryIds.length;

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Distance Gapping</Typography>
        <ToggleButtonGroup
          size="small"
          value={distanceMetric}
          exclusive
          onChange={(e, newMetric) => { if (newMetric) setDistanceMetric(newMetric); }}
        >
          <ToggleButton value="total">Total Distance</ToggleButton>
          <ToggleButton value="carry">Carry Distance</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        <Chip
          label="All Shots"
          clickable
          color={areAllCategoriesSelected ? 'primary' : 'default'}
          variant={areAllCategoriesSelected ? 'filled' : 'outlined'}
          onClick={() => setSelectedCategoryIds(allCategoryIds)}
        />
        {shotConfig.categories.map(cat => (
          <Chip
            key={cat.id}
            label={cat.name}
            clickable
            color={selectedCategoryIds.includes(cat.id) ? 'primary' : 'default'}
            variant={selectedCategoryIds.includes(cat.id) ? 'filled' : 'outlined'}
            onClick={() => handleCategoryToggle(cat.id)}
          />
        ))}
      </Box>
      
      {clubRanges.length > 0 ? (
        <Stack spacing={2.5}>
          {clubRanges.map(club => (
            <Box key={club.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">{club.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(club.min)} - {Math.round(club.max)} {unitLabel}
                </Typography>
              </Box>
              <Slider
                value={[club.min, club.max]}
                min={0}
                max={maxDistanceOverall}
                disabled
                sx={{ 
                  padding: '13px 0', 
                  '& .MuiSlider-thumb': { display: 'none' },
                  '& .MuiSlider-track': {
                    background: (theme) => `linear-gradient(to right, transparent ${(club.min / maxDistanceOverall) * 100}%, ${theme.palette.primary.main} ${(club.min / maxDistanceOverall) * 100}%, ${theme.palette.primary.main} ${(club.max / maxDistanceOverall) * 100}%, transparent ${(club.max / maxDistanceOverall) * 100}%)`,
                  }
                }}
              />
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No distance data available for the selected categories.
        </Typography>
      )}
    </Paper>
  );
};

const MyBagPage = ({ userProfile, isActive }) => {
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shotConfig, setShotConfig] = useState({ categories: [], shotTypes: [] });
  const [myBags, setMyBags] = useState([]);
  const [gappingSelectedBagId, setGappingSelectedBagId] = useState('all'); // 'all' or a bag id for gapping
  const [displayUnit, setDisplayUnit] = useState('meters'); // Default to meters
  const [isAddClubModalOpen, setAddClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [isShotsModalOpen, setShotsModalOpen] = useState(false);
  const [clubForShots, setClubForShots] = useState(null);
  const [isShotTypesModalOpen, setShotTypesModalOpen] = useState(false);
  const [isBagPresetModalOpen, setBagPresetModalOpen] = useState(false);
  const [editingBag, setEditingBag] = useState(null);
  const [deletingBagId, setDeletingBagId] = useState(null);
  const [clubSortOrder, setClubSortOrder] = useState('loft'); // 'loft' or 'name'
  const [clubFilterBagIds, setClubFilterBagIds] = useState([]); // Array of bag IDs
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, id: null, name: '', type: '' });

  const fetchData = async () => {
    if (!isActive) return;
    setLoading(true);
    try {
      const { myClubs, myBags, shotTypes } = await getMyBagData();
      setMyClubs(myClubs);
      setMyBags(myBags);
      // Replace mock config with fetched data
      setShotConfig({
        categories: mockUserShotConfig.categories, // Categories are still static for now
        shotTypes: shotTypes || [],
      });
    } catch (error) {
      console.error("Failed to load bag data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userProfile, isActive]);

  const handleSaveClub = async (clubData) => {
    if (editingClub) {
      // Update existing club
      const updatedClub = await updateClub(editingClub.id, clubData);
      setMyClubs(myClubs.map(c => c.id === editingClub.id ? updatedClub : c));
    } else {
      // Create new club
      const newClub = await createClub(clubData);
      setMyClubs([...myClubs, newClub]);
    }
  };

  const handleOpenEditModal = (club) => {
    setEditingClub(club);
    setAddClubModalOpen(true);
  };

  const handleDeleteRequest = (item, type) => {
    if (type === 'club') {
      setConfirmDeleteDialog({ open: true, id: item.id, name: item.name, type: 'club' });
    } else if (type === 'shot') {
      setConfirmDeleteDialog({ open: true, id: item, name: 'this shot', type: 'shot' });
    }
  };

  const handleConfirmDelete = async () => {
    const { id, type } = confirmDeleteDialog;
    if (!id) return;

    if (type === 'club') {
      try {
        await deleteClub(id);
        setMyClubs(prevClubs => prevClubs.filter(club => club.id !== id));
      } catch (error) {
        console.error("Failed to delete club", error);
      }
    } else if (type === 'shot') {
      try {
        await deleteShot(id);
        // Refetch data to update all club cards
        await fetchData();
      } catch (error) {
        console.error("Failed to delete shot", error);
      } finally {
        setConfirmDeleteDialog({ open: false, id: null, name: '', type: '' });
      }
    }
  };

  const handleConfigureShots = (club, openInAddMode = false, shotToEdit = null) => {
    const clubData = { ...club, shotToEdit };
    if (openInAddMode) {
      clubData.openInAddMode = true;
    }
    setClubForShots(clubData);
    setShotsModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddClubModalOpen(false);
    setEditingClub(null);
  };

  const handleClubBagAssignmentChange = async (clubId, newBagIds) => {
    try {
      await syncClubInBags(clubId, newBagIds);
      // To reflect the change immediately, we can update the local state
      // without a full refetch, which is more performant.
      await fetchData(); // Or for simplicity, just refetch.
    } catch (error) {
      console.error("Failed to update club's bag assignment:", error);
    }
  };

  const handleSaveBag = async (bagData) => {
    const { id, clubIds, ...bagDetails } = bagData;
    try {
      if (id) {
        // Update existing bag
        await updateBag(id, bagDetails, clubIds);
      } else {
        // Create new bag
        await createBag(bagDetails, clubIds);
      }
      await fetchData(); // Refetch all data to update UI
      setBagPresetModalOpen(false);
    } catch (error) {
      console.error("Failed to save bag preset:", error);
      // TODO: Show error snackbar
    }
  };

  const handleOpenBagModal = (bag) => {
    setEditingBag(bag);
    setBagPresetModalOpen(true);
  };

  const handleDeleteBagRequest = (bagId) => {
    setDeletingBagId(bagId);
  };

  const handleConfirmDeleteBag = async () => {
    if (!deletingBagId) return;
    try {
      await deleteBag(deletingBagId);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete bag:", error);
    } finally {
      setDeletingBagId(null);
    }
  };

  const filteredClubsForGapping = useMemo(() => {
    if (gappingSelectedBagId === 'all') return myClubs;
    return myClubs.filter(club => myBags.find(b => b.id === gappingSelectedBagId)?.clubIds.includes(club.id));
  }, [myClubs, myBags, gappingSelectedBagId]);

  const filteredAndSortedClubs = useMemo(() => {
    let clubsToDisplay = [...myClubs];

    // Apply bag filter
    if (clubFilterBagIds.length > 0) {
      clubsToDisplay = clubsToDisplay.filter(club => 
        clubFilterBagIds.some(bagId => {
          const bag = myBags.find(b => b.id === bagId);
          return bag?.clubIds.includes(club.id);
        })
      );
    }

    // Apply sorting
    clubsToDisplay.sort((a, b) => {
      if (clubSortOrder === 'loft') {
        const loftA = parseInt(a.loft) || 999; // Put clubs without loft at the end
        const loftB = parseInt(b.loft) || 999;
        if (loftA !== loftB) {
          return loftA - loftB; // Ascending loft
        }
      }
      // Default or fallback sort by name
      return a.name.localeCompare(b.name);
    });

    return clubsToDisplay;
  }, [myClubs, myBags, clubSortOrder, clubFilterBagIds]);

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="My Bag"
        subtitle="Manage your clubs and know your distances."
        icon={<StraightenIcon />}
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              color="primary"
              value={displayUnit}
              exclusive
              onChange={(e, newUnit) => { if (newUnit) setDisplayUnit(newUnit); }}
              aria-label="distance unit"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiToggleButton-root': { color: 'white', borderColor: 'rgba(255,255,255,0.3)' },
                '& .Mui-selected': { backgroundColor: 'white !important', color: 'primary.main !important' }
              }}
            >
              <ToggleButton value="meters">Meters</ToggleButton>
              <ToggleButton value="yards">Yards</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        }
      />

      {/* Distance Lookup Tool */}
      <DistanceLookup myBags={myBags} myClubs={myClubs} displayUnit={displayUnit} />

      {/* Bag Gapping Chart */}
      <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Bag Gapping</Typography>
          <ToggleButtonGroup
            size="small"
            value={gappingSelectedBagId}
            exclusive
            onChange={(e, newId) => { if (newId) setGappingSelectedBagId(newId); }}
          >
            <ToggleButton value="all">All Clubs</ToggleButton>
            {myBags.map(bag => <ToggleButton key={bag.id} value={bag.id}>{bag.name}</ToggleButton>)}
          </ToggleButtonGroup>
        </Box>
        <BagGappingChart 
          clubs={filteredClubsForGapping} 
          displayUnit={displayUnit} 
          shotConfig={shotConfig}
        />
      </Paper>

      {/* My Bags Section */}
      <MyBagsSection
        myBags={myBags}
        myClubs={myClubs}
        handleOpenBagModal={handleOpenBagModal}
        handleDeleteBagRequest={handleDeleteBagRequest}
      />

      {/* Club List */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={600}>My Clubs</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingClub(null); setAddClubModalOpen(true); }}>Add Club</Button>
        </Box>
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 240, flexGrow: 1 }} size="small">
            <InputLabel>Filter by Bag</InputLabel>
            <Select
              multiple
              value={clubFilterBagIds}
              onChange={(e) => setClubFilterBagIds(e.target.value)}
              label="Filter by Bag"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(id => {
                    const bag = myBags.find(b => b.id === id);
                    return <Chip key={id} label={bag?.name || '...'} size="small" />;
                  })}
                </Box>
              )}
            >
              {myBags.map((bag) => (<MenuItem key={bag.id} value={bag.id}>{bag.name}</MenuItem>))}
            </Select>
          </FormControl>
          <ToggleButtonGroup size="small" value={clubSortOrder} exclusive onChange={(e, newOrder) => { if (newOrder) setClubSortOrder(newOrder); }}>
            <ToggleButton value="loft">Sort by Loft</ToggleButton>
            <ToggleButton value="name">Sort by Name</ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Stack>

      <Stack spacing={3}>
        {filteredAndSortedClubs.map(club => (
          <ClubCard
            key={club.id}
            club={club}
            shotConfig={shotConfig}
            displayUnit={displayUnit}
            bags={myBags}
            onEdit={handleOpenEditModal}
            onDeleteRequest={handleDeleteRequest}
            onConfigureShots={handleConfigureShots}
            onManageShotTypes={() => setShotTypesModalOpen(true)}
            onBagAssignmentChange={handleClubBagAssignmentChange}
          />
        ))}
      </Stack>

      <AddClubModal
        open={isAddClubModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClub}
        clubToEdit={editingClub}
      />

      <ConfigureShotsModal
        open={isShotsModalOpen}
        onClose={() => setShotsModalOpen(false)}
        club={clubForShots}
        onDataChange={fetchData}
        shotTypes={shotConfig.shotTypes}
        onManageShotTypes={() => setShotTypesModalOpen(true)}
        onModalClose={() => {
          setShotsModalOpen(false);
          setClubForShots(null);
        }}
      />

      <ManageShotTypesModal
        open={isShotTypesModalOpen}
        onClose={() => setShotTypesModalOpen(false)}
        shotTypes={shotConfig.shotTypes}
        onDataChange={fetchData}
      />

      <BagPresetModal
        open={isBagPresetModalOpen}
        onClose={() => setBagPresetModalOpen(false)}
        onSave={handleSaveBag}
        bagToEdit={editingBag}
        myClubs={myClubs}
      />

      <ConfirmationDialog
        open={confirmDeleteDialog.open}
        onClose={() => setConfirmDeleteDialog({ open: false, id: null, name: '', type: '' })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${confirmDeleteDialog.name}?`}
        contentText={`Are you sure you want to permanently delete ${confirmDeleteDialog.type === 'club' ? 'this club and all of its associated shots' : 'this shot'}? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />

      <ConfirmationDialog
        open={Boolean(deletingBagId)}
        onClose={() => setDeletingBagId(null)}
        onConfirm={handleConfirmDeleteBag}
        title="Delete Bag Preset?"
        contentText="Are you sure you want to permanently delete this bag preset? This will not delete the clubs themselves."
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default MyBagPage;