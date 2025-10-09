'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { authClient } from '@/lib/auth/client';

interface UserData {
  name: string;
  surname: string;
  email: string;
  position: string;
  role: string;
  address: string;
  cellNumber: string;
  idNumber: string;
  status: string;
  permissions: Array<{ permission: string }>;
  createdAt: number[];
  updatedAt: number[];
}

export function AccountInfo(): React.JSX.Element {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user email from localStorage
        const currentUser = await authClient.getUser();
        if (!currentUser.data?.email) {
          setError('No user email found. Please sign in again.');
          return;
        }

        // Fetch user details from API
        const result = await authClient.fetchUserByEmail(currentUser.data.email);
        if (result.success && result.data) {
          setUserData(result.data);
        } else {
          setError(result.error || 'Failed to fetch user details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading user information...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">No user data available</Alert>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateArray: number[]) => {
    if (!dateArray || dateArray.length < 3) return 'N/A';
    return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent>
        {/* Header Section with Avatar and Basic Info */}
        <Stack spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ height: '80px', width: '80px', bgcolor: 'primary.main' }}>
            {userData.name.charAt(0)}{userData.surname.charAt(0)}
          </Avatar>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{userData.name} {userData.surname}</Typography>
            <Typography color="text.secondary" variant="body1">
              {userData.position}
            </Typography>
            <Chip 
              label={userData.role} 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={userData.status} 
              color={userData.status === 'PENDING' ? 'warning' : 'success'} 
              size="small" 
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Scrollable Content Area */}
        <Box sx={{ maxHeight: '63vh', overflow: 'auto' }}>
          {/* Detailed Information Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{userData.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                <Typography variant="body1">{userData.cellNumber}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">ID Number</Typography>
                <Typography variant="body1">{userData.idNumber}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">Member Since</Typography>
                <Typography variant="body1">{formatDate(userData.createdAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body1">{userData.address}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Permissions Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Permissions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userData.permissions && userData.permissions.length > 0 ? (
                userData.permissions.map((perm, index) => (
                  <Chip
                    key={index}
                    label={perm.permission.replace(/-/g, ' ').replace(/_/g, ' ')}
                    variant="outlined"
                    size="small"
                    color="success"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No permissions assigned
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Account Details */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Account Details</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              <Typography variant="body1">{formatDate(userData.updatedAt)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">Account Status</Typography>
              <Typography variant="body1">{userData.status}</Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
