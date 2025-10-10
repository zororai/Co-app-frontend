'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';

import { authClient } from '@/lib/auth/client';

export interface TotalProfitProps {
  sx?: SxProps;
}

export function TotalProfit({ sx }: TotalProfitProps): React.JSX.Element {
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.fetchApprovedSecurityCompaniesCount();
      
      if (result.success && result.data !== undefined) {
        // Assuming the API returns a number directly or an object with count property
        const countValue = typeof result.data === 'number' ? result.data : result.data.count || 0;
        setCount(countValue);
      } else {
        setError(result.error || 'Failed to fetch security companies count');
        setCount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Security Companies
            </Typography>
            <Typography variant="h4">
              {loading ? (
                <CircularProgress size={24} />
              ) : error ? (
                <Typography color="error" variant="body2">Error</Typography>
              ) : (
                count
              )}
            </Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
