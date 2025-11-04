'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FiltersSidebar } from './filters-sidebar';
import { ReportCard, type ReportCard as ReportCardType } from './report-card';

// Sample data - replace with actual API data
const sampleReports: ReportCardType[] = [
  {
    id: '1',
    title: 'Monthly Inspection Report',
    description: 'Comprehensive inspection report for all shafts in the north sector.',
    date: 'November 1, 2025',
    status: 'Completed',
  },
  {
    id: '2',
    title: 'Safety Audit Summary',
    description: 'Quarterly safety audit results and recommendations for improvement.',
    date: 'October 28, 2025',
    status: 'Completed',
  },
  {
    id: '3',
    title: 'Maintenance History',
    description: 'Detailed maintenance records and scheduled maintenance activities.',
    date: 'October 25, 2025',
    status: 'Completed',
  },
  {
    id: '4',
    title: 'Incident Analysis',
    description: 'Analysis of recent incidents and corrective actions taken.',
    date: 'October 20, 2025',
    status: 'Completed',
  },
];

export function ShaftHistoryReportsView(): React.JSX.Element {
  const [filteredReports, setFilteredReports] = React.useState<ReportCardType[]>(sampleReports);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearchChange = (search: string) => {
    if (!search) {
      setFilteredReports(sampleReports);
      return;
    }

    const filtered = sampleReports.filter((report) =>
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredReports(filtered);
  };

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Shaft History Reports</Typography>
        <Typography color="text.secondary" variant="body1" sx={{ mt: 1 }}>
          View and search through historical shaft reports
        </Typography>
      </div>

      <Grid container spacing={3}>
        {/* Left Sidebar - Filters */}
        <Grid
          size={{
            xs: 12,
            md: 3,
          }}
        >
          <FiltersSidebar onSearchChange={handleSearchChange} />
        </Grid>

        {/* Right Content - Report Cards Grid */}
        <Grid
          size={{
            xs: 12,
            md: 9,
          }}
        >
          <Box>
            <Grid container spacing={3}>
              {isLoading ? (
                // Loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                    key={index}
                  >
                    <ReportCard
                      report={{
                        id: `loading-${index}`,
                        title: '',
                        description: '',
                      }}
                      loading
                    />
                  </Grid>
                ))
              ) : filteredReports.length > 0 ? (
                // Reports display
                filteredReports.map((report) => (
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                    key={report.id}
                  >
                    <ReportCard report={report} />
                  </Grid>
                ))
              ) : (
                // No results
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                    }}
                  >
                    <Typography color="text.secondary">
                      No reports found matching your search
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
