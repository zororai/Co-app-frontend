import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Upload as PhosphorUploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { authClient } from '@/lib/auth/client';
import { Snackbar, Alert } from '@mui/material';
import dayjs from 'dayjs';

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onSubmit?: (vehicleData: VehicleFormData) => void;
}

export interface VehicleFormData {
  regNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: string;
  assignedDriver: string;
  lastServiceDate: dayjs.Dayjs | null;
  ownerName: string;
  ownerAddress: string;
  ownerCellNumber: string;
  ownerIdNumber: string;
  idPicture: File | null;
  truckPicture: File | null;
  registrationBook: File | null;
}

export function AddVehicleDialog({ open, onClose, onSubmit, onRefresh }: AddVehicleDialogProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{type: 'success' | 'error', message: string} | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [approvedDrivers, setApprovedDrivers] = React.useState<Array<{id: string, name: string, surname: string}>>([]);
  const [formData, setFormData] = React.useState<VehicleFormData>({
    regNumber: '',
    vehicleType: '',
    make: '',
    model: '',
    year: '',
    assignedDriver: '',
    lastServiceDate: null,
    ownerName: '',
    ownerAddress: '',
    ownerCellNumber: '',
    ownerIdNumber: '',
    idPicture: null,
    truckPicture: null,
    registrationBook: null,
  });
  
  // Fetch approved drivers when component mounts
  React.useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const drivers = await authClient.fetchApprovedDrivers();
        console.log('Fetched approved drivers:', drivers);
        console.log('Type of drivers:', typeof drivers);
        
        // Check if we need to parse the JSON string
        if (typeof drivers === 'string') {
          try {
            const parsedDrivers = JSON.parse(drivers);
            console.log('Parsed drivers:', parsedDrivers);
            setApprovedDrivers(parsedDrivers);
          } catch (parseError) {
            console.error('Error parsing drivers data:', parseError);
          }
        } else {
          // If it's already an object, ensure it's an array
          if (Array.isArray(drivers)) {
            console.log('Drivers is already an array with length:', drivers.length);
            setApprovedDrivers(drivers);
          } else {
            console.log('Drivers is an object but not an array:', drivers);
            // Check if there's a data property or similar that contains the array
            const possibleArrays = ['data', 'drivers', 'items', 'results'];
            for (const key of possibleArrays) {
              if (drivers && drivers[key] && Array.isArray(drivers[key])) {
                console.log(`Found array in drivers.${key} with length:`, drivers[key].length);
                setApprovedDrivers(drivers[key]);
                break;
              }
            }
          }
        }
        
        // After setting the state, log what we have
        setTimeout(() => {
          console.log('Current approvedDrivers state:', approvedDrivers);
        }, 100);
      } catch (error) {
        console.error('Error fetching approved drivers:', error);
      }
    };
    
    fetchDrivers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: string } }, child?: React.ReactNode) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleDateChange = (field: string, value: dayjs.Dayjs | null) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle file input for document fields
  const handleFileChange = (field: 'idPicture' | 'truckPicture' | 'registrationBook', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      [field]: file,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.regNumber) newErrors.regNumber = 'Registration number is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.assignedDriver) newErrors.assignedDriver = 'Assigned driver is required';
    if (!formData.lastServiceDate) newErrors.lastServiceDate = 'Last service date is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerIdNumber) newErrors.ownerIdNumber = 'Owner ID number is required';
    if (!formData.ownerCellNumber) newErrors.ownerCellNumber = 'Owner cell number is required';
    if (!formData.ownerAddress) newErrors.ownerAddress = 'Owner address is required';
    
    // Phone number validation
    if (formData.ownerCellNumber && !/^\+?[0-9\s]+$/.test(formData.ownerCellNumber)) {
      newErrors.ownerCellNumber = 'Invalid phone number format';
    }
    
    // ID number validation to allow format like 80-101500D87
    if (formData.ownerIdNumber && !/^\d{2}-\d{6}[A-Z]\d{2}$/.test(formData.ownerIdNumber)) {
      newErrors.ownerIdNumber = 'ID number should be in format XX-XXXXXXAXX (e.g., 80-101500D87)';
    }
    
    // Document validation
    if (!formData.idPicture) {
      newErrors.idPicture = 'ID picture is required';
    }
    
    if (!formData.truckPicture) {
      newErrors.truckPicture = 'Vehicle picture is required';
    }
    
    if (!formData.registrationBook) {
      newErrors.registrationBook = 'Registration book is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Call the API to register the vehicle
      // Note: This API function needs to be implemented in client.ts
      const result = await authClient.registerVehicle(formData);
      
      if (result.success) {
        // Show success notification
        setNotification({
          type: 'success',
          message: 'Vehicle registered successfully!'
        });
        
        // If onSubmit is provided, call it with the form data
        if (onSubmit) {
          onSubmit(formData);
        }
        
        // If onRefresh is provided, call it to refresh the data
        if (onRefresh) {
          onRefresh();
        }
        
        // Close the dialog after a short delay to show the success message
        setTimeout(() => {
          handleClose();
          setNotification(null);
        }, 1500);
      } else {
        // Show error notification
        setNotification({
          type: 'error',
          message: `Failed to register vehicle: ${result.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error registering vehicle:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      regNumber: '',
      vehicleType: '',
      make: '',
      model: '',
      year: '',
      assignedDriver: '',
      lastServiceDate: null,
      ownerName: '',
      ownerAddress: '',
      ownerCellNumber: '',
      ownerIdNumber: '',
      idPicture: null,
      truckPicture: null,
      registrationBook: null,
    });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          Register New Vehicle
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Typography variant="body2" color="text.secondary" sx={{ px: 3, pb: 2 }}>
          Register a new vehicle in the transport management system
        </Typography>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Vehicle Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Vehicle Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.regNumber}
                    helperText={errors.regNumber}
                    required
                    placeholder="e.g., ABC123GP"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <FormControl fullWidth required error={!!errors.vehicleType}>
                    <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                    <Select
                      labelId="vehicle-type-label"
                      name="vehicleType"
                      value={formData.vehicleType}
                      label="Vehicle Type"
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="Sedan">Sedan</MenuItem>
                      <MenuItem value="SUV">SUV</MenuItem>
                      <MenuItem value="Truck">Truck</MenuItem>
                      <MenuItem value="Van">Van</MenuItem>
                      <MenuItem value="Bus">Bus</MenuItem>
                    </Select>
                    {errors.vehicleType && <FormHelperText error>{errors.vehicleType}</FormHelperText>}
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Make"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.make}
                    helperText={errors.make}
                    required
                    placeholder="e.g., Toyota"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.model}
                    helperText={errors.model}
                    required
                    placeholder="e.g., Corolla"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.year}
                    helperText={errors.year}
                    required
                    placeholder="e.g., 2023"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <FormControl fullWidth margin="normal" error={!!errors.assignedDriver} disabled={loading}>
                    <InputLabel id="assigned-driver-label">Assigned Driver</InputLabel>
                    <Select
                      labelId="assigned-driver-label"
                      id="assigned-driver"
                      name="assignedDriver"
                      value={formData.assignedDriver}
                      onChange={handleChange}
                      label="Assigned Driver"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {Array.isArray(approvedDrivers) && approvedDrivers.length > 0 ? (
                        approvedDrivers.map((driver) => (
                          <MenuItem key={driver.id || Math.random()} value={driver.id}>
                            {driver.name || (driver as any).firstName} {driver.surname || (driver as any).lastName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No drivers available</MenuItem>
                      )}
                    </Select>
                    {errors.assignedDriver && (
                      <Typography variant="caption" color="error">
                        {errors.assignedDriver}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <DatePicker
                    label="Last Service Date"
                    value={formData.lastServiceDate}
                    onChange={(date) => handleDateChange('lastServiceDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.lastServiceDate,
                        helperText: errors.lastServiceDate,
                        disabled: loading,
                        placeholder: "Select date"
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Owner Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Owner Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Owner Name"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.ownerName}
                    helperText={errors.ownerName}
                    required
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Owner ID Number"
                    name="ownerIdNumber"
                    value={formData.ownerIdNumber}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.ownerIdNumber}
                    helperText={errors.ownerIdNumber}
                    required
                    placeholder="e.g., 80-101500D-87"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Owner Cell Number"
                    name="ownerCellNumber"
                    value={formData.ownerCellNumber}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.ownerCellNumber}
                    helperText={errors.ownerCellNumber}
                    required
                    placeholder="+27 11 123 4567"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Owner Address"
                    name="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.ownerAddress}
                    helperText={errors.ownerAddress}
                    multiline
                    rows={2}
                    placeholder="Full residential address"
                    required
                  />
                </Box>
              </Box>
            </Box>

            {/* Documents Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Documents
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(33% - 8px)', minWidth: '240px' }}>
                  <Button
                    component="label"
                    variant={formData.idPicture ? "contained" : "outlined"}
                    color={formData.idPicture ? "success" : "primary"}
                    startIcon={formData.idPicture ? <CheckCircleIcon /> : <UploadIcon />}
                    sx={{ 
                      height: '56px', 
                      width: '100%',
                      borderColor: errors.idPicture ? 'error.main' : undefined,
                      position: 'relative'
                    }}
                    disabled={loading}
                  >
                    {formData.idPicture ? 'ID Photo Uploaded ✓' : 'Upload ID Photo'}
                    <input
                      type="file"
                      accept="image/jpeg"
                      hidden
                      onChange={(e) => handleFileChange('idPicture', e)}
                    />
                  </Button>
                  {formData.idPicture && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      ID photo selected successfully
                    </Typography>
                  )}
                  {errors.idPicture && (
                    <FormHelperText error>{errors.idPicture}</FormHelperText>
                  )}
                </Box>
                <Box sx={{ flex: '1 1 calc(33% - 8px)', minWidth: '240px' }}>
                  <Button
                    component="label"
                    variant={formData.truckPicture ? "contained" : "outlined"}
                    color={formData.truckPicture ? "success" : "primary"}
                    startIcon={formData.truckPicture ? <CheckCircleIcon /> : <UploadIcon />}
                    sx={{ 
                      height: '56px', 
                      width: '100%',
                      borderColor: errors.truckPicture ? 'error.main' : undefined,
                      position: 'relative'
                    }}
                    disabled={loading}
                  >
                    {formData.truckPicture ? 'Vehicle Photo Uploaded ✓' : 'Upload Vehicle Photo'}
                    <input
                      type="file"
                      accept="image/jpeg"
                      hidden
                      onChange={(e) => handleFileChange('truckPicture', e)}
                    />
                  </Button>
                  {formData.truckPicture && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      Vehicle photo selected successfully
                    </Typography>
                  )}
                  {errors.truckPicture && (
                    <FormHelperText error>{errors.truckPicture}</FormHelperText>
                  )}
                </Box>
                <Box sx={{ flex: '1 1 calc(33% - 8px)', minWidth: '240px' }}>
                  <Button
                    component="label"
                    variant={formData.registrationBook ? "contained" : "outlined"}
                    color={formData.registrationBook ? "success" : "primary"}
                    startIcon={formData.registrationBook ? <CheckCircleIcon /> : <UploadIcon />}
                    sx={{ 
                      height: '56px', 
                      width: '100%',
                      borderColor: errors.registrationBook ? 'error.main' : undefined,
                      position: 'relative'
                    }}
                    disabled={loading}
                  >
                    {formData.registrationBook ? 'Registration Book Uploaded ✓' : 'Upload Registration Book'}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileChange('registrationBook', e)}
                    />
                  </Button>
                  {formData.registrationBook && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      Registration book selected successfully
                    </Typography>
                  )}
                  {errors.registrationBook && (
                    <FormHelperText error>{errors.registrationBook}</FormHelperText>
                  )}
                </Box>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Register Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification !== null} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity={notification?.type || 'info'} 
          sx={{ width: '100%' }}
        >
          {notification?.message || ''}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
