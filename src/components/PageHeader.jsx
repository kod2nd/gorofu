import React from "react";
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const getInitials = (text = "") => {
  const parts = String(text).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "•";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

/**
 * PageHeader
 *
 * Props:
 * - title: string | ReactNode
 * - subtitle?: string | ReactNode
 * - icon?: ReactNode (e.g. <GolfCourseIcon />)
 * - avatarText?: string (shows initials avatar if icon not provided)
 * - chips?: Array<{ label: string, color?: "default"|"primary"|"secondary"|"error"|"info"|"success"|"warning", sx?: object }>
 * - actions?: ReactNode (buttons / toggles)
 * - maxWidth?: number|string (defaults to 1200)
 * - sx?: object (Paper sx override)
 */
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
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
            {(icon || avatarText) && (
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
                {icon || getInitials(avatarText)}
              </Avatar>
            )}

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
                {title}
              </Typography>

              {subtitle ? (
                <Typography variant="body2" color="text.secondary" noWrap>
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

          {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
        </Stack>
      </Paper>

  );
};

export default PageHeader;
