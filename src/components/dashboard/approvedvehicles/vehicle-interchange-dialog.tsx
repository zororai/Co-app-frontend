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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BuildIcon from '@mui/icons-material/Build';
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
  const theme = useTheme();
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
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle 
        id="vehicle-interchange-dialog-title"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: theme.palette.secondary.main,
          color: 'white',
          py: 2.5,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsCarIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Vehicle Interchange Details
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ py: 6, textAlign: 'center', color: 'error.main', px: 3 }}>
            <Typography variant="h6">{error}</Typography>
          </Box>
        )}

        {!loading && !error && vehicle && (
          <Box>
            {/* Top Section - Full Width Vehicle Details Card */}
            <Box sx={{ bgcolor: '#f8f9fa', p: 3 }}>
              <Card 
                elevation={0} 
                sx={{ 
                  bgcolor: 'white',
                  border: `2px solid ${theme.palette.secondary.main}`,
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header with Registration Number and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          color: 'white',
                          p: 2,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <DirectionsCarIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          Registration Number
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          {vehicle.regNumber || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Chip
                        label={vehicle.status || 'PENDING'}
                        sx={{
                          bgcolor: 
                            vehicle.status === 'APPROVED' ? '#4caf50' : 
                            vehicle.status === 'REJECTED' ? '#f44336' : 
                            vehicle.status === 'MAINTAINCE' ? '#ff9800' : 
                            '#2196f3',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          px: 2
                        }}
                      />
                      {vehicle.operationalStatus && (
                        <Chip
                          label={vehicle.operationalStatus}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: theme.palette.secondary.main,
                            color: theme.palette.secondary.main,
                            fontWeight: 500
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Vehicle Details Grid */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '150px' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Vehicle Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontSize: '1rem' }}>
                          {vehicle.vehicleType || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '150px' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Make
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontSize: '1rem' }}>
                          {vehicle.make || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '150px' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Model
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontSize: '1rem' }}>
                          {vehicle.model || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '150px' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                          Year
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontSize: '1rem' }}>
                          {vehicle.year || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '200px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            Last Service Date
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontSize: '1rem' }}>
                            {vehicle.lastServiceDate || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '200px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            Assigned Driver
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontSize: '1rem' }}>
                            {vehicle.assignedDriver || 'Not Assigned'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Bottom Section - Two Equal Cards Side by Side */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {/* Owner Details Card */}
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box 
                          sx={{ 
                            bgcolor: theme.palette.secondary.light,
                            color: theme.palette.secondary.main,
                            p: 1.5,
                            borderRadius: 1.5,
                            display: 'flex'
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          Owner Details
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            Owner Name
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {vehicle.ownerName || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            Cell Number
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {vehicle.ownerCellNumber || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            ID Number
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {vehicle.ownerIdNumber || 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            Address
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                            {vehicle.ownerAddress || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Additional Information Card */}
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '300px' }}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Box 
                          sx={{ 
                            bgcolor: theme.palette.secondary.light,
                            color: theme.palette.secondary.main,
                            p: 1.5,
                            borderRadius: 1.5,
                            display: 'flex'
                          }}
                        >
                          <BuildIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          Additional Information
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {vehicle.reason && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Reason / Notes
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {vehicle.reason}
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                            Vehicle ID
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                            {vehicle.id || 'N/A'}
                          </Typography>
                        </Box>

                        {!vehicle.reason && (
                          <Box sx={{ 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 2, 
                            p: 2, 
                            textAlign: 'center',
                            border: '1px dashed #ccc'
                          }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              No additional notes available
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
