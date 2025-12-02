 

'use client';

import * as React from 'react';
import { Fragment } from 'react';
import Dialog from '@mui/material/Dialog';
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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';
import { CheckCircle } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

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

// Text field styling for consistent branding
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#121212',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#121212',
  },
};

export function AddOreDialog({ open, onClose, onRefresh }: AddUserDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // State for form data
  const [formData, setFormData] = React.useState({

    shaftNumbers: '',
    weight: '',
    numberOfBags: '',
    transportStatus: '',
    selectedTransportdriver: '',
    selectedTransport: '',
    originLocation: '',
    destination: '',
    location: '',
    // Additional fields
    transportReason: '',
    processStatus: '',
    date: dayjs() as dayjs.Dayjs,
    time: dayjs() as dayjs.Dayjs,
    tax: [
      {
        taxType: '',
        taxRate: 0
      }
    ]
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

  // Handle date changes
  const handleDateChange = (field: string) => (date: dayjs.Dayjs | null) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  // Handle switch change


  // Handle tax field changes
  const handleTaxChange = (index: number, field: 'taxType' | 'taxRate') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTax = [...formData.tax];
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
        // Additional fields
        transportReason: formData.transportReason || '',
        processStatus: formData.processStatus || '',
        date: formData.date ? formData.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        // Convert dayjs time object to the required format
        time: {
          hour: formData.time.hour(),
          minute: formData.time.minute(),
          second: formData.time.second(),
          nano: 0 // dayjs doesn't have nanoseconds, so we set it to 0
        },
        // Filter out empty tax entries
        tax: formData.tax.filter(item => item.taxType.trim() !== ''),
        location: formData.location || ''
      };
      
      // Call API to create ore record
      console.log('Sending ore data to API:', oreData);
      const response = await authClient.createOre(oreData);
      console.log('API response:', response);
      
      // Check if the response was successful
      if (!response.success) {
        throw new Error(response.error || 'Failed to create ore record');
      }
      
      // Successfully created ore record
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error('Error creating ore record:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to create ore record');
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
    if (!isSubmitting) {
      // Reset all state
      setActiveStep(0);
      setError(null);
      setFormSubmitted(false);
      setFormData({
        shaftNumbers: '',
        weight: '',
        numberOfBags: '',
        transportStatus: '',
        selectedTransportdriver: '',
        selectedTransport: '',
        originLocation: '',
        destination: '',
        location: '',
        transportReason: '',
        processStatus: '',
        date: dayjs(),
        time: dayjs(),
        tax: [{ taxType: '', taxRate: 0 }]
      });
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 1,
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Sticky Header with Stepper */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2,
          pt: 2,
          px: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Assign Ore to Transport
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      {/* Scrollable Content */}
      <DialogContent sx={{ 
        flex: 1,
        overflow: 'auto',
        px: 3,
        py: 3
      }}>

        {/* Step 0: Ore Information */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Ore Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid xs={12}>
                <Autocomplete
                  multiple
                  id="shaft-numbers-autocomplete"
                  options={shaftAssignments || []}
                  getOptionLabel={(option) => {
                    return option.shaftNumbers || option.shaftNumber || '';
                  }}
                  loading={loadingShafts}
                  defaultValue={[]}
                  onChange={(event, newValue) => {
                    const shaftNumbersString = newValue
                      .map(item => item.shaftNumbers || item.shaftNumber || '')
                      .join(', ');
                    setFormData({
                      ...formData,
                      shaftNumbers: shaftNumbersString
                    });
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps}>
                        {option.shaftNumbers || option.shaftNumber || ''}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Shaft Numbers"
                      placeholder="Search for shaft numbers"
                      helperText={
                        formSubmitted && !formData.shaftNumbers
                          ? 'Shaft numbers are required'
                          : shaftError || 'Select shaft numbers from approved assignments'
                      }
                      error={formSubmitted && !formData.shaftNumbers}
                      sx={textFieldStyle}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {loadingShafts ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={handleChange('weight')}
                  placeholder="Enter weight in kg"
                  error={formSubmitted && !formData.weight}
                  helperText={formSubmitted && !formData.weight ? 'Weight is required' : ''}
                  sx={textFieldStyle}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Number of Bags"
                  name="numberOfBags"
                  type="number"
                  value={formData.numberOfBags || ''}
                  onChange={handleChange('numberOfBags')}
                  placeholder="Enter number of bags"
                  error={formSubmitted && !formData.numberOfBags}
                  helperText={formSubmitted && !formData.numberOfBags ? 'Number of bags is required' : ''}
                  sx={textFieldStyle}
                />
              </Grid>
              
              <Grid xs={12}>
                <FormControl 
                  fullWidth 
                  required
                  error={formSubmitted && !formData.transportStatus}
                  sx={textFieldStyle}
                >
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
                  {formSubmitted && !formData.transportStatus && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      Transport status is required
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transport Driver"
                  name="selectedTransportdriver"
                  value={formData.selectedTransportdriver || ''}
                  onChange={handleChange('selectedTransportdriver')}
                  placeholder="Enter transport driver name"
                  sx={textFieldStyle}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transport Vehicle"
                  name="selectedTransport"
                  value={formData.selectedTransport || ''}
                  onChange={handleChange('selectedTransport')}
                  placeholder="Enter transport vehicle details"
                  sx={textFieldStyle}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 1: Tax Information */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Tax Information
            </Typography>
            
            {formData.tax.map((taxItem, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Tax Type"
                      value={taxItem.taxType}
                      onChange={handleTaxChange(index, 'taxType')}
                      placeholder="e.g., VAT, Royalty Tax"
                      error={formSubmitted && !taxItem.taxType && formData.tax.length === 1}
                      helperText={
                        formSubmitted && !taxItem.taxType && formData.tax.length === 1
                          ? 'Tax type is required'
                          : ''
                      }
                      sx={textFieldStyle}
                    />
                  </Grid>
                  
                  <Grid xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Tax Rate"
                      type="number"
                      value={taxItem.taxRate || ''}
                      onChange={handleTaxChange(index, 'taxRate')}
                      placeholder="Enter tax rate"
                      error={formSubmitted && !taxItem.taxRate && formData.tax.length === 1}
                      helperText={
                        formSubmitted && !taxItem.taxRate && formData.tax.length === 1
                          ? 'Tax rate is required'
                          : ''
                      }
                      sx={textFieldStyle}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      onClick={() => removeTaxEntry(index)}
                      disabled={formData.tax.length === 1}
                      color="error"
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
              sx={{ 
                borderColor: '#121212', 
                color: '#121212',
                '&:hover': { borderColor: '#333', bgcolor: 'rgba(18, 18, 18, 0.04)' }
              }}
            >
              Add Tax Entry
            </Button>
          </Box>
        )}

        {/* Step 2: Transport Information */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Transport Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transport Reason"
                  name="transportReason"
                  value={formData.transportReason || ''}
                  onChange={handleChange('transportReason')}
                  placeholder="e.g., Processing, Export"
                  sx={textFieldStyle}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <FormControl fullWidth sx={textFieldStyle}>
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
              
              <Grid xs={12} sm={6}>
                <FormControl fullWidth sx={textFieldStyle}>
                  <InputLabel id="location-label">Collection Location</InputLabel>
                  <Select
                    labelId="location-label"
                    id="location"
                    value={formData.location || ''}
                    onChange={handleSelectChange('location')}
                    label="Collection Location"
                  >
                    <MenuItem value="ground">Still on the ground</MenuItem>
                    <MenuItem value="truck">Loaded in Truck</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Origin Location"
                  name="originLocation"
                  value={formData.originLocation || ''}
                  onChange={handleChange('originLocation')}
                  placeholder="Enter origin location"
                  sx={textFieldStyle}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination || ''}
                  onChange={handleChange('destination')}
                  placeholder="Enter destination"
                  sx={textFieldStyle}
                />
              </Grid>
              
              <Grid xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={handleDateChange('date')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="Time"
                    value={formData.time}
                    onChange={handleDateChange('time')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: textFieldStyle
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        )}
        {/* Step 3: Review */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
              Review Ore Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all information before submitting.
            </Typography>
            
            <Box sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1, 
              p: 3
            }}>
              {/* Ore Information Section */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Ore Information
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Shaft Numbers</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.shaftNumbers || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.weight ? `${formData.weight} kg` : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Number of Bags</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.numberOfBags || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Transport Status</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.transportStatus === 'pending' ? 'Pending' :
                     formData.transportStatus === 'in_transit' ? 'In Transit' :
                     formData.transportStatus === 'delivered' ? 'Delivered' :
                     formData.transportStatus === 'cancelled' ? 'Cancelled' :
                     'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Transport Driver</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.selectedTransportdriver || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Transport Vehicle</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.selectedTransport || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Tax Information Section */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Tax Information
              </Typography>
              {formData.tax.some(t => t.taxType) ? (
                <Grid container spacing={2}>
                  {formData.tax.filter(t => t.taxType).map((taxItem, index) => (
                    <Grid key={index} xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">{taxItem.taxType}</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {taxItem.taxRate}%
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tax information provided
                </Typography>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              {/* Transport Information Section */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Transport Information
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Transport Reason</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.transportReason || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Process Status</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.processStatus === 'pending' ? 'Pending' :
                     formData.processStatus === 'processing' ? 'Processing' :
                     formData.processStatus === 'completed' ? 'Completed' :
                     formData.processStatus === 'cancelled' ? 'Cancelled' :
                     'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Collection Location</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.location === 'ground' ? 'Still on the ground' :
                     formData.location === 'truck' ? 'Loaded in Truck' :
                     'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Origin Location</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.originLocation || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Destination</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.destination || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.date ? formData.date.format('DD/MM/YYYY') : 'Not provided'}
                    {' at '}
                    {formData.time ? formData.time.format('HH:mm') : 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Step 4: Confirmation */}
        {activeStep === 4 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle 
              sx={{ 
                fontSize: 72, 
                color: 'success.main',
                mb: 2
              }} 
            />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              Ore Record Created Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The ore transport record has been created and saved to the system.
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'success.lighter',
              borderRadius: 1,
              p: 3,
              mt: 3
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Record Details:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Shaft Numbers: {formData.shaftNumbers}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Weight: {formData.weight} kg
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Bags: {formData.numberOfBags}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      {/* Fixed Button Bar at Bottom */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Back Button - Show on all steps except first and last */}
        {activeStep > 0 && activeStep < steps.length - 1 && (
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ 
              borderColor: '#121212', 
              color: '#121212',
              '&:hover': { borderColor: '#333', bgcolor: 'rgba(18, 18, 18, 0.04)' }
            }}
          >
            Back
          </Button>
        )}
        
        {/* Spacer for first and last step */}
        {(activeStep === 0 || activeStep === steps.length - 1) && <Box />}
        
        {/* Next/Submit Button - Hide on last step */}
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            sx={{ 
              bgcolor: '#121212', 
              color: 'white',
              '&:hover': { bgcolor: '#333' },
              '&:disabled': { bgcolor: 'action.disabledBackground' }
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Creating...
              </Box>
            ) : activeStep === steps.length - 2 ? (
              'Create Ore Record'
            ) : (
              'Next'
            )}
          </Button>
        )}
        
        {/* Close Button - Show only on last step */}
        {activeStep === steps.length - 1 && (
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
        )}
      </Box>
    </Dialog>
  );
}

// Helper component for the grid layout
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
          flexBasis: sm ? `${(sm / 12) * 100}%` : `${(xs / 12) * 100}%`,
          maxWidth: sm ? `${(sm / 12) * 100}%` : `${(xs / 12) * 100}%`,
          '@media (max-width: 600px)': {
            flexBasis: `${(xs / 12) * 100}%`,
            maxWidth: `${(xs / 12) * 100}%`,
          },
        }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
