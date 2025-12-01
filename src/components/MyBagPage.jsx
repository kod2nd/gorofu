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
  Snackbar,
  ListSubheader,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Search, Straighten as StraightenIcon, Settings, CheckCircle, GolfCourse, UploadFile, Download } from '@mui/icons-material';
import PageHeader from './PageHeader';
import { elevatedCardStyles } from '../styles/commonStyles';
import { getMyBagData, createClub, updateClub, deleteClub, createBag, updateBag, deleteBag, syncClubInBags, deleteShot, bulkCreateClubs } from '../services/myBagService';
import AddClubModal from './myBag/AddClubModal';
import ConfigureShotsModal from './myBag/ConfigureShotsModal';
import ManageShotTypesModal from './myBag/ManageShotTypesModal';
import DistanceLookup from './myBag/DistanceLookup';
import BagPresetModal from './myBag/BagPresetModal';
import BagGappingChart from './myBag/BagGappingChart';
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      setSnackbar({ open: true, message: 'Club updated successfully!', severity: 'success' });
    } else {
      // Create new club
      const newClub = await createClub(clubData);
      setMyClubs([...myClubs, newClub]);
      setSnackbar({ open: true, message: 'Club added successfully!', severity: 'success' });
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
    const { id, clubIds, name, tags, is_default } = bagData;
    try {
      if (id) {
        // Update existing bag
        await updateBag(id, { name, tags, is_default }, clubIds);        
      } else {
        // Create new bag
        await createBag({ name, tags, is_default }, clubIds);
      }
      await fetchData(); // Refetch all data to update UI
      setBagPresetModalOpen(false);
      setSnackbar({ open: true, message: `Bag ${id ? 'updated' : 'created'} successfully!`, severity: 'success' });
    } catch (error) {
      console.error("Failed to save bag preset:", error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    }
  };

  const handleOpenBagModal = (bag) => {
    setEditingBag(bag);
    setBagPresetModalOpen(true);
  };

  const handleDeleteBagRequest = (bagId) => {
    setDeletingBagId(bagId);
  };

  const handleSetDefaultBag = async (bagToSetAsDefault) => {
    try {
      // We only need to update the is_default flag. The service handles unsetting the old default.
      const updates = {
        name: bagToSetAsDefault.name,
        tags: bagToSetAsDefault.tags,
        is_default: true,
      };
      await updateBag(bagToSetAsDefault.id, updates, bagToSetAsDefault.clubIds);
      await fetchData(); // Refresh data to show the change
      setSnackbar({ open: true, message: `"${bagToSetAsDefault.name}" is now the default bag.`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Error setting default bag: ${error.message}`, severity: 'error' });
    }
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

  const groupedClubsForDisplay = useMemo(() => {
    const clubTypesOrder = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];
    const groups = {};

    clubTypesOrder.forEach(type => {
      groups[type] = [];
    });

    filteredAndSortedClubs.forEach(club => {
      const type = club.type && clubTypesOrder.includes(club.type) ? club.type : 'Other';
      groups[type].push(club);
    });

    // The filteredAndSortedClubs are already sorted, so we just need to group them.
    // If sorting by name, the loft sort within groups might not be perfect, but the primary sort is respected.
    // The loft sort is most effective when the primary sort is 'loft'.

    return groups;

  }, [filteredAndSortedClubs]);

  const clubTemplateHeaders = [
    'name', 'type', 'make', 'model', 'loft', 'shaft_make', 'shaft_model', 
    'shaft_flex', 'shaft_weight', 'shaft_length', 'grip_make', 'grip_model', 
    'grip_size', 'grip_weight', 'swing_weight'
  ];

  const handleDownloadClubTemplate = () => {
    const csvContent = clubTemplateHeaders.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'my_clubs_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClubUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      let text = e.target.result;
      if (text.startsWith('\uFEFF')) { // Remove BOM
        text = text.substring(1);
      }
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const clubsToCreate = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const clubData = headers.reduce((obj, header, index) => {
          if (clubTemplateHeaders.includes(header) && values[index]) {
            obj[header] = values[index];
          }
          return obj;
        }, {});
        if (Object.keys(clubData).length > 0) {
          clubsToCreate.push(clubData);
        }
      }

      try {
        await bulkCreateClubs(clubsToCreate);
        setSnackbar({ open: true, message: `${clubsToCreate.length} clubs imported successfully!`, severity: 'success' });
        fetchData(); // Refresh the list
      } catch (error) {
        setSnackbar({ open: true, message: `Error importing clubs: ${error.message}`, severity: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = null; // Reset file input
  };

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

      <DistanceLookup myBags={myBags} myClubs={myClubs} displayUnit={displayUnit} />

      {/* Bag Gapping Chart */}
      <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
        handleSetDefaultBag={handleSetDefaultBag}
        displayUnit={displayUnit}
        shotConfig={shotConfig}
      />

      {/* Club List */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={600}>My Clubs</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadClubTemplate}>Template</Button>
            <Button component="label" variant="outlined" startIcon={<UploadFile />}>
              Upload CSV
              <input type="file" hidden accept=".csv" onChange={handleClubUpload} />
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => { setEditingClub(null); setAddClubModalOpen(true); }}>
                Add Club
            </Button>
          </Stack>
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
        {Object.entries(groupedClubsForDisplay).map(([type, clubsInGroup]) => {
          if (clubsInGroup.length === 0) return null;
          return (
            <Box key={type}>
              <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '2em' }}>{type}</ListSubheader>
              <Stack spacing={3}>
                {clubsInGroup.map(club => (
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
            </Box>
          );
        })}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyBagPage;