import { createTheme } from '@mui/material/styles';

const commonSettings = {
  typography: {
    fontFamily: '"Inter", "system-ui", "sans-serif"',
    h5: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
};

export const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'light',
    background: { default: '#F8FAFC', paper: '#ffffff' },
    primary: { main: '#0F172A' },
    secondary: { main: '#00E676' },
    text: { primary: '#0F172A', secondary: '#64748B' },
  },
});

// ACTUAL DARK THEME
export const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'dark',
    background: { default: '#0F172A', paper: '#1E293B' },
    primary: { main: '#F8FAFC' },
    secondary: { main: '#00E676' },
    text: { primary: '#F8FAFC', secondary: '#94A3B8' },
    divider: '#334155',
  },
});