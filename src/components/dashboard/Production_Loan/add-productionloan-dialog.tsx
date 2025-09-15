 

'use client';

import * as React from 'react';
import { Fragment } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { authClient } from '@/lib/auth/client';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import { CheckCircle } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface TaxItem {
  taxType: string;
  taxRate: number;
}

interface FormData {
  loanName: string;
  paymentMethod: string;
  amountOrGrams: number;
  purpose: string;
  tax: TaxItem[];
  transportReason?: string;
  processStatus?: string;
  location?: string;
}

// Define steps for the stepper
const steps = [
  'Loan Information',
  'Review',
  'Confirmation'
];

// Define role options
const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
  { value: 'she_officer', label: 'SHE Officer' },
  { value: 'mine_manager', label: 'Mine Manager' }
];

// Define position options
const positionOptions = [
  { value: 'general_manager', label: 'General Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operator', label: 'Operator' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'safety_officer', label: 'Safety Officer' },
  { value: 'administrator', label: 'Administrator' }
];

// Define location options
const locationOptions = [
  { value: 'main_shaft', label: 'Main Shaft' },
  { value: 'processing_plant', label: 'Processing Plant' },
  { value: 'security_office', label: 'Security Office' },
  { value: 'head_office', label: 'Head Office' }
];

export function AddProductionLoanDialog({ open, onClose, onRefresh }: AddUserDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [tempPassword, setTempPassword] = React.useState('••••••••••');
  
  // State for form data
  const [formData, setFormData] = React.useState<FormData>({
    loanName: '',
    paymentMethod: '',
    amountOrGrams: 0,
    purpose: '',
    tax: [{ taxType: '', taxRate: 0 }]
  });

  // State for shaft assignments
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [loadingShafts, setLoadingShafts] = React.useState<boolean>(false);
  const [shaftError, setShaftError] = React.useState<string>('');
  
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Phone validation function
  const validatePhone = (phone: string): boolean => {
    const re = /^\+?[0-9\s-]{10,15}$/;
    return re.test(phone);
  };

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


  // Handle switch change


  // Handle tax field changes
  const handleTaxChange = (index: number, field: 'taxType' | 'taxRate') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTax = [...formData.tax];
    // Assign directly to the specific property to satisfy TypeScript
    if (field === 'taxRate') {
      newTax[index].taxRate = Number(event.target.value);
    } else {
      newTax[index].taxType = event.target.value;
    }
    
    setFormData({
      ...formData,
      tax: newTax
    });
  };

  // Add new tax entry
  const addTaxEntry = () => {
    setFormData({
      ...formData,
      tax: [...formData.tax, { taxType: '', taxRate: 0 }]
    });
  };

  // Remove tax entry
  const removeTaxEntry = (index: number) => {
    const newTax = [...formData.tax];
    newTax.splice(index, 1);
    setFormData({
      ...formData,
      tax: newTax
    });
  };

  // Handle next step
  const handleNext = () => {
    // For the first step, validate required fields
    if (activeStep === 0) {
      setFormSubmitted(true);
      
      // Check required fields
      if (
        !formData.loanName ||
        !formData.paymentMethod ||
        !formData.amountOrGrams ||
        !formData.purpose
      ) {
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

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create production loan data object with all fields
      const loanData = {
        loanName: formData.loanName,
        paymentMethod: formData.paymentMethod,
        amountOrGrams: formData.amountOrGrams,
        purpose: formData.purpose
      };
      
      // Call API to create production loan record
      console.log('Sending production loan data to API:', loanData);
      const response = await authClient.createProductionLoan(loanData);
      console.log('API response:', response);
      
      // Check if the response was successful
      if (!response.success) {
        throw new Error(response.error || 'Failed to create production loan record');
      }
      
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error('Error creating production loan record:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to create production loan record');
      // Show error in UI
      setActiveStep(activeStep); // Stay on current step
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch approved shaft assignments when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchApprovedShaftAssignments();
    }
  }, [open]);

  // Function to fetch approved shaft assignments
  const fetchApprovedShaftAssignments = async () => {
    setLoadingShafts(true);
    setShaftError('');
    try {
      const response = await authClient.fetchApprovedShaftAssignments();
      console.log('Shaft assignments response:', response);
      
      if (response && Array.isArray(response)) {
        // Use mock data for testing if response is empty
        if (response.length === 0) {
          const mockData = [
            { id: '1', shaftNumber: 'SA1' },
            { id: '2', shaftNumber: 'SA2' },
            { id: '3', shaftNumber: 'SA3' }
          ];
          setShaftAssignments(mockData);
          console.log('Using mock data:', mockData);
        } else {
          setShaftAssignments(response);
          console.log('Setting shaft assignments:', response);
        }
      } else {
        // Use mock data if response is not as expected
        const mockData = [
          { id: '1', shaftNumber: 'SA1' },
          { id: '2', shaftNumber: 'SA2' },
          { id: '3', shaftNumber: 'SA3' }
        ];
        setShaftAssignments(mockData);
        console.log('Using mock data due to invalid response:', mockData);
      }
    } catch (error) {
      console.error('Error fetching shaft assignments:', error);
      setShaftError('Failed to load shaft assignments');
      
      // Use mock data on error
      const mockData = [
        { id: '1', shaftNumber: 'SA1' },
        { id: '2', shaftNumber: 'SA2' },
        { id: '3', shaftNumber: 'SA3' }
      ];
      setShaftAssignments(mockData);
      console.log('Using mock data due to error:', mockData);
    } finally {
      setLoadingShafts(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      // Reset form state
      setActiveStep(0);
      setError(null);
      setSuccess(false);
      setFormSubmitted(false);
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
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
          Add Production Loan
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
  
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

        {/* Step content */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Loan Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Loan Name"
                  name="loanName"
                  value={formData.loanName}
                  onChange={handleChange('loanName')}
                  placeholder="Enter loan name/purpose"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="payment-method-label">Payment Method</InputLabel>
                  <Select
                    labelId="payment-method-label"
                    id="payment-method"
                    value={formData.paymentMethod || ''}
                    onChange={handleSelectChange('paymentMethod')}
                    label="Payment Method"
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Gold ">Gold Grams</MenuItem>
                
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Amount/Grams"
                  name="amountOrGrams"
                  type="number"
                  value={formData.amountOrGrams || ''}
                  onChange={handleChange('amountOrGrams')}
                  placeholder="Enter amount or grams"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Purpose"
                  name="purpose"
                  multiline
                  rows={3}
                  value={formData.purpose || ''}
                  onChange={handleChange('purpose')}
                  placeholder="Describe the purpose of this loan"
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

        {/* Step 2: Tax */}
       

      
        
        {/* Step 2: Review */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Production Loan Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the information before creating the production loan record.
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Loan Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Loan Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.loanName || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.paymentMethod || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Amount/Grams</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.amountOrGrams || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Purpose
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Purpose</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.purpose || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
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
                {isSubmitting ? 'Creating...' : 'Send Production Loan For Approval'}
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
                Production Loan Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The production loan record has been created and saved to the system.
              </Typography>
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

// Helper component for the grid layout in review step
const Grid = ({ 
  container = false, 
  item = false, 
  xs = 12, 
  spacing = 0, 
  children, 
  ...props 
}: {
  container?: boolean;
  item?: boolean;
  xs?: number;
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
        }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};