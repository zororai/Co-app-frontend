'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';
import { navItems } from '@/components/dashboard/layout/config';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void;
}

export function EditUserDialog({ open, onClose, userId, onRefresh }: EditUserDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    surname: '',
    idNumber: '',
    address: '',
    cellNumber: '',
    email: '',
    position: '',
    location: '',
    role: '',
    permissions: [] as { permission: string }[],
    status: '',
    notes: '',
    reason: ''
  });

  // Available permissions from navItems
  const availablePermissions = React.useMemo(() => {
    const perms: string[] = [];
    const extractPermissions = (items: any[]) => {
      items.forEach(item => {
        if (item.key) perms.push(item.key);
        if (item.items) extractPermissions(item.items);
      });
    };
    extractPermissions([...navItems]);
    return [...new Set(perms)];
  }, []);

  // Fetch user data when dialog opens
  React.useEffect(() => {
    if (open && userId) {
      fetchUserData();
    }
  }, [open, userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await authClient.fetchUserById(userId);
      
      if (result.success && result.data) {
        const user = result.data;
        setFormData({
          name: user.name || '',
          surname: user.surname || '',
          idNumber: user.idNumber || '',
          address: user.address || '',
          cellNumber: user.cellNumber || '',
          email: user.email || '',
          position: user.position || '',
          location: user.location || '',
          role: user.role || '',
          permissions: user.permissions || [],
          status: user.status || '',
          notes: user.notes || '',
          reason: user.reason || ''
        });
      } else {
        setError(result.error || 'Failed to load user data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading user data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission: string) => {
    const exists = formData.permissions.some(p => p.permission === permission);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p.permission !== permission)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, { permission }]
      }));
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('custom-auth-token');
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          updatedAt: new Date().toISOString()
        })
      });

      // Check HTTP status code first
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to update user'}`);
      }

      const result = await response.json();

      // Success - check result if available
      if (result && result.success === false) {
        setError(result.error || 'Failed to update user');
      } else {
        setSuccess('User updated successfully!');
        setTimeout(() => {
          if (onRefresh) onRefresh();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
          Edit User
        </Typography>
        <IconButton 
          onClick={handleClose} 
          size="small" 
          sx={{ 
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress sx={{ color: 'secondary.main' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Surname"
                  value={formData.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="ID Number"
                  value={formData.idNumber}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Cell Number"
                  value={formData.cellNumber}
                  onChange={(e) => handleChange('cellNumber', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Role & Position */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Role & Position
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    label="Position"
                  >
                    <MenuItem value="Representatives">Representatives</MenuItem>
                    <MenuItem value="Owner">Owner</MenuItem>
                    <MenuItem value="Member">Member</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="PUSHED_BACK">Pushed Back</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Permissions */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availablePermissions.map((permission) => (
                  <Chip
                    key={permission}
                    label={permission}
                    onClick={() => handlePermissionToggle(permission)}
                    color={formData.permissions.some(p => p.permission === permission) ? 'default' : 'default'}
                    variant={formData.permissions.some(p => p.permission === permission) ? 'filled' : 'outlined'}
                    sx={{
                      bgcolor: formData.permissions.some(p => p.permission === permission) 
                        ? theme.palette.secondary.main 
                        : 'transparent',
                      color: formData.permissions.some(p => p.permission === permission) 
                        ? '#fff' 
                        : theme.palette.secondary.main,
                      borderColor: theme.palette.secondary.main,
                      '&:hover': {
                        bgcolor: formData.permissions.some(p => p.permission === permission)
                          ? theme.palette.secondary.dark
                          : 'rgba(50, 56, 62, 0.08)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Additional Details */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main }}>
                Additional Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />
                <TextField
                  label="Reason"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined" 
          disabled={saving}
          sx={{
            borderColor: 'secondary.main',
            color: 'secondary.main',
            '&:hover': {
              borderColor: 'secondary.dark',
              bgcolor: 'rgba(50, 56, 62, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading || saving}
          sx={{
            bgcolor: 'secondary.main',
            '&:hover': {
              bgcolor: 'secondary.dark'
            }
          }}
        >
          {saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
