import { createTheme } from "@mui/material/styles";

import { colorSchemes } from './color-schemes';
import { components } from './components/components';
import { shadows } from './shadows';
import type { Theme } from './types';
import { typography } from './typography';

function customCreateTheme(): Theme {
  const theme = createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1440 } },
    colorSchemes,
    components,
    cssVariables: {
			colorSchemeSelector: "class",
		},
    direction: "ltr",
    shadows,
    shape: { borderRadius: 8 },
    typography,
  });

  // Override focus colors for input fields to use secondary instead of primary
  const overriddenTheme = createTheme(
    {
      ...theme,
    },
    {
      components: {
        ...components,
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'inherit',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'inherit',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.secondary.main,
                borderWidth: '2px',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.secondary.main,
                },
              },
            },
          },
        },
      },
    }
  );

  return overriddenTheme;
}

export { customCreateTheme as createTheme };
