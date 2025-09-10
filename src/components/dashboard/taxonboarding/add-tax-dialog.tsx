'use client';

import * as React from 'react';
import { Fragment } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { authClient } from '@/lib/auth/client';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { CheckCircle, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

interface AddTaxDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface TaxFormData {
  taxType: string;
  taxRate: string;
  location: string;
  description: string;
}

interface TaxFormErrors {
  taxType: boolean;
  taxRate: boolean;
  location: boolean;
}

// Define steps for the stepper
const steps = [
  'Tax Information',
  'Review',
  'Confirmation'
];

// Define tax type options
const taxTypeOptions = [
  { value: 'income_tax', label: 'Income Tax' },
  { value: 'vat', label: 'Value Added Tax (VAT)' },
  { value: 'corporate_tax', label: 'Corporate Tax' },
  { value: 'mining_royalty', label: 'Mining Royalty' },
  { value: 'property_tax', label: 'Property Tax' },
  { value: 'customs_duty', label: 'Customs Duty' },
  { value: 'other', label: 'Other' }
];

// Define location options
const locationOptions = [
  { value: 'on_site', label: 'On site' },
  { value: 'off_site', label: 'Off Site' },
];

// Validation functions
const validateRequired = (value: string): boolean => {
  return value.trim() !== '';
};

const validateTaxRate = (value: string): boolean => {
  const rate = Number.parseFloat(value);
  return !isNaN(rate) && rate >= 0 && rate <= 100;
};

// Helper component for the grid layout in review step
const Grid = ({ 
  container = false, 
  item = false, 
  xs = 12, 
  sm, 
  spacing = 0, 
  children, 
  ...props 
}: {
  container?: boolean;
  item?: boolean;
  xs?: number;
  sm?: number;
  spacing?: number;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return (
    <Box
      sx={{
        ...(container && {
          display: 'flex',
          flexWrap: 'wrap',
          margin: spacing ? `-${spacing * 4}px` : 0,
        }),
        ...(item && {
          padding: spacing ? `${spacing * 4}px` : 0,
          flexBasis: `${(xs / 12) * 100}%`,
          maxWidth: `${(xs / 12) * 100}%`,
          ...(sm && {
            '@media (min-width: 600px)': {
              flexBasis: `${(sm / 12) * 100}%`,
              maxWidth: `${(sm / 12) * 100}%`,
            },
          }),
        }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export function AddTaxDialog({ open, onClose, onRefresh }: AddTaxDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = React.useState<TaxFormData>({
    taxType: '',
    taxRate: '',
    location: '',
    description: ''
  });
  
  const [errors, setErrors] = React.useState<TaxFormErrors>({
    taxType: false,
    taxRate: false,
    location: false
  });
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [taxReference, setTaxReference] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setFormData({
        taxType: '',
        taxRate: '',
        location: '',
        description: ''
      });
      setErrors({
        taxType: false,
        taxRate: false,
        location: false
      });
      setSuccess(false);
      setTaxReference('');
      setError(null);
      setFormSubmitted(false);
    }
  }, [open]);

  // Handle form field changes
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Handle select changes
  const handleSelectChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors = {
      taxType: !validateRequired(formData.taxType),
      taxRate: !validateRequired(formData.taxRate) || !validateTaxRate(formData.taxRate),
      location: !validateRequired(formData.location)
    };
    
    setErrors(newErrors);
    
    return !Object.values(newErrors).some(Boolean);
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      setFormSubmitted(true);
      
      if (!validateForm()) {
        return; // Don't proceed if validation fails
      }
    }
    
    if (activeStep === steps.length - 2) {
      // Submit form before going to confirmation step
      handleSubmit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call API to create tax
      const response = await authClient.createTax({
        taxType: formData.taxType,
        taxRate: Number.parseFloat(formData.taxRate),
        location: formData.location,
        description: formData.description || ''
      });
      
      // Generate reference number (in a real app, this would come from the API)
      const generatedReference = `TAX-${Math.floor(Math.random() * 10_000).toString().padStart(4, '0')}`;
      setTaxReference(generatedReference);
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error('Error creating tax:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to create tax');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    // Reset form state
    setActiveStep(0);
    setFormData({
      taxType: '',
      taxRate: '',
      location: '',
      description: ''
    });
    setErrors({
      taxType: false,
      taxRate: false,
      location: false
    });
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
    setTaxReference('');
    setFormSubmitted(false);
    
    // Call parent onClose
    onClose();
  };

  // Copy reference to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(taxReference);
    // You could add a toast notification here
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 1 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div">
          Add Operational Tax
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a new tax entry for operational purposes.
        </Typography>
        
        {/* Stepper */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step 1: Tax Information */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tax Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && errors.taxType}
                  margin="normal"
                >
                  <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                    Tax Type *
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter tax type"
                    value={formData.taxType}
                    onChange={handleChange('taxType')}
                  />
                  {formSubmitted && errors.taxType && (
                    <FormHelperText>Tax type is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Tax Rate (%)"
                  value={formData.taxRate}
                  onChange={handleChange('taxRate')}
                  placeholder="Enter tax rate (0-100)"
                  error={formSubmitted && errors.taxRate}
                  helperText={formSubmitted && errors.taxRate ? 'Enter a valid tax rate between 0 and 100' : ''}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && errors.location}
                  margin="normal"
                >
                  <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                    Location *
                  </Typography>
                  <Select
                    fullWidth
                    displayEmpty
                    value={formData.location}
                    onChange={handleSelectChange('location')}
                  >
                    <MenuItem value=""><em>Select location</em></MenuItem>
                    {locationOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && errors.location && (
                    <FormHelperText>Location is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description "
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Enter additional details about this tax"
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ 
                  bgcolor: '#121212', 
                  color: 'white',
                  '&:hover': { bgcolor: '#333' } 
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Review */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Tax Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the information before creating the tax entry.
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Tax Type</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {taxTypeOptions.find(option => option.value === formData.taxType)?.label || formData.taxType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Tax Rate</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.taxRate}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {locationOptions.find(option => option.value === formData.location)?.label || formData.location}
                  </Typography>
                </Grid>
                {formData.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formData.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ borderColor: '#121212', color: '#121212' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ 
                  bgcolor: '#121212', 
                  color: 'white',
                  '&:hover': { bgcolor: '#333' } 
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Tax'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 2 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Tax Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The tax entry has been created. Here is the reference number:
              </Typography>
            </Box>
            
            <Box sx={{ 
              border: '1px solid #b9f6ca', 
              bgcolor: '#e8f5e9', 
              borderRadius: 1, 
              p: 2, 
              mb: 3 
            }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Tax Reference Number
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {taxReference}
                </Typography>
                <IconButton size="small" onClick={copyToClipboard}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <span style={{ marginRight: '8px' }}>⚠️</span> Important:
              </Typography>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Financial reporting and compliance
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Tax planning and forecasting
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Operational cost calculations
                  </Typography>
                </li>
              </ul>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{ 
                  bgcolor: '#121212', 
                  color: 'white',
                  '&:hover': { bgcolor: '#333' } 
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
