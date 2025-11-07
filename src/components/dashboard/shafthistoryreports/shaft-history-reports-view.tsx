'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import { FiltersSidebar } from './filters-sidebar';
import { ShaftDetail } from './shaft-detail';
import { ProductionReportCard } from './production-report-card';
import { FinancialReportCard } from './financial-report-card';
import { MinerCompanyDetails } from './miner-company-details';

export function ShaftHistoryReportsView(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(false);
  const [shaftData, setShaftData] = React.useState<any>(null);
  const [productionData, setProductionData] = React.useState<any>(null);
  const [financialData, setFinancialData] = React.useState<any>(null);
  const [minerData, setMinerData] = React.useState<any>(null);
  const [companyData, setCompanyData] = React.useState<any>(null);
  const [minerCompanyFetched, setMinerCompanyFetched] = React.useState(false);

  const handleSearchChange = (search: string) => {
    if (!search) {
      setShaftData(null);
      setProductionData(null);
      setFinancialData(null);
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

  const handleFinancialReportResult = (data: any) => {
    setFinancialData(data);
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

  // Print functionality
  const printableRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printableRef.current) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the content to print
    const content = printableRef.current.innerHTML;

    // Write the HTML content with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shaft History Report - Print</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              padding: 20px;
              background: white;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
            /* Preserve card styles */
            .MuiCard-root {
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              margin-bottom: 20px;
              padding: 16px;
              break-inside: avoid;
            }
            /* Typography styles */
            h4, h5, h6 {
              margin-bottom: 8px;
            }
            .MuiTypography-caption {
              font-size: 0.75rem;
              color: #757575;
            }
            .MuiTypography-body2 {
              font-size: 0.875rem;
            }
            /* Divider */
            .MuiDivider-root {
              border-top: 1px solid #e0e0e0;
              margin: 16px 0;
            }
            /* Grid layout */
            .MuiGrid-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
            }
            /* Chip styles */
            .MuiChip-root {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 0.8125rem;
              border: 1px solid #e0e0e0;
              margin: 4px;
            }
            /* Progress bar */
            .MuiLinearProgress-root {
              height: 8px;
              border-radius: 4px;
              background-color: #e0e0e0;
            }
            .MuiLinearProgress-bar {
              height: 100%;
              border-radius: 4px;
            }
            /* Stack spacing */
            .MuiStack-root > * + * {
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <h1 style="margin-bottom: 20px;">Shaft History Report</h1>
          <p style="color: #757575; margin-bottom: 30px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <div>
          <Typography variant="h4">Shaft History Reports</Typography>
          <Typography color="text.secondary" variant="body1" sx={{ mt: 1 }}>
            View and search through historical shaft reports
          </Typography>
        </div>
        {shaftData && (
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Print Report
          </Button>
        )}
      </Stack>

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
            onFinancialReportResult={handleFinancialReportResult}
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
            <Stack spacing={3} ref={printableRef}>
              {/* Show shaft details when search result is available */}
              <ShaftDetail data={shaftData} />
              
              {/* Show miner or company details below shaft details */}
              {showMinerCompanyCard && (
                <MinerCompanyDetails minerData={minerData} companyData={companyData} />
              )}
              
              {/* Show production report below miner/company details */}
              <ProductionReportCard data={productionData} />

              {/* Show financial report below production report */}
              <FinancialReportCard data={financialData} />
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
