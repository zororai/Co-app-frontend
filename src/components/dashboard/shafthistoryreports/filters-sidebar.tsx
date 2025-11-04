'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface FiltersSidebarProps {
  onSearchChange?: (search: string) => void;
}

export function FiltersSidebar({ onSearchChange }: FiltersSidebarProps): React.JSX.Element {
  const [search, setSearch] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    onSearchChange?.(value);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 3,
      }}
    >
      <Stack spacing={3}>
        <div>
          <Typography variant="h6">Filters</Typography>
        </div>
        <Divider />
        <FormControl fullWidth>
          <OutlinedInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search reports..."
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--mui-palette-divider)',
              },
            }}
          />
        </FormControl>
      </Stack>
    </Card>
  );
}
