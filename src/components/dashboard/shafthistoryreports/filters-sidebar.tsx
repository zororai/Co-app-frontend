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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { authClient } from '@/lib/auth/client';

interface FiltersSidebarProps {
  onSearchChange?: (search: string) => void;
  onSearchResult?: (data: any) => void;
  onProductionReportResult?: (data: any) => void;
}

export function FiltersSidebar({ onSearchChange, onSearchResult, onProductionReportResult }: FiltersSidebarProps): React.JSX.Element {
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [period, setPeriod] = React.useState<'week' | 'month' | 'year'>('month');
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [weekOfYear, setWeekOfYear] = React.useState(1);

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
      // First API call: Fetch shaft assignment
      const shaftResult = await authClient.fetchShaftAssignmentByShaftNumber(search);
      
      if (shaftResult.success && shaftResult.data) {
        onSearchResult?.(shaftResult.data);
        onSearchChange?.(search);

        // Second API call: Fetch production statistics (only if first call succeeds)
        const statsParams: any = {
          shaftNumber: search,
          period,
          year,
        };

        // Add month or weekOfYear based on period
        if (period === 'month') {
          statsParams.month = month;
        } else if (period === 'week') {
          statsParams.weekOfYear = weekOfYear;
        }

        const statsResult = await authClient.fetchOreTransportStatistics(statsParams);
        
        if (statsResult.success && statsResult.data) {
          onProductionReportResult?.(statsResult.data);
        } else {
          console.error('Error fetching production statistics:', statsResult.error);
          onProductionReportResult?.(null);
        }
      } else {
        console.error('Error fetching shaft assignment:', shaftResult.error);
        onSearchResult?.(null);
        onProductionReportResult?.(null);
      }
    } catch (error) {
      console.error('Error searching shaft:', error);
      onSearchResult?.(null);
      onProductionReportResult?.(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (event: any) => {
    setPeriod(event.target.value as 'week' | 'month' | 'year');
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
        
        {/* Shaft Number Search */}
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

        <Divider />

        {/* Period Filters */}
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Report Period
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={handlePeriodChange}
              >
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              inputProps={{ min: 2000, max: 2100 }}
            />

            {period === 'month' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Month (1-12)"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
              />
            )}

            {period === 'week' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Week of Year (1-53)"
                value={weekOfYear}
                onChange={(e) => setWeekOfYear(Number(e.target.value))}
                inputProps={{ min: 1, max: 53 }}
              />
            )}
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}
