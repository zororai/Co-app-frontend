import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import type { SxProps } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { PauseCircleIcon } from '@phosphor-icons/react/dist/ssr/PauseCircle';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { authClient } from '@/lib/auth/client';

interface ShaftStatusData {
  suspendedCount: number;
  approvedCount: number;
}

export interface TotalCustomersProps {
  sx?: SxProps;
}

export function TotalCustomers({ sx }: TotalCustomersProps): React.JSX.Element {
  const theme = useTheme();
  const [shaftData, setShaftData] = React.useState<ShaftStatusData>({ suspendedCount: 0, approvedCount: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authClient.fetchShaftStatusCounts();
      
      if (result.success && result.data) {
        const data: ShaftStatusData = result.data;
        setShaftData(data);
      } else {
        setError(result.error || 'Failed to fetch shaft status data');
        setShaftData({ suspendedCount: 0, approvedCount: 0 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setShaftData({ suspendedCount: 0, approvedCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const totalShafts = shaftData.approvedCount + shaftData.suspendedCount;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Shaft Status
              </Typography>
              <Typography variant="h4">
                {loading ? (
                  <CircularProgress size={24} sx={{ color: theme.palette.secondary.main }} />
                ) : error ? (
                  <Typography color="error" variant="body2">Error</Typography>
                ) : (
                  totalShafts
                )}
              </Typography>
            </Stack>
            <Avatar sx={{ 
              backgroundColor: theme.palette.secondary.main,
              height: '56px', 
              width: '56px' 
            }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          
          {!loading && !error && (
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
              <Chip
                icon={<CheckCircleIcon fontSize="var(--icon-fontSize-sm)" />}
                label={`Active: ${shaftData.approvedCount}`}
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<PauseCircleIcon fontSize="var(--icon-fontSize-sm)" />}
                label={`Suspended: ${shaftData.suspendedCount}`}
                color="error"
                variant="outlined"
                size="small"
              />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
