import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import FormatListBulletedAddIcon from "@mui/icons-material/FormatListBulletedAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditNote from "@mui/icons-material/EditNote";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LuggageIcon from "@mui/icons-material/Luggage";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const Sidebar = ({
  onNavClick,
  onSignOut,
  isExpanded,
  handleDrawerToggle,
  activePage,
  userRoles,
  isMobile,
}) => {
  const theme = useTheme();

  const menuItems = useMemo(() => {
    const items = [
      { text: "Dashboard", icon: <ViewQuiltIcon />, page: "dashboard", section: "Main" },
      { text: "Add Round", icon: <FormatListBulletedAddIcon />, page: "addRound", section: "Main" },
      { text: "Rounds History", icon: <HistoryIcon />, page: "roundsHistory", section: "Main" },
      { text: "My Bag", icon: <LuggageIcon />, page: "myBag", section: "Main" },
      { text: "Notes", icon: <EditNote />, page: "studentInteractions", section: "Main" },
      { text: "Account", icon: <AccountCircleIcon />, page: "account", section: "Main" },
      { text: "View Round", icon: <VisibilityIcon />, page: "viewRound", hidden: true },
    ];

    const isAdmin = userRoles?.some((role) => ["admin", "super_admin"].includes(role));
    if (isAdmin) {
      items.push(
        { type: "section", label: "Admin" },
        { text: "User Mgmt", icon: <ManageAccountsIcon />, page: "userManagement", section: "Admin" },
        { text: "Course Mgmt", icon: <GolfCourseIcon />, page: "courseManagement", section: "Admin" },
        { text: "Coach Mgmt", icon: <PeopleOutlineOutlinedIcon />, page: "coachManagement", section: "Admin" }
      );
    }

    return items;
  }, [userRoles]);

  const width = isExpanded ? 264 : 72;

  const bg = theme.palette.custom?.primaryDarkBlue || theme.palette.grey[900];
  const surface = `linear-gradient(180deg, ${alpha(bg, 0.98)} 0%, ${alpha(bg, 0.92)} 100%)`;

  const NavRow = ({ item }) => {
    const selected = item.page === activePage;

    const button = (
      <ListItemButton
        onClick={() => onNavClick(item.page)}
        selected={selected}
        sx={{
          position: "relative",
          borderRadius: 2,
          py: 1,
          px: isExpanded ? 1.25 : 1,
          justifyContent: isExpanded ? "flex-start" : "center",
          gap: isExpanded ? 1.25 : 0,

          // subtle hover
          "&:hover": {
            backgroundColor: alpha("#fff", 0.06),
          },

          // selected pill
          "&.Mui-selected": {
            backgroundColor: alpha("#fff", 0.12),
            "&:hover": {
              backgroundColor: alpha("#fff", 0.16),
            },
          },

          // left accent bar when selected
          "&.Mui-selected::before": {
            content: '""',
            position: "absolute",
            left: 6,
            top: 10,
            bottom: 10,
            width: 4,
            borderRadius: 4,
            backgroundColor: alpha("#fff", 0.9),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            color: alpha("#fff", selected ? 0.95 : 0.8),
            // consistent icon sizing
            "& svg": { fontSize: 22 },
            mr: isExpanded ? 0.5 : 0,
          }}
        >
          {item.icon}
        </ListItemIcon>

        {isExpanded && (
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: selected ? 700 : 600,
              letterSpacing: 0.1,
            }}
            sx={{ color: alpha("#fff", selected ? 0.95 : 0.85) }}
          />
        )}
      </ListItemButton>
    );

    // tooltips only when collapsed
    return (
      <ListItem disablePadding sx={{ mb: 0.75 }}>
        {isExpanded ? (
          button
        ) : (
          <Tooltip title={item.text} placement="right" arrow>
            {button}
          </Tooltip>
        )}
      </ListItem>
    );
  };

  return (
    <Box
      sx={{
        width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 1.5,
        color: "white",
        background: surface,
        borderRight: `1px solid ${alpha("#fff", 0.08)}`,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Top brand row */}
      <Box
        sx={{
          position: "relative",
          height: 64,
          display: "flex",
          alignItems: "center",
          px: isExpanded ? 1 : 0,
          mb: 2,
        }}
      >
        {/* Brand / Logo (always visible) */}
        {isExpanded && (
          <Box
            onClick={() => onNavClick("dashboard")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              mb: 3,
              px: 1,
            }}
          >
            <SportsGolfIcon sx={{ fontSize: 32, color: "white" }} />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                letterSpacing: 0.5,
                lineHeight: 1,
              }}
            >
              Gorufu
            </Typography>
          </Box>
        )}

        {/* Drawer toggle (never affects layout) */}
        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              color: "white",
              zIndex: 2,
            }}
          >
            {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: alpha("#fff", 0.10), mb: 1.25 }} />

      {/* Nav */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 0.5 }}>
        <Typography
          sx={{
            px: 1,
            pb: 1,
            pt: 0.25,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.8,
            color: alpha("#fff", 0.55),
            display: isExpanded ? "block" : "none",
            textTransform: "uppercase",
          }}
        >
          Main
        </Typography>

        <List disablePadding>
          {menuItems.map((item, idx) => {
            if (item.hidden) return null;

            if (item.type === "section") {
              return (
                <Box key={`section-${idx}`} sx={{ mt: 1.25, mb: 0.75 }}>
                  <Divider sx={{ borderColor: alpha("#fff", 0.10), mb: 1 }} />
                  <Typography
                    sx={{
                      px: 1,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.8,
                      color: alpha("#fff", 0.55),
                      display: isExpanded ? "block" : "none",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            }

            return <NavRow key={item.page} item={item} />;
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: alpha("#fff", 0.10), mt: 1.25, mb: 1 }} />

      <Box sx={{ px: 0.5 }}>
        <List disablePadding>
          <ListItem disablePadding>
            {isExpanded ? (
              <ListItemButton
                onClick={onSignOut}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.25,
                  "&:hover": { backgroundColor: alpha("#fff", 0.06) },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: alpha("#fff", 0.8),
                    "& svg": { fontSize: 22 },
                    mr: 1,
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Sign out"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }}
                  sx={{ color: alpha("#fff", 0.85) }}
                />
              </ListItemButton>
            ) : (
              <Tooltip title="Sign out" placement="right" arrow>
                <ListItemButton
                  onClick={onSignOut}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    justifyContent: "center",
                    "&:hover": { backgroundColor: alpha("#fff", 0.06) },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: alpha("#fff", 0.8),
                      "& svg": { fontSize: 22 },
                    }}
                  >
                    <LogoutIcon />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            )}
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
