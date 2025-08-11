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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import Divider from '@mui/material/Divider';
import { CheckCircle } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

// Define steps for the stepper
const steps = [
  'Ore Information',
  'Tax Information',
  'Transport Information',
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

export function AddOreDialog({ open, onClose, onRefresh }: AddUserDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [tempPassword, setTempPassword] = React.useState('••••••••••');
  
  // Form state
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    address: '',
    role: '',
    location: '',
    position: '',
    isActive: true,
    notes: '',
    startDate: null as dayjs.Dayjs | null,
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Ore specific fields
    shaftNumbers: '',
    weight: '',
    numberOfBags: '',
    transportStatus: '',
    selectedTransportdriver: '',
    selectedTransport: '',
    originLocation: '',
    destination: '',
    // Additional fields
    transportReason: '',
    processStatus: '',
    date: dayjs() as dayjs.Dayjs,
    time: {
      hour: 0,
      minute: 0,
      second: 0,
      nano: 0
    },
    tax: [
      {
        taxType: '',
        taxRate: 0
      }
    ]
  });

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

  // Handle date changes
  const handleDateChange = (field: string) => (date: dayjs.Dayjs | null) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  // Handle switch change
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isActive: event.target.checked
    });
  };

  // Handle tax field changes
  const handleTaxChange = (index: number, field: 'taxType' | 'taxRate') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTax = [...formData.tax];
    if (field === 'taxRate') {
      newTax[index][field] = Number(event.target.value);
    } else {
      newTax[index][field] = event.target.value;
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
        !formData.shaftNumbers ||
        !formData.weight ||
        !formData.numberOfBags ||
        !formData.transportStatus
      ) {
        return; // Don't proceed if validation fails
      }
    }
    
    // For the second step, validate tax information
    if (activeStep === 1) {
      setFormSubmitted(true);
      
      // Check if at least one tax entry has both fields filled
      const hasValidTax = formData.tax.some(item => item.taxType && item.taxRate > 0);
      
      if (!hasValidTax) {
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
      // Create ore data object with all fields
      const oreData = {
        // Ore specific fields
        shaftNumbers: formData.shaftNumbers,
        weight: formData.weight,
        numberOfBags: formData.numberOfBags,
        transportStatus: formData.transportStatus,
        selectedTransportdriver: formData.selectedTransportdriver || '',
        selectedTransport: formData.selectedTransport || '',
        originLocation: formData.originLocation || '',
        destination: formData.destination || '',
        notes: formData.notes || '',
        // Additional fields
        transportReason: formData.transportReason || '',
        processStatus: formData.processStatus || '',
        location: formData.location || '',
        date: formData.date ? formData.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        time: formData.time || {
          hour: 0,
          minute: 0,
          second: 0,
          nano: 0
        },
        // Filter out empty tax entries
        tax: formData.tax.filter(item => item.taxType.trim() !== '')
      };
      
      // Call API to create ore record
      const response = await authClient.createOre(oreData);
      
      // Generate reference number for the ore
      const oreRef = `ORE-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      setReferenceNumber(oreRef);
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error creating ore record:', err);
      setError(err instanceof Error ? err.message : 'Failed to create ore record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    // Reset form state
    setActiveStep(0);
    setValidationErrors({});
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
    setTempPassword('••••••••••');
    setShowPassword(false);
    setFormSubmitted(false);
    
    // Call parent onClose
    onClose();
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
          Assign Ore to Transport
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
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Shaft Numbers"
                  name="shaftNumbers"
                  value={formData.shaftNumbers || ''}
                  onChange={handleChange('shaftNumbers')}
                  placeholder="Enter shaft numbers (comma separated)"
                  margin="normal"
                  helperText="Enter shaft numbers separated by commas"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={handleChange('weight')}
                  placeholder="Enter weight in kg"
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Number of Bags"
                  name="numberOfBags"
                  type="number"
                  value={formData.numberOfBags || ''}
                  onChange={handleChange('numberOfBags')}
                  placeholder="Enter number of bags"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="transport-status-label">Transport Status</InputLabel>
                  <Select
                    labelId="transport-status-label"
                    id="transport-status"
                    value={formData.transportStatus || ''}
                    onChange={handleSelectChange('transportStatus')}
                    label="Transport Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in_transit">In Transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transport Driver"
                  name="selectedTransportdriver"
                  value={formData.selectedTransportdriver || ''}
                  onChange={handleChange('selectedTransportdriver')}
                  placeholder="Enter transport driver name"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transport Vehicle"
                  name="selectedTransport"
                  value={formData.selectedTransport || ''}
                  onChange={handleChange('selectedTransport')}
                  placeholder="Enter transport vehicle details"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: 0 }}></Box> {/* Empty box to satisfy children requirement */}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: 0 }}></Box> {/* Empty box to satisfy children requirement */}
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
        {activeStep === 1 && (
          <Box>
            
            <Grid container spacing={2}>
             
              
             
              
              {/* Tax Information */}
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
                  Tax Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {formData.tax.map((taxItem, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Tax Type"
                          value={taxItem.taxType}
                          onChange={handleTaxChange(index, 'taxType')}
                          placeholder="Enter tax type"
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Tax Rate (%)"
                          type="number"
                          value={taxItem.taxRate}
                          onChange={handleTaxChange(index, 'taxRate')}
                          placeholder="Enter tax rate"
                          margin="normal"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <IconButton 
                          onClick={() => removeTaxEntry(index)}
                          disabled={formData.tax.length === 1}
                          color="error"
                          sx={{ mt: 1 }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={addTaxEntry}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Tax
                </Button>
              </Grid>
              
             
            
              
            </Grid>
            
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

        {/* Step 3: Additional Details */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transport Reason"
                  name="transportReason"
                  value={formData.transportReason || ''}
                  onChange={handleChange('transportReason')}
                  placeholder="Enter reason for transport"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="process-status-label">Process Status</InputLabel>
                  <Select
                    labelId="process-status-label"
                    id="process-status"
                    value={formData.processStatus || ''}
                    onChange={handleSelectChange('processStatus')}
                    label="Process Status"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={formData.date || null}
                  onChange={handleDateChange('date')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Time"
                  value={formData.date || null}
                  onChange={(newTime) => {
                    if (newTime) {
                      setFormData({
                        ...formData,
                        date: newTime,
                        time: {
                          hour: newTime.hour(),
                          minute: newTime.minute(),
                          second: 0,
                          nano: 0
                        }
                      });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange('notes')}
                  placeholder="Enter any additional notes about this ore"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Origin Location"
                  name="originLocation"
                  value={formData.originLocation || ''}
                  onChange={handleChange('originLocation')}
                  placeholder="Enter origin location"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination || ''}
                  onChange={handleChange('destination')}
                  placeholder="Enter destination"
                  margin="normal"
                />
              </Grid>
            </Grid>
            
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
        
        {/* Step 4: Review */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Ore Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the information before creating the ore record.
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Shaft Numbers</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.shaftNumbers || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Weight</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.weight ? `${formData.weight} kg` : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Number of Bags</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.numberOfBags || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Transport Status</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.transportStatus === 'pending' ? 'Pending' :
                     formData.transportStatus === 'in_transit' ? 'In Transit' :
                     formData.transportStatus === 'delivered' ? 'Delivered' :
                     formData.transportStatus === 'cancelled' ? 'Cancelled' :
                     formData.transportStatus || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Transport Driver</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.selectedTransportdriver || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Transport Vehicle</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.selectedTransport || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Tax Information
              </Typography>
              <Grid container spacing={2}>
                {formData.tax.length > 0 ? (
                  formData.tax.map((taxItem, index) => (
                    <React.Fragment key={index}>
                      {taxItem.taxType && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">{taxItem.taxType}</Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {taxItem.taxRate}%
                          </Typography>
                        </Grid>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1">No tax information provided</Typography>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Additional Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Transport Reason</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.transportReason || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Process Status</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.processStatus === 'pending' ? 'Pending' :
                     formData.processStatus === 'processing' ? 'Processing' :
                     formData.processStatus === 'completed' ? 'Completed' :
                     formData.processStatus === 'cancelled' ? 'Cancelled' :
                     formData.processStatus || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.date ? formData.date.format('DD/MM/YYYY') : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Time</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.date ? formData.date.format('HH:mm') : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Origin Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.originLocation || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Destination</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.destination || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Additional Notes</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.notes || 'Not provided'}
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
                {isSubmitting ? 'Creating...' : 'Save ore record'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 5: Confirmation */}
        {/* Make sure we're accessing the correct activeStep variable */}
        {activeStep === 4 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Ore Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The ore record has been created. Here is the reference number:
              </Typography>
            </Box>
            
            <Box sx={{ 
              border: '1px solid #ffd54f', 
              bgcolor: '#fffde7', 
              borderRadius: 1, 
              p: 2, 
              mb: 3 
            }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Reference Number
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
               
                <Box>
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={copyToClipboard}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
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