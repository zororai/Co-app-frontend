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
import { useTheme } from '@mui/material/styles';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  picture: string; // Passport photo (35mm x 45mm)
  qrcode: string; // Generated QR code for driver ID
  additionalNotes: string;
}

// Define steps for the stepper
const steps = [
  'Personal Information',
  'License Details',
  'Contact Information',
  'Review Details',
  'Generate Driver ID',
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
  const theme = useTheme();
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
    picture: '',
    qrcode: '',
    additionalNotes: '',
  });

  // Consistent TextField styling using theme colors
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: theme.palette.secondary.main },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': { color: theme.palette.secondary.main },
    },
  } as const;

  // Validate Zimbabwean ID number format
  const validateZimbabweanID = (idNumber: string): string | null => {
    // Remove any spaces or dashes for validation
    const cleanId = idNumber.replace(/[\s-]/g, '');
    
    // Check if it's exactly 11 characters
    if (cleanId.length !== 11) {
      return 'ID number must be exactly 11 characters';
    }
    
    // Check format: 2 digits + 6 digits + 1 letter + 2 digits (e.g., 67-657432D45)
    const idPattern = /^\d{8}[A-Za-z]\d{2}$/;
    if (!idPattern.test(cleanId)) {
      return 'Invalid format. Expected: XX-XXXXXXDXX (e.g., 67-657432D45)';
    }
    
    return null; // Valid
  };

  // Format ID number with dashes
  const formatIdNumber = (value: string): string => {
    // Remove all non-alphanumeric characters
    const clean = value.replace(/[^0-9A-Za-z]/g, '');
    
    // Apply formatting: XX-XXXXXXDXX
    if (clean.length <= 2) {
      return clean;
    } else if (clean.length <= 8) {
      return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    } else if (clean.length <= 10) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 8)}${clean.slice(8)}`;
    } else {
      return `${clean.slice(0, 2)}-${clean.slice(2, 8)}${clean.slice(8, 9)}${clean.slice(9, 11)}`;
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    let fieldErrors = { ...errors };
    
    // Special handling for ID number
    if (name === 'idNumber') {
      processedValue = formatIdNumber(value);
      // Uppercase the letter for consistent display
      processedValue = processedValue.toUpperCase();
      
      // Validate ID number if it's not empty
      if (processedValue.trim()) {
        const validationError = validateZimbabweanID(processedValue);
        if (validationError) {
          fieldErrors.idNumber = validationError;
        } else {
          delete fieldErrors.idNumber;
        }
      } else {
        delete fieldErrors.idNumber;
      }
      
      setErrors(fieldErrors);
    }
    
    // Special handling for years of experience
    if (name === 'yearsOfExperience') {
      const years = parseFloat(value);
      if (value && years < 2) {
        fieldErrors.yearsOfExperience = 'Minimum 2 years of experience required';
      } else {
        delete fieldErrors.yearsOfExperience;
      }
      setErrors(fieldErrors);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
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
    const newFormData = {
      ...formData,
      [field]: value,
    };
    
    const newErrors = { ...errors };
    
    // Validate age if this is the date of birth field
    if (field === 'dateOfBirth' && value) {
      const age = dayjs().diff(value, 'year');
      
      if (age < 18) {
        newErrors.dateOfBirth = 'Driver must be at least 18 years old';
      } else {
        delete newErrors.dateOfBirth;
      }
    }
    
    // Validate license expiry date
    if (field === 'licenseExpiryDate' && value) {
      const startOfNextMonth = dayjs().add(1, 'month').startOf('month');
      
      if (value.isBefore(startOfNextMonth)) {
        newErrors.licenseExpiryDate = 'License expiry date must be at least in the next month';
      } else {
        delete newErrors.licenseExpiryDate;
      }
    }
    
    setErrors(newErrors);
    setFormData(newFormData);
  };
  
  // Handle stepper navigation
  const handleNext = () => {
    if (activeStep === steps.length - 3) {
      // If on the review step, generate QR code and move to ID generation
      generateQRCode();
      setActiveStep((prevStep) => prevStep + 1);
    } else if (activeStep === steps.length - 2) {
      // If on the ID generation step, submit the form
      handleSubmitForm();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Generate QR Code for driver
  const generateQRCode = async () => {
    try {
      // Create QR code data with driver information
      const qrData = JSON.stringify({
        id: formData.idNumber,
        name: `${formData.firstName} ${formData.lastName}`,
        license: formData.licenseNumber,
        class: formData.licenseClass,
        expires: formData.licenseExpiryDate?.format('DD/MM/YYYY'),
      });
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setFormData({
        ...formData,
        qrcode: qrCodeDataURL,
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFileChange = (field: 'licenseDocument' | 'idDocument' | 'picture') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Special validation for passport photo
      if (field === 'picture') {
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
          const newErrors = { ...errors };
          newErrors.picture = 'Please upload an image file';
          setErrors(newErrors);
          return;
        }
        
        // Validate image dimensions (35mm x 45mm at 300 DPI = 413px x 531px)
        const img = new Image();
        const reader = new FileReader();
        
        reader.addEventListener('load', () => {
          const result = reader.result;
          if (typeof result === 'string') {
            img.src = result;
            
            img.addEventListener('load', () => {
              const expectedWidth = 413; // 35mm at 300 DPI
              const expectedHeight = 531; // 45mm at 300 DPI
              const tolerance = 50; // Allow some tolerance
              
              if (
                Math.abs(img.width - expectedWidth) > tolerance ||
                Math.abs(img.height - expectedHeight) > tolerance
              ) {
                const newErrors = { ...errors };
                newErrors.picture = `Photo dimensions should be approximately 35mm x 45mm (${expectedWidth}px x ${expectedHeight}px). Current: ${img.width}px x ${img.height}px`;
                setErrors(newErrors);
              } else {
                const newErrors = { ...errors };
                delete newErrors.picture;
                setErrors(newErrors);
                
                // Store the base64 string in the form data
                setFormData({
                  ...formData,
                  [field]: result,
                });
              }
            });
          }
        });
        
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        
        reader.addEventListener('load', () => {
          const result = reader.result;
          if (typeof result === 'string') {
            // Store the base64 string in the form data
            setFormData({
              ...formData,
              [field]: result,
            });
          }
        });
        
        // Read the file as a data URL (base64)
        reader.readAsDataURL(file);
      }
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
    return validateZimbabweanID(id) === null;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    setFormSubmitted(true);
    
    switch (activeStep) {
      case 0: { // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
        else {
          const idErr = validateZimbabweanID(formData.idNumber);
          if (idErr) newErrors.idNumber = idErr;
        }
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const age = dayjs().diff(formData.dateOfBirth, 'year');
          if (age < 18) {
            newErrors.dateOfBirth = 'Driver must be at least 18 years old';
          }
        }
        break;
      }
      
      case 1: { // License Details
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseClass) newErrors.licenseClass = 'License class is required';
        if (!formData.licenseExpiryDate) {
          newErrors.licenseExpiryDate = 'License expiry date is required';
        } else {
          const startOfNextMonth = dayjs().add(1, 'month').startOf('month');
          if (formData.licenseExpiryDate.isBefore(startOfNextMonth)) {
            newErrors.licenseExpiryDate = 'License expiry date must be at least in the next month';
          }
        }
        if (formData.yearsOfExperience && parseFloat(formData.yearsOfExperience) < 2) {
          newErrors.yearsOfExperience = 'Minimum 2 years of experience required';
        }
        if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
        if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
        if (!formData.picture) newErrors.picture = 'Passport photo is required';
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
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = dayjs().diff(formData.dateOfBirth, 'year');
      if (age < 18) {
        newErrors.dateOfBirth = 'Driver must be at least 18 years old';
      }
    }
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!formData.licenseClass) newErrors.licenseClass = 'License class is required';
    if (!formData.licenseExpiryDate) {
      newErrors.licenseExpiryDate = 'License expiry date is required';
    } else {
      const startOfNextMonth = dayjs().add(1, 'month').startOf('month');
      if (formData.licenseExpiryDate.isBefore(startOfNextMonth)) {
        newErrors.licenseExpiryDate = 'License expiry date must be at least in the next month';
      }
    }
    if (formData.yearsOfExperience && parseFloat(formData.yearsOfExperience) < 2) {
      newErrors.yearsOfExperience = 'Minimum 2 years of experience required';
    }
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
    if (formData.idNumber) {
      const idErr = validateZimbabweanID(formData.idNumber);
      if (idErr) newErrors.idNumber = idErr;
    }
    
    // Required documents
    if (!formData.licenseDocument) newErrors.licenseDocument = 'License document is required';
    if (!formData.idDocument) newErrors.idDocument = 'ID document is required';
    if (!formData.picture) newErrors.picture = 'Passport photo is required';
    
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
    setError(''); // Clear any previous errors
    
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
      } else {
        // Show error with clear message
        const errorMessage = result.error || 'Unknown error';
        setError(errorMessage);
        
        // If it's a duplicate email error, set field-specific error and navigate back
        if (errorMessage.toLowerCase().includes('email already exists')) {
          setErrors(prev => ({
            ...prev,
            emailAddress: 'This email address is already registered. Please use a different email.'
          }));
          setActiveStep(0); // Go back to Personal Details step
        }
      }
    } catch (error) {
      console.error('Error registering driver:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      // If it's a duplicate email error, set field-specific error and go back to first step
      if (errorMessage.toLowerCase().includes('email already exists')) {
        setErrors(prev => ({
          ...prev,
          emailAddress: 'This email address is already registered. Please use a different email.'
        }));
        setActiveStep(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // If the submission was successful, refresh the table data
    const wasSuccessful = success;
    
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
      picture: '',
      qrcode: '',
      additionalNotes: '',
    });
    setActiveStep(0);
    setFormSubmitted(false);
    setSuccess(false);
    setError(null);
    setErrors({});
    onClose();
    
    // Refresh the table after closing if submission was successful
    if (wasSuccessful && onRefresh) {
      onRefresh();
    }
  };

  // Download Driver ID Card as PDF
  const downloadDriverIDCard = async () => {
    try {
      const cardElement = document.getElementById('driver-id-card');
      if (!cardElement) return;
      
      // Capture the ID card as canvas
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions to fit the card nicely on the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 40; // Leave margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Save PDF with driver's name
      const filename = `${formData.firstName}_${formData.lastName}_Driver_ID.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
                />
              </Box>
              
              {/* Row 2: ID Number | Date of Birth */}
              {/* 
                Zimbabwean ID Format: XX-XXXXXXDXX (11 characters total)
                - First 2 digits: District where ID was registered
                - Next 6 digits: Serial number for that district  
                - Next 1 character: Check letter for verification
                - Last 2 digits: District of origin for applicant
                Example: 67-657432D45
              */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="ID Number *"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="67-657432D45"
                  error={!!errors.idNumber}
                  helperText={
                    errors.idNumber || 
                    "Format: XX-XXXXXXDXX (District-Serial+Check+Origin). Example: 67-657432D45"
                  }
                  inputProps={{
                    maxLength: 13, // XX-XXXXXXDXX = 13 characters with dashes
                    style: { textTransform: 'uppercase' }
                  }}
                  sx={textFieldStyle}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date of Birth *"
                    value={formData.dateOfBirth}
                    onChange={handleDateChange('dateOfBirth')}
                    maxDate={dayjs().subtract(18, 'year')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: formSubmitted && !!errors.dateOfBirth,
                        helperText: formSubmitted && errors.dateOfBirth ? errors.dateOfBirth : 'Driver must be at least 18 years old',
                        sx: textFieldStyle,
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
                  label="License Number "
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Enter license number"
                  error={formSubmitted && !!errors.licenseNumber}
                  helperText={formSubmitted && errors.licenseNumber}
                  sx={textFieldStyle}
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
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.secondary.main },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.secondary.main },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.secondary.main },
                    }}
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
                    minDate={dayjs().add(1, 'month').startOf('month')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: formSubmitted && !!errors.licenseExpiryDate,
                        helperText: formSubmitted && errors.licenseExpiryDate ? errors.licenseExpiryDate : 'Must be at least next month',
                        sx: textFieldStyle,
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
                  error={formSubmitted && !!errors.yearsOfExperience}
                  helperText={
                    formSubmitted && errors.yearsOfExperience 
                      ? errors.yearsOfExperience 
                      : 'Minimum 2 years required'
                  }
                  inputProps={{
                    min: 2,
                    step: 0.5,
                  }}
                  sx={textFieldStyle}
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
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Passport Photo * (35mm x 45mm)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange('picture')}
                    />
                  </Button>
                  {formData.picture ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">Photo uploaded</Typography>
                      </Box>
                      <Box 
                        component="img"
                        src={formData.picture}
                        alt="Passport Photo Preview"
                        sx={{
                          mt: 2,
                          width: '120px',
                          height: '155px',
                          objectFit: 'cover',
                          border: '2px solid #ccc',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  ) : formSubmitted && errors.picture ? (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {errors.picture}
                    </Typography>
                  ) : null}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Photo should be 35mm wide x 45mm high (approximately 413px x 531px at 300 DPI)
                  </Typography>
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
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
                sx={textFieldStyle}
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
        // Generate Driver ID step
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, textAlign: 'center' }}>
              Driver ID Card
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Review the generated driver ID card with QR code
            </Typography>
            
            {/* Driver ID Card */}
            <Box
              id="driver-id-card"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                border: '3px solid #000',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  bgcolor: '#C9A958',
                  py: 2,
                  textAlign: 'center',
                  borderBottom: '2px solid #000',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000' }}>
                  DRIVER
                </Typography>
              </Box>
              
              {/* Content */}
              <Box sx={{ bgcolor: '#F5E6D3', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  {/* Photo Section */}
                  <Box sx={{ flex: '0 0 auto' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 155,
                        bgcolor: '#E0E0E0',
                        border: '2px solid #999',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {formData.picture ? (
                        <Box
                          component="img"
                          src={formData.picture}
                          alt="Driver Photo"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ textAlign: 'center', px: 1 }}>
                          PHOTO SIZE<br />W=35mm H=45mm
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                      PHOTO SIZE W=0.1 x H=1 in
                    </Typography>
                  </Box>
                  
                  {/* Details Section */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {formData.firstName.toUpperCase()} {formData.lastName.toUpperCase()}
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <strong>ID:</strong> {formData.idNumber} <strong style={{ marginLeft: 16 }}>CLASS:</strong> {formData.licenseClass}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#C9A958' }}>
                        FULL NAME
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {formData.firstName} {formData.lastName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <strong>ADDRESS:</strong> {formData.address || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <strong>ISSUED:</strong> {dayjs().format('DD-MM-YY')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        <strong>EXPIRES:</strong> {formData.licenseExpiryDate?.format('DD-MM-YY') || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* QR Code Section */}
                  <Box sx={{ flex: '0 0 auto' }}>
                    {formData.qrcode ? (
                      <Box
                        component="img"
                        src={formData.qrcode}
                        alt="QR Code"
                        sx={{
                          width: 120,
                          height: 120,
                          border: '2px solid #000',
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: '#E0E0E0',
                          border: '2px solid #999',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption">QR CODE</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
            
            {/* Download Button */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={downloadDriverIDCard}
                disabled={!formData.qrcode}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark,
                  },
                }}
              >
                Download ID Card as PDF
              </Button>
            </Box>
          </Box>
        );
      }
      
      case 5: {
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
         <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            py: 2.5,
            px: 3,
            m: 0
          }}>

          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Add New Driver
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
        <Typography variant="body2" color="text.secondary" sx={{ paddingLeft :2 , py: 2 , mt: 0.5 }}>
            Register a new driver in the transport management system
          </Typography>
        
        <Box sx={{ width: '100%', px: 3, py: 2 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel
            sx={{
              '& .MuiStepIcon-root': {
                color: '#d1d5db',
                '&.Mui-active': {
                  color: theme.palette.secondary.main,
                },
                '&.Mui-completed': {
                  color: theme.palette.secondary.main,
                },
              },
              '& .MuiStepLabel-label': {
                '&.Mui-active': {
                  color: theme.palette.secondary.main,
                  fontWeight: 600,
                },
                '&.Mui-completed': {
                  color: theme.palette.secondary.main,
                  fontWeight: 500,
                },
              },
              '& .MuiStepConnector-line': {
                borderColor: '#d1d5db',
              },
              '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
                borderColor: theme.palette.secondary.main,
              },
              '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
                borderColor: theme.palette.secondary.main,
              },
            }}
          >
            {steps.map((label, index) => (
              <Step key={label} completed={activeStep > index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <DialogContent 
          dividers 
          sx={{
            px: 3,
            py: 2,
            maxHeight: '60vh',
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.secondary.main, borderRadius: '3px' },
          }}
        >
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
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark
                  }
                }}
              >
                {activeStep === steps.length - 3 ? 'Generate ID' : activeStep === steps.length - 2 ? 'Send for Approval' : 'Next'}
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
