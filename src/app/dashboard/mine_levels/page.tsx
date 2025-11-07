'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import { authClient } from '@/lib/auth/client';
import { DateRangeFilter } from '@/components/dashboard/mine_levels/date-range-filter';
import { MineLevelStats } from '@/components/dashboard/mine_levels/mine-level-stats';
import { DetailedMetrics } from '@/components/dashboard/mine_levels/detailed-metrics';

interface MineLevelData {
  activeShafts: number;
  deactivatedShafts: number;
  activeSections: number;
  deactivatedSections: number;
  oreCollected: Record<string, number>;
  oreProcessed: Record<string, number>;
  goldProduced: Record<string, number>;
  reprocessedOre: Record<string, number>;
  moneyPaidOut: Record<string, number>;
  totalMoneyPaidOut: number;
  totalDumpWeight: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Page(): React.JSX.Element {
  const [data, setData] = React.useState<MineLevelData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const printableRef = React.useRef<HTMLDivElement>(null);

  const handleSearch = React.useCallback(async (startDate: string, endDate: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.fetchMineLevelReport({ startDate, endDate });
      
      if (result.success && result.data) {
        console.log('Mine level report data:', result.data);
        setData(result.data);
      } else {
        console.error('Error fetching mine level report:', result.error);
        setError(result.error || 'Failed to fetch mine level report');
        setData(null);
      }
    } catch (error) {
      console.error('Error searching mine level data:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Print functionality
  const handlePrint = () => {
    if (!printableRef.current || !data) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = printableRef.current.innerHTML;
    const startDateFormatted = data.startDate && dayjs(data.startDate).isValid()
      ? dayjs(data.startDate).format('YYYY-MM-DD HH:mm')
      : 'Not specified';
    const endDateFormatted = data.endDate && dayjs(data.endDate).isValid()
      ? dayjs(data.endDate).format('YYYY-MM-DD HH:mm')
      : 'Not specified';
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mine Level Report - Print</title>
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
              svg, .MuiSvgIcon-root {
                display: none !important;
              }
            }
            .MuiCard-root {
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              margin-bottom: 20px;
              padding: 16px;
              break-inside: avoid;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-bottom: 8px;
            }
            .MuiGrid-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
            }
          </style>
        </head>
        <body>
          <h1 style="margin-bottom: 20px;">Mine Level Report</h1>
          <p style="color: #757575; margin-bottom: 30px;">
            Generated on ${currentDate} at ${currentTime}
          </p>
          <p style="margin-bottom: 20px;">
            <strong>Period:</strong> ${startDateFormatted} to ${endDateFormatted}
          </p>
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

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <div>
          <Typography variant="h4">Mine Level Reports</Typography>
          <Typography color="text.secondary" variant="body1" sx={{ mt: 1 }}>
            View comprehensive mine operations and production statistics
          </Typography>
        </div>
        {data && (
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              bgcolor: 'secondary.main',
              color: '#fff',
              '&:hover': { bgcolor: 'secondary.dark' }
            }}
          >
            Print Report
          </Button>
        )}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Sidebar - Date Range Filter */}
        <Grid size={{ xs: 12, md: 3 }}>
          <DateRangeFilter onSearch={handleSearch} isLoading={isLoading} />
        </Grid>

        {/* Right Content - Report Data */}
        <Grid size={{ xs: 12, md: 9 }}>
          {isLoading ? (
            <Card>
              <CardContent>
                <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading mine level report...
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : data ? (
            <Stack spacing={3} ref={printableRef}>
              {/* Date Range Info */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Report Period
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>From:</strong> {data.startDate && dayjs(data.startDate).isValid() 
                      ? dayjs(data.startDate).format('MMMM D, YYYY HH:mm')
                      : 'Not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>To:</strong> {data.endDate && dayjs(data.endDate).isValid()
                      ? dayjs(data.endDate).format('MMMM D, YYYY HH:mm')
                      : 'Not specified'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Statistics Cards */}
              <MineLevelStats data={data} />

              {/* Detailed Metrics */}
              <DetailedMetrics
                oreCollected={data.oreCollected || {}}
                oreProcessed={data.oreProcessed || {}}
                goldProduced={data.goldProduced || {}}
                reprocessedOre={data.reprocessedOre || {}}
                moneyPaidOut={data.moneyPaidOut || {}}
              />
            </Stack>
          ) : (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                  }}
                >
                  <Stack alignItems="center" spacing={2}>
                    <Typography color="text.secondary" variant="h6">
                      No Report Data
                    </Typography>
                    <Typography color="text.secondary" variant="body1">
                      Select a date range and click "Generate Report" to view mine level statistics
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
