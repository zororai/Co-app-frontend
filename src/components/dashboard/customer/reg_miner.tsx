import * as React from 'react';
import { Box, Button, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, Snackbar, Alert, Stepper, Step, StepLabel } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';
import { useTheme } from '@mui/material/styles';

export interface RegMinerDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface RegMinerFormProps {
  onRefresh?: () => void;
  onStepChange?: (step: number) => void;
}

const RegMinerForm = React.forwardRef<{ handleNext: () => void; handleBack: () => void }, RegMinerFormProps>(({ onRefresh, onStepChange }, ref) => {
  // Success feedback (aligning with security company dialog style)
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Personal Info', 'ID Picture', 'Team Members', 'Review', 'Confirmation'];
  const [teamMembers, setTeamMembers] = React.useState([
    { name: '', surname: '', address: '', idNumber: '' }
  ]);
  const [form, setForm] = React.useState({
    name: '',
    surname: '',
    address: '',
    cell: '',
    nationId: '',
    position: 'Representatives',
    cooperative: '',
    idPicture: '',  // Will store base64 string
  });
  
  // State for form validation errors
  const [errors, setErrors] = React.useState({
    name: '',
    surname: '',
    address: '',
    cell: '',
    nationId: '',
    cooperative: '',
    idPicture: '',
    teamMembers: [''],
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {
      name: '',
      surname: '',
      address: '',
      cell: '',
      nationId: '',
      cooperative: '',
      idPicture: '',
      teamMembers: [''],
    };
    let isValid = true;

    // Validate main form fields
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
    if (!form.cell.trim()) {
      newErrors.cell = 'Cell number is required';
    } else if (!/^\d{10}$/.test(form.cell.trim())) {
      newErrors.cell = 'Invalid cell number format';
      isValid = false;
    }
    if (!form.nationId.trim()) {
      newErrors.nationId = 'National ID is required';
    } else if (!/^\d{2}-\d{6}[A-Z]\d{2}$/.test(form.nationId.trim())) {
      newErrors.nationId = 'Invalid National ID format (should be like 59-187654D49)';
      isValid = false;
    }
    if (!form.cooperative.trim()) {
      newErrors.cooperative = 'Cooperative/Syndicate name is required';
      isValid = false;
    }
    
    if (!form.idPicture) {
      newErrors.idPicture = 'ID Picture is required';
      isValid = false;
    }

    // Validate team members
    const teamErrors = teamMembers.map(member => {
      const memberErrors = [];
      if (!member.name.trim()) memberErrors.push('Name is required');
      if (!member.surname.trim()) memberErrors.push('Surname is required');

      return memberErrors.join(', ');
    });
    
    if (teamErrors.some(error => error !== '')) {
      newErrors.teamMembers = teamErrors;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | React.ChangeEvent<{ value: unknown; name?: string }>
  ) => {
    if ('target' in e && e.target) {
      const { name, value, files, type } = e.target as HTMLInputElement;
      if (type === 'file' && files && files[0]) {
        const file = files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            idPicture: 'Please select an image file'
          }));
          return;
        }

        // Reset error if previously set
        setErrors(prev => ({
          ...prev,
          idPicture: ''
        }));

        // Convert image to base64
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const base64String = reader.result as string;
          setForm(prev => ({
            ...prev,
            idPicture: base64String
          }));
        });
        reader.readAsDataURL(file);
      } else {
        setForm((prev) => ({
          ...prev,
          [name as string]: value,
        }));
      }
    } else if ('name' in e && 'value' in e) {
      // For Select component
      const { name, value } = e as { name?: string; value: unknown };
      setForm((prev) => ({
        ...prev,
        [name as string]: value,
      }));
    }
  };

  const handleTeamChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamMembers((prev) => {
      const updated = [...prev];
      (updated[idx] as any)[name] = value;
      return updated;
    });
  };

  const addTeamMember = () => {
    setTeamMembers((prev) => [...prev, { name: '', surname: '', address: '', idNumber: '' }]);
  };

  const validatePersonalInfo = () => {
    // Validate only personal info fields on step 0
    let isValid = true;
    const updatedErrors = { ...errors } as any;
    updatedErrors.name = '';
    updatedErrors.surname = '';
    updatedErrors.address = '';
    updatedErrors.cell = '';
    updatedErrors.nationId = '';
    updatedErrors.cooperative = '';

    if (!form.name.trim()) { updatedErrors.name = 'Name is required'; isValid = false; }
    if (!form.surname.trim()) { updatedErrors.surname = 'Surname is required'; isValid = false; }
    if (!form.address.trim()) { updatedErrors.address = 'Address is required'; isValid = false; }
    if (!form.cell.trim()) { updatedErrors.cell = 'Cell number is required'; isValid = false; }
    else if (!/^\d{10}$/.test(form.cell.trim())) { updatedErrors.cell = 'Invalid cell number format'; isValid = false; }
    if (!form.nationId.trim()) { updatedErrors.nationId = 'National ID is required'; isValid = false; }
    else if (!/^\d{2}-\d{6}[A-Z]\d{2}$/.test(form.nationId.trim())) { updatedErrors.nationId = 'Invalid National ID format (should be like 59-187654D49)'; isValid = false; }
    if (!form.cooperative.trim()) { updatedErrors.cooperative = 'Cooperative/Syndicate name is required'; isValid = false; }

    setErrors((prev) => ({ ...prev, ...updatedErrors }));
    return isValid;
  };

  const validateIdPicture = () => {
    if (!form.idPicture) {
      setErrors(prev => ({ ...prev, idPicture: 'ID Picture is required' }));
      return false;
    }
    return true;
  };

  const validateTeamMembers = () => {
    const teamErrors = teamMembers.map(member => {
      const errs: string[] = [];
      if (!member.name.trim()) errs.push('Name');
      if (!member.surname.trim()) errs.push('Surname');
      if (!member.idNumber.trim()) errs.push('ID Number');
      return errs.length ? errs.join(', ') : '';
    });
    if (teamErrors.some(e => e !== '')) {
      setErrors(prev => ({ ...prev, teamMembers: teamErrors }));
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    // Per-step validation
    if (activeStep === 0 && !validatePersonalInfo()) return;
    if (activeStep === 1 && !validateIdPicture()) return;
    if (activeStep === 2 && !validateTeamMembers()) return;

    if (activeStep === 3) {
      // Submit on review step
      // synthesize a submit by calling handleSubmit via a fake event
      await handleSubmit(new Event('submit') as any);
      const newStep = activeStep + 1;
      setActiveStep(newStep);
      if (onStepChange) onStepChange(newStep);
      return;
    }

    const newStep = activeStep + 1;
    setActiveStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  const handleBack = () => {
    const newStep = Math.max(0, activeStep - 1);
    setActiveStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };
  
  // Expose navigation functions to parent
  React.useImperativeHandle(ref, () => ({
    handleNext,
    handleBack
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | Event) => {
    if (e && 'preventDefault' in e) {
      (e as React.FormEvent<HTMLFormElement>).preventDefault();
    }
    
    // Validate form before submission
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      const { error, success } = await authClient.registerMiner({
        ...form,
        teamMembers: teamMembers.map(member => ({
          name: member.name,
          surname: member.surname,
          address: member.address,
          idNumber: member.idNumber,
        })),
        cooperativename: ''
      });

      if (error) {
        setErrors(prev => ({
          ...prev,
          submit: error
        }));
        console.error('Registration failed:', error);
        return;
      }

      if (success) {
        // Show success snackbar then advance to Confirmation step
        setShowSuccessAlert(true);
        // Move to confirmation
        setActiveStep(4);
        // Optionally refresh after a small delay
        setTimeout(() => {
          if (onRefresh) {
            onRefresh();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 900 }}>
      {/* Success Alert */}
      <Snackbar
        open={showSuccessAlert}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Registration successful!
        </Alert>
      </Snackbar>

      {/* Stepper moved to fixed header */}

      {/* Step Content */}
      {activeStep === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>Name</InputLabel>
            <TextField
              name="name"
              placeholder="Please enter name"
              fullWidth
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>Surname</InputLabel>
            <TextField
              name="surname"
              placeholder="Add your surname"
              fullWidth
              value={form.surname}
              onChange={handleChange}
              error={!!errors.surname}
              helperText={errors.surname}
              required
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>Address</InputLabel>
            <TextField
              name="address"
              placeholder="Add your address"
              fullWidth
              value={form.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              required
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>Cell Number</InputLabel>
            <TextField
              name="cell"
              placeholder="Add your cell number (10 digits)"
              fullWidth
              value={form.cell}
              onChange={handleChange}
              error={!!errors.cell}
              helperText={errors.cell}
              required
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>National ID Number</InputLabel>
            <TextField
              name="nationId"
              placeholder="Add your national ID (e.g., 59-187654D49)"
              fullWidth
              value={form.nationId}
              onChange={handleChange}
              error={!!errors.nationId}
              helperText={errors.nationId}
              required
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>Position</InputLabel>
            <Select
              name="position"
              fullWidth
              value={form.position}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  [e.target.name as string]: e.target.value,
                }));
              }}
            >
              <MenuItem value="Representatives">Representatives</MenuItem>
              <MenuItem value="Owner">Owner</MenuItem>
              <MenuItem value="Member">Member</MenuItem>
            </Select>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>Name Of Cooperative/Syndicate</InputLabel>
            <TextField
              name="cooperative"
              placeholder="Add name of syndicate"
              fullWidth
              value={form.cooperative}
              onChange={handleChange}
              error={!!errors.cooperative}
              helperText={errors.cooperative}
              required
            />
          </Box>
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>ID Picture</InputLabel>
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                color={errors.idPicture ? 'error' : 'primary'}
              >
                {form.idPicture ? 'Change Image' : 'Choose Image'}
                <input
                  type="file"
                  name="idPicture"
                  hidden
                  onChange={handleChange}
                  accept="image/*"
                />
              </Button>
              {errors.idPicture && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.idPicture}
                </Typography>
              )}
              {form.idPicture && (
                <>
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'success.main' }}>
                    Image selected ✓
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      overflow: 'hidden',
                      maxWidth: '100%',
                      maxHeight: '200px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={form.idPicture}
                      alt="ID Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Team Members Step */}
      {activeStep === 2 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Add Team Members</Typography>
          <IconButton color="primary" onClick={addTeamMember} sx={{ mb: 2 }}>
            <AddCircleIcon />
          </IconButton>
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, maxWidth: 700 }}>
            {teamMembers.map((member, idx) => (
              <Box key={idx} sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 2 }}>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    name="name"
                    label="Name"
                    fullWidth
                    value={member.name}
                    onChange={(e) => handleTeamChange(idx, e)}
                    error={!!errors.teamMembers[idx] && errors.teamMembers[idx].includes('Name')}
                    helperText={errors.teamMembers[idx] && errors.teamMembers[idx].includes('Name') ? 'Name is required' : ''}
                    required
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    name="surname"
                    label="Surname"
                    fullWidth
                    value={member.surname}
                    onChange={(e) => handleTeamChange(idx, e)}
                    error={!!errors.teamMembers[idx] && errors.teamMembers[idx].includes('Surname')}
                    helperText={errors.teamMembers[idx] && errors.teamMembers[idx].includes('Surname') ? 'Surname is required' : ''}
                    required
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    name="address"
                    label="Address"
                    fullWidth
                    value={member.address}
                    onChange={(e) => handleTeamChange(idx, e)}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    name="idNumber"
                    label="ID Number"
                    fullWidth
                    value={member.idNumber}
                    onChange={(e) => handleTeamChange(idx, e)}
                    error={!!errors.teamMembers[idx] && errors.teamMembers[idx].includes('ID Number')}
                    helperText={errors.teamMembers[idx] && errors.teamMembers[idx].includes('ID Number') ? 'ID Number is required' : ''}
                    required
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Review Step */}
      {activeStep === 3 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Review Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>Personal Information</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2"><strong>Name:</strong> {form.name} {form.surname}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {form.address}</Typography>
                <Typography variant="body2"><strong>Cell:</strong> {form.cell}</Typography>
                <Typography variant="body2"><strong>National ID:</strong> {form.nationId}</Typography>
                <Typography variant="body2"><strong>Position:</strong> {form.position}</Typography>
                <Typography variant="body2"><strong>Cooperative:</strong> {form.cooperative}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>ID Picture</Typography>
              {form.idPicture ? (
                <Box sx={{ mt: 1, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, maxWidth: 300 }}>
                  <img src={form.idPicture} alt="ID Preview" style={{ maxWidth: '100%', objectFit: 'contain' }} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No image selected</Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Confirmation Step */}
      {activeStep === 4 && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
            Miner Submitted Successfully!
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Your registration has been received and is pending approval.
          </Typography>
        </Box>
      )}

      {/* Navigation buttons moved to fixed bottom action bar */}
    </Box>
  );
});

