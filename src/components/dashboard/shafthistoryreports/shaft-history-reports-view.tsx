'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FiltersSidebar } from './filters-sidebar';
import { ShaftDetail } from './shaft-detail';
import { ProductionReportCard } from './production-report-card';
import { MinerCompanyDetails } from './miner-company-details';

export function ShaftHistoryReportsView(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);
  const [shaftData, setShaftData] = React.useState<any>(null);
  const [productionData, setProductionData] = React.useState<any>(null);
  const [minerData, setMinerData] = React.useState<any>(null);
  const [companyData, setCompanyData] = React.useState<any>(null);
  const [minerCompanyFetched, setMinerCompanyFetched] = React.useState(false);

  const handleSearchChange = (search: string) => {
    if (!search) {
      setShaftData(null);
      setProductionData(null);
      setMinerData(null);
      setCompanyData(null);
      setMinerCompanyFetched(false);
      return;
    }
  };

  const handleSearchResult = (data: any) => {
    setShaftData(data);
  };

  const handleProductionReportResult = (data: any) => {
    setProductionData(data);
  };

  const handleMinerCompanyResult = (miner: any, company: any) => {
    console.log('🎯 handleMinerCompanyResult called');
    console.log('   Miner:', miner);
    console.log('   Company:', company);
    console.log('   Has miner?', !!miner);
    console.log('   Has company?', !!company);
    setMinerData(miner);
    setCompanyData(company);
    setMinerCompanyFetched(true); // Mark that we attempted to fetch
    console.log('✅ State updated, minerCompanyFetched set to true');
  };

  // Check if we should show miner/company card - show it if we attempted to fetch, even if both are null
  const showMinerCompanyCard = minerCompanyFetched;

  // Debug: Log when card visibility changes
  React.useEffect(() => {
    console.log('🔍 Card visibility check:');
    console.log('   showMinerCompanyCard:', showMinerCompanyCard);
    console.log('   minerCompanyFetched:', minerCompanyFetched);
    console.log('   minerData:', minerData);
    console.log('   companyData:', companyData);
  }, [showMinerCompanyCard, minerCompanyFetched, minerData, companyData]);

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
            onMinerCompanyResult={handleMinerCompanyResult}
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
              
              {/* Show miner or company details below shaft details */}
              {showMinerCompanyCard && (
                <MinerCompanyDetails minerData={minerData} companyData={companyData} />
              )}
              
              {/* Show production report below miner/company details */}
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
