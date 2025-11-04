'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { authClient } from '@/lib/auth/client';

interface FiltersSidebarProps {
  onSearchChange?: (search: string) => void;
  onSearchResult?: (data: any) => void;
}

export function FiltersSidebar({ onSearchChange, onSearchResult }: FiltersSidebarProps): React.JSX.Element {
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
  };

  const handleSearchClick = async () => {
    if (!search.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.fetchShaftAssignmentByShaftNumber(search);
      
      if (result.success && result.data) {
        onSearchResult?.(result.data);
        onSearchChange?.(search);
      } else {
        console.error('Error fetching shaft assignment:', result.error);
        onSearchResult?.(null);
      }
    } catch (error) {
      console.error('Error searching shaft:', error);
      onSearchResult?.(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
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
        <Stack direction="row" spacing={1}>
          <FormControl fullWidth>
            <OutlinedInput
              value={search}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder="Search Shaft..."
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
          <Button
            variant="contained"
            onClick={handleSearchClick}
            disabled={isLoading || !search.trim()}
            sx={{ minWidth: '100px' }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
