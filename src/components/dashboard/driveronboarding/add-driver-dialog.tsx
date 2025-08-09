import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { Dayjs } from 'dayjs';
'use client';

import * as React from 'react';
import { Fragment } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

// Interface for component props
interface AddDriverDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}
// Interface for driver form data
interface DriverFormData {
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth: Dayjs | null;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate: Dayjs | null;
  yearsOfExperience: string;
  phoneNumber: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  licenseDocument: File | null;
  idDocument: File | null;
  additionalNotes: string;
  status: string;
}

// Constants for dropdown options
const LICENSE_CLASSES = [
  { value: 'A', label: 'Class A' },
  { value: 'B', label: 'Class B' },
  { value: 'C', label: 'Class C' },
  { value: 'D', label: 'Class D' },
  { value: 'E', label: 'Class E' }
];

const EXPERIENCE_LEVELS = [
  { value: '0-1', label: 'Less than 1 year' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: 'More than 10 years' }
];

const EMERGENCY_RELATIONSHIPS = [
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'CHILD', label: 'Child' },
  { value: 'FRIEND', label: 'Friend' },
  { value: 'OTHER', label: 'Other' }
];

const DRIVER_STATUS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUSPENDED', label: 'Suspended' }
];

// Required documents
const REQUIRED_DOCUMENTS = {
  LICENSE: 'licenseDocument',
  ID: 'idDocument'
};

// Styled components
const VisuallyHiddenInput = styled('input')({  
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Styled component for upload button
const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

export function AddDriverDialog({ open, onClose, onRefresh }: AddDriverDialogProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  // Form state
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
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    licenseDocument: null,
    idDocument: null,
    additionalNotes: '',
    status: 'PENDING'
  });

  // Handle form field changes
  const handleChange = (field: keyof DriverFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Handle select changes
  const handleSelectChange = (field: keyof DriverFormData) => (event: React.ChangeEvent<{ value: unknown }>) => {
    setFormData({
      ...formData,
      [field]: event.target.value as string
    });
  };

  // Handle date changes
  const handleDateChange = (field: keyof DriverFormData) => (date: Dayjs | null) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  // Handle document upload
  const handleFileUpload = (field: keyof DriverFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData({
      ...formData,
      [field]: file
    });
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Handle tab change
  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setFormSubmitted(true);
    
    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.idNumber ||
      !formData.dateOfBirth ||
      !formData.licenseNumber ||
      !formData.licenseClass ||
      !formData.licenseExpiryDate ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.address
    ) {
      setError('Please fill in all required fields');
      return; // Don't proceed if validation fails
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the data for submission
      const driverData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        idNumber: formData.idNumber,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.format('YYYY-MM-DD') : '',
        licenseNumber: formData.licenseNumber,
        licenseClass: formData.licenseClass,
        licenseExpiryDate: formData.licenseExpiryDate ? formData.licenseExpiryDate.format('YYYY-MM-DD') : '',
        yearsOfExperience: formData.yearsOfExperience,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        emergencyContactPhone: formData.emergencyContactPhone,
        additionalNotes: formData.additionalNotes,
        status: formData.status
      };

      // TODO: Add proper API endpoint for driver registration
      // For now, we'll simulate a successful response
      // const response = await authClient.registerDriver(driverData);
      const response = { success: true }; // Simulated successful response
      
      if (response.success) {
        setSuccess(true);
        
        // Refresh the parent component if needed
        if (onRefresh) {
          onRefresh();
        }
        
        // Close the dialog after a delay
        setTimeout(() => {
          handleDialogClose();
        }, 2000);
      } else {
        throw new Error('Failed to submit driver information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit driver information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      setFormSubmitted(false);
      setActiveTab(0);
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
        email: '',
        address: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        licenseDocument: null,
        idDocument: null,
        additionalNotes: '',
        status: 'PENDING'
      });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Add New Driver
        <Typography variant="body2" color="text.secondary">
          Register a new driver with complete information and required documents.
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box sx={{ width: '100%', px: 3 }}>
        <Stepper activeStep={activeTab} alternativeLabel>
          {['Personal Information', 'License Information', 'Contact Information', 'Emergency Contact', 'Documents', 'Additional Notes'].map((label, index) => (
            <Step key={label} completed={activeTab > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>Driver information submitted successfully!</Alert>
        )}
        {/* Render the active tab's content here, e.g. getTabContent(activeTab) */}
        {/* You may need to refactor your tab content into a function/component if not already done */}
      </DialogContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Button color="inherit" disabled={activeTab === 0 || loading} onClick={() => setActiveTab(activeTab - 1)}>
          Previous
        </Button>
        <Button variant="contained" onClick={() => setActiveTab(activeTab + 1)} disabled={loading}>
          {activeTab === 5 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Dialog>
  );
}
