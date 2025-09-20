// src/theme.js
import { createTheme } from '@mui/material/styles';

const customColors = {
  // Primary colors from the theme
  primaryDarkBlue: '#2C3E50',
  accentLightBlue: '#3498DB',

  // Backgrounds and text
  veryLightGrey: '#F4F6F9',
  lightGrey: '#E9ECF0',
  textPrimary: '#34495E',
  textSecondary: '#7F8C8D',

  // Other colors as needed
  white: '#FFFFFF',
  black: '#000000',
  pastelGreen: '#7CDD6D'
};

const theme = createTheme({
  palette: {
    primary: {
      main: customColors.primaryDarkBlue,
    },
    secondary: {
      main: customColors.accentLightBlue,
    },
    background: {
      default: customColors.veryLightGrey,
      paper: customColors.white,
    },
    text: {
      primary: customColors.textPrimary,
      secondary: customColors.textSecondary,
    },
    custom: customColors,
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;