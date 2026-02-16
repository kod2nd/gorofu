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
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${headerBorder}`,
          p: { xs: 2, sm: 3 },
          mb: 2,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
            theme.palette.background.default,
            0.6
          )} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              }}
            >
              {getInitials(full_name)}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
                noWrap
              >
                {full_name || "User"}
              </Typography>

              <Typography variant="body2" color="text.secondary" noWrap>
                {email}
              </Typography>

              <Stack direction="row" gap={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                {(roles || []).map((role) => (
                  <Chip
                    key={role}
                    size="small"
                    color={roleTone(role)}
                    label={roleLabel(role)}
                    sx={{
                      fontWeight: 700,
                      textTransform: "capitalize",
                      borderRadius: 999,
                    }}
                  />
                ))}
                {isImpersonating && (
                  <Chip
                    size="small"
                    label="Impersonating (read-only)"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.warning.main, 0.16),
                      color: theme.palette.warning.dark,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Actions */}
          {!isEditing ? (
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
          )}
        </Stack>
      </Paper>

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
