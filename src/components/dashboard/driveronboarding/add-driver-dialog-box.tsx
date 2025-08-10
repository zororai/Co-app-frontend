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
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { authClient } from '@/lib/auth/client';
import { Snackbar, Alert } from '@mui/material';
import dayjs from 'dayjs';

interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onSubmit?: (driverData: DriverFormData) => void;
}

export interface DriverFormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth: dayjs.Dayjs | null;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate: dayjs.Dayjs | null;
  yearsOfExperience: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  licenseDocument: string | null; // Changed to string for base64
  idDocument: string | null; // Changed to string for base64
  additionalNotes: string;
}

export function AddDriverDialog({ open, onClose, onSubmit, onRefresh }: AddDriverDialogProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [notification, setNotification] = React.useState<{type: 'success' | 'error', message: string} | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState<DriverFormData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: null,
    licenseNumber: '',
    licenseClass: '',
    licenseExpiryDate: null,
    yearsOfExperience: '',
    phoneNumber: '',
    emailAddress: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    licenseDocument: null,
    idDocument: null,
    additionalNotes: '',
  });

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

  const handleFileChange = (field: 'licenseDocument' | 'idDocument', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // Store the base64 string in the form data
          setFormData({
            ...formData,
            [field]: event.target.result as string,
          });
        }
      };
      
      // Read the file as a data URL (base64)
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseClass) newErrors.licenseClass = 'License class is required';
    if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    
    // Email validation if provided
    if (formData.emailAddress && !/^\S+@\S+\.\S+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    
    // Phone number validation (simple format check)
    if (formData.phoneNumber && !/^[+]?[0-9\s-()]{8,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // ID number validation (simple length check)
    if (formData.idNumber && formData.idNumber.length < 6) {
      newErrors.idNumber = 'ID number must be at least 6 characters';
    }
    
    // Required documents
    if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
    if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
    
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
      // Call the API to register the driver
      const result = await authClient.registerDriver(formData);
      
      if (result.success) {
        // Show success notification
        setNotification({
          type: 'success',
          message: 'Driver registered successfully!'
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
          message: `Failed to register driver: ${result.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error registering driver:', error);
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
      firstName: '',
      lastName: '',
      idNumber: '',
      dateOfBirth: null,
      licenseNumber: '',
      licenseClass: '',
      licenseExpiryDate: null,
      yearsOfExperience: '',
      phoneNumber: '',
      emailAddress: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      licenseDocument: null,
      idDocument: null,
      additionalNotes: '',
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
          Add New Driver
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
          Register a new driver in the transport management system
        </Typography>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Personal Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Personal Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    required
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    required
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="ID Number"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.idNumber}
                    helperText={errors.idNumber}
                    required
                    placeholder="e.g., 8001015009087"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(date) => handleDateChange('dateOfBirth', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth,
                        disabled: loading,
                        placeholder: "Select date"
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* License Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                License Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber}
                    required
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <FormControl fullWidth required error={!!errors.licenseClass}>
                    <InputLabel id="license-class-label">License Class</InputLabel>
                    <Select
                      labelId="license-class-label"
                      name="licenseClass"
                      value={formData.licenseClass}
                      label="License Class"
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="A">Class A</MenuItem>
                      <MenuItem value="B">Class B</MenuItem>
                      <MenuItem value="C">Class C</MenuItem>
                      <MenuItem value="EB">Class EB</MenuItem>
                      <MenuItem value="EC1">Class EC1</MenuItem>
                    </Select>
                    {errors.licenseClass && <FormHelperText error>{errors.licenseClass}</FormHelperText>}
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <DatePicker
                    label="License Expiry Date"
                    value={formData.licenseExpiryDate}
                    onChange={(date) => handleDateChange('licenseExpiryDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.licenseExpiryDate,
                        helperText: errors.licenseExpiryDate,
                        disabled: loading,
                        placeholder: "Select expiry date"
                      }
                    }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    type="number"
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.yearsOfExperience}
                    helperText={errors.yearsOfExperience}
                  />
                </Box>
              </Box>
            </Box>

            {/* Contact Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    required
                    placeholder="+27 11 123 4567"
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.emailAddress}
                    helperText={errors.emailAddress}
                    placeholder="email@example.com"
                  />
                </Box>

                {/* Documents Section */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Documents
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                      <Button
                        component="label"
                        variant={formData.licenseDocument ? "contained" : "outlined"}
                        color={formData.licenseDocument ? "success" : "primary"}
                        startIcon={formData.licenseDocument ? <CheckCircleIcon /> : <UploadIcon />}
                        sx={{ 
                          height: '56px', 
                          width: '100%',
                          borderColor: errors.licenseDocument ? 'error.main' : undefined,
                          position: 'relative'
                        }}
                        disabled={loading}
                      >
                        {formData.licenseDocument ? 'License Uploaded ✓' : 'Upload License'}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileChange('licenseDocument', e)}
                        />
                      </Button>
                      {formData.licenseDocument && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          License document selected successfully
                        </Typography>
                      )}
                      {errors.licenseDocument && (
                        <FormHelperText error>{errors.licenseDocument}</FormHelperText>
                      )}
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                      <Button
                        component="label"
                        variant={formData.idDocument ? "contained" : "outlined"}
                        color={formData.idDocument ? "success" : "primary"}
                        startIcon={formData.idDocument ? <CheckCircleIcon /> : <UploadIcon />}
                        sx={{ 
                          height: '56px', 
                          width: '100%',
                          borderColor: errors.idDocument ? 'error.main' : undefined,
                          position: 'relative'
                        }}
                        disabled={loading}
                      >
                        {formData.idDocument ? 'ID Uploaded ✓' : 'Upload ID'}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileChange('idDocument', e)}
                        />
                      </Button>
                      {formData.idDocument && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                          ID document selected successfully
                        </Typography>
                      )}
                      {errors.idDocument && (
                        <FormHelperText error>{errors.idDocument}</FormHelperText>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Additional Notes Section */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Additional Notes
                  </Typography>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.address}
                    helperText={errors.address}
                    multiline
                    rows={2}
                    placeholder="Full residential address"
                  />
                </Box>
              </Box>
            </Box>

            {/* Emergency Contact Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Emergency Contact
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.emergencyContactName}
                    helperText={errors.emergencyContactName}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    error={!!errors.emergencyContactPhone}
                    helperText={errors.emergencyContactPhone}
                    placeholder="+27 11 123 4567"
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
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ height: '56px', width: '100%' }}
                  >
                    Upload License
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileChange('licenseDocument', e)}
                    />
                  </Button>
                </Box>
                <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ height: '56px', width: '100%' }}
                  >
                    Upload ID
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileChange('idDocument', e)}
                    />
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Additional Notes Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Any additional information about the driver"
              />
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
            {loading ? 'Submitting...' : 'Add Driver'}
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
