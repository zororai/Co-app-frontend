'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import { authClient } from '@/lib/auth/client';

interface SectionReportFilterProps {
  onSearch: (name: string, startDate: string, endDate: string) => void;
  isLoading: boolean;
}

interface Section {
  id?: string;
  sectionName: string;
  [key: string]: any;
}

export function SectionReportFilter({ onSearch, isLoading }: SectionReportFilterProps): React.JSX.Element {
  const [sectionName, setSectionName] = React.useState('');
  const [startDate, setStartDate] = React.useState(dayjs().subtract(7, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [sections, setSections] = React.useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = React.useState(true);

  // Fetch approved sections on component mount
  React.useEffect(() => {
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const result = await authClient.fetchApprovedSections();
        if (result.success && result.data) {
          // Handle both array response and object with array property
          const sectionsData = Array.isArray(result.data) ? result.data : result.data.sections || [];
          setSections(sectionsData);
        } else {
          console.error('Failed to fetch sections:', result.error);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchSections();
  }, []);

  // Convert dates to ISO format for API
  const handleGenerateReport = () => {
    if (!sectionName.trim()) {
      alert('Please select a section');
      return;
    }

    const startDateISO = dayjs(startDate).toISOString();
    const endDateISO = dayjs(endDate).toISOString();
    onSearch(sectionName.trim(), startDateISO, endDateISO);
  };

  const handleQuickSelect = (days: number) => {
    const newStartDate = dayjs().subtract(days, 'days').format('YYYY-MM-DD');
    const newEndDate = dayjs().format('YYYY-MM-DD');
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Section Filter</Typography>

          {/* Section Name Dropdown */}
          <TextField
            select
            label="Section Name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            fullWidth
            required
            helperText={loadingSections ? "Loading sections..." : "Select a section to report on"}
            disabled={loadingSections || sections.length === 0}
            InputProps={{
              startAdornment: loadingSections ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : null,
            }}
          >
            {!loadingSections && sections.length === 0 && (
              <MenuItem value="" disabled>
                No sections available
              </MenuItem>
            )}
            {sections.map((section) => (
              <MenuItem key={section.id || section.sectionName} value={section.sectionName}>
                {section.sectionName}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Range */}
          <Typography variant="subtitle2" color="text.secondary">
            Date Range
          </Typography>

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Quick Select Buttons */}
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Quick Select
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickSelect(1)}
                sx={{ flex: '1 1 auto' }}
              >
                24h
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickSelect(7)}
                sx={{ flex: '1 1 auto' }}
              >
                7d
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickSelect(30)}
                sx={{ flex: '1 1 auto' }}
              >
                30d
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleQuickSelect(90)}
                sx={{ flex: '1 1 auto' }}
              >
                90d
              </Button>
            </Stack>
          </Stack>

          {/* Generate Button */}
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleGenerateReport}
            disabled={isLoading}
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
