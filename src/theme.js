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
    success: {
      main: customColors.pastelGreen,
    },
    warning: {
      50: '#FDF8E1',
      100: '#F9F2C7',
      main: '#F1C40F',
    },
    grey: {
      50: '#FAFAFA',
      100: customColors.lightGrey,
      200: '#E0E0E0',
      300: '#BDBDBD',
      800: customColors.primaryDarkBlue,
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
    MuiCssBaseline: {
      styleOverrides: {
        '*:focus:not(:focus-visible)': {
          outline: 'none',
        },
      },
    },
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