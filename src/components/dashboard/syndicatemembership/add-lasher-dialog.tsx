'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  InputLabel,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';
import QRCode from 'qrcode';

interface AddLasherDialogProps {
  open: boolean;
  onClose: () => void;
  minerId: string | null;
  onSuccess?: () => void;
}

export function AddLasherDialog({ open, onClose, minerId, onSuccess }: AddLasherDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const steps = ['Personal Details', 'Review', 'ID Card'];
  
  // Form state
  const [form, setForm] = React.useState({
    name: '',
    surname: '',
    address: '',
    cellNumber: '',
    idNumber: '',
    picture: '',
    qrcode: '',
    lasherId: '',
  });

  // Error state
  const [errors, setErrors] = React.useState({
    name: '',
    surname: '',
    address: '',
    cellNumber: '',
    idNumber: '',
    picture: '',
    submit: '',
  });

  // Generate unique lasher ID and QR code when dialog opens
  React.useEffect(() => {
    if (open && !form.lasherId) {
      const generateId = async () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const lasherId = `LASHER-${timestamp}${random}`;
        
        try {
          const qrcodeData = await QRCode.toDataURL(lasherId, {
            width: 300,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          
          setForm(prev => ({
            ...prev,
            lasherId,
            qrcode: qrcodeData,
          }));
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      };
      
      generateId();
    }
  }, [open]);

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setForm({
        name: '',
        surname: '',
        address: '',
        cellNumber: '',
        idNumber: '',
        picture: '',
        qrcode: '',
        lasherId: '',
      });
      setErrors({
        name: '',
        surname: '',
        address: '',
        cellNumber: '',
        idNumber: '',
        picture: '',
        submit: '',
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Zimbabwean ID number format
  const validateZimbabweanID = (idNumber: string): string | null => {
    const cleanId = idNumber.replace(/[\s-]/g, '');
    
    if (cleanId.length !== 11) {
      return 'ID number must be exactly 11 characters';
    }
    
    const idPattern = /^\d{8}[A-Za-z]\d{2}$/;
    if (!idPattern.test(cleanId)) {
      return 'Invalid format. Expected: XX-XXXXXXDXX (e.g., 12-234732D49)';
    }
    
    return null;
  };

  // Validate phone number (10 digits)
  const validatePhoneNumber = (phone: string): string | null => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return null;
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, picture: 'Image size must be less than 5MB' }));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, picture: 'Please upload a valid image file' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, picture: reader.result as string }));
        setErrors(prev => ({ ...prev, picture: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      surname: '',
      address: '',
      cellNumber: '',
      idNumber: '',
      picture: '',
      submit: '',
    };

    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!form.surname.trim()) {
      newErrors.surname = 'Surname is required';
      isValid = false;
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    const phoneError = validatePhoneNumber(form.cellNumber);
    if (phoneError) {
      newErrors.cellNumber = phoneError;
      isValid = false;
    }

    const idError = validateZimbabweanID(form.idNumber);
    if (idError) {
      newErrors.idNumber = idError;
      isValid = false;
    }

    if (!form.picture) {
      newErrors.picture = 'Photo is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate before moving to review
      if (validateForm()) {
        setActiveStep(prev => prev + 1);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!minerId) {
      setErrors(prev => ({ ...prev, submit: 'Miner ID is required' }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      const result = await authClient.addTeamMember(minerId, {
        name: form.name,
        surname: form.surname,
        qrcode: form.qrcode,
        cellNumber: form.cellNumber,
        picture: form.picture,
        idNumber: form.idNumber,
        address: form.address,
      });

      if (result.success) {
        setShowSuccessAlert(true);
        setActiveStep(2); // Move to ID card step
        
        // Call onSuccess callback to refresh the table
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrors(prev => ({ ...prev, submit: result.error || 'Failed to add lasher' }));
      }
    } catch (error) {
      console.error('Error adding lasher:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error instanceof Error ? error.message : 'An error occurred' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download ID card as image
  const handleDownloadID = () => {
    const idCard = document.getElementById('lasher-id-card');
    if (!idCard) return;

    // Use html2canvas or similar library in production
    // For now, just trigger print
    window.print();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: theme.palette.secondary.main,
            color: 'white',
            p: 2,
            fontWeight: 600,
          }}
        >
          Add New Lasher
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box sx={{ px: 3, pt: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          {/* Step 0: Personal Details */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <InputLabel required>Name</InputLabel>
                <TextField
                  name="name"
                  placeholder="Enter name"
                  fullWidth
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Box>

              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <InputLabel required>Surname</InputLabel>
                <TextField
                  name="surname"
                  placeholder="Enter surname"
                  fullWidth
                  value={form.surname}
                  onChange={handleChange}
                  error={!!errors.surname}
                  helperText={errors.surname}
                />
              </Box>

              <Box sx={{ width: '100%', px: 1.5, mb: 2 }}>
                <InputLabel required>Address</InputLabel>
                <TextField
                  name="address"
                  placeholder="Enter address"
                  fullWidth
                  multiline
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Box>

              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <InputLabel required>National ID Number</InputLabel>
                <TextField
                  name="idNumber"
                  placeholder="12-234732D49"
                  fullWidth
                  value={form.idNumber}
                  onChange={handleChange}
                  error={!!errors.idNumber}
                  helperText={errors.idNumber}
                />
              </Box>

              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5, mb: 2 }}>
                <InputLabel required>Phone Number</InputLabel>
                <TextField
                  name="cellNumber"
                  placeholder="0718463728"
                  fullWidth
                  value={form.cellNumber}
                  onChange={handleChange}
                  error={!!errors.cellNumber}
                  helperText={errors.cellNumber}
                />
              </Box>

              <Box sx={{ width: '100%', px: 1.5, mb: 2 }}>
                <InputLabel required>Photo</InputLabel>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{ 
                    py: 6, 
                    borderStyle: 'dashed',
                    borderColor: errors.picture ? 'error.main' : 'divider',
                  }}
                >
                  {form.picture ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        component="img"
                        src={form.picture}
                        alt="Preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          mb: 1,
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="body2">Click to change photo</Typography>
                    </Box>
                  ) : (
                    <Typography>Click to upload photo</Typography>
                  )}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {errors.picture && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.picture}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Step 1: Review */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main }}>
                Review Information
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.name} {form.surname}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      National ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.idNumber}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      Phone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.cellNumber}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {form.address}
                    </Typography>
                  </CardContent>
                </Card>

                {form.picture && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                        Photo
                      </Typography>
                      <Box
                        component="img"
                        src={form.picture}
                        alt="Lasher"
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 2,
                        }}
                      />
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Box>
          )}

          {/* Step 2: ID Card */}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main }}>
                Lasher ID Card
              </Typography>

              {/* ID Card Preview - Matching the provided image */}
              <Card
                id="lasher-id-card"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  border: '3px solid #000',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '1px solid #ccc', pb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                      LASHER ID
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                      trust
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                    {/* Photo */}
                    <Box
                      sx={{
                        width: 120,
                        height: 140,
                        flexShrink: 0,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      {form.picture && (
                        <Box
                          component="img"
                          src={form.picture}
                          alt="Lasher"
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </Box>

                    {/* Details */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {form.name} {form.surname}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>ID:</strong> {form.lasherId}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>National ID:</strong> {form.idNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Phone:</strong> {form.cellNumber}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Address:</strong> {form.address}
                      </Typography>
                    </Box>

                    {/* QR Code */}
                    {form.qrcode && (
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          flexShrink: 0,
                          border: '2px solid #000',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          component="img"
                          src={form.qrcode}
                          alt="QR Code"
                          sx={{
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Footer */}
                  <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #ccc' }}>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      This ID must be carried at all times
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Download Button */}
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadID}
                sx={{
                  mt: 3,
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': { bgcolor: theme.palette.secondary.dark },
                }}
              >
                Download ID Card
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: 'background.default' }}>
          {activeStep > 0 && activeStep < 2 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          
          {activeStep === 0 && (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                bgcolor: theme.palette.secondary.main,
                '&:hover': { bgcolor: theme.palette.secondary.dark },
              }}
            >
              Next: Review
            </Button>
          )}

          {activeStep === 1 && (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                bgcolor: theme.palette.secondary.main,
                '&:hover': { bgcolor: theme.palette.secondary.dark },
              }}
            >
              {isSubmitting ? 'Adding Lasher...' : 'Add Lasher'}
            </Button>
          )}

          {activeStep === 2 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleDownloadIdCard}
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': { 
                    borderColor: theme.palette.secondary.dark,
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                Download ID Card
              </Button>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': { bgcolor: theme.palette.secondary.dark },
                }}
              >
                Done
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={4000}
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Lasher added successfully! You can now download the ID card.
        </Alert>
      </Snackbar>
    </>
  );
}
