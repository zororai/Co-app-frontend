'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSendToMaintenance = async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await authClient.sendVehicleToMaintenance(vehicleId);
      
      if (result.success) {
        onStatusChange();
        onClose();
      } else {
        setError(result.error || 'Failed to send vehicle to maintenance');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error sending vehicle to maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetToFunctional = async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await authClient.setVehicleToIdle(vehicleId);
      
      if (result.success) {
        onStatusChange();
        onClose();
      } else {
        setError(result.error || 'Failed to set vehicle as functional');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error setting vehicle as functional:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="vehicle-maintenance-dialog-title"
    >
      <DialogTitle id="vehicle-maintenance-dialog-title">
        Vehicle Status Management
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {vehicleStatus === 'Maintainance' 
            ? 'This vehicle is currently in maintenance. Would you like to mark it as functional?'
            : 'Would you like to send this vehicle to maintenance?'}
        </DialogContentText>
        {error && (
          <DialogContentText color="error" sx={{ mt: 2 }}>
            {error}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        {vehicleStatus === 'Maintainance' ? (
          <Button 
            onClick={handleSetToFunctional}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Processing...' : 'Mark as Functional'}
          </Button>
        ) : (
          <Button 
            onClick={handleSendToMaintenance}
            color="primary"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Processing...' : 'Send to Maintenance'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
