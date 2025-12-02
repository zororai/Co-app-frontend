import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

interface ChangeDriverStatusDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'APPROVED', label: 'APPROVED' },
  { value: 'OFF_DUTY', label: 'OFF DUTY' },
  { value: 'TRANSFERRED', label: 'TRANSFERRED' },
  { value: 'SICK', label: 'SICK' },
  { value: 'NOT_LONGER_PART_OF_US', label: 'NOT LONGER PART OF US' },
];

export function ChangeDriverStatusDialog({ 
  open, 
  onClose, 
  driverId, 
  onSuccess 
}: ChangeDriverStatusDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [status, setStatus] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setStatus('');
      setReason('');
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    // Validation
    if (!status) {
      setError('Please select a status');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }
    if (!driverId) {
      setError('Driver ID is missing');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authClient.updateDriverStatus(driverId, status, reason);
      
      if (result.success) {
        setSuccess('Driver status updated successfully');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to update driver status');
      }
    } catch (err) {
      console.error('Error updating driver status:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle 
        sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          bgcolor: theme.palette.secondary.main, 
          p: 2 
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
          Change Driver Status
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#9e9e9e' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 3 }}>
          {/* Success Message */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Status Dropdown */}
          <TextField
            select
            label="Change Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            disabled={loading}
          >
            <MenuItem value="" disabled>
              Select a status
            </MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Reason TextField */}
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Enter reason for status change..."
            disabled={loading}
            helperText="Please provide a detailed reason for this status change"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          sx={{
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.dark,
              bgcolor: 'rgba(50, 56, 62, 0.04)',
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#ffffff',
            '&:hover': {
              bgcolor: theme.palette.secondary.dark,
            },
          }}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : null}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
