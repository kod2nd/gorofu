import React from "react";
import {
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from "@mui/material";
import { Add, Download, UploadFile } from "@mui/icons-material";
import ClubCard from "./ClubCard";

const MyClubsSection = ({
  myBags,
  groupedClubs,
  clubFilterBagIds,
  setClubFilterBagIds,
  clubSortOrder,
  setClubSortOrder,
  onAddClub,
  onDownloadTemplate,
  onUpload,
  shotConfig,
  displayUnit,
  onEditClub,
  onDeleteClub,
  onConfigureShots,
  onManageShotTypes,
  onClubBagAssignmentChange,
}) => {
  const theme = useTheme();

  const getClubTypeStyle = (type) => {
    const styles = {
      Driver: { color: theme.palette.error.main },
      Woods: { color: theme.palette.warning.dark },
      Hybrid: { color: theme.palette.success.main },
      Iron: { color: theme.palette.info.main },
      Wedge: { color: theme.palette.primary.main },
      Putter: { color: theme.palette.grey[700] },
      Other: { color: theme.palette.grey[500] },
    };
    return styles[type] || styles.Other;
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Header and Actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Title */}
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              textAlign: { xs: "center", sm: "left" },
              fontSize: { xs: "1.25rem", md: "1.5rem" },
            }}
          >
            My Clubs
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              width: { xs: "100%", sm: "auto" },
              alignItems: "stretch",
            }}
          >
            {/* Use fullWidth only on mobile, remove it on larger screens */}
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={onDownloadTemplate}
              fullWidth={true}
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Template
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "inline", sm: "none" } }}
              >
                Download Template
              </Box>
            </Button>

            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFile />}
              fullWidth={true}
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Upload CSV
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "inline", sm: "none" } }}
              >
                Upload
              </Box>
              <input type="file" hidden accept=".csv" onChange={onUpload} />
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddClub}
              fullWidth={true}
              sx={{
                width: { xs: "100%", sm: "auto" },
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Add Club
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "inline", sm: "none" } }}
              >
                New Club
              </Box>
            </Button>
          </Stack>
        </Box>

        {/* Filters and Sorting */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <FormControl sx={{ minWidth: 240, flexGrow: 1 }} size="small">
            <InputLabel>Filter by Bag</InputLabel>
            <Select
              multiple
              value={clubFilterBagIds}
              onChange={(e) => setClubFilterBagIds(e.target.value)}
              label="Filter by Bag"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const bag = myBags.find((b) => b.id === id);
                    return (
                      <Chip key={id} label={bag?.name || "..."} size="small" />
                    );
                  })}
                </Box>
              )}
            >
              {myBags.map((bag) => (
                <MenuItem key={bag.id} value={bag.id}>
                  {bag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            size="small"
            value={clubSortOrder}
            exclusive
            onChange={(e, newOrder) => {
              if (newOrder) setClubSortOrder(newOrder);
            }}
          >
            <ToggleButton value="loft">Sort by Loft</ToggleButton>
            <ToggleButton value="name">Sort by Name</ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* Club Groups */}
        <Stack spacing={3}>
          {Object.entries(groupedClubs).map(([type, clubsInGroup]) => {
            if (clubsInGroup.length === 0) return null;
            const typeStyle = getClubTypeStyle(type);
            return (
              <Box key={type}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: typeStyle.color,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                    }}
                  >
                    {type}s
                  </Typography>
                </Box>
                <Stack spacing={3}>
                  {clubsInGroup.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      shotConfig={shotConfig}
                      displayUnit={displayUnit}
                      bags={myBags}
                      onEdit={onEditClub}
                      onDeleteRequest={onDeleteClub}
                      onConfigureShots={onConfigureShots}
                      onManageShotTypes={onManageShotTypes}
                      onBagAssignmentChange={onClubBagAssignmentChange}
                    />
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default MyClubsSection;
