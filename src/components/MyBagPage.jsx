import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Box,
  Typography,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { Straighten as StraightenIcon } from '@mui/icons-material';
import PageHeader from './PageHeader';
import {
  getMyBagData,
  createClub,
  updateClub,
  deleteClub,
  createBag,
  updateBag,
  deleteBag,
  syncClubInBags,
  deleteShot,
  bulkCreateClubs,
} from '../services/myBagService';
import AddClubModal from './myBag/AddClubModal';
import ConfigureShotsModal from './myBag/ConfigureShotsModal';
import ManageShotTypesModal from './myBag/ManageShotTypesModal';
import DistanceLookup from './myBag/DistanceLookup';
import BagPresetModal from './myBag/BagPresetModal';
import MyBagsSection from './myBag/MyBagsSection';
import ConfirmationDialog from './myBag/ConfirmationDialog';
import MyClubsSection from './myBag/MyClubsSection';
import { segmentedSx } from '../styles/commonStyles';

// Mock user-defined shot configuration. In a real app, this would be fetched from the database.
const mockUserShotConfig = {
  categories: [
    { id: 'cat_long', name: 'Long Game' },
    { id: 'cat_approach', name: 'Approach' },
    { id: 'cat_short', name: 'Short Game' },
  ],
  shotTypes: [],
};

