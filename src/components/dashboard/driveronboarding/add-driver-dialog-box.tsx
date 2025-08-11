'use client';

import * as React from 'react';
import { Fragment } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authClient } from '../../../lib/auth/client';
import { Snackbar } from '@mui/material';

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

// Define steps for the stepper
const steps = [
  'Personal Information',
  'License Details',
  'Contact Information',
  'Review Details',
  'Confirmation'
];

// License class options
const licenseClasses = [
  { value: 'A', label: 'Class A' },
  { value: 'B', label: 'Class B' },
  { value: 'C', label: 'Class C' },
  { value: 'EB', label: 'Class EB' },
  { value: 'EC1', label: 'Class EC1' }
];

export function AddDriverDialog({ open, onClose, onSubmit, onRefresh }: AddDriverDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
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

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle select field changes
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as keyof DriverFormData;
    const value = e.target.value as string;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (field: keyof DriverFormData) => (value: dayjs.Dayjs | null) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  // Handle stepper navigation
  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      // If on the review step, submit the form
      handleSubmitForm();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFileChange = (field: 'licenseDocument' | 'idDocument') => (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Validation functions
  const validateEmail = (email: string): boolean => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^[+]?[0-9\s-()]{8,}$/.test(phone);
  };

  const validateIdNumber = (id: string): boolean => {
    return id.length >= 6;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    setFormSubmitted(true);
    
    switch (activeStep) {
      case 0: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
        else if (!validateIdNumber(formData.idNumber)) newErrors.idNumber = 'ID number must be at least 6 characters';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      
      case 1: // License Details
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseClass) newErrors.licenseClass = 'License class is required';
        if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';
        if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
        if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
        break;
      
      case 2: // Contact Information
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        else if (!validatePhone(formData.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid phone number';
        if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
          newErrors.emailAddress = 'Please enter a valid email address';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = (): boolean => {
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
    if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    
    // Phone number validation
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // ID number validation
    if (formData.idNumber && !validateIdNumber(formData.idNumber)) {
      newErrors.idNumber = 'ID number must be at least 6 characters';
    }
    
    // Required documents
    if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
    if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepNext = () => {
    if (validateCurrentStep()) {
      handleNext();
    }
  };

  const handleSubmitForm = async () => {
    // Validate all steps before final submission
    if (!validateAllSteps()) {
      setError('Please fill in all required fields correctly');
      return;
    }
    
    setLoading(true);
    try {
      // Call the API to register the driver
      const result = await authClient.registerDriver(formData);
      
      if (result.success) {
        // Set success state and move to confirmation step
        setSuccess(true);
        setReferenceNumber(result.referenceNumber || 'DRV-' + Math.floor(Math.random() * 10000));
        setActiveStep(steps.length - 1); // Move to confirmation step
        
        // If onSubmit is provided, call it with the form data
        if (onSubmit) {
          onSubmit(formData);
        }
        
        // If onRefresh is provided, call it to refresh the data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        // Show error
        setError(`Failed to register driver: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error registering driver:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all form state
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
    setActiveStep(0);
    setFormSubmitted(false);
    setSuccess(false);
    setError(null);
    setErrors({});
    onClose();
  };

  // Render step content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            {/* Personal Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={formSubmitted && !!errors.firstName}
                    helperText={formSubmitted && errors.firstName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={formSubmitted && !!errors.lastName}
                    helperText={formSubmitted && errors.lastName}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ID Number"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    error={formSubmitted && !!errors.idNumber}
                    helperText={formSubmitted && errors.idNumber}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData.dateOfBirth}
                      onChange={handleDateChange('dateOfBirth')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: formSubmitted && !!errors.dateOfBirth,
                          helperText: formSubmitted && errors.dateOfBirth ? errors.dateOfBirth : '',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={3}>
            {/* License Details Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                License Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    error={formSubmitted && !!errors.licenseNumber}
                    helperText={formSubmitted && errors.licenseNumber}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={formSubmitted && !!errors.licenseClass} required>
                    <InputLabel>License Class</InputLabel>
                    <Select
                      name="licenseClass"
                      value={formData.licenseClass}
                      onChange={handleSelectChange}
                      label="License Class"
                    >
                      {licenseClasses.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formSubmitted && errors.licenseClass && (
                      <FormHelperText>{errors.licenseClass}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="License Expiry Date"
                      value={formData.licenseExpiryDate}
                      onChange={handleDateChange('licenseExpiryDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: formSubmitted && !!errors.licenseExpiryDate,
                          helperText: formSubmitted && errors.licenseExpiryDate ? errors.licenseExpiryDate : '',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    name="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Document Upload Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Document Upload
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={formData.licenseDocument ? <CheckCircleIcon color="success" /> : <UploadIcon />}
                    sx={{ height: '56px' }}
                    color={formData.licenseDocument ? 'success' : 'primary'}
                  >
                    {formData.licenseDocument ? 'License Uploaded ✓' : 'Upload License'}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange('licenseDocument')}
                    />
                  </Button>
                  {formSubmitted && errors.licenseDocument && (
                    <FormHelperText error>{errors.licenseDocument}</FormHelperText>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={formData.idDocument ? <CheckCircleIcon color="success" /> : <UploadIcon />}
                    sx={{ height: '56px' }}
                    color={formData.idDocument ? 'success' : 'primary'}
                  >
                    {formData.idDocument ? 'ID Uploaded ✓' : 'Upload ID'}
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange('idDocument')}
                    />
                  </Button>
                  {formSubmitted && errors.idDocument && (
                    <FormHelperText error>{errors.idDocument}</FormHelperText>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Stack>
        );
      
      case 2:
        return (
          <Stack spacing={3}>
            {/* Contact Information Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid component="div" item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={formSubmitted && !!errors.phoneNumber}
                    helperText={formSubmitted && errors.phoneNumber}
                    required
                  />
                </Grid>
                <Grid component="div" item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    error={formSubmitted && !!errors.emailAddress}
                    helperText={formSubmitted && errors.emailAddress}
                  />
                </Grid>
                <Grid component="div" item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Emergency Contact Section */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid component="div" item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid component="div" item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
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
        );
      
      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Review Driver Details
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please review all the information before submitting
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Personal Information
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>First Name:</strong> {formData.firstName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Name:</strong> {formData.lastName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID Number:</strong> {formData.idNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date of Birth:</strong> {formData.dateOfBirth?.format('DD/MM/YYYY') || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  License Information
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>License Number:</strong> {formData.licenseNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>License Class:</strong> {formData.licenseClass}
                  </Typography>
                  <Typography variant="body2">
                    <strong>License Expiry Date:</strong> {formData.licenseExpiryDate?.format('DD/MM/YYYY') || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Years of Experience:</strong> {formData.yearsOfExperience || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Contact Information
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Phone Number:</strong> {formData.phoneNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email Address:</strong> {formData.emailAddress || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {formData.address || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Emergency Contact
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {formData.emergencyContactName || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {formData.emergencyContactPhone || 'Not provided'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Documents
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>License Document:</strong> {formData.licenseDocument ? 'Uploaded' : 'Not uploaded'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID Document:</strong> {formData.idDocument ? 'Uploaded' : 'Not uploaded'}
                  </Typography>
                </Box>
              </Grid>
              
              {formData.additionalNotes && (
                <Grid  item xs={12} sm={6}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Additional Notes
                  </Typography>
                  <Typography variant="body2">
                    {formData.additionalNotes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Stack>
        );
      
      case 4:
        return (
          <Stack spacing={3} alignItems="center">
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" align="center">
              Driver Registration Successful!
            </Typography>
            <Typography variant="body1" align="center">
              The driver has been successfully registered in the system.
            </Typography>
            <Typography variant="body1" align="center" fontWeight="bold">
              Reference Number: {referenceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please keep this reference number for your records.
            </Typography>
          </Stack>
        );
      
      default:
        return null;
    }
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
          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ pt: 2, pb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Form content based on active step */}
          <Box sx={{ mt: 2 }}>
            {renderStepContent()}
          </Box>
          
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          {activeStep !== 4 && (
            <Button
              onClick={handleClose}
              color="inherit"
            >
              Cancel
            </Button>
          )}
          
          {activeStep > 0 && activeStep !== 4 && (
            <Button 
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </Button>
          )}
          
          {activeStep < steps.length - 1 && (
            <Button 
              onClick={handleStepNext}
              variant="contained"
              disabled={loading}
            >
              {activeStep === steps.length - 2 ? 'Submit' : 'Next'}
            </Button>
          )}
          
          {activeStep === steps.length - 1 && (
            <Button 
              onClick={handleClose}
              variant="contained"
              color="primary"
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Driver registered successfully!
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
