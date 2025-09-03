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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { CheckCircle } from '@mui/icons-material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddUserDialog({ open, onClose }: AddUserDialogProps): React.JSX.Element {
  const [step, setStep] = React.useState(1);
  const [userData, setUserData] = React.useState({
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
    notes: ''
  });
  const [tempPassword, setTempPassword] = React.useState('••••••••••');
  const [showPassword, setShowPassword] = React.useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName': {
        return value.trim() === '' ? 'This field is required' : '';
      }
      case 'email': {
        if (value.trim() === '') return 'Email is required';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value) ? '' : 'Invalid email format';
      }
      case 'phone': {
        if (value.trim() === '') return '';
        const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
        return phoneRegex.test(value) ? '' : 'Invalid phone format';
      }
      case 'idNumber': {
        return value.trim() === '' ? 'ID Number is required' : '';
      }
      case 'role':
      case 'position':
      case 'location': {
        return value === '' ? 'This field is required' : '';
      }
      default: {
        return '';
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Validate the field
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Validate the field
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData(prev => ({ ...prev, isActive: e.target.checked }));
  };

  const validateStep = (currentStep: number): boolean => {
    let isValid = true;
    const newValidationErrors = { ...validationErrors };
    
    if (currentStep === 1) {
      // Validate basic information fields
      const fieldsToValidate = ['firstName', 'lastName', 'email', 'idNumber'];
      for (const field of fieldsToValidate) {
        const error = validateField(field, userData[field as keyof typeof userData] as string);
        newValidationErrors[field as keyof typeof validationErrors] = error;
        if (error) isValid = false;
      }
      
      // Validate phone if provided
      if (userData.phone) {
        const phoneError = validateField('phone', userData.phone);
        newValidationErrors.phone = phoneError;
        if (phoneError) isValid = false;
      }
    } else if (currentStep === 2) {
      // Validate role and location fields
      const fieldsToValidate = ['role', 'position', 'location'];
      for (const field of fieldsToValidate) {
        const error = validateField(field, userData[field as keyof typeof userData] as string);
        newValidationErrors[field as keyof typeof validationErrors] = error;
        if (error) isValid = false;
      }
    }
    
    setValidationErrors(newValidationErrors);
    return isValid;
  };

  const handleNext = () => {
    if (step < 4) {
      const isValid = validateStep(step);
      if (isValid) {
        setStep(step + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    role: '',
    position: '',
    location: ''
  });

  const handleCreate = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Call the API to create a new user
      const result = await authClient.createUser(userData);
      
      if (result.success) {
        // Set the password from the API response
        setTempPassword(result.password);
        // Move to success step
        setStep(4);
      } else {
        // Show error message
        setError(result.error || 'Failed to create user');
      }
    } catch (error_) {
      setError('An unexpected error occurred');
      console.error('Error creating user:', error_);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setStep(1);
    setUserData({
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
      notes: ''
    });
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
      maxWidth="sm" 
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
      
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a new user account with role-based access permissions.
        </Typography>
        
        {/* Progress Steps */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          {[1, 2, 3, 4].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: step >= stepNumber ? '#3f51b5' : '#e0e0e0',
                  color: '#fff',
                  fontWeight: 'bold',
                  zIndex: 1
                }}
              >
                {step > stepNumber ? <CheckCircle fontSize="small" /> : stepNumber}
              </Box>
              {stepNumber < 4 && (
                <Box
                  sx={{
                    height: 1,
                    bgcolor: step > stepNumber ? '#3f51b5' : '#e0e0e0',
                    width: '60px',
                    alignSelf: 'center'
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                />
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                />
              </Box>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="user@mine.com"
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                This will be used as the username
              </Typography>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                placeholder="+27 11 123 4567"
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
                sx={{ mb: 3 }}
              />
              <TextField
                required
                fullWidth
                label="ID Number"
                name="idNumber"
                value={userData.idNumber}
                onChange={handleChange}
                placeholder="Enter ID number"
                error={!!validationErrors.idNumber}
                helperText={validationErrors.idNumber}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                name="address"
                value={userData.address}
                onChange={handleChange}
                placeholder="Enter physical address"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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

        {/* Step 2: Role and Location */}
        {step === 2 && (
          <Box>
            <FormControl fullWidth required sx={{ mb: 3 }} error={!!validationErrors.role}>
              <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                Role *
              </Typography>
              <Select
                displayEmpty
                name="role"
                value={userData.role}
                onChange={handleSelectChange as any}
                renderValue={
                  userData.role === "" 
                    ? () => <Typography color="text.secondary">Select user role</Typography> 
                    : undefined
                }
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="she_officer">SHE Officer</MenuItem>
                <MenuItem value="mine_manager">Mine Manager</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth required sx={{ mb: 3 }} error={!!validationErrors.position}>
              <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                Position *
              </Typography>
              <Select
                displayEmpty
                name="position"
                value={userData.position}
                onChange={handleSelectChange as any}
                renderValue={
                  userData.position === "" 
                    ? () => <Typography color="text.secondary">Select position</Typography> 
                    : undefined
                }
              >
                <MenuItem value="general_manager">General Manager</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
                <MenuItem value="operator">Operator</MenuItem>
                <MenuItem value="engineer">Engineer</MenuItem>
                <MenuItem value="safety_officer">Safety Officer</MenuItem>
                <MenuItem value="administrator">Administrator</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <Typography variant="body2" component="label" sx={{ mb: 1, fontWeight: 500 }}>
                Location / Section *
              </Typography>
              <Select
                displayEmpty
                name="location"
                value={userData.location}
                onChange={handleSelectChange as any}
                renderValue={
                  userData.location === "" 
                    ? () => <Typography color="text.secondary">Select location</Typography> 
                    : undefined
                }
              >
                <MenuItem value="main_shaft">Main Shaft</MenuItem>
                <MenuItem value="processing_plant">Processing Plant</MenuItem>
                <MenuItem value="security_office">Security Office</MenuItem>
                <MenuItem value="head_office">Head Office</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>Active Status</Typography>
              <Switch
                checked={userData.isActive}
                onChange={handleSwitchChange}
                color="primary"
              />
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes (Optional)"
              name="notes"
              value={userData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this user..."
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                sx={{ borderColor: '#121212', color: '#121212' }}
              >
                Previous
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

        {/* Step 3: Review */}
        {step === 3 && (
          <Box>
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Review User Details</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please review the information before creating the user account.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.firstName} {userData.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.phone}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">ID Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.idNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.role === 'she_officer' ? 'SHE Officer' : 
                     userData.role === 'mine_manager' ? 'Mine Manager' :
                     userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Position</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.position === 'general_manager' ? 'General Manager' :
                     userData.position === 'safety_officer' ? 'Safety Officer' :
                     userData.position.charAt(0).toUpperCase() + userData.position.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.location === 'main_shaft' ? 'Main Shaft' :
                     userData.location === 'processing_plant' ? 'Processing Plant' :
                     userData.location === 'security_office' ? 'Security Office' :
                     userData.location === 'head_office' ? 'Head Office' : userData.location}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {userData.address}
                  </Typography>
                </Grid>
                {userData.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Notes</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {userData.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            {error && (
              <Box sx={{ mb: 2, p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                sx={{ borderColor: '#121212', color: '#121212' }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleCreate}
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

        {/* Step 4: Success */}
        {step === 4 && (
          <Box>
            <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
              User Created Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The user account has been created. Here is the temporary password:
            </Typography>
            
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
                    A welcome email has been sent to {userData.email}
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
