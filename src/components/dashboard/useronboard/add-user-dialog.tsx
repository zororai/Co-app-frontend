'use client';

import * as React from 'react';
import { Fragment } from 'react';
import { useRouter } from 'next/navigation';
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
import Switch from '@mui/material/Switch';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { paths } from '@/paths';
import { navItems } from '../layout/config';
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
  'Basic Information',
  'Role & Position',
  'Permissions',
  'Additional Details',
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

export function AddUserDialog({ open, onClose, onRefresh }: AddUserDialogProps): React.JSX.Element {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [tempPassword, setTempPassword] = React.useState('••••••••••');
  
  // Permissions state
  const [permissions, setPermissions] = React.useState<Record<string, boolean>>({});
  
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
    emergencyContactPhone: ''
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

  // Handle permission toggle for individual items
  const handlePermissionToggle = (permissionKey: string) => {
    setPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }));
  };

  // Handle parent toggle - toggles all child items
  const handleParentToggle = (parentItem: any) => {
    const isParentEnabled = !permissions[parentItem.key];
    const updatedPermissions = { ...permissions };
    
    // Toggle the parent
    updatedPermissions[parentItem.key] = isParentEnabled;
    
    // If parent has items, toggle all of them
    if (parentItem.items && parentItem.items.length > 0) {
      parentItem.items.forEach((subItem: any) => {
        updatedPermissions[subItem.key] = isParentEnabled;
      });
    }
    
    setPermissions(updatedPermissions);
  };

  // Handle next step
  const handleNext = () => {
    // For the first step, validate required fields
    if (activeStep === 0) {
      setFormSubmitted(true);
      
      // Check required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !validateEmail(formData.email) ||
        !formData.idNumber
      ) {
        return; // Don't proceed if validation fails
      }
    }
    
    // For the second step, validate role and position
    if (activeStep === 1) {
      setFormSubmitted(true);
      
      if (
        !formData.role ||
        !formData.position ||
        !formData.location
      ) {
        return; // Don't proceed if validation fails
      }
    }
    
    // For the permissions step (step 2), ensure at least one permission is selected
    if (activeStep === 2) {
      if (Object.values(permissions).every(p => !p)) {
        setError('Please select at least one permission');
        return;
      }
      setError(null);
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
      // Call API to create user with permissions
      const response = await authClient.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        idNumber: formData.idNumber,
        address: formData.address || '',
        role: formData.role,
        location: formData.location,
        position: formData.position,
        isActive: formData.isActive,
        notes: formData.notes || '',
        startDate: formData.startDate ? formData.startDate.format('YYYY-MM-DD') : undefined,
        emergencyContactName: formData.emergencyContactName || '',
        emergencyContactPhone: formData.emergencyContactPhone || '',
        permissions: permissions // Send the permissions object as is
      });
      
      // If API indicates failure, show error and stop (do not advance/refresh)
      if (!response || response.success === false) {
        setError(response?.error || 'Failed to create user');
        return;
      }
      
      // Generate temporary password and reference number
      const tempPass = '0000';
      setTempPassword(tempPass);
      setReferenceNumber(`USR-${Math.floor(Math.random() * 10_000).toString().padStart(4, '0')}`);
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }

      // Revalidate and refresh the current route so lists reflect the new user
      router.refresh();
    } catch (error_) {
      console.error('Error creating user:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    // Reset form state
    setActiveStep(0);
    setFormData({
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
      startDate: null,
      emergencyContactName: '',
      emergencyContactPhone: ''
    });
    setValidationErrors({});
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
    setTempPassword('••••••••••');
    setShowPassword(false);
    setFormSubmitted(false);
    setPermissions({});
    
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
          Add New User
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a new user account with role-based access permissions.
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
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  placeholder="Enter first name"
                  error={formSubmitted && !formData.firstName}
                  helperText={formSubmitted && !formData.firstName ? 'First name is required' : ''}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  placeholder="Enter last name"
                  error={formSubmitted && !formData.lastName}
                  helperText={formSubmitted && !formData.lastName ? 'Last name is required' : ''}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="user@example.com"
                  error={!!(formSubmitted && (!formData.email || !validateEmail(formData.email)))}
                  helperText={
                    formSubmitted && !formData.email
                      ? 'Email is required'
                      : formSubmitted && !validateEmail(formData.email)
                      ? 'Invalid email format'
                      : 'This will be used as the username'
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="+27 11 123 4567"
                  error={!!(formSubmitted && formData.phone && !validatePhone(formData.phone))}
                  helperText={formSubmitted && formData.phone && !validatePhone(formData.phone) ? 'Invalid phone format' : ''}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ID Number"
                  value={formData.idNumber}
                  onChange={handleChange('idNumber')}
                  placeholder="Enter ID number"
                  error={formSubmitted && !formData.idNumber}
                  helperText={formSubmitted && !formData.idNumber ? 'ID Number is required' : ''}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  placeholder="Enter physical address"
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={handleDateChange('startDate')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal'
                      }
                    }}
                  />
                </LocalizationProvider>
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

        {/* Step 2: Role and Position */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Role & Position
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && !formData.role}
                  margin="normal"
                >
                  <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                    Role *
                  </Typography>
                  <Select
                    displayEmpty
                    value={formData.role}
                    onChange={handleSelectChange('role')}
                    renderValue={
                      formData.role === "" 
                        ? () => <Typography color="text.secondary">Select user role</Typography> 
                        : undefined
                    }
                  >
                    {roleOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && !formData.role && (
                    <FormHelperText>Role is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && !formData.position}
                  margin="normal"
                >
                  <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                    Position *
                  </Typography>
                  <Select
                    displayEmpty
                    value={formData.position}
                    onChange={handleSelectChange('position')}
                    renderValue={
                      formData.position === "" 
                        ? () => <Typography color="text.secondary">Select user position</Typography> 
                        : undefined
                    }
                  >
                    {positionOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && !formData.position && (
                    <FormHelperText>Position is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && !formData.location}
                  margin="normal"
                >
                  <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                    Location *
                  </Typography>
                  <Select
                    displayEmpty
                    value={formData.location}
                    onChange={handleSelectChange('location')}
                    renderValue={
                      formData.location === "" 
                        ? () => <Typography color="text.secondary">Select user location</Typography> 
                        : undefined
                    }
                  >
                    {locationOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && !formData.location && (
                    <FormHelperText>Location is required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>Active Status</Typography>
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                </Box>
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

        {/* Step 3: Permissions */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              User Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the permissions to grant to this user
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 2 }}>
              {navItems.map((item) => (
                <Box key={item.key} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch
                      checked={!!permissions[item.key]}
                      onChange={() => handleParentToggle(item)}
                      inputProps={{ 'aria-label': `Toggle ${item.title} permission` }}
                    />
                    <Typography fontWeight="bold">{item.title}</Typography>
                  </Box>
                  {item.items && (
                    <Box sx={{ ml: 4, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {item.items.map((subItem) => (
                        <Box key={subItem.key} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Switch
                            checked={!!permissions[subItem.key]}
                            onChange={() => handlePermissionToggle(subItem.key)}
                            inputProps={{ 'aria-label': `Toggle ${subItem.title} permission` }}
                            size="small"
                          />
                          <Typography variant="body2">{subItem.title}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
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

        {/* Step 4: Additional Details */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  placeholder="Additional notes about this user..."
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleChange('emergencyContactName')}
                  placeholder="Emergency contact person"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange('emergencyContactPhone')}
                  placeholder="Emergency contact number"
                  error={!!(formSubmitted && formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone))}
                  helperText={formSubmitted && formData.emergencyContactPhone && !validatePhone(formData.emergencyContactPhone) ? 'Invalid phone format' : ''}
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
        
        {/* Step 5: Review */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review User Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the information before creating the user account.
            </Typography>
            
            {/* Permissions Review Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Permissions
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1
              }}>
                {Object.entries(permissions)
                  .filter(([_, isSelected]) => isSelected)
                  .map(([permission]) => (
                    <Chip 
                      key={permission} 
                      label={permission} 
                      color="primary"
                      size="small"
                      sx={{ 
                        mb: 1,
                        '& .MuiChip-label': {
                          px: 1,
                          fontSize: '0.75rem'
                        }
                      }}
                    />
                  ))}
                {Object.values(permissions).every(p => !p) && (
                  <Typography variant="body2" color="text.secondary">
                    No permissions selected
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.firstName} {formData.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.phone || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">ID Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.idNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {roleOptions.find(option => option.value === formData.role)?.label || formData.role}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Position</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {positionOptions.find(option => option.value === formData.position)?.label || formData.position}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {locationOptions.find(option => option.value === formData.location)?.label || formData.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.startDate ? formData.startDate.format('DD/MM/YYYY') : 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.address || 'Not provided'}
                  </Typography>
                </Grid>
                {formData.emergencyContactName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Emergency Contact</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formData.emergencyContactName}
                    </Typography>
                  </Grid>
                )}
                {formData.emergencyContactPhone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Emergency Phone</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formData.emergencyContactPhone}
                    </Typography>
                  </Grid>
                )}
                {formData.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formData.notes}
                    </Typography>
                  </Grid>
                )}
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
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 6: Confirmation */}
        {activeStep === 5 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                User Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The user account has been created. Here is the temporary password:
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
                Temporary Password
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {showPassword ? tempPassword : '••••••••••'}
                </Typography>
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
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <span style={{ marginRight: '8px' }}>⚠️</span> Important:
              </Typography>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    This password will only be shown once
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    Copy and share it securely with the user
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    The user will be required to change it on first login
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    A welcome email has been sent to {formData.email}
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