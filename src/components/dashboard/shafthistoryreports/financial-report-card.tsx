'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

interface FinancialReportData {
  shaftNumber: string;
  period: string;
  year: number;
  month?: number;
  weekOfYear?: number;
  totalFineAmount: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  totalContraventions: number;
  paidContraventions: number;
  unpaidContraventions: number;
  contraventionTypes: string[];
  paymentRate: number;
}

interface FinancialReportCardProps {
  data: FinancialReportData | null;
}

export function FinancialReportCard({ data }: FinancialReportCardProps): React.JSX.Element {
  if (!data) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography color="text.secondary">
            No financial report data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const InfoItem = ({ label, value, unit = '' }: { label: string; value: any; unit?: string }) => (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium">
        {value !== undefined && value !== null ? `${value}${unit}` : 'N/A'}
      </Typography>
    </Stack>
  );

  const formatPeriodDisplay = () => {
    if (data.period === 'week') {
      return `Week ${data.weekOfYear}, ${data.year}`;
    } else if (data.period === 'month') {
      return `Month ${data.month}, ${data.year}`;
    } else {
      return `Year ${data.year}`;
    }
  };

  const formatCurrency = (amount: number) => {
    const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `USD ${formattedAmount} / ZWG ${formattedAmount}`;
  };

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <div>
            <Typography variant="h6">Financial Report - Contraventions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatPeriodDisplay()}
            </Typography>
          </div>

          <Divider />

          {/* Financial Summary */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Financial Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem 
                  label="Total Fine Amount" 
                  value={formatCurrency(data.totalFineAmount)} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem 
                  label="Total Paid Amount" 
                  value={formatCurrency(data.totalPaidAmount)} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem 
                  label="Total Unpaid Amount" 
                  value={formatCurrency(data.totalUnpaidAmount)} 
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Contravention Statistics */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Contravention Statistics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem 
                  label="Total Contraventions" 
                  value={data.totalContraventions} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem 
                  label="Paid Contraventions" 
                  value={data.paidContraventions} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <InfoItem 
                  label="Unpaid Contraventions" 
                  value={data.unpaidContraventions} 
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Payment Rate Progress */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">
                Payment Rate
              </Typography>
              <Typography variant="body2" fontWeight="medium" color="primary.main">
                {data.paymentRate.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={data.paymentRate} 
              sx={{ 
                height: 8, 
                borderRadius: 1,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: data.paymentRate >= 70 ? 'success.main' : data.paymentRate >= 40 ? 'warning.main' : 'error.main',
                  borderRadius: 1,
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {data.paidContraventions} of {data.totalContraventions} contraventions paid
            </Typography>
          </Box>

          {/* Contravention Types */}
          {data.contraventionTypes && data.contraventionTypes.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Contravention Types
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  {data.contraventionTypes.map((type, index) => (
                    <Chip 
                      key={index}
                      label={type} 
                      size="small" 
                      variant="outlined"
                      color="default"
                    />
                  ))}
                </Stack>
              </Box>
            </>
          )}

          <Divider />

          {/* Summary Chips */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Quick Summary
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label={`${data.totalContraventions} Total Contraventions`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
              <Chip 
                label={formatCurrency(data.totalFineAmount)} 
                size="small" 
                color="error"
                variant="outlined"
              />
              <Chip 
                label={`${data.paymentRate.toFixed(0)}% Paid`} 
                size="small" 
                color={data.paymentRate >= 70 ? 'success' : 'warning'}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
