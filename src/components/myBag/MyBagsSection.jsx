import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Card,
  Divider,
  IconButton,
  Collapse,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { Add, Edit, Delete, Star, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { elevatedCardStyles } from "../../styles/commonStyles";
import BagGappingChart from "./BagGappingChart";

const clubTypesOrder = ['Driver', 'Woods', 'Hybrid', 'Iron', 'Wedge', 'Putter', 'Other'];

const getClubTypeStyle = (type, theme) => {
  const styles = {
    Driver: { color: theme.palette.error.main },
    Woods: { color: theme.palette.warning.dark },
    Hybrid: { color: theme.palette.success.main },
    Iron: { color: theme.palette.info.main },
    Wedge: { color: theme.palette.secondary.main },
    Putter: { color: theme.palette.grey[700] },
    Other: { color: theme.palette.grey[500] },
  };
  return styles[type] || styles.Other;
};

const MyBagsSection = ({ myBags, myClubs, handleOpenBagModal, handleDeleteBagRequest, handleSetDefaultBag, displayUnit, shotConfig }) => {
  const theme = useTheme();
  const [expandedBagId, setExpandedBagId] = useState(null);

  return (
    <Paper {...elevatedCardStyles} sx={{ p: 3, mb: 4, borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600}>My Bags</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenBagModal(null)}>Add Bag</Button>
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
            <Card key={bag.id} variant="outlined" sx={{ borderRadius: 3, transition: 'all 0.3s ease', '&:hover': { boxShadow: 3, borderColor: 'primary.light' } }}>
              <Box sx={{ p: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, color: 'white', cursor: 'pointer' }} onClick={() => setExpandedBagId(expandedBagId === bag.id ? null : bag.id)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{bag.name}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      {bag.tags && bag.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />)}
                    </Stack>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {bag.is_default ? (
                      <Chip icon={<Star />} label="Default" size="small" sx={{ bgcolor: 'success.dark', color: 'white', fontWeight: 'bold' }} />
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => { e.stopPropagation(); handleSetDefaultBag(bag); }}
                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                      >
                        Set as Default
                      </Button>
                    )}
                    <IconButton size="small" sx={{ color: 'white' }} aria-label="edit preset" onClick={(e) => { e.stopPropagation(); handleOpenBagModal(bag); }}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: 'white' }} aria-label="delete preset" onClick={(e) => { e.stopPropagation(); handleDeleteBagRequest(bag.id); }}><Delete fontSize="small" /></IconButton>
                  </Stack>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{clubsInBag.length} / 14 Clubs</Typography>
                  <LinearProgress variant="determinate" value={(clubsInBag.length / 14) * 100} sx={{ height: 6, borderRadius: 3, mt: 0.5, bgcolor: 'rgba(255,255,255,0.3)' }} />
                </Box>
              </Box>
              <Collapse in={expandedBagId === bag.id} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {Object.entries(groupedClubsInBag).map(
                      ([type, clubsInGroup]) => {
                        const typeStyle = getClubTypeStyle(type, theme);
                        return (
                          <Box key={type}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: typeStyle.color }} />
                              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{type}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, pl: 2.5 }}>
                              {clubsInGroup.map((club) => {
                                const specDetails = [club.make, club.model, club.loft ? `${club.loft}°` : "", club.bounce ? `${club.bounce}°` : ""].filter(Boolean).join(" ");
                                return (
                                  <Chip
                                    key={club.id}
                                    label={
                                      <Box component="span" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                        <Typography component="span" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>{club.name}</Typography>
                                        {specDetails && <Typography component="span" variant="caption" color="text.secondary">{specDetails}</Typography>}
                                      </Box>
                                    }
                                    size="small"
                                    variant="outlined"
                                  />
                                );
                              })}
                            </Stack>
                          </Box>
                        );
                      })}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <BagGappingChart clubs={clubsInBag} displayUnit={displayUnit} shotConfig={shotConfig} />
                </Box>
              </Collapse>
              <Divider />
              <Button
                fullWidth
                onClick={() => setExpandedBagId(expandedBagId === bag.id ? null : bag.id)}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: expandedBagId === bag.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                }
                sx={{ justifyContent: 'space-between', p: 1.5, textTransform: 'none', color: 'text.secondary', borderRadius: '0 0 12px 12px' }}
              >
                <Typography variant="body2" fontWeight="500">
                  {expandedBagId === bag.id ? 'Hide Details' : 'View Clubs & Gapping'}
                </Typography>
              </Button>
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default MyBagsSection;