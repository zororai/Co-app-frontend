'use client';

import * as React from 'react';
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
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import { CheckCircle, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Alert from '@mui/material/Alert';

interface AddTransportCostDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface TransportCostFormData {
  paymentMethod: string;
  amountOrGrams: string;
  reason: string;
}

interface TransportCostFormErrors {
  paymentMethod: boolean;
  amountOrGrams: boolean;
  reason: boolean;
}

// Define steps for the stepper
const steps = [
  'Transport Cost Information',
  'Review',
  'Confirmation'
];

// Validation functions
const validateRequired = (value: string): boolean => {
  return value.trim() !== '';
};

const validateAmount = (value: string): boolean => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
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

export function AddTaxDialog({ open, onClose, onRefresh }: AddTransportCostDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formData, setFormData] = React.useState<TransportCostFormData>({
    paymentMethod: '',
    amountOrGrams: '',
    reason: ''
  });
  
  const [errors, setErrors] = React.useState<TransportCostFormErrors>({
    paymentMethod: false,
    amountOrGrams: false,
    reason: false
  });
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [transportCostReference, setTransportCostReference] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setFormData({
        paymentMethod: '',
        amountOrGrams: '',
        reason: ''
      });
      setErrors({
        paymentMethod: false,
        amountOrGrams: false,
        reason: false
      });
      setSuccess(false);
      setTransportCostReference('');
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

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors = {
      paymentMethod: !validateRequired(formData.paymentMethod),
      amountOrGrams: !validateRequired(formData.amountOrGrams) || !validateAmount(formData.amountOrGrams),
      reason: !validateRequired(formData.reason)
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
      // Call API to create transport cost
      const response = await authClient.createTransportCost({
        paymentMethod: formData.paymentMethod,
        amountOrGrams: Number(formData.amountOrGrams),
        reason: formData.reason
      });
      
      // Generate reference number (in a real app, this would come from the API)
      const generatedReference = `COST-${Math.floor(Math.random() * 10_000).toString().padStart(4, '0')}`;
      setTransportCostReference(generatedReference);
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error('Error creating transport cost:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to create transport cost');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    // Reset form state
    setActiveStep(0);
    setFormData({
      paymentMethod: '',
      amountOrGrams: '',
      reason: ''
    });
    setErrors({
      paymentMethod: false,
      amountOrGrams: false,
      reason: false
    });
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
    setTransportCostReference('');
    setFormSubmitted(false);
    
    // Refresh the table data if callback is provided
    if (onRefresh) {
      onRefresh();
    }
    
    // Call parent onClose
    onClose();
  };

  // Copy reference to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(transportCostReference);
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
          Add Transport Cost
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Fixed Stepper Section */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        px: 3,
        py: 2
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create a new transport cost entry.
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{
          '& .MuiStepIcon-root': {
            color: '#d1d5db',
            '&.Mui-active': { color: 'rgb(5, 5, 68)' },
            '&.Mui-completed': { color: 'rgb(5, 5, 68)' },
          },
          '& .MuiStepLabel-label': {
            '&.Mui-active': { color: 'rgb(5, 5, 68)', fontWeight: 600 },
            '&.Mui-completed': { color: 'rgb(5, 5, 68)', fontWeight: 500 },
          },
          '& .MuiStepConnector-line': { borderColor: '#d1d5db' },
          '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: 'rgb(5, 5, 68)' },
          '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: 'rgb(5, 5, 68)' },
        }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Scrollable Content Area */}
      <DialogContent sx={{
        px: 3,
        py: 2,
        maxHeight: '60vh',
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgb(5, 5, 68)', borderRadius: '3px' },
      }}>

        {/* Step 1: Transport Cost Information */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Transport Cost Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && errors.paymentMethod}
                  margin="normal"
                >
                  <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                    Payment Method *
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    label="Payment Method"
                    value={formData.paymentMethod}
                    onChange={handleChange('paymentMethod')}
                    placeholder="Select payment method"
                  >
                    <MenuItem value="Gold">Gold</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                  </TextField>
                  {formSubmitted && errors.paymentMethod && (
                    <FormHelperText>Payment method is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Amount or Grams"
                  value={formData.amountOrGrams}
                  onChange={handleChange('amountOrGrams')}
                  placeholder="Enter amount or grams"
                  error={formSubmitted && errors.amountOrGrams}
                  helperText={formSubmitted && errors.amountOrGrams ? 'Enter a valid non-negative number' : ''}
                  margin="normal"
                  type="number"
                  InputProps={{
                    inputProps: { min: 0 },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Reason"
                  value={formData.reason}
                  onChange={handleChange('reason')}
                  placeholder="Enter reason for this cost"
                  multiline
                  rows={3}
                  margin="normal"
                  error={formSubmitted && errors.reason}
                  helperText={formSubmitted && errors.reason ? 'Reason is required' : ''}
                />
              </Grid>
            </Grid>
            
            {/* Buttons moved to fixed bottom bar */}
          </Box>
        )}

        {/* Step 2: Review */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Transport Cost Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the information before creating the transport cost entry.
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Amount or Grams</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.amountOrGrams}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Reason</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.reason}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Buttons moved to fixed bottom bar */}
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 2 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Transport Cost Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The transport cost entry has been created. Here is the reference number:
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
                Transport Cost Reference Number
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {transportCostReference}
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
            
            {/* Close button moved to fixed bottom bar */}
          </Box>
        )}
      </DialogContent>

      {/* Fixed Button Section */}
      <Box sx={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#fafafa',
        borderTop: '1px solid #e0e0e0',
        px: 3,
        py: 2,
        display: 'flex',
        justifyContent: activeStep === 0 ? 'flex-end' : 'space-between',
        alignItems: 'center',
      }}>
        {activeStep > 0 && activeStep < steps.length - 1 && (
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{
              borderColor: 'rgb(5, 5, 68)',
              color: 'rgb(5, 5, 68)',
              '&:hover': { borderColor: 'rgb(5, 5, 68)', backgroundColor: 'rgba(5, 5, 68, 0.04)' }
            }}
          >
            Back
          </Button>
        )}

        {activeStep < steps.length - 2 && (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ bgcolor: 'rgb(5, 5, 68)', color: 'white', '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.8)' } }}
          >
            Next
          </Button>
        )}

        {activeStep === steps.length - 2 && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ bgcolor: 'rgb(5, 5, 68)', color: 'white', '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.8)' } }}
          >
            {isSubmitting ? 'Creating...' : 'Create Transport Cost'}
          </Button>
        )}

        {activeStep === steps.length - 1 && (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{ bgcolor: 'rgb(5, 5, 68)', color: 'white', '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.8)' } }}
          >
            Close
          </Button>
        )}
      </Box>
    </Dialog>
  );
}
