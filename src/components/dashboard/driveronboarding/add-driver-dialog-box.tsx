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
// Grid import removed as it's no longer used
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
  licenseDocument: string ; // Changed to string for base64
  idDocument: string ; // Changed to string for base64
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
    licenseDocument: '',
    idDocument: '',
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
      
      reader.addEventListener('load', (event) => {
        if (event.target && event.target.result) {
          // Store the base64 string in the form data
          setFormData({
            ...formData,
            [field]: event.target.result as string,
          });
        }
      });
      
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
    return id.length >= 11;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    setFormSubmitted(true);
    
    switch (activeStep) {
      case 0: { // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
        else if (!validateIdNumber(formData.idNumber)) newErrors.idNumber = 'ID number must be at least 11 characters';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      }
      
      case 1: { // License Details
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseClass) newErrors.licenseClass = 'License class is required';
        if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = 'License expiry date is required';
        if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
        if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
        break;
      }
      
      case 2: { // Contact Information
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        else if (!validatePhone(formData.phoneNumber)) newErrors.phoneNumber = 'Please enter a valid phone number';
        if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
          newErrors.emailAddress = 'Please enter a valid email address';
        }
        break;
      }
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
      newErrors.idNumber = 'ID number must be at least 11 characters';
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
        setReferenceNumber(result.referenceNumber || 'DRV-' + Math.floor(Math.random() * 10_000));
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
      licenseDocument: '',
      idDocument: '',
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
      case 0: {
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Personal Information</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: First Name | Last Name */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="First Name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  error={formSubmitted && !!errors.firstName}
                  helperText={formSubmitted && errors.firstName}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Last Name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  error={formSubmitted && !!errors.lastName}
                  helperText={formSubmitted && errors.lastName}
                />
              </Box>
              
              {/* Row 2: ID Number | Date of Birth */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="ID Number *"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="Enter ID number"
                  error={formSubmitted && !!errors.idNumber}
                  helperText={formSubmitted && errors.idNumber}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date of Birth *"
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
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 1: {
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>License Details</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: License Number | License Class */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="License Number *"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  error={formSubmitted && !!errors.licenseNumber}
                  helperText={formSubmitted && errors.licenseNumber}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <FormControl fullWidth required error={formSubmitted && !!errors.licenseClass}>
                  <InputLabel id="license-class-label">License Class *</InputLabel>
                  <Select
                    labelId="license-class-label"
                    name="licenseClass"
                    value={formData.licenseClass}
                    onChange={(e) => handleSelectChange(e as any)}
                    label="License Class *"
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
              </Box>
              
              {/* Row 2: License Expiry Date | Years of Experience */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="License Expiry Date *"
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
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  placeholder="Enter years of experience"
                  type="number"
                />
              </Box>
            </Box>
            
            {/* Document Upload Section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mt: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    License Document Copy *
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload License
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={handleFileChange('licenseDocument')}
                    />
                  </Button>
                  {formData.licenseDocument ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">Document uploaded</Typography>
                    </Box>
                  ) : formSubmitted && errors.licenseDocument ? (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {errors.licenseDocument}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ID Document Copy *
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload ID
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={handleFileChange('idDocument')}
                    />
                  </Button>
                  {formData.idDocument ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">Document uploaded</Typography>
                    </Box>
                  ) : formSubmitted && errors.idDocument ? (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {errors.idDocument}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 2: {
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Contact Information</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: Phone Number | Email Address */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number *"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  error={formSubmitted && !!errors.phoneNumber}
                  helperText={formSubmitted && errors.phoneNumber}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  error={formSubmitted && !!errors.emailAddress}
                  helperText={formSubmitted && errors.emailAddress}
                />
              </Box>
              
              {/* Row 2: Address */}
              <Box sx={{ width: '100%', px: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  multiline
                  rows={2}
                />
              </Box>
            </Box>
            
            {/* Emergency Contact Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>Emergency Contact</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Enter emergency contact name"
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Enter emergency contact phone"
                />
              </Box>
            </Box>
            
            {/* Additional Notes Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 3 }}>Additional Notes</Typography>
            <Box sx={{ px: 1.5 }}>
              <TextField
                fullWidth
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Any additional information about the driver"
              />
            </Box>
          </Box>
        );
      }
      
      case 3: {
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Review Driver Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all the information before submitting
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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
              </Box>
              
              {formData.additionalNotes && (
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Typography variant="body2">
                    {formData.additionalNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
      }
      
      case 4: {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Driver Registration Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              The driver has been successfully registered in the system.
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
              Reference Number: {referenceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please keep this reference number for your records.
            </Typography>
          </Box>
        );
      }
      
      default: {
        return null;
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, pb: 0 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Add New Driver
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Register a new driver in the transport management system
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Box sx={{ width: '100%', px: 3, py: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {renderStepContent()}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ ml: 'auto' }}
            >
              Close
            </Button>
          ) : (
            <Fragment>
              <Button
                color="inherit"
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
              >
                Previous
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button
                variant="contained"
                onClick={handleStepNext}
                disabled={loading}
                sx={{
                  bgcolor: activeStep === steps.length - 2 ? '#4caf50' : undefined,
                  '&:hover': {
                    bgcolor: activeStep === steps.length - 2 ? '#388e3c' : undefined
                  }
                }}
              >
                {activeStep === steps.length - 2 ? 'Send for Approval' : 'Next'}
              </Button>
            </Fragment>
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
