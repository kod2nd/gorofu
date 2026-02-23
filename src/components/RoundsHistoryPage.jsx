import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { roundService } from "../services/roundService";
import { elevatedCardStyles } from "../styles/commonStyles";
import RoundsTable from "./RoundsTable";
import PageHeader from "./PageHeader";
import ConfirmationDialog from "./myBag/ConfirmationDialog";

const RoundsHistoryPage = ({ user, onViewRound, onAddRound, isActive }) => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    roundId: null,
  });

  useEffect(() => {
    if (user && isActive) {
      loadRounds();
    }
  }, [user, isActive]);

  const loadRounds = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch all rounds for the history page
      const roundsData = await roundService.getUserRounds(user.email, 999);
      setRounds(roundsData);
    } catch (err) {
      setError("Failed to load rounds history. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (roundId) => {
    setConfirmDelete({ open: true, roundId });
  };

  const handleConfirmDelete = async () => {
    const { roundId } = confirmDelete;
    if (!roundId) return;

    try {
      await roundService.deleteRound(roundId, user.email);
      setRounds(rounds.filter((round) => round.id !== roundId));
    } catch (err) {
      setError("Failed to delete round. " + err.message);
    } finally {
      setConfirmDelete({ open: false, roundId: null });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Rounds History"
        subtitle="View your rounds"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddRound}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
            }}
          >
            Add New Round
          </Button>
        }
      />
      <Paper {...elevatedCardStyles}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        ></Box>

        {rounds.length === 0 ? (
          <Typography>You haven't recorded any rounds yet.</Typography>
        ) : (
          <RoundsTable
            rounds={rounds}
            onViewRound={onViewRound}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDelete.open}
          onClose={() => setConfirmDelete({ open: false, roundId: null })}
          onConfirm={handleConfirmDelete}
          title="Delete Round?"
          contentText="Are you sure you want to permanently delete this round? This action cannot be undone."
          confirmText="Delete"
          confirmColor="error"
        />
      </Paper>
    </Box>
  );
};

export default RoundsHistoryPage;
