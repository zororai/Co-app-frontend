'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';

interface VehicleMaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null;
  vehicleStatus: string;
  onStatusChange: () => void;
}

export function VehicleMaintenanceDialog({
  open,
  onClose,
  vehicleId,
  vehicleStatus,
  onStatusChange,
}: VehicleMaintenanceDialogProps): React.JSX.Element {
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setStatus('');
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!vehicleId) return;
    
    if (!status) {
      setError('Please select a status');
      return;
    }
    
    if (!reason.trim()) {
      setError('Please enter a reason');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await authClient.updateVehicleStatus(vehicleId, status, reason);
      
      if (result.success) {
        onStatusChange();
        onClose();
      } else {
        setError(result.error || 'Failed to update vehicle status');
      }
    } catch (error_) {
      setError('An unexpected error occurred');
      console.error('Error updating vehicle status:', error_);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="vehicle-maintenance-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle 
        id="vehicle-maintenance-dialog-title"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}
      >
        Vehicle Status Management
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{ 
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status-select"
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="APPROVED">APPROVED</MenuItem>
            <MenuItem value="MAINTAINCE">MAINTAINCE</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Reason"
          placeholder="Enter reason for status change"
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          fullWidth
          sx={{ mb: 2 }}
        />

        {error && (
          <DialogContent sx={{ color: 'error.main', py: 1, px: 0 }}>
            {error}
          </DialogContent>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
