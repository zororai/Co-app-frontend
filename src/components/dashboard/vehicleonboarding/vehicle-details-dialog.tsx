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
import Skeleton from '@mui/material/Skeleton';
import { authClient } from '@/lib/auth/client';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';

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
  const theme = useTheme();
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
    } catch (error_) {
      console.error('Error fetching vehicle details:', error_);
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
        case 'APPROVED': {
          // Implement approve vehicle API call when available
          await authClient.approveVehicle(vehicle.id);
          
          break;
        }
        case 'REJECTED': {
          if (!reason) {
            alert('Please provide a reason for rejection');
            setIsSubmitting(false);
            return;
          }
          // Implement reject vehicle API call when available
          await authClient.rejectVehicle(vehicle.id, reason);
          
          break;
        }
        case 'PUSHED_BACK': {
          if (!reason) {
            alert('Please provide a reason for pushing back');
            setIsSubmitting(false);
            return;
          }
          // Implement push back vehicle API call when available
          await authClient.pushBackVehicle(vehicle.id, reason);
          
          break;
        }
        default: {
          throw new Error(`Unsupported status: ${status}`);
        }
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
    } catch {
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
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
          Vehicle Details
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('vehicle-details-printable', 'Vehicle Details')} 
            size="small" 
            sx={{ 
              mr: 1, 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <PrintIcon />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 2.5 
            }}>
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="85%" />
                <Skeleton variant="text" width="95%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="rectangular" width="30%" height={28} />
              </Box>
            </Box>
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
          <Box sx={{ p: 3 }} id="vehicle-details-printable">
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5
            }}>
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Vehicle Information
                </Typography>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                  mt: 2
                }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Registration Number:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.regNumber || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Vehicle Type:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.vehicleType || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Make:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.make || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Model:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.model || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Year:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.year || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Last Service Date:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {formatDate(vehicle.lastServiceDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Status:</strong>
                    </Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
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
                        fontWeight: 'medium',
                        fontSize: '0.875rem'
                      }}
                    >
                      {vehicle.status || 'PENDING'}
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Owner Information
                </Typography>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                  mt: 2
                }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Name:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.ownerName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>ID Number:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.ownerIdNumber || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Cell Number:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.ownerCellNumber || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Address:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.ownerAddress || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ 
                gridColumn: '1 / -1', 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Assigned Driver
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                    <strong>Driver ID:</strong>
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                    {vehicle.assignedDriver || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                gridColumn: '1 / -1', 
                border: `2px solid ${theme.palette.secondary.main}`, 
                borderRadius: '12px', 
                p: 2.5,
                bgcolor: '#ffffff'
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: theme.palette.secondary.main, 
                    fontWeight: 700, 
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
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
                <Box sx={{ 
                  gridColumn: '1 / -1', 
                  border: `2px solid ${theme.palette.secondary.main}`, 
                  borderRadius: '12px', 
                  p: 2.5,
                  bgcolor: '#ffffff'
                }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: theme.palette.secondary.main, 
                      fontWeight: 700, 
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Additional Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                      <strong>Reason:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                      {vehicle.reason}
                    </Typography>
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
