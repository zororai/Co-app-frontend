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
import Paper from '@mui/material/Paper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authClient } from '../../../lib/auth/client';
import { Snackbar } from '@mui/material';

interface AddMillDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onSubmit?: (millData: MillFormData) => void;
}

export interface MillFormData {
  millName: string;
  millLocation: string;
  millType: string;
  owner: string;
  idNumber: string;
  address: string;
  picture: string; // Base64 string for uploaded image
  status: string;
  reason: string;
  statusHealth: string;
}

// Define steps for the stepper
const steps = [
  'Mill Information',
  'Location Details',
  'Status Information',
  'Review Details',
  'Confirmation'
];

// Mill type options
const millTypes = [
  // Crushing Mills (Primary Size Reduction)
  { value: 'jaw_crusher', label: 'Jaw Crusher' },
  { value: 'gyratory_crusher', label: 'Gyratory Crusher' },
  { value: 'cone_crusher', label: 'Cone Crusher' },
  { value: 'impact_crusher', label: 'Impact Crusher' },
  { value: 'hammer_mill', label: 'Hammer Mill' },
  
  // Grinding Mills (Size Reduction for Liberation)
  { value: 'ball_mill', label: 'Ball Mill' },
  { value: 'rod_mill', label: 'Rod Mill' },
  { value: 'ag_mill', label: 'Autogenous Mill (AG Mill)' },
  { value: 'sag_mill', label: 'Semi-Autogenous Mill (SAG Mill)' },
  { value: 'pebble_mill', label: 'Pebble Mill' },
  { value: 'tower_mill', label: 'Tower Mill / Vertical Mill' },
  { value: 'stirred_media_mill', label: 'Stirred Media Mill (IsaMill, SMD)' },
  { value: 'vibratory_mill', label: 'Vibratory Mill' },
  
  // Specialized Grinding Mills
  { value: 'stamp_mill', label: 'Stamp Mill' },
  { value: 'chilean_mill', label: 'Chilean Mill / Edge Runner Mill' },
  { value: 'pan_mill', label: 'Pan Mill (Wet Pan Mill)' },
  { value: 'hpgr', label: 'High Pressure Grinding Rolls (HPGR)' },
  
  // Classification & Ancillary Mills
  { value: 'air_classifier_mill', label: 'Air Classifier Mill' },
  { value: 'jet_mill', label: 'Jet Mill' },
  { value: 'attrition_mill', label: 'Attrition Mill' },
];

