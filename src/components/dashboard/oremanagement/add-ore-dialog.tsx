'use client';

import * as React from 'react';
import { Fragment } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider, 
  FormControl,
  FormHelperText,
  IconButton, 
  InputAdornment, 
  InputLabel,
  MenuItem,
  Paper, 
  Select,
  Step, 
  StepLabel, 
  Stepper, 
  TextField, 
  Typography 
} from '@mui/material';
import { authClient } from '@/lib/auth/client';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Switch from '@mui/material/Switch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { CheckCircle } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Autocomplete from '@mui/material/Autocomplete';
import { SelectChangeEvent } from '@mui/material/Select';

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
        taxRate: 0,
        location: '',
        description: ''

      }
    ]
  });

  // State for shaft assignments
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [loadingShafts, setLoadingShafts] = React.useState<boolean>(false);
  const [shaftError, setShaftError] = React.useState<string>('');
  
  // State for tax directions
  const [taxDirections, setTaxDirections] = React.useState<any[]>([]);
  const [loadingTaxDirections, setLoadingTaxDirections] = React.useState<boolean>(false);
  const [taxDirectionsError, setTaxDirectionsError] = React.useState<string>('');
  
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
  const handleTaxChange = (index: number, field: 'taxType' | 'taxRate' | 'location' | 'description') => (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const newTax = [...formData.tax];
    const value = (event as any).target?.value;
    if (field === 'taxRate') {
      newTax[index].taxRate = Number(value);
    } else if (field === 'taxType') {
      newTax[index].taxType = value as string;
    } else if (field === 'location') {
      newTax[index].location = value as string;
    } else {
      newTax[index].description = value as string;
    }
    
    setFormData({
      ...formData,
      tax: newTax
    });
  };
  
  // Handle tax type selection from dropdown (store LABEL, not ID)
  const handleTaxTypeSelect = (index: number) => (event: SelectChangeEvent<string>) => {
    const selectedLabel = event.target.value as string;
    const selectedTax = taxDirections.find(tax => tax.taxType === selectedLabel);
    
    if (selectedTax) {
      const newTax = [...formData.tax];
      newTax[index] = {
        taxType: selectedLabel, // Store the LABEL for backend/reference
        taxRate: selectedTax.taxRate ?? 0,
        location: selectedTax.location ?? '',
        description: selectedTax.description ?? ''
      };
      
      console.log('Selected tax:', selectedTax);
      console.log('Updated tax entry:', newTax[index]);
      
      setFormData({
        ...formData,
        tax: newTax
      });
    }
  };

  // Add new tax entry
  const addTaxEntry = () => {
    setFormData({
      ...formData,
      tax: [...formData.tax, { taxType: '', taxRate: 0,location: '', description: ''}]
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
    
    // For the third step, validate additional details
    if (activeStep === 2) {
      setFormSubmitted(true);
      
      // Check if process status is selected
      if (!formData.processStatus) {
        setError('Please select a process status');
        return; // Don't proceed if validation fails
      }
      
      setError(null); // Clear any previous errors
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
      
      // Generate reference number for the ore
    
      setSuccess(true);
      
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

  // Fetch approved shaft assignments and tax directions when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchApprovedShaftAssignments();
      fetchApprovedTaxDirections();
    }
  }, [open]);
  
  // Function to fetch approved tax directions
  const fetchApprovedTaxDirections = async () => {
    setLoadingTaxDirections(true);
    setTaxDirectionsError('');
    try {
      const response = await authClient.fetchApprovedTaxDirections();
      console.log('Tax directions response:', response);
      
      if (response && Array.isArray(response)) {
        setTaxDirections(response);
        console.log('Setting tax directions:', response);
      } else {
        setTaxDirectionsError('Invalid response format');
        console.error('Invalid tax directions response format');
      }
    } catch (error) {
      console.error('Error fetching tax directions:', error);
      setTaxDirectionsError('Failed to load tax directions');
    } finally {
      setLoadingTaxDirections(false);
    }
  };

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

  // TextField styling with rgb(5, 5, 68) theme
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: 'rgb(5, 5, 68)' },
      '&.Mui-focused fieldset': { borderColor: 'rgb(5, 5, 68)' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(5, 5, 68)' },
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
        background: 'linear-gradient(135deg,rgb(5, 5, 68) 0%,rgb(5, 5, 68) 100%)',
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Assign Ore to Transport
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Fixed Stepper Section */}
      <Box sx={{ width: '100%', px: 3, py: 2, background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Assign ore to transport with tax information and additional details
        </Typography>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{
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
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent sx={{ 
        px: 3, 
        py: 2, 
        maxHeight: '60vh', 
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgb(5, 5, 68)', borderRadius: '3px' },
      }}>

        {/* Step content */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  id="shaft-numbers-autocomplete"
                  options={shaftAssignments || []}
                  getOptionLabel={(option) => {
                    // Handle both shaftNumber and shaftNumbers fields
                    return option.shaftNumbers || option.shaftNumber || '';
                  }}
                  loading={loadingShafts}
                  defaultValue={[]}
                  onChange={(event, newValue) => {
                    console.log('Selected values:', newValue);
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
                      margin="normal"
                      helperText={shaftError || "Select shaft numbers from approved assignments"}
                      error={!!shaftError}
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
                  sx={textFieldStyle}
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
                  sx={textFieldStyle}
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
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: 0 }}></Box> {/* Empty box to satisfy children requirement */}
              </Grid>
            </Grid>
            {/* Buttons moved to fixed bottom action bar */}
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
                        <FormControl fullWidth margin="normal">
                          <InputLabel id={`tax-type-label-${index}`}>Tax Type</InputLabel>
                          <Select
                            labelId={`tax-type-label-${index}`}
                            id={`tax-type-${index}`}
                            value={taxItem.taxType}
                            onChange={handleTaxTypeSelect(index)}
                            label="Tax Type"
                            disabled={loadingTaxDirections}
                          >
                            {taxDirections.map((taxDirection) => (
                              <MenuItem key={taxDirection.id} value={taxDirection.taxType}>
                                {taxDirection.taxType || taxDirection.name || taxDirection.id}
                              </MenuItem>
                            ))}
                            {loadingTaxDirections && (
                              <MenuItem disabled>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CircularProgress size={20} sx={{ mr: 1 }} />
                                  Loading...
                                </Box>
                              </MenuItem>
                            )}
                          </Select>
                          {taxDirectionsError && (
                            <FormHelperText error>{taxDirectionsError}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Tax Rate (%)"
                          type="number"
                          value={taxItem.taxRate}
                          sx={textFieldStyle}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            readOnly: true
                          }}
                          placeholder="Auto-populated"
                          margin="normal"
                          disabled={!taxItem.taxType}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={taxItem.location}
                          sx={textFieldStyle}
                          InputProps={{
                            readOnly: true
                          }}
                          placeholder="Auto-populated"
                          margin="normal"
                          disabled={!taxItem.taxType}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={taxItem.description}
                          sx={textFieldStyle}
                          InputProps={{
                            readOnly: true
                          }}
                          placeholder="Auto-populated"
                          margin="normal"
                          disabled={!taxItem.taxType}
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
            
            {/* Buttons moved to fixed bottom action bar */}
          </Box>
        )}

        {/* Step 3: Additional Details */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Detailsi
            </Typography>
            <Grid container spacing={2}>
              
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
      
                  </Select>
                </FormControl>
              </Grid>
           
           
          
          
       
           
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="process-status-label">Collection Location</InputLabel>
                  <Select
                    labelId="process-status-label"
                    id="process-status"
                    value={formData.location ||''}
                    onChange={handleSelectChange('location')}
                    label="Collection Location"
                  >
                    <MenuItem value="pending">Still on the ground</MenuItem>
                    <MenuItem value="processing">Loaded in Truck </MenuItem>
                  
                  
                  </Select>
                </FormControl>
              </Grid>
          
            </Grid>
            
            {/* Buttons moved to fixed bottom action bar */}
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
                     formData.transportStatus === 'cancelled' ? 'Cancelled' :
                     formData.transportStatus || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Transport Driver</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.selectedTransportdriver || 'Not yet provided'}
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
             
              </Grid>
            </Box>
            
            {/* Buttons moved to fixed bottom action bar */}
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
            
          
       
            
            {/* Close button moved to fixed bottom action bar */}
          </Box>
        )}
      </DialogContent>
      
      {/* Fixed Bottom Action Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, background: '#fafafa', borderTop: '1px solid #eaeaea' }}>
        {activeStep === steps.length - 1 ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ 
                bgcolor: 'rgb(5, 5, 68)',
                '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' } 
              }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <Fragment>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ borderColor: 'rgb(5, 5, 68)', color: 'rgb(5, 5, 68)', '&:hover': { borderColor: 'rgb(5, 5, 68)', backgroundColor: 'rgba(5, 5, 68, 0.04)' } }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
              disabled={isSubmitting}
              sx={{ 
                bgcolor: 'rgb(5, 5, 68)',
                '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' } 
              }}
            >
              {activeStep === steps.length - 2 ? (isSubmitting ? 'Creating...' : 'Submit') : 'Next'}
            </Button>
          </Fragment>
        )}
      </Box>
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