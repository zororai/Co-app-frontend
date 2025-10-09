'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { authClient } from '@/lib/auth/client';
import { getAllAvailablePermissions } from '@/components/dashboard/layout/config';

interface UserData {
  _id?: string; // MongoDB ObjectId
  id?: string;  // Alternative ID field
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

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
] as const;

const positions = [
  { value: 'general_manager', label: 'General Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operator', label: 'Operator' },
  { value: 'security', label: 'Security' },
] as const;

export function AccountDetailsForm(): React.JSX.Element {
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  
  const allAvailablePermissions = getAllAvailablePermissions();

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
          // Set current permissions
          const currentPermissions = result.data.permissions?.map((p: any) => p.permission) || [];
          setSelectedPermissions(currentPermissions);
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

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userData) return;

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData(event.currentTarget);
      const updateData = {
        name: formData.get('firstName') as string,
        surname: formData.get('lastName') as string,
        email: formData.get('email') as string,
        cellNumber: formData.get('phone') as string,
        address: formData.get('address') as string,
        position: formData.get('position') as string,
        role: formData.get('role') as string,
        permissions: selectedPermissions.map(permission => ({ permission })),
      };

      // Extract the user ID from the userData (MongoDB uses _id, some APIs use id)
      const userId = userData._id || userData.id;
      
      if (!userId) {
        setError('User ID not found. Cannot update user details.');
        return;
      }

      console.log('Form submission details:');
      console.log('- User ID:', userId);
      console.log('- Update data:', updateData);
      console.log('- Selected permissions:', selectedPermissions);
      console.log('- Original user data:', userData);

      // Try self-update first (more likely to have permissions)
      console.log('Attempting self-update via /api/users/me...');
      let result = await authClient.updateCurrentUser(updateData);
      
      console.log('Self-update result:', result);
      
      // If self-update fails with 404 or "not found", try admin update with user ID
      if (!result.success && (
        result.error?.includes('not found') || 
        result.error?.includes('Update endpoint not found') ||
        result.error?.includes('404')
      )) {
        console.log('Self-update endpoint not available (404), trying admin update with user ID...');
        console.log('Fallback triggered because error contains:', result.error);
        result = await authClient.updateUser(userId, updateData);
        console.log('Admin update result:', result);
      } else if (!result.success) {
        console.log('Self-update failed but not with 404, error:', result.error);
      }
      
      if (result.success) {
        setSuccess('User details updated successfully!');
        // Refresh user data
        const refreshResult = await authClient.fetchUserByEmail(updateData.email);
        if (refreshResult.success && refreshResult.data) {
          setUserData(refreshResult.data);
        }
      } else {
        setError(result.error || 'Failed to update user details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading user information...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && !userData) {
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

  const currentPermissions = userData.permissions?.map(p => p.permission) || [];
  const newPermissions = selectedPermissions.filter(p => !currentPermissions.includes(p));

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>First name</InputLabel>
                <OutlinedInput 
                  defaultValue={userData.name} 
                  label="First name" 
                  name="firstName" 
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Last name</InputLabel>
                <OutlinedInput 
                  defaultValue={userData.surname} 
                  label="Last name" 
                  name="lastName" 
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput 
                  defaultValue={userData.email} 
                  label="Email address" 
                  name="email" 
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Phone number</InputLabel>
                <OutlinedInput 
                  defaultValue={userData.cellNumber} 
                  label="Phone number" 
                  name="phone" 
                  type="tel" 
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select 
                  defaultValue={userData.position} 
                  label="Position" 
                  name="position" 
                  variant="outlined"
                >
                  {positions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select 
                  defaultValue={userData.role} 
                  label="Role" 
                  name="role" 
                  variant="outlined"
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Address</InputLabel>
                <OutlinedInput 
                  defaultValue={userData.address} 
                  label="Address" 
                  name="address"
                  multiline
                  rows={2}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Permissions Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Permissions</Typography>
            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allAvailablePermissions.map((permission) => {
                  const isCurrentPermission = currentPermissions.includes(permission);
                  const isSelected = selectedPermissions.includes(permission);
                  const isNewPermission = newPermissions.includes(permission);
                  
                  return (
                    <Chip
                      key={permission}
                      label={permission.replace(/-/g, ' ').replace(/_/g, ' ')}
                      onClick={() => handlePermissionToggle(permission)}
                      color={
                        isNewPermission ? 'error' : 
                        isSelected ? 'success' : 
                        'default'
                      }
                      variant={isSelected ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    />
                  );
                })}
              </Box>
              {newPermissions.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Red permissions are new and haven't been applied yet. Click "Save details" to apply them.
                </Alert>
              )}
            </Box>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            type="submit"
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : 'Save details'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
