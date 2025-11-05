'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FiltersSidebar } from './filters-sidebar';
import { ShaftDetail } from './shaft-detail';
import { ProductionReportCard } from './production-report-card';

export function ShaftHistoryReportsView(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);
  const [shaftData, setShaftData] = React.useState<any>(null);
  const [productionData, setProductionData] = React.useState<any>(null);

  const handleSearchChange = (search: string) => {
    if (!search) {
      setShaftData(null);
      setProductionData(null);
      return;
    }
  };

  const handleSearchResult = (data: any) => {
    setShaftData(data);
  };

  const handleProductionReportResult = (data: any) => {
    setProductionData(data);
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
          <FiltersSidebar 
            onSearchChange={handleSearchChange}
            onSearchResult={handleSearchResult}
            onProductionReportResult={handleProductionReportResult}
          />
        </Grid>

        {/* Right Content - Shaft Detail and Production Report */}
        <Grid
          size={{
            xs: 12,
            md: 9,
          }}
        >
          {shaftData ? (
            <Stack spacing={3}>
              {/* Show shaft details when search result is available */}
              <ShaftDetail data={shaftData} />
              
              {/* Show production report below shaft details */}
              <ProductionReportCard data={productionData} />
            </Stack>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
              }}
            >
              <Typography color="text.secondary" variant="body1">
                Enter a shaft number and click Search to view details
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
