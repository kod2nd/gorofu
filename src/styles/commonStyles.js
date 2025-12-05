// src/styles/commonStyles.js
// Centralized styling system for consistent UI across the golf app

// Common card/paper styles used across forms
export const cardStyles = {
  elevation: 0,
  sx: {
    p: 3,
    mb: 3,
    width: '100%',
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
  }
};

// Elevated card variant for main containers
export const elevatedCardStyles = {
  elevation: 4,
  sx: {
    p: { xs: 2, md: 4 },
    borderRadius: 4,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: 8,
    }
  }
};

// Section header styles for consistent typography
export const sectionHeaderStyles = {
  variant: "subtitle1",
  sx: { 
    fontWeight: "bold", 
    mb: 2, 
    color: 'primary.main' 
  }
};

// Common hover effects for interactive elements
export const hoverEffects = {
  card: {
    transition: 'all 0.2s',
    '&:hover': {
      boxShadow: 1,
      borderColor: 'primary.light',
    }
  },
  button: {
    transition: 'filter 0.2s ease-in-out',
    '&:hover': {
      filter: 'brightness(0.95)',
    }
  },
  iconButton: {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'action.hover',
    }
  }
};

// Action button styles for edit/delete etc.
export const actionButtonStyles = {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    color: 'white',
    cursor: 'pointer',
    borderRadius: '50%',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
  }
};

// Chip container styles for horizontal scrollable chips
export const chipContainerStyles = {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflowX: 'auto',
    gap: 0.75,
    py: 0.5,
    px: 0.5,
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      height: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'grey.400',
      borderRadius: 2,
    },
  },
  chip: {
    flexShrink: 0,
    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
    height: { xs: 26, sm: 32 },
    '& .MuiChip-label': {
      px: { xs: 1, sm: 1.5 },
      py: { xs: 0.25, sm: 0.5 },
      whiteSpace: 'nowrap',
    },
  }
};


// Button styles
export const buttonStyles = {
  primary: {
    borderRadius: 3,
    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
    color: 'white',
    fontWeight: 600,
    px: 3,
    py: 1,
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
    '&:hover': {
      background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
    }
  },
  secondary: {
    borderRadius: 3,
    bgcolor: 'grey.100',
    borderColor: 'grey.300',
    color: 'text.secondary',
    fontWeight: 600,
    px: 3,
    py: 1,
    '&:hover': {
      bgcolor: 'grey.200',
      borderColor: 'grey.400',
    }
  }
};

// Toggle button group styles
export const toggleButtonGroupStyles = {
  small: {
    '& .MuiToggleButton-root': {
      px: { xs: 1, sm: 1.5 },
      py: { xs: 0.25, sm: 0.5 },
      fontSize: { xs: '0.75rem', sm: '0.8125rem' },
      minWidth: { xs: 60, sm: 70 },
    }
  },
  sortDirection: {
    '& .MuiToggleButton-root': {
      px: { xs: 1, sm: 0.75 },
      py: { xs: 0.5, sm: 0.375 },
      minWidth: { xs: '50%', sm: 'auto' },
    }
  }
};

// Typography styles
export const typographyStyles = {
  clubName: {
    variant: 'h6',
    fontWeight: 'bold',
    noWrap: true,
    sx: {
      fontSize: { xs: '1rem', sm: '1.25rem' },
      lineHeight: 1.2,
    }
  },
  clubSubtitle: {
    variant: 'body2',
    sx: {
      opacity: 0.9,
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: 1.4,
    }
  },
  distanceLabel: {
    variant: 'caption',
    sx: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: { xs: '0.65rem', sm: '0.75rem' },
      display: 'block',
    }
  },
  distanceValue: {
    fontWeight: 'bold',
    color: 'white',
    sx: {
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      whiteSpace: 'nowrap',
    }
  }
};


// Accordion styles
export const accordionStyles = {
  clubCard: {
    sx: {
      borderRadius: 3,
      overflow: 'hidden',
      '&:before': { display: 'none' },
    }
  },
  summary: {
    sx: {
      p: { xs: 1.5, sm: 2, md: 3 },
      bgcolor: 'primary.main',
      color: 'white',
      '& .MuiAccordionSummary-content': {
        m: 0,
        alignItems: 'center',
        overflow: 'hidden',
      },
    }
  }
};

// Empty state styles
export const emptyStateStyles = {
  paper: {
    variant: 'outlined',
    sx: {
      borderRadius: 4,
      border: '2px dashed',
      borderColor: 'grey.300',
      bgcolor: 'grey.50',
      p: 6,
      textAlign: 'center',
    }
  }
};

// Table-specific styles that use theme colors
export const tableStyles = {
  header: {
    backgroundColor: 'grey.800',
    color: 'common.white',
  },
  statLabel: {
    backgroundColor: 'warning.50',
    '&:hover': {
      backgroundColor: 'warning.100',
      fontWeight: 'bold',
    }
  },
  gameTypeHeader: {
    backgroundColor: 'action.hover',
  },
  totalColumn: {
    backgroundColor: 'grey.100',
  },
  focusedCell: {
    backgroundColor: 'action.selected',
  },
  rowHeaderMinWidth: 120,
  cellMinWidth: 60,
  cellPadding: 0.5,
};

// Switch component styles using theme colors
export const switchStyles = {
  default: {
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: 'success.main',
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: 'success.main',
    },
  },
  warning: {
    "& .MuiSwitch-track": {
      backgroundColor: 'error.light',
      opacity: '1 !important',
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: 'common.white',
      opacity: '0.8 !important',
    },
  }
};

// Text field styles for consistent input appearance
export const textFieldStyles = {
  textAlign: "center",
  "& .MuiInputBase-input::placeholder": {
    fontStyle: "italic",
    opacity: 0.6,
    color: "text.secondary",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      border: "none",
    },
    "&:hover fieldset": {
      borderColor: "action.hover",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.75rem",
    },
  },
};

// Animation styles
export const animationStyles = {
  invalidInputPulse: {
    animation: "pulse 0.5s ease-in-out",
    "@keyframes pulse": {
      "0%": { boxShadow: "0 0 0 0 rgba(255, 0, 0, 0.7)" },
      "70%": { boxShadow: "0 0 0 10px rgba(255, 0, 0, 0)" },
      "100%": { boxShadow: "0 0 0 0 rgba(255, 0, 0, 0)" },
    },
  }
};

// Cell styles for tables
export const cellStyles = {
  base: {
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    padding: "8px",
    "& .stat-label": {
      display: "block",
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "0.75rem",
    },
    "& .hole-label": {
      display: "block",
      fontWeight: "bold",
      textAlign: "right",
      fontSize: "0.75rem",
    },
  },
  divider: {
    borderRight: "1px solid",
    borderColor: "divider",
  },
  bold: {
    fontWeight: "bold",
  }
};