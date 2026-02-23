import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { Edit as EditIcon, Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { userProfileService } from "../services/userProfileService";
import ProfileDisplay from "./ProfileDisplay";
import ProfileEditForm from "./ProfileEditForm";
import PageHeader from "./PageHeader";

const AccountPage = ({ userProfile, onProfileUpdate, isImpersonating = false }) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        country: userProfile.country || "",
        handicap: userProfile.handicap || "",
        phone: userProfile.phone || "",
        date_of_birth: userProfile.date_of_birth || "",
        scoring_bias: userProfile.scoring_bias ?? 1,
      });
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <Typography color="text.secondary">Loading profile…</Typography>
      </Box>
    );
  }

  const { full_name, email, roles } = userProfile;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        handicap: formData.handicap === "" || isNaN(formData.handicap) ? null : parseFloat(formData.handicap),
        date_of_birth: formData.date_of_birth || null,
      };

      await userProfileService.updateUserProfile(userProfile.user_id, dataToSave);
      onProfileUpdate({ ...userProfile, ...dataToSave });
      setIsEditing(false);
      setSnackbar({ open: true, message: "Profile updated.", severity: "success" });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: "error" });
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: userProfile.full_name || "",
      country: userProfile.country || "",
      handicap: userProfile.handicap || "",
      phone: userProfile.phone || "",
      date_of_birth: userProfile.date_of_birth || "",
      scoring_bias: userProfile.scoring_bias ?? 1,
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const roleLabel = (r) => (r || "").replaceAll("_", " ");

  const roleTone = (role) => {
    const r = role?.toLowerCase();
    if (r === "super_admin" || r === "admin") return "error";
    if (r === "coach") return "info";
    return "default";
  };

  const headerBorder = alpha(theme.palette.text.primary, 0.08);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3 }, pb: 4 }}>
      {/* Header */}
      <PageHeader
        title={full_name || "User"}
        subtitle={email}
        avatarText={full_name || email}
        chips={[
          ...(roles || []).map((role) => ({
            label: roleLabel(role),
            color: roleTone(role),
            sx: { fontWeight: 700, textTransform: "capitalize" },
          })),
          ...(isImpersonating
            ? [
                {
                  label: "Impersonating (read-only)",
                  sx: (theme) => ({
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.warning.main, 0.16),
                    color: theme.palette.warning.dark,
                  }),
                },
              ]
            : []),
        ]}
        actions={
          !isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              disabled={isImpersonating}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800, px: 2.5 }}
            >
              Edit
            </Button>
          ) : (
            <Stack direction="row" gap={1}>
              <IconButton
                onClick={handleCancel}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                }}
              >
                <CloseIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 800, px: 2.5 }}
              >
                Save
              </Button>
            </Stack>
          )
        }
      />

      {/* Body */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Typography sx={{ fontWeight: 900, mb: 1.5, letterSpacing: "-0.01em" }}>
          Profile details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {isEditing ? (
          <ProfileEditForm formData={formData} email={email} handleInputChange={handleInputChange} />
        ) : (
          <ProfileDisplay userProfile={userProfile} />
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountPage;