const MyBagPage = ({ user, isActive }) => {
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shotConfig, setShotConfig] = useState({ categories: [], shotTypes: [] });
  const [myBags, setMyBags] = useState([]);
  const [gappingSelectedBagId, setGappingSelectedBagId] = useState('all');
  const [displayUnit, setDisplayUnit] = useState('meters');
  const [isAddClubModalOpen, setAddClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [isShotsModalOpen, setShotsModalOpen] = useState(false);
  const [clubForShots, setClubForShots] = useState(null);
  const [isShotTypesModalOpen, setShotTypesModalOpen] = useState(false);
  const [isBagPresetModalOpen, setBagPresetModalOpen] = useState(false);
  const [editingBag, setEditingBag] = useState(null);
  const [deletingBagId, setDeletingBagId] = useState(null);
  const [clubSortOrder, setClubSortOrder] = useState('loft');
  const [clubFilterBagIds, setClubFilterBagIds] = useState([]);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, id: null, name: '', type: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();

  // ✅ Normalize user id: supports profile shape (user_id) and auth shape (id)
  const userId = user?.user_id ?? user?.id ?? null;

  const fetchData = async () => {
    if (!isActive) return;

    // If we don't have a target user yet, don't fetch (prevents fallback to wrong user)
    if (!userId) {
      setMyClubs([]);
      setMyBags([]);
      setShotConfig({ categories: mockUserShotConfig.categories, shotTypes: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ✅ getMyBagData expects an "impersonatedUser" object with user_id
      const { myClubs, myBags, shotTypes } = await getMyBagData();

      setMyClubs(myClubs);
      setMyBags(myBags);
      setShotConfig({
        categories: mockUserShotConfig.categories,
        shotTypes: shotTypes || [],
      });
    } catch (error) {
      console.error('Failed to load bag data', error);
      setSnackbar({ open: true, message: `Failed to load bag data: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Reload when impersonation changes (userId) or when page becomes active
  }, [isActive, userId]);

  const handleSaveClub = async (clubData) => {
    if (editingClub) {
      const updatedClub = await updateClub(editingClub.id, clubData);
      setMyClubs(myClubs.map(c => (c.id === editingClub.id ? updatedClub : c)));
      setSnackbar({ open: true, message: 'Club updated successfully!', severity: 'success' });
    } else {
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
        console.error('Failed to delete club', error);
        setSnackbar({ open: true, message: `Failed to delete club: ${error.message}`, severity: 'error' });
      } finally {
        setConfirmDeleteDialog({ open: false, id: null, name: '', type: '' });
      }
    } else if (type === 'shot') {
      try {
        await deleteShot(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete shot', error);
        setSnackbar({ open: true, message: `Failed to delete shot: ${error.message}`, severity: 'error' });
      } finally {
        setConfirmDeleteDialog({ open: false, id: null, name: '', type: '' });
      }
    }
  };

  const handleConfigureShots = (club, openInAddMode = false, shotToEdit = null) => {
    const clubData = { ...club, shotToEdit };
    if (openInAddMode) clubData.openInAddMode = true;
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
      await fetchData();
    } catch (error) {
      console.error("Failed to update club's bag assignment:", error);
      setSnackbar({ open: true, message: `Failed to update club assignment: ${error.message}`, severity: 'error' });
    }
  };

  const handleSaveBag = async (bagData) => {
    const { id, clubIds, name, tags, is_default } = bagData;
    try {
      if (id) {
        await updateBag(id, { name, tags, is_default }, clubIds);
      } else {
        await createBag({ name, tags, is_default }, clubIds);
      }
      await fetchData();
      setBagPresetModalOpen(false);
      setSnackbar({ open: true, message: `Bag ${id ? 'updated' : 'created'} successfully!`, severity: 'success' });
    } catch (error) {
      console.error('Failed to save bag preset:', error);
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
      const updates = {
        name: bagToSetAsDefault.name,
        tags: bagToSetAsDefault.tags,
        is_default: true,
      };
      await updateBag(bagToSetAsDefault.id, updates, bagToSetAsDefault.clubIds);
      await fetchData();
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
      console.error('Failed to delete bag:', error);
      setSnackbar({ open: true, message: `Failed to delete bag: ${error.message}`, severity: 'error' });
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

    if (clubFilterBagIds.length > 0) {
      clubsToDisplay = clubsToDisplay.filter(club =>
        clubFilterBagIds.some(bagId => {
          const bag = myBags.find(b => b.id === bagId);
          return bag?.clubIds.includes(club.id);
        })
      );
    }

    clubsToDisplay.sort((a, b) => {
      if (clubSortOrder === 'loft') {
        const loftA = parseInt(a.loft) || 999;
        const loftB = parseInt(b.loft) || 999;
        if (loftA !== loftB) return loftA - loftB;
      }
      return a.name.localeCompare(b.name);
    });

    return clubsToDisplay;
  }, [myClubs, myBags, clubSortOrder, clubFilterBagIds]);

  const groupedClubsForDisplay = useMemo(() => {
    const clubTypesOrder = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];
    const groups = {};
    clubTypesOrder.forEach(type => { groups[type] = []; });

    filteredAndSortedClubs.forEach(club => {
      const type = club.type && clubTypesOrder.includes(club.type) ? club.type : 'Other';
      groups[type].push(club);
    });

    return groups;
  }, [filteredAndSortedClubs]);

  const clubTemplateHeaders = [
    'name', 'type', 'make', 'model', 'loft', 'bounce', 'shaft_make', 'shaft_model',
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
      if (text.startsWith('\uFEFF')) text = text.substring(1);

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
        if (Object.keys(clubData).length > 0) clubsToCreate.push(clubData);
      }

      try {
        await bulkCreateClubs(clubsToCreate);
        setSnackbar({ open: true, message: `${clubsToCreate.length} clubs imported successfully!`, severity: 'success' });
        fetchData();
      } catch (error) {
        setSnackbar({ open: true, message: `Error importing clubs: ${error.message}`, severity: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <Box sx={{ pb: 4 }}>
      <PageHeader
        title="My Bag"
        subtitle="Manage your clubs"
        icon={<StraightenIcon />}
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={displayUnit}
              exclusive
              onChange={(e, newUnit) => {
                if (newUnit) setDisplayUnit(newUnit);
              }}
              aria-label="distance unit"
              sx={segmentedSx(theme, {radius: 10})}
            >
              <ToggleButton value="meters">m</ToggleButton>
              <ToggleButton value="yards">yd</ToggleButton>
            </ToggleButtonGroup>

          </Stack>
        }
      />

      <DistanceLookup myBags={myBags} myClubs={myClubs} displayUnit={displayUnit} />

      <MyBagsSection
        myBags={myBags}
        myClubs={myClubs}
        handleOpenBagModal={handleOpenBagModal}
        handleDeleteBagRequest={handleDeleteBagRequest}
        handleSetDefaultBag={handleSetDefaultBag}
        displayUnit={displayUnit}
        shotConfig={shotConfig}
      />

      <MyClubsSection
        myBags={myBags}
        groupedClubs={groupedClubsForDisplay}
        clubFilterBagIds={clubFilterBagIds}
        setClubFilterBagIds={setClubFilterBagIds}
        clubSortOrder={clubSortOrder}
        setClubSortOrder={setClubSortOrder}
        onAddClub={() => { setEditingClub(null); setAddClubModalOpen(true); }}
        onDownloadTemplate={handleDownloadClubTemplate}
        onUpload={handleClubUpload}
        shotConfig={shotConfig}
        displayUnit={displayUnit}
        onEditClub={handleOpenEditModal}
        onDeleteClub={handleDeleteRequest}
        onConfigureShots={handleConfigureShots}
        onManageShotTypes={() => setShotTypesModalOpen(true)}
        onClubBagAssignmentChange={handleClubBagAssignmentChange}
      />

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
