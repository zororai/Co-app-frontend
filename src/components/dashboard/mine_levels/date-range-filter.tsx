'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';
import dayjs from 'dayjs';

interface DateRangeFilterProps {
  onSearch: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export function DateRangeFilter({ onSearch, isLoading = false }: DateRangeFilterProps): React.JSX.Element {
  const [startDate, setStartDate] = React.useState<string>(
    dayjs().subtract(7, 'day').format('YYYY-MM-DDTHH:mm')
  );
  const [endDate, setEndDate] = React.useState<string>(
    dayjs().format('YYYY-MM-DDTHH:mm')
  );

  const handleSearch = () => {
    // Convert to ISO format with timezone
    const startISO = dayjs(startDate).toISOString();
    const endISO = dayjs(endDate).toISOString();
    onSearch(startISO, endISO);
  };

  const handleQuickSelect = (days: number) => {
    const end = dayjs();
    const start = end.subtract(days, 'day');
    setStartDate(start.format('YYYY-MM-DDTHH:mm'));
    setEndDate(end.format('YYYY-MM-DDTHH:mm'));
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant="h6">Date Range Filter</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Select date range to view mine level reports
            </Typography>
          </div>

          <Divider />

          {/* Date Inputs */}
          <Stack spacing={2}>
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="End Date & Time"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>

          <Divider />

          {/* Quick Select Buttons */}
          <div>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Quick Select
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleQuickSelect(1)}
              >
                Last 24 Hours
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleQuickSelect(7)}
              >
                Last 7 Days
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleQuickSelect(30)}
              >
                Last 30 Days
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleQuickSelect(90)}
              >
                Last 90 Days
              </Button>
            </Stack>
          </div>

          <Divider />

          {/* Search Button */}
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={isLoading || !startDate || !endDate}
            fullWidth
            sx={{
              bgcolor: 'secondary.main',
              color: '#fff',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            {isLoading ? 'Loading...' : 'Generate Report'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
