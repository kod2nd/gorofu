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
  elevation: 3,
  sx: {
    p: { xs: 2, md: 4 },
    borderRadius: 3,
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
  }
};

// Table-specific styles that use theme colors
export const tableStyles = {
  // Header colors using theme
  header: {
    backgroundColor: 'grey.800',
    color: 'common.white',
  },
  
  // Row colors using theme
  statLabel: {
    backgroundColor: 'warning.50', // Light yellow from theme
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
  
  // Sizing
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
            opacity: 0.8,
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