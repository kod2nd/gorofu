import React from "react";
import { Box, Typography, Paper, Divider, useTheme, alpha } from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  SportsGolf as SportsGolfIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

const FieldCard = ({ icon: Icon, label, value }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        p: 2,
        transition: "all 0.18s ease",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.25),
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.10),
            color: theme.palette.primary.main,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.75,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {value || "—"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const ProfileDisplay = ({ userProfile }) => {
  const scoringBiasMap = { 0: "Par", 1: "Bogey", 2: "Double Bogey" };
  const scoringBiasText = scoringBiasMap[userProfile.scoring_bias] ?? "Bogey";

  const fields = [
    { icon: PersonIcon, label: "Display name", value: userProfile.full_name },
    { icon: EmailIcon, label: "Email", value: userProfile.email },
    { icon: PublicIcon, label: "Country", value: userProfile.country },
    {
      icon: SportsGolfIcon,
      label: "Handicap",
      value: userProfile.handicap != null ? Number(userProfile.handicap).toFixed(1) : null,
    },
    { icon: PhoneIcon, label: "Phone", value: userProfile.phone },
    {
      icon: CakeIcon,
      label: "Date of birth",
      value: userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString() : null,
    },
    { icon: TuneIcon, label: "Scorecard bias", value: scoringBiasText },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: "-0.01em" }}>
          Personal information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Your profile details used for scoring and personalization.
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
        }}
      >
        {fields.map((f) => (
          <FieldCard key={f.label} icon={f.icon} label={f.label} value={f.value} />
        ))}
      </Box>
    </Box>
  );
};

export default ProfileDisplay;
