import React from "react";
import {
  Paper,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Star,
  StarBorder,
  PushPin,
  PushPinOutlined,
  ChatBubbleOutline,
  KeyboardArrowRight,
  PersonOutline,
  School,
} from "@mui/icons-material";
import { toProperCase, stripHtmlAndTruncate } from "./utils";

const NoteThreadRow = ({ note, onClick, onFavorite, onPin, isViewingSelfAsCoach, user }) => {
  const canFavorite = !isViewingSelfAsCoach;
  const canPin = (user?.roles || []).includes("coach") && !isViewingSelfAsCoach;
  const isPersonalNote = note.author_id === note.student_id;

  return (
    <Paper
      onClick={() => onClick(note.id)}
      elevation={0}
      sx={(theme) => ({
        display: "flex",
        alignItems: "flex-start",
        p: { xs: 1.5, sm: 2 },
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
        background: `linear-gradient(180deg,
          ${alpha(theme.palette.background.paper, 1)} 0%,
          ${alpha(theme.palette.background.default, 0.55)} 100%)`,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease",

        // left accent
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: isPersonalNote ? theme.palette.secondary.main : theme.palette.primary.main,
          opacity: 0.75,
          transform: "scaleY(0.7)",
          transformOrigin: "center",
          transition: "transform 160ms ease, opacity 160ms ease",
        },

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.10)}`,
          borderColor: alpha(theme.palette.primary.main, 0.22),
          background: `linear-gradient(180deg,
            ${alpha(theme.palette.background.paper, 1)} 0%,
            ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
        },
        "&:hover::before": {
          transform: "scaleY(1)",
          opacity: 1,
        },

        // reveal actions only on hover (desktop)
        "&:hover .note-actions": {
          opacity: 1,
          transform: "translateX(0px)",
        },
        "& .note-actions": {
          opacity: { xs: 1, sm: 0.75 },
          transform: { xs: "none", sm: "translateX(4px)" },
          transition: "opacity 160ms ease, transform 160ms ease",
        },
        "&:hover .chevron": { transform: "translateX(4px)" },
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              fontSize: { xs: "1rem", sm: "1.05rem" },
              mb: 1,
              lineHeight: 1.25,
              wordBreak: "break-word",
            }}
          >
            {note.subject || "No Subject"}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              icon={isPersonalNote ? <PersonOutline /> : <School />}
              label={isPersonalNote ? "Personal" : "Lesson"}
              size="small"
              color={isPersonalNote ? "secondary" : "primary"}
              sx={{
                height: 24,
                fontSize: "0.72rem",
                fontWeight: 700,
                borderRadius: 999,
                "& .MuiChip-icon": { fontSize: "0.95rem" },
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", flexShrink: 0 }}>
              {toProperCase(note.author?.full_name)}
            </Typography>

            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "divider", display: { xs: "none", sm: "block" } }} />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem", display: { xs: "none", sm: "block" } }}
            >
              {note.lesson_date
                ? new Date(note.lesson_date).toLocaleDateString("en-UK", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </Typography>

            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "divider" }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
              <ChatBubbleOutline sx={{ fontSize: "0.9rem", color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                {note.replies?.length || 0}
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.813rem", sm: "0.875rem" },
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {stripHtmlAndTruncate(note.note, 80)}
          </Typography>
        </Box>

        {/* Actions */}
        <Box className="note-actions" sx={{ display: "flex", alignItems: "center", gap: { xs: 0, sm: 0.5 } }}>
          {canPin && (
            <Tooltip title={note.is_pinned_to_dashboard ? "Unpin from dashboard" : "Pin to dashboard"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(note);
                }}
                sx={(theme) => ({
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                  color: note.is_pinned_to_dashboard ? "primary.main" : "text.secondary",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.10),
                    color: "primary.main",
                  },
                })}
              >
                {note.is_pinned_to_dashboard ? (
                  <PushPin sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
                ) : (
                  <PushPinOutlined sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
                )}
              </IconButton>
            </Tooltip>
          )}

          {canFavorite && (
            <Tooltip title={note.is_favorited ? "Remove from favorites" : "Add to favorites"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(note);
                }}
                sx={(theme) => ({
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.10)}`,
                  color: note.is_favorited ? "warning.main" : "text.secondary",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.warning.main, 0.12),
                    color: "warning.main",
                  },
                })}
              >
                {note.is_favorited ? (
                  <Star sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
                ) : (
                  <StarBorder sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }} />
                )}
              </IconButton>
            </Tooltip>
          )}

          <KeyboardArrowRight
            className="chevron"
            sx={{
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              color: "text.secondary",
              ml: { xs: 0, sm: 0.5 },
              transition: "transform 160ms ease",
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default NoteThreadRow;