export function AddMillDialog({ open, onClose, onSubmit, onRefresh }: AddMillDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState<MillFormData>({
    millName: '',
    millLocation: '',
    millType: '',
    owner: '',
    idNumber: '',
    address: '',
    picture: '',
    status: 'PENDING',
    reason: 'Newly added mill',
    statusHealth: 'HEALTHY',
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
    const name = e.target.name as keyof MillFormData;
    const value = e.target.value as string;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (field: keyof MillFormData) => (value: dayjs.Dayjs | null) => {
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

  const handleFileChange = (field: 'licenseDocument' | 'idDocument' | 'picture') => (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const validateIdNumber = (id: string): boolean => {
    return id.length >= 11;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    setFormSubmitted(true);
    
    switch (activeStep) {
      case 0: // Mill Information
        if (!formData.millName.trim()) newErrors.millName = 'Mill name is required';
        if (!formData.millType.trim()) newErrors.millType = 'Mill type is required';
        if (!formData.owner.trim()) newErrors.owner = 'Owner name is required';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
        break;
      
      case 1: // Location Details
        if (!formData.millLocation.trim()) newErrors.millLocation = 'Mill location is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.picture) newErrors.picture = 'Mill picture is required';
        break;
      
      case 2: // Status Information
        // Status is pre-filled with PENDING
        // Optional fields, no validation required
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllSteps = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.millName.trim()) newErrors.millName = 'Mill name is required';
    if (!formData.millType.trim()) newErrors.millType = 'Mill type is required';
    if (!formData.owner.trim()) newErrors.owner = 'Owner name is required';
    if (!formData.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    if (!formData.millLocation.trim()) newErrors.millLocation = 'Mill location is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.picture) newErrors.picture = 'Mill picture is required';
    
    // ID number validation
    if (formData.idNumber && !validateIdNumber(formData.idNumber)) {
      newErrors.idNumber = 'ID number must be at least 11 characters';
    }
    
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
      // Call the API to register the mill
      const result = await authClient.registerMill(formData);
      
      if (result.success) {
        // Set success state and move to confirmation step
        setSuccess(true);
     
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
        setError(`Failed to register mill: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error registering mill:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all form state
    setFormData({
      millName: '',
      millLocation: '',
      millType: '',
      owner: '',
      idNumber: '',
      address: '',
      picture: '',
      status: 'PENDING',
      reason: '',
      statusHealth: 'HEALTHY',
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
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Mill Information</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: Mill Name | Mill Type */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Mill Model *"
                  name="millName"
                  value={formData.millName}
                  onChange={handleChange}
                  placeholder="Enter mill name"
                  error={formSubmitted && !!errors.millName}
                  helperText={formSubmitted && errors.millName}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <FormControl fullWidth required error={formSubmitted && !!errors.millType}>
                  <InputLabel id="mill-type-label">Mill Type *</InputLabel>
                  <Select
                    labelId="mill-type-label"
                    name="millType"
                    value={formData.millType}
                    onChange={(e) => handleSelectChange(e as any)}
                    label="Mill Type *"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    {millTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && errors.millType && (
                    <FormHelperText>{errors.millType}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              {/* Row 2: Owner | ID Number */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Owner Name / Company Name"
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="Owner Name / Company Name"
                  error={formSubmitted && !!errors.owner}
                  helperText={formSubmitted && errors.owner}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="ID Number/Company Reg Number "
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="ID Number/Company Reg Number"
                  error={formSubmitted && !!errors.idNumber}
                  helperText={formSubmitted && errors.idNumber}
                />
              </Box>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Location Details</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: Mill Location | Address */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <FormControl fullWidth required error={formSubmitted && !!errors.millLocation}>
                  <InputLabel id="mill-location-label">Mill Location *</InputLabel>
                  <Select
                    labelId="mill-location-label"
                    name="millLocation"
                    value={formData.millLocation}
                    onChange={(e) => handleSelectChange(e as any)}
                    label="Mill Location *"
                  >
                    <MenuItem value="">Select Location</MenuItem>
                    <MenuItem value="on_site_processing">On site processing</MenuItem>
                    <MenuItem value="off_site_processing">Off site processing</MenuItem>
                  </Select>
                  {formSubmitted && errors.millLocation && (
                    <FormHelperText>{errors.millLocation}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Address *"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  multiline
                  rows={2}
                  error={formSubmitted && !!errors.address}
                  helperText={formSubmitted && errors.address}
                />
              </Box>
            </Box>
            
            {/* Mill Picture Upload Section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mt: 2 }}>
              <Box sx={{ width: '100%', px: 1.5, mb: 2 }}>
                <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mill Picture *
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ mt: 1 }}
                  >
                    Upload Picture
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange('picture')}
                    />
                  </Button>
                  {formData.picture ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">Picture uploaded</Typography>
                    </Box>
                  ) : formSubmitted && errors.picture ? (
                    <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {errors.picture}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Status Information</Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: Status | Status Health */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value="PENDING"
                    disabled
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </Select>
                  <FormHelperText>Status is set to Pending for new mills</FormHelperText>
                </FormControl>
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-health-label">Status Health</InputLabel>
                  <Select
                    labelId="status-health-label"
                    name="statusHealth"
                    value="HEALTHY"
                    disabled
                    label="Status Health"
                  >
                    <MenuItem value="HEALTHY">Healthy</MenuItem>
                  </Select>
                  <FormHelperText>Health status is set to Healthy for new mills</FormHelperText>
                </FormControl>
              </Box>
              
              {/* Row 2: Reason */}
              <Box sx={{ width: '100%', px: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Enter reason for status (if applicable)"
                  multiline
                  rows={2}
                />
              </Box>
            </Box>
            
          </Box>
        );
      
      case 3:
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Review Mill Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all the information before submitting.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Mill Information Section */}
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Mill Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mill Name
                    </Typography>
                    <Typography variant="body1">
                      {formData.millName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mill Type
                    </Typography>
                    <Typography variant="body1">
                      {formData.millType || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Owner
                    </Typography>
                    <Typography variant="body1">
                      {formData.owner || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ID Number
                    </Typography>
                    <Typography variant="body1">
                      {formData.idNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Location Details Section */}
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Location Details
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mill Location
                    </Typography>
                    <Typography variant="body1">
                      {formData.millLocation || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {formData.address || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Picture
                    </Typography>
                    <Typography variant="body1">
                      {formData.picture ? 'Uploaded' : 'Not uploaded'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Status Information Section */}
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Status Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      {formData.status || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status Health
                    </Typography>
                    <Typography variant="body1">
                      {formData.statusHealth || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '100%' }, px: 1.5, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body1">
                      {formData.reason || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
            </Box>
          </Box>
        );
        
      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Mill Registration Submitted
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your mill registration has been submitted successfully.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Reference Number: <strong>{referenceNumber}</strong>
            </Typography>
          </Box>
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
            Add New Mill
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Register a new mill in the system
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
          {activeStep !== steps.length - 1 ? (
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
          ) : (
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ ml: 'auto' }}
            >
              Close
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
