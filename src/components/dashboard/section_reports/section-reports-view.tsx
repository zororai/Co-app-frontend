'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Printer as PrinterIcon } from '@phosphor-icons/react/dist/ssr/Printer';

import { UserStatCard } from './user-stat-card';
import { UserMapSection } from './user-map-section';
import { UserTrendChart } from './user-trend-chart';
import { UserGrowthChart } from './user-growth-chart';
import { authClient } from '@/lib/auth/client';

export function SectionReportsView(): React.JSX.Element {
  const [totalArea, setTotalArea] = React.useState<string>('0');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await authClient.fetchTotalMiningArea();
        if (result.success && result.data) {
          // Format the number with commas
          const formattedArea = parseFloat(result.data.totalArea).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          });
          setTotalArea(formattedArea);
        }
      } catch (error) {
        console.error('Error fetching total mining area:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack spacing={3}>
      {/* Header with Print Button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Section Reports</Typography>
        <Button
          variant="contained"
          startIcon={<PrinterIcon fontSize="var(--icon-fontSize-md)" />}
          onClick={handlePrint}
          sx={{
            bgcolor: 'secondary.main',
            color: '#fff',
            '&:hover': { bgcolor: 'secondary.dark' }
          }}
        >
          Print Report
        </Button>
      </Stack>

      {/* User Section */}
      <Stack spacing={3}>
       
        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <UserStatCard
              title="Total Mining Area"
              value={isLoading ? <CircularProgress size={24} /> : totalArea}
              icon="users"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <UserStatCard
              title="New Users"
              value="125"
              icon="userPlus"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <UserStatCard
              title="Active Users"
              value="1,800"
              icon="userCheck"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <UserStatCard
              title="Retention"
              value="68%"
              icon="repeat"
            />
          </Grid>
        </Grid>

        {/* Map Section */}
        <UserMapSection />

        {/* Charts Section */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <UserTrendChart />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <UserGrowthChart />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
}
