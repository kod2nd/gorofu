import React from "react";
import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const getInitials = (text = "") => {
  const parts = String(text).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "•";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

const PageHeader = ({
  title,
  subtitle,
  icon,
  avatarText,
  chips = [],
  actions,
  maxWidth = 1200,
  sx,
}) => {
  const theme = useTheme();
  const headerBorder = alpha(theme.palette.text.primary, 0.12);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${headerBorder}`,
        p: { xs: 2, sm: 3 },
        mb: 2,
        background: `linear-gradient(180deg,
          ${alpha(theme.palette.background.paper, 1)} 0%,
          ${alpha(theme.palette.background.default, 0.6)} 100%)`,
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        {/* Left */}
        <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0, flex: 1 }}>
          {(icon || avatarText) && (
            <Avatar
              sx={{
                width: 52,
                height: 52,
                fontWeight: 800,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                flexShrink: 0,
              }}
            >
              {icon || getInitials(avatarText)}
            </Avatar>
          )}

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
              // allow wrap on small screens so it doesn't get "crushed"
              noWrap={false}
            >
              {title}
            </Typography>

            {subtitle ? (
              <Typography
                variant="body2"
                color="text.secondary"
                // also allow wrap on small screens
                noWrap={false}
                sx={{ mt: 0.25 }}
              >
                {subtitle}
              </Typography>
            ) : null}

            {chips?.length > 0 ? (
              <Stack direction="row" gap={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                {chips.map((c, idx) => (
                  <Chip
                    key={`${c.label}-${idx}`}
                    size="small"
                    label={c.label}
                    color={c.color || "default"}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 999,
                      textTransform: "none",
                      ...(c.sx || {}),
                    }}
                  />
                ))}
              </Stack>
            ) : null}
          </Box>
        </Stack>

        {/* Right (actions) */}
        {actions ? (
          <Box
            sx={{
              flexShrink: 0,
              // on small screens: actions go below and align right
              alignSelf: { xs: "flex-end", sm: "center" },
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              justifyContent: { xs: "flex-end", sm: "flex-end" },
            }}
          >
            {actions}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default PageHeader;