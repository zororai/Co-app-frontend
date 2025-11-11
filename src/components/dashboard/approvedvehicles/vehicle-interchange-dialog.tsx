'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { authClient } from '@/lib/auth/client';

interface VehicleInterchangeDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null;
}

export function VehicleInterchangeDialog({
  open,
  onClose,
  vehicleId,
}: VehicleInterchangeDialogProps): React.JSX.Element {
  const [vehicle, setVehicle] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && vehicleId) {
      fetchVehicleDetails();
    }
  }, [open, vehicleId]);

  const fetchVehicleDetails = async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await authClient.fetchVehicleById(vehicleId);
      
      if (data) {
        setVehicle(data);
      } else {
        setError('Failed to fetch vehicle details');
      }
    } catch (error_) {
      setError('An unexpected error occurred');
      console.error('Error fetching vehicle details:', error_);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="vehicle-interchange-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle 
        id="vehicle-interchange-dialog-title"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}
      >
        Vehicle Interchange Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ 
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ py: 3, textAlign: 'center', color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!loading && !error && vehicle && (
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            borderRadius: 2, 
            p: 3 
          }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Vehicle Details
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Registration Number */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Registration Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.regNumber || 'N/A'}
                </Typography>
              </Box>

              {/* Vehicle Type */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Vehicle Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.vehicleType || 'N/A'}
                </Typography>
              </Box>

              {/* Make */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Make
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.make || 'N/A'}
                </Typography>
              </Box>

              {/* Model */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Model
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.model || 'N/A'}
                </Typography>
              </Box>

              {/* Year */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Year
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.year || 'N/A'}
                </Typography>
              </Box>

              {/* Operational Status */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Operational Status
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.operationalStatus || 'N/A'}
                </Typography>
              </Box>

              {/* Last Service Date */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Last Service Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.lastServiceDate || 'N/A'}
                </Typography>
              </Box>

              {/* Status */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Status
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.status || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Owner Details
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Owner Name */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Owner Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.ownerName || 'N/A'}
                </Typography>
              </Box>

              {/* Owner Cell Number */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Owner Cell Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.ownerCellNumber || 'N/A'}
                </Typography>
              </Box>

              {/* Owner ID Number */}
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Owner ID Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.ownerIdNumber || 'N/A'}
                </Typography>
              </Box>

              {/* Owner Address */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Owner Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {vehicle.ownerAddress || 'N/A'}
                </Typography>
              </Box>
            </Box>

            {vehicle.reason && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Reason
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {vehicle.reason}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
