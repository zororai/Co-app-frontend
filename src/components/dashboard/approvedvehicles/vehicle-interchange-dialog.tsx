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
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
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
  const [driver, setDriver] = React.useState<any>(null);
  const [approvedDrivers, setApprovedDrivers] = React.useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = React.useState<string>('');
  const [selectedDriverDetails, setSelectedDriverDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [driverLoading, setDriverLoading] = React.useState<boolean>(false);
  const [approvedDriversLoading, setApprovedDriversLoading] = React.useState<boolean>(false);
  const [selectedDriverLoading, setSelectedDriverLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const fetchDriverDetails = async (driverId: string) => {
    if (!driverId) return;
    
    setDriverLoading(true);
    
    try {
      const data = await authClient.fetchDriverById(driverId);
      
      if (data) {
        setDriver(data);
      } else {
        console.error('Failed to fetch driver details');
      }
    } catch (error_) {
      console.error('Error fetching driver details:', error_);
    } finally {
      setDriverLoading(false);
    }
  };

  const fetchApprovedDrivers = async () => {
    setApprovedDriversLoading(true);
    
    try {
      const data = await authClient.fetchApprovedDrivers();
      
      if (data) {
        setApprovedDrivers(data);
      } else {
        console.error('Failed to fetch approved drivers');
      }
    } catch (error_) {
      console.error('Error fetching approved drivers:', error_);
    } finally {
      setApprovedDriversLoading(false);
    }
  };

  const fetchSelectedDriverDetails = async (driverId: string) => {
    if (!driverId) return;
    
    setSelectedDriverLoading(true);
    
    try {
      const data = await authClient.fetchDriverById(driverId);
      
      if (data) {
        setSelectedDriverDetails(data);
      } else {
        console.error('Failed to fetch selected driver details');
      }
    } catch (error_) {
      console.error('Error fetching selected driver details:', error_);
    } finally {
      setSelectedDriverLoading(false);
    }
  };

  const handleDriverChange = (event: SelectChangeEvent<string>) => {
    const driverId = event.target.value;
    setSelectedDriverId(driverId);
    if (driverId) {
      fetchSelectedDriverDetails(driverId);
    } else {
      setSelectedDriverDetails(null);
    }
  };

  React.useEffect(() => {
    if (open && vehicleId) {
      fetchVehicleDetails();
      fetchApprovedDrivers();
    }
  }, [open, vehicleId]);

  React.useEffect(() => {
    if (vehicle?.driverId) {
      fetchDriverDetails(vehicle.driverId);
    }
  }, [vehicle]);

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

            {/* Bottom Section - Three Columns Side by Side */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
                {/* Column 1: Driver Details Card */}
                <Box sx={{ flex: '1 1 0', minWidth: '0' }}>
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
                          Driver Details
                        </Typography>
                      </Box>

                      {!vehicle.driverId ? (
                        <Box sx={{ 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 2, 
                          p: 3, 
                          textAlign: 'center',
                          border: '1px dashed #ccc'
                        }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No driver assigned to this vehicle
                          </Typography>
                        </Box>
                      ) : driverLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : driver ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Full Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : driver.firstName || driver.lastName || driver.name || driver.surname || 'N/A'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              Cell Number
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {driver.phoneNumber || driver.cellNumber || 'N/A'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                              ID Number
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {driver.idNumber || 'N/A'}
                            </Typography>
                          </Box>

                          {driver.licenseNumber && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                License Number
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {driver.licenseNumber}
                              </Typography>
                            </Box>
                          )}

                          {driver.licenseExpiryDate && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                License Expiry Date
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {driver.licenseExpiryDate}
                              </Typography>
                            </Box>
                          )}

                          {driver.address && (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Address
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {driver.address}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ 
                          bgcolor: '#fff3e0', 
                          borderRadius: 2, 
                          p: 3, 
                          textAlign: 'center',
                          border: '1px solid #ffb74d'
                        }}>
                          <Typography variant="body2" sx={{ color: '#e65100' }}>
                            Failed to load driver details
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                {/* Column 2: Switch Driver Button */}
                <Box 
                  sx={{ 
                    flex: '0 0 auto',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    px: 1
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<SwapHorizIcon />}
                    sx={{
                      bgcolor: '#4caf50',
                      color: 'white',
                      py: 2,
                      px: 2.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      boxShadow: 3,
                      minWidth: '120px',
                      '&:hover': {
                        bgcolor: '#45a049',
                        boxShadow: 6,
                      },
                      '&:disabled': {
                        bgcolor: '#ccc',
                        color: '#666'
                      }
                    }}
                    disabled={!selectedDriverId || selectedDriverLoading}
                  >
                    Switch Driver
                  </Button>
                </Box>

                {/* Column 3: Switch Driver Card */}
                <Box sx={{ flex: '1 1 0', minWidth: '0' }}>
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
                          <SwapHorizIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                          Switch Driver
                        </Typography>
                      </Box>

                      {/* Driver Selection Dropdown */}
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="driver-select-label">Select Driver</InputLabel>
                        <Select
                          labelId="driver-select-label"
                          id="driver-select"
                          value={selectedDriverId}
                          label="Select Driver"
                          onChange={handleDriverChange}
                          disabled={approvedDriversLoading}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {approvedDrivers.map((approvedDriver) => (
                            <MenuItem key={approvedDriver.id} value={approvedDriver.id}>
                              {approvedDriver.firstName} {approvedDriver.lastName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Selected Driver Details */}
                      {approvedDriversLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : selectedDriverLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : selectedDriverDetails ? (
                        <Box>
                          <Divider sx={{ mb: 2.5 }} />
                          
                          {/* Driver Avatar/Picture */}
                          {selectedDriverDetails.picture && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                              <Avatar
                                src={selectedDriverDetails.picture}
                                alt={`${selectedDriverDetails.firstName} ${selectedDriverDetails.lastName}`}
                                sx={{ 
                                  width: 100, 
                                  height: 100,
                                  border: `3px solid ${theme.palette.secondary.main}`
                                }}
                              />
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Full Name
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.firstName} {selectedDriverDetails.lastName}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                ID Number
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.idNumber || 'N/A'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Date of Birth
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.dateOfBirth || 'N/A'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                License Number
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.licenseNumber || 'N/A'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                License Class
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.licenseClass || 'N/A'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                License Expiry Date
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.licenseExpiryDate || 'N/A'}
                              </Typography>
                            </Box>

                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>
                                Years of Experience
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {selectedDriverDetails.yearsOfExperience || 0} years
                              </Typography>
                            </Box>

                            {/* QR Code */}
                            {selectedDriverDetails.qrcode && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, mb: 1, display: 'block' }}>
                                  QR Code
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                  <img 
                                    src={selectedDriverDetails.qrcode} 
                                    alt="Driver QR Code"
                                    style={{ maxWidth: '150px', height: 'auto' }}
                                  />
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ) : selectedDriverId ? (
                        <Box sx={{ 
                          bgcolor: '#fff3e0', 
                          borderRadius: 2, 
                          p: 3, 
                          textAlign: 'center',
                          border: '1px solid #ffb74d'
                        }}>
                          <Typography variant="body2" sx={{ color: '#e65100' }}>
                            Failed to load driver details
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          bgcolor: '#f5f5f5', 
                          borderRadius: 2, 
                          p: 3, 
                          textAlign: 'center',
                          border: '1px dashed #ccc'
                        }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Select a driver to view details
                          </Typography>
                        </Box>
                      )}
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
