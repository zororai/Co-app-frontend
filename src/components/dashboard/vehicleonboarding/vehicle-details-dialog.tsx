'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { authClient } from '@/lib/auth/client';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';

interface VehicleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string | null;
  onRefresh?: () => void; // Optional callback to refresh the table data
}

export function VehicleDetailsDialog({ 
  open, 
  onClose, 
  vehicleId, 
  onRefresh 
}: VehicleDetailsDialogProps): React.JSX.Element {
  const [vehicle, setVehicle] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Fetch vehicle details when dialog opens and vehicleId changes
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
        setError('Failed to load vehicle details');
      }
    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setError('An error occurred while loading vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!status || !vehicle) return;
    
    setIsSubmitting(true);
    try {
      switch (status) {
        case 'APPROVED':
          // Implement approve vehicle API call when available
          await authClient.approveVehicle(vehicle.id);
          
          break;
        case 'REJECTED':
          if (!reason) {
            alert('Please provide a reason for rejection');
            setIsSubmitting(false);
            return;
          }
          // Implement reject vehicle API call when available
          await authClient.rejectVehicle(vehicle.id, reason);
          
          break;
        case 'PUSHED_BACK':
          if (!reason) {
            alert('Please provide a reason for pushing back');
            setIsSubmitting(false);
            return;
          }
          // Implement push back vehicle API call when available
          await authClient.pushBackVehicle(vehicle.id, reason);
          
          break;
        default:
          throw new Error(`Unsupported status: ${status}`);
      }

      // Close the dialog after successful update
      onClose();

      // Refresh the table data if onRefresh callback is provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert(`Failed to update status to ${status}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date string to a more readable format
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: '#15073d'
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Vehicle Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={() => printElementById('vehicle-details-printable', 'Vehicle Details')} size="small" sx={{ mr: 1, color: '#9e9e9e' }}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: '#9e9e9e' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
            <Typography>{error}</Typography>
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }} 
              onClick={fetchVehicleDetails}
            >
              Retry
            </Button>
          </Box>
        ) : vehicle ? (
          <Box sx={{ p: 2 }} id="vehicle-details-printable">
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2
            }}>
              <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Vehicle Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography><strong>Registration Number:</strong> {vehicle.regNumber || 'N/A'}</Typography>
                  <Typography><strong>Vehicle Type:</strong> {vehicle.vehicleType || 'N/A'}</Typography>
                  <Typography><strong>Make:</strong> {vehicle.make || 'N/A'}</Typography>
                  <Typography><strong>Model:</strong> {vehicle.model || 'N/A'}</Typography>
                  <Typography><strong>Year:</strong> {vehicle.year || 'N/A'}</Typography>
                  <Typography><strong>Last Service Date:</strong> {formatDate(vehicle.lastServiceDate)}</Typography>
                  <Typography>
                    <strong>Status:</strong>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        ml: 1,
                        bgcolor:
                          vehicle.status === 'PENDING' ? '#FFF9C4' :
                          vehicle.status === 'REJECTED' ? '#FFCDD2' :
                          vehicle.status === 'PUSHED_BACK' ? '#FFE0B2' :
                          '#C8E6C9',
                        color:
                          vehicle.status === 'PENDING' ? '#F57F17' :
                          vehicle.status === 'REJECTED' ? '#B71C1C' :
                          vehicle.status === 'PUSHED_BACK' ? '#E65100' :
                          '#1B5E20',
                      }}
                    >
                      {vehicle.status || 'PENDING'}
                    </Box>
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Owner Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography><strong>Name:</strong> {vehicle.ownerName || 'N/A'}</Typography>
                  <Typography><strong>ID Number:</strong> {vehicle.ownerIdNumber || 'N/A'}</Typography>
                  <Typography><strong>Cell Number:</strong> {vehicle.ownerCellNumber || 'N/A'}</Typography>
                  <Typography><strong>Address:</strong> {vehicle.ownerAddress || 'N/A'}</Typography>
                </Box>
              </Box>
              <Box sx={{ gridColumn: '1 / -1', border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Assigned Driver
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography><strong>Driver ID:</strong> {vehicle.assignedDriver || 'N/A'}</Typography>
                  {/* Additional driver information can be added here if available */}
                </Box>
              </Box>
              <Box sx={{ gridColumn: '1 / -1', border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Documents
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {vehicle.idPicture && (
                    <Box sx={{ flex: '1 1 300px', maxWidth: '300px' }}>
                      <Typography variant="body2" gutterBottom>ID Picture</Typography>
                      <Box
                        component="img"
                        src={`data:image/jpeg;base64,${vehicle.idPicture}`}
                        alt="ID Picture"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '200px',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  )}
                  {vehicle.truckPicture && (
                    <Box sx={{ flex: '1 1 300px', maxWidth: '300px' }}>
                      <Typography variant="body2" gutterBottom>Vehicle Picture</Typography>
                      <Box
                        component="img"
                        src={`data:image/jpeg;base64,${vehicle.truckPicture}`}
                        alt="Vehicle Picture"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '200px',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  )}
                  {vehicle.registrationBook && (
                    <Box sx={{ flex: '1 1 300px', maxWidth: '300px' }}>
                      <Typography variant="body2" gutterBottom>Registration Book</Typography>
                      <Box
                        component="img"
                        src={`data:image/jpeg;base64,${vehicle.registrationBook}`}
                        alt="Registration Book"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '200px',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
              {vehicle.reason && (
                <Box sx={{ gridColumn: '1 / -1', border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                    Additional Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Reason:</strong> {vehicle.reason}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>No vehicle data available</Typography>
          </Box>
        )}
      </DialogContent>
      
    </Dialog>
  );
}
