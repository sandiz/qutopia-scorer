import { Typography } from '@mui/material';
import React from 'react';
import './App.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import OBSComponent from './OBSComponent';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Typography variant="h2" component="h2" style={{ margin: 20 }}>
          QPositive Scorer
        </Typography>

        <OBSComponent />
      </div>
    </ThemeProvider>
  );
}


export default App;
