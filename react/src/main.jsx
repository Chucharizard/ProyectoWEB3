import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#37738F',
      light: '#4B7D96',
      dark: '#2D5A73',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#56A099',
      light: '#6BA7A3',
      dark: '#458078',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderRight: '3px solid #e0e0e0',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #37738F 0%, #56A099 100%)',
          boxShadow: '0 8px 32px rgba(55, 115, 143, 0.4)',
          '& .MuiToolbar-root': {
            minHeight: '64px',
            '@media (max-width: 900px)': {
              minHeight: '56px',
              paddingLeft: '12px',
              paddingRight: '12px',
            },
            '@media (max-width: 600px)': {
              minHeight: '52px',
              paddingLeft: '8px',
              paddingRight: '8px',
            }
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#37738F !important',
            color: '#FFFFFF !important',
            '&:hover': {
              backgroundColor: '#2D5A73 !important',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF !important',
            },
            '& .MuiListItemText-primary': {
              color: '#FFFFFF !important',
              fontWeight: 'bold !important',
            },
            '& .MuiListItemText-secondary': {
              color: '#E0E0E0 !important',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(55, 115, 143, 0.1) !important',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '& .employee-card': {
            background: 'linear-gradient(135deg, #37738F 0%, #56A099 100%) !important',
            '& .MuiTypography-root': {
              color: '#FFFFFF !important',
            }
          }
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