export function RegMinerDialog({ open, onClose, onRefresh }: RegMinerDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Personal Info', 'ID Picture', 'Team Members', 'Review', 'Confirmation'];
  const formRef = React.useRef<{ handleNext: () => void; handleBack: () => void }>(null);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  
  const handleNext = () => {
    if (formRef.current?.handleNext) {
      formRef.current.handleNext();
    }
  };

  const handleBack = () => {
    if (formRef.current?.handleBack) {
      formRef.current.handleBack();
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'white' }}>
          Syndicate Miner Registration
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Fixed Stepper Section */}
      <Box sx={{ width: '100%', px: 3, py: 2, background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Register a new syndicate miner with personal information, ID picture, and team members
        </Typography>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{
            '& .MuiStepIcon-root': {
              color: '#d1d5db',
              '&.Mui-active': { color: theme.palette.secondary.main },
              '&.Mui-completed': { color: theme.palette.secondary.main },
            },
            '& .MuiStepLabel-label': {
              '&.Mui-active': { color: theme.palette.secondary.main, fontWeight: 600 },
              '&.Mui-completed': { color: theme.palette.secondary.main, fontWeight: 500 },
            },
            '& .MuiStepConnector-line': { borderColor: '#d1d5db' },
            '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': { borderColor: theme.palette.secondary.main },
            '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: theme.palette.secondary.main },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent sx={{ px: 3, py: 2, maxHeight: '60vh', overflow: 'auto' }}>
        <RegMinerForm 
          onRefresh={onRefresh} 
          onStepChange={handleStepChange}
          ref={formRef}
        />
      </DialogContent>
      
      {/* Fixed Bottom Action Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, background: '#fafafa', borderTop: '1px solid #eaeaea' }}>
        {activeStep === steps.length - 1 ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                color: '#fff',
                '&:hover': { bgcolor: theme.palette.secondary.dark } 
              }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ 
                borderColor: theme.palette.secondary.main, 
                color: theme.palette.secondary.main, 
                '&:hover': { 
                  borderColor: theme.palette.secondary.dark, 
                  bgcolor: 'rgba(50, 56, 62, 0.04)' 
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                color: '#fff',
                '&:hover': { bgcolor: theme.palette.secondary.dark } 
              }}
            >
              {activeStep === steps.length - 2 ? 'Submit' : 'Next'}
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  );
}
