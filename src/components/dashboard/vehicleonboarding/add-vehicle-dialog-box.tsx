'use client';

import * as React from 'react';
import { Fragment } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UploadIcon from '@mui/icons-material/Upload';
import CancelIcon from '@mui/icons-material/Cancel';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// Grid import removed as it's no longer used
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Alert from '@mui/material/Alert';
import { Snackbar } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { authClient } from '@/lib/auth/client';

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onSubmit?: (vehicleData: VehicleFormData) => void;
}

export interface VehicleFormData {
  regNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  year: string;
  assignedDriver: string;
  lastServiceDate: dayjs.Dayjs | null;
  ownerName: string;
  ownerAddress: string;
  ownerCellNumber: string;
  ownerIdNumber: string;
  idPicture: File | null;
  truckPicture: File | null;
  registrationBook: File | null;
}

// Define steps for the stepper
const steps = [
  'Vehicle Information',
  'Owner Details',
  'Documents',
  'Review Details',
  'Confirmation'
];

// Vehicle type options
const vehicleTypes = [
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Van', label: 'Van' },
  { value: 'Bus', label: 'Bus' }
];

export function AddVehicleDialog({ open, onClose, onSubmit, onRefresh }: AddVehicleDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [notification, setNotification] = React.useState<{type: 'success' | 'error', message: string} | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [approvedDrivers, setApprovedDrivers] = React.useState<Array<{id: string, name: string, surname: string}>>([]);
  const [formData, setFormData] = React.useState<VehicleFormData>({
    regNumber: '',
    vehicleType: '',
    make: '',
    model: '',
    year: '',
    assignedDriver: '',
    lastServiceDate: null,
    ownerName: '',
    ownerAddress: '',
    ownerCellNumber: '',
    ownerIdNumber: '',
    idPicture: null,
    truckPicture: null,
    registrationBook: null,
  });
  
  // Fetch approved drivers when component mounts
  React.useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const drivers = await authClient.fetchApprovedDrivers();
        
        // Check if we need to parse the JSON string
        if (typeof drivers === 'string') {
          try {
            const parsedDrivers = JSON.parse(drivers);
            setApprovedDrivers(parsedDrivers);
          } catch (parseError) {
            console.error('Error parsing drivers data:', parseError);
          }
        } else {
          // If it's already an object, ensure it's an array
          if (Array.isArray(drivers)) {
            setApprovedDrivers(drivers);
          } else {
            // Check if there's a data property or similar that contains the array
            const possibleArrays = ['data', 'drivers', 'items', 'results'];
            for (const key of possibleArrays) {
              if (drivers && drivers[key] && Array.isArray(drivers[key])) {
                setApprovedDrivers(drivers[key]);
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching approved drivers:', error);
      }
    };
    
    fetchDrivers();
  }, []);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: string } }, child?: React.ReactNode): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
  };

  const handleDateChange = (field: string) => (value: dayjs.Dayjs | null): void => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle file input for document fields
  const handleFileChange = (field: 'idPicture' | 'truckPicture' | 'registrationBook') => (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      [field]: file,
    });
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    setFormSubmitted(true);
    
    switch (activeStep) {
      case 0: { // Vehicle Information
        if (!formData.regNumber) newErrors.regNumber = 'Registration number is required';
        if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
        if (!formData.make) newErrors.make = 'Make is required';
        if (!formData.model) newErrors.model = 'Model is required';
        if (!formData.year) newErrors.year = 'Year is required';
        if (!formData.assignedDriver) newErrors.assignedDriver = 'Assigned driver is required';
        if (!formData.lastServiceDate) newErrors.lastServiceDate = 'Last service date is required';
        break;
      }
      
      case 1: { // Owner Details
        if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!formData.ownerIdNumber) newErrors.ownerIdNumber = 'Owner ID number is required';
        if (!formData.ownerCellNumber) newErrors.ownerCellNumber = 'Owner cell number is required';
        if (!formData.ownerAddress) newErrors.ownerAddress = 'Owner address is required';
        
        // Phone number validation
        if (formData.ownerCellNumber && !/^\+?[0-9\s]+$/.test(formData.ownerCellNumber)) {
          newErrors.ownerCellNumber = 'Invalid phone number format';
        }
        
        // ID number validation to allow format like 80-101500D87
        if (formData.ownerIdNumber && !/^\d{2}-\d{6}[A-Z]\d{2}$/.test(formData.ownerIdNumber)) {
          newErrors.ownerIdNumber = 'ID number should be in format XX-XXXXXXAXX (e.g., 80-101500D87)';
        }
        break;
      }
      
      case 2: { // Documents
        if (!formData.idPicture) newErrors.idPicture = 'ID picture is required';
        if (!formData.truckPicture) newErrors.truckPicture = 'Vehicle picture is required';
        if (!formData.registrationBook) newErrors.registrationBook = 'Registration book is required';
        break;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all steps
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.regNumber) newErrors.regNumber = 'Registration number is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.assignedDriver) newErrors.assignedDriver = 'Assigned driver is required';
    if (!formData.lastServiceDate) newErrors.lastServiceDate = 'Last service date is required';
    if (!formData.ownerName) newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerIdNumber) newErrors.ownerIdNumber = 'Owner ID number is required';
    if (!formData.ownerCellNumber) newErrors.ownerCellNumber = 'Owner cell number is required';
    if (!formData.ownerAddress) newErrors.ownerAddress = 'Owner address is required';
    
    // Phone number validation
    if (formData.ownerCellNumber && !/^\+?[0-9\s]+$/.test(formData.ownerCellNumber)) {
      newErrors.ownerCellNumber = 'Invalid phone number format';
    }
    
    // ID number validation to allow format like 80-101500D87
    if (formData.ownerIdNumber && !/^\d{2}-\d{6}[A-Z]\d{2}$/.test(formData.ownerIdNumber)) {
      newErrors.ownerIdNumber = 'ID number should be in format XX-XXXXXXAXX (e.g., 80-101500D87)';
    }
    
    // Document validation
    if (!formData.idPicture) newErrors.idPicture = 'ID picture is required';
    if (!formData.truckPicture) newErrors.truckPicture = 'Vehicle picture is required';
    if (!formData.registrationBook) newErrors.registrationBook = 'Registration book is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle stepper navigation
  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      // If on the review step, submit the form
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepNext = () => {
    if (validateCurrentStep()) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Call the API to register the vehicle
      const result = await authClient.registerVehicle(formData);
      
      if (result.success) {
        // Set success state and move to confirmation step
        setSuccess(true);
        setReferenceNumber(result.referenceNumber || 'VEH-' + Math.floor(Math.random() * 10_000));
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
        setError(`Failed to register vehicle: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error registering vehicle:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset all form state
    setFormData({
      regNumber: '',
      vehicleType: '',
      make: '',
      model: '',
      year: '',
      assignedDriver: '',
      lastServiceDate: null,
      ownerName: '',
      ownerAddress: '',
      ownerCellNumber: '',
      ownerIdNumber: '',
      idPicture: null,
      truckPicture: null,
      registrationBook: null,
    });
    setActiveStep(0);
    setFormSubmitted(false);
    setSuccess(false);
    setError(null);
    setErrors({});
    
    onClose();
  };

  // Render step content based on active step
  const renderStepContent = (): React.ReactNode => {
    switch (activeStep) {
      case 0: { // Vehicle Information
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Vehicle Information
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Enter the basic details of the vehicle
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.regNumber}
                  helperText={formSubmitted && errors.regNumber}
                  required
                  placeholder="e.g., ABC123GP"
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth required error={!!errors.vehicleType} size="small">
                  <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                  <Select
                    labelId="vehicle-type-label"
                    name="vehicleType"
                    value={formData.vehicleType}
                    label="Vehicle Type"
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && errors.vehicleType && (
                    <FormHelperText>{errors.vehicleType}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="Make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.make}
                  helperText={formSubmitted && errors.make}
                  required
                  placeholder="e.g., Toyota"
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.model}
                  helperText={formSubmitted && errors.model}
                  required
                  placeholder="e.g., Corolla"
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="Year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.year}
                  helperText={formSubmitted && errors.year}
                  required
                  placeholder="e.g., 2023"
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <FormControl fullWidth error={formSubmitted && !!errors.assignedDriver} required size="small">
                  <InputLabel id="assigned-driver-label">Assigned Driver</InputLabel>
                  <Select
                    labelId="assigned-driver-label"
                    id="assigned-driver"
                    name="assignedDriver"
                    value={formData.assignedDriver}
                    onChange={handleChange}
                    label="Assigned Driver"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {Array.isArray(approvedDrivers) && approvedDrivers.length > 0 ? (
                      approvedDrivers.map((driver) => (
                        <MenuItem key={driver?.id || Math.random()} value={driver?.name || (driver as any)?.firstName || '' + ' ' + driver?.surname || (driver as any)?.lastName || ''} >
                          {driver?.name || (driver as any)?.firstName || ''} {driver?.surname || (driver as any)?.lastName || ''}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value=""><em>No drivers available</em></MenuItem>
                    )}
                  </Select>
                  {formSubmitted && errors.assignedDriver && (
                    <FormHelperText>{errors.assignedDriver}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <DatePicker
                  label="Last Service Date"
                  value={formData.lastServiceDate}
                  onChange={handleDateChange('lastServiceDate')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: formSubmitted && !!errors.lastServiceDate,
                      helperText: formSubmitted && errors.lastServiceDate,
                      size: 'small',
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 1: { // Owner Details
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Owner Information
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Enter the details of the vehicle owner
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="Owner Name"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.ownerName}
                  helperText={formSubmitted && errors.ownerName}
                  required
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="ID Number"
                  name="ownerIdNumber"
                  value={formData.ownerIdNumber}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.ownerIdNumber}
                  helperText={formSubmitted && errors.ownerIdNumber}
                  required
                  placeholder="e.g., 80-101500D87"
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '240px' }}>
                <TextField
                  fullWidth
                  label="Cell Number"
                  name="ownerCellNumber"
                  value={formData.ownerCellNumber}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.ownerCellNumber}
                  helperText={formSubmitted && errors.ownerCellNumber}
                  required
                  placeholder="e.g., +27 11 123 4567"
                  size="small"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 100%' }}>
                <TextField
                  fullWidth
                  label="Address"
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleChange}
                  error={formSubmitted && !!errors.ownerAddress}
                  helperText={formSubmitted && errors.ownerAddress}
                  required
                  multiline
                  rows={3}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 2: { // Documents
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Required Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Please upload the following required documents
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '200px' }}>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={formData.idPicture ? <CheckCircleIcon color="success" /> : <UploadIcon />}
                  sx={{ 
                    height: '56px',
                    borderColor: formData.idPicture ? '#4caf50' : undefined,
                    '&:hover': {
                      borderColor: formData.idPicture ? '#388e3c' : undefined,
                      backgroundColor: formData.idPicture ? 'rgba(76, 175, 80, 0.04)' : undefined
                    }
                  }}
                  color={formData.idPicture ? 'success' : 'primary'}
                >
                  {formData.idPicture ? 'ID Uploaded ✓' : 'Upload Owner ID'}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange('idPicture')}
                  />
                </Button>
                {formSubmitted && errors.idPicture && (
                  <FormHelperText error sx={{ ml: 1.5 }}>{errors.idPicture}</FormHelperText>
                )}
              </Box>
              
              <Box sx={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '200px' }}>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={formData.truckPicture ? <CheckCircleIcon color="success" /> : <UploadIcon />}
                  sx={{ 
                    height: '56px',
                    borderColor: formData.truckPicture ? '#4caf50' : undefined,
                    '&:hover': {
                      borderColor: formData.truckPicture ? '#388e3c' : undefined,
                      backgroundColor: formData.truckPicture ? 'rgba(76, 175, 80, 0.04)' : undefined
                    }
                  }}
                  color={formData.truckPicture ? 'success' : 'primary'}
                >
                  {formData.truckPicture ? 'Vehicle Photo Uploaded ✓' : 'Upload Vehicle Photo'}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange('truckPicture')}
                  />
                </Button>
                {formSubmitted && errors.truckPicture && (
                  <FormHelperText error sx={{ ml: 1.5 }}>{errors.truckPicture}</FormHelperText>
                )}
              </Box>
              
              <Box sx={{ flex: '1 1 calc(33.33% - 8px)', minWidth: '200px' }}>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={formData.registrationBook ? <CheckCircleIcon color="success" /> : <UploadIcon />}
                  sx={{ 
                    height: '56px',
                    borderColor: formData.registrationBook ? '#4caf50' : undefined,
                    '&:hover': {
                      borderColor: formData.registrationBook ? '#388e3c' : undefined,
                      backgroundColor: formData.registrationBook ? 'rgba(76, 175, 80, 0.04)' : undefined
                    }
                  }}
                  color={formData.registrationBook ? 'success' : 'primary'}
                >
                  {formData.registrationBook ? 'Car Registration Book Uploaded ✓' : 'UploadCar Registration Book '}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange('registrationBook')}
                  />
                </Button>
                {formSubmitted && errors.registrationBook && (
                  <FormHelperText error sx={{ ml: 1.5 }}>{errors.registrationBook}</FormHelperText>
                )}
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 3: { // Review Details
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Review Vehicle Details
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              Please review all the information before submitting
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '240px' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee' }}>
                  Vehicle Information
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Registration Number:
                    </Typography>
                    <Typography variant="body2">
                      {formData.regNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Vehicle Type:
                    </Typography>
                    <Typography variant="body2">
                      {formData.vehicleType}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Make:
                    </Typography>
                    <Typography variant="body2">
                      {formData.make}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Model:
                    </Typography>
                    <Typography variant="body2">
                      {formData.model}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Year:
                    </Typography>
                    <Typography variant="body2">
                      {formData.year}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Last Service Date:
                    </Typography>
                    <Typography variant="body2">
                      {formData.lastServiceDate?.format('DD/MM/YYYY') || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '240px' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee' }}>
                  Owner Information
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Owner Name:
                    </Typography>
                    <Typography variant="body2">
                      {formData.ownerName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      ID Number:
                    </Typography>
                    <Typography variant="body2">
                      {formData.ownerIdNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Cell Number:
                    </Typography>
                    <Typography variant="body2">
                      {formData.ownerCellNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', width: '140px' }}>
                      Address:
                    </Typography>
                    <Typography variant="body2">
                      {formData.ownerAddress}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 100%' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee' }}>
                  Documents
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 calc(33.33% - 12px)', minWidth: '200px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formData.idPicture ? 
                        <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} /> : 
                        <CancelIcon color="error" sx={{ mr: 1, fontSize: 20 }} />}
                      <Typography variant="body2">
                        ID Picture: {formData.idPicture ? 'Uploaded' : 'Not uploaded'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: '1 1 calc(33.33% - 12px)', minWidth: '200px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formData.truckPicture ? 
                        <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} /> : 
                        <CancelIcon color="error" sx={{ mr: 1, fontSize: 20 }} />}
                      <Typography variant="body2">
                        Vehicle Picture: {formData.truckPicture ? 'Uploaded' : 'Not uploaded'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: '1 1 calc(33.33% - 12px)', minWidth: '200px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {formData.registrationBook ? 
                        <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} /> : 
                        <CancelIcon color="error" sx={{ mr: 1, fontSize: 20 }} />}
                      <Typography variant="body2">
                        Registration Book: {formData.registrationBook ? 'Uploaded' : 'Not uploaded'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      }
      
      case 4: { // Confirmation
        return (
          <Box sx={{ spacing: 3, alignItems: "center" }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" align="center">
              Vehicle Registration Successful!
            </Typography>
            <Typography variant="body1" align="center">
              The vehicle has been successfully registered in the system.
            </Typography>
            <Typography variant="body1" align="center" fontWeight="bold">
              Reference Number: {referenceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
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

  // Main render function
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={loading ? undefined : handleClose}
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
            background: 'linear-gradient(135deg,rgb(5, 5, 68) 0%,rgb(5, 5, 68) 100%)',
            color: 'white',
            py: 2.5,
            px: 3,
            m: 0
          }}>

          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {activeStep === steps.length - 1 ? 'Registration Complete' : 'Vehicle Registration'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Register a new vehicle in the transport management system
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={loading}
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
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step content */}
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
                onClick={activeStep === steps.length - 2 ? handleSubmit : handleStepNext}
                disabled={loading}
                sx={{
                  bgcolor: activeStep === steps.length - 2 ? '#4caf50' : undefined,
                  '&:hover': {
                    bgcolor: activeStep === steps.length - 2 ? '#388e3c' : undefined
                  }
                }}
              >
                {activeStep === steps.length - 2 ? 'Submit' : 'Next'}
              </Button>
            </Fragment>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
 
      </Snackbar>
    </LocalizationProvider>
  );
}
