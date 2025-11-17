import * as React from 'react';
import { Box, Button, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent, Snackbar, Alert, Stepper, Step, StepLabel, Card, CardContent } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { authClient } from '@/lib/auth/client';
import { useTheme } from '@mui/material/styles';
import QRCode from 'qrcode';

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
  const steps = ['Personal Info', 'ID Picture', 'Team Members', 'Team Member IDs', 'Review', 'Confirmation'];
  const [teamMembers, setTeamMembers] = React.useState([
    { id: '', name: '', surname: '', address: '', idNumber: '', cellNumber: '', picture: '', qrcode: '' }
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

  // Initialize first team member with ID and QR code
  React.useEffect(() => {
    const initializeFirstMember = async () => {
      if (teamMembers.length === 1 && !teamMembers[0].id) {
        const newId = generateTeamMemberId();
        const qrCodeData = await generateQRCode(newId);
        setTeamMembers([{
          id: newId,
          name: '',
          surname: '',
          address: '',
          idNumber: '',
          cellNumber: '',
          picture: '',
          qrcode: qrCodeData
        }]);
      }
    };
    initializeFirstMember();
  }, []);

  // Validate Zimbabwean ID number format
  const validateZimbabweanID = (idNumber: string): string | null => {
    // Remove any spaces or dashes for validation
    const cleanId = idNumber.replace(/[\s-]/g, '');
    
    // Check if it's exactly 11 characters
    if (cleanId.length !== 11) {
      return 'ID number must be exactly 11 characters';
    }
    
    // Check format: 2 digits + 6 digits + 1 letter + 2 digits (e.g., 67-657432D45)
    const idPattern = /^\d{8}[A-Za-z]\d{2}$/;
    if (!idPattern.test(cleanId)) {
      return 'Invalid format. Expected: XX-XXXXXXDXX (e.g., 67-657432D45)';
    }
    
    return null; // Valid
  };

  // Format ID number with dashes
  const formatIdNumber = (value: string): string => {
    // Remove all non-alphanumeric characters
    const clean = value.replace(/[^0-9A-Za-z]/g, '');
    
    // Apply formatting: XX-XXXXXXDXX
    if (clean.length <= 2) {
      return clean;
    } else if (clean.length <= 8) {
      return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    } else if (clean.length <= 10) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 8)}${clean.slice(8)}`;
    } else {
      return `${clean.slice(0, 2)}-${clean.slice(2, 8)}${clean.slice(8, 9)}${clean.slice(9, 11)}`;
    }
  };

  // Generate unique ID for team members
  const generateTeamMemberId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LASHER-${timestamp}-${random}`;
  };

  // Generate QR code
  const generateQRCode = async (data: string): Promise<string> => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  // Download team member ID card
  const downloadTeamMemberID = async (member: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#32383e';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Title
    ctx.fillStyle = '#32383e';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LASHER ID', canvas.width / 2, 50);
    
    // Cooperative name
    ctx.font = 'bold 20px Arial';
    ctx.fillText(form.cooperative, canvas.width / 2, 80);
    
    // Divider line
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(canvas.width - 30, 95);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Member picture
    if (member.picture) {
      try {
        const img = new Image();
        img.src = member.picture;
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 30, 110, 120, 150);
            resolve(null);
          };
          img.onerror = resolve;
        });
      } catch (error) {
        console.error('Error loading member picture:', error);
      }
    } else {
      // Placeholder for picture
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(30, 110, 120, 150);
      ctx.fillStyle = '#999999';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No Photo', 90, 185);
    }
    
    // Member details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`${member.name} ${member.surname}`, 170, 130);
    
    ctx.font = '14px Arial';
    ctx.fillText(`ID: ${member.id}`, 170, 155);
    ctx.fillText(`National ID: ${member.idNumber}`, 170, 180);
    ctx.fillText(`Phone: ${member.cellNumber}`, 170, 205);
    if (member.address) {
      ctx.fillText(`Address: ${member.address}`, 170, 230);
    }
    
    // QR Code
    if (member.qrcode) {
      try {
        const qrImg = new Image();
        qrImg.src = member.qrcode;
        await new Promise((resolve) => {
          qrImg.onload = () => {
            ctx.drawImage(qrImg, canvas.width - 180, 110, 150, 150);
            resolve(null);
          };
          qrImg.onerror = resolve;
        });
      } catch (error) {
        console.error('Error loading QR code:', error);
      }
    }
    
    // Footer
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#666666';
    ctx.fillText('This ID must be carried at all times', canvas.width / 2, canvas.height - 30);
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, canvas.height - 15);
    
    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Lasher-ID-${member.name}-${member.surname}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
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
        let processedValue = value as string;
        let fieldErrors = { ...errors };
        
        // Special handling for ID number
        if (name === 'nationId') {
          processedValue = formatIdNumber(value as string);
          // Ensure consistent uppercase display for the letter part
          processedValue = processedValue.toUpperCase();
          
          // Validate ID number if it's not empty
          if (processedValue.trim()) {
            const validationError = validateZimbabweanID(processedValue);
            if (validationError) {
              fieldErrors.nationId = validationError;
            } else {
              fieldErrors.nationId = '';
            }
          } else {
            fieldErrors.nationId = '';
          }
          
          setErrors(fieldErrors);
        }
        
        setForm((prev) => ({
          ...prev,
          [name as string]: processedValue,
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
    const { name, value, files, type } = e.target as HTMLInputElement;
    
    if (type === 'file' && files && files[0]) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const base64String = reader.result as string;
        setTeamMembers((prev) => {
          const updated = [...prev];
          (updated[idx] as any)[name] = base64String;
          return updated;
        });
      });
      reader.readAsDataURL(file);
    } else {
      let processedValue = value as string;
      // Apply formatting and uppercase for team member ID numbers
      if (name === 'idNumber') {
        processedValue = formatIdNumber(processedValue).toUpperCase();
      }
      setTeamMembers((prev) => {
        const updated = [...prev];
        (updated[idx] as any)[name] = processedValue;
        return updated;
      });
    }
  };

  const addTeamMember = async () => {
    const newId = generateTeamMemberId();
    const qrCodeData = await generateQRCode(newId);
    setTeamMembers((prev) => [...prev, { 
      id: newId,
      name: '', 
      surname: '', 
      address: '', 
      idNumber: '',
      cellNumber: '',
      picture: '',
      qrcode: qrCodeData
    }]);
  };

  const removeTeamMember = (idx: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== idx));
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
    if (!form.nationId.trim()) { 
      updatedErrors.nationId = 'National ID is required'; 
      isValid = false; 
    } else {
      const idValidationError = validateZimbabweanID(form.nationId);
      if (idValidationError) {
        updatedErrors.nationId = idValidationError;
        isValid = false;
      }
    }
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
      if (!member.cellNumber.trim()) {
        errs.push('Phone Number');
      } else if (!/^\d{10}$/.test(member.cellNumber.trim())) {
        errs.push('Invalid phone format');
      }
      if (!member.idNumber.trim()) {
        errs.push('ID Number');
      } else {
        const idErr = validateZimbabweanID(member.idNumber);
        if (idErr) errs.push('Invalid ID format');
      }
      return errs.length ? errs.join(', ') : '';
    });
    if (teamErrors.some(e => e !== '')) {
      setErrors(prev => ({ ...prev, teamMembers: teamErrors }));
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const personalInfoValid = validatePersonalInfo();
    const idPictureValid = validateIdPicture();
    const teamMembersValid = validateTeamMembers();
    
    return personalInfoValid && idPictureValid && teamMembersValid;
  };

  const handleNext = async () => {
    // Per-step validation
    if (activeStep === 0 && !validatePersonalInfo()) return;
    if (activeStep === 1 && !validateIdPicture()) return;
    if (activeStep === 2 && !validateTeamMembers()) return;
    // Step 3 is Team Member IDs - no validation needed, just viewing

    if (activeStep === 4) {
      // Submit on review step (now step 4)
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
      // Build explicit payload with only required fields
      const payload = {
        name: form.name,
        surname: form.surname,
        address: form.address,
        cell: form.cell,
        nationId: form.nationId,
        position: form.position,
        cooperativename: form.cooperative,
        idPicture: form.idPicture,
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          name: member.name,
          surname: member.surname,
          address: member.address,
          idNumber: member.idNumber,
          cellNumber: member.cellNumber || '',
          picture: member.picture || '',
          qrcode: member.qrcode || '',
        }))
      };

      console.log('Submitting registration with payload:', {
        ...payload,
        idPicture: payload.idPicture ? `${payload.idPicture.substring(0, 30)}...` : 'empty',
        teamMembers: payload.teamMembers.map(m => ({
          ...m,
          picture: m.picture ? `${m.picture.substring(0, 30)}...` : 'empty',
          qrcode: m.qrcode ? `${m.qrcode.substring(0, 30)}...` : 'empty'
        }))
      });

      const { error, success } = await authClient.registerMiner(payload);

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
        // Move to confirmation (step 5)
        setActiveStep(5);
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
          {/* 
            Zimbabwean ID Format: XX-XXXXXXDXX (11 characters total)
            - First 2 digits: District where ID was registered
            - Next 6 digits: Serial number for that district  
            - Next 1 character: Check letter for verification
            - Last 2 digits: District of origin for applicant
            Example: 67-657432D45
          */}
          <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
            <InputLabel>National ID Number</InputLabel>
            <TextField
              name="nationId"
              placeholder="67-657432D45"
              fullWidth
              value={form.nationId}
              onChange={handleChange}
              error={!!errors.nationId}
              helperText={
                errors.nationId || 
                "Format: XX-XXXXXXDXX (District-Serial+Check+Origin). Example: 67-657432D45"
              }
              inputProps={{
                maxLength: 13, // XX-XXXXXXDXX = 13 characters with dashes
                style: { textTransform: 'uppercase' }
              }}
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
          <Box sx={{ maxWidth: 900 }}>
            {teamMembers.map((member, idx) => (
              <Card key={idx} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Team Member {idx + 1}
                    </Typography>
                    {teamMembers.length > 1 && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => removeTeamMember(idx)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1 }}>
                    <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }}>
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
                    <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }}>
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
                    <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }}>
                      <TextField
                        name="cellNumber"
                        label="Phone Number"
                        fullWidth
                        value={member.cellNumber}
                        onChange={(e) => handleTeamChange(idx, e)}
                        error={
                          !!errors.teamMembers[idx] && (
                            errors.teamMembers[idx].includes('Phone Number') ||
                            errors.teamMembers[idx].includes('Invalid phone format')
                          )
                        }
                        helperText={
                          errors.teamMembers[idx]
                            ? errors.teamMembers[idx].includes('Phone Number')
                              ? 'Phone number is required'
                              : errors.teamMembers[idx].includes('Invalid phone format')
                                ? 'Must be 10 digits'
                                : ''
                            : 'Enter 10-digit phone number'
                        }
                        placeholder="0771234567"
                        inputProps={{
                          maxLength: 10
                        }}
                        required
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }}>
                      <TextField
                        name="address"
                        label="Address"
                        fullWidth
                        value={member.address}
                        onChange={(e) => handleTeamChange(idx, e)}
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }}>
                      <TextField
                        name="idNumber"
                        label="National ID Number"
                        fullWidth
                        value={member.idNumber}
                        onChange={(e) => handleTeamChange(idx, e)}
                        error={
                          !!errors.teamMembers[idx] && (
                            errors.teamMembers[idx].includes('ID Number') ||
                            errors.teamMembers[idx].includes('Invalid ID format')
                          )
                        }
                        helperText={
                          errors.teamMembers[idx]
                            ? errors.teamMembers[idx].includes('ID Number')
                              ? 'ID Number is required'
                              : errors.teamMembers[idx].includes('Invalid ID format')
                                ? 'Format: XX-XXXXXXDXX (e.g., 67-657432D45)'
                                : ''
                            : 'Format: XX-XXXXXXDXX'
                        }
                        placeholder="67-657432D45"
                        inputProps={{
                          maxLength: 13,
                          style: { textTransform: 'uppercase' }
                        }}
                        required
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }}>
                      <InputLabel sx={{ mb: 1 }}>Picture Upload</InputLabel>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {member.picture ? 'Change Picture' : 'Upload Picture'}
                        <input
                          type="file"
                          name="picture"
                          hidden
                          onChange={(e) => handleTeamChange(idx, e)}
                          accept="image/*"
                        />
                      </Button>
                      {member.picture && (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <img
                            src={member.picture}
                            alt="Member"
                            style={{
                              maxWidth: '100px',
                              maxHeight: '100px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ width: '100%', px: 1, mb: 2 }}>
                      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Generated ID:</strong> {member.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Team Member IDs Step */}
      {activeStep === 3 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Team Member IDs</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review and download ID cards for all team members
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            {teamMembers.map((member, idx) => (
              <Box key={idx} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, px: 1.5, mb: 3 }}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                      {member.name} {member.surname}
                    </Typography>
                    {member.picture && (
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img
                          src={member.picture}
                          alt={`${member.name} ${member.surname}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                      </Box>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>ID:</strong> {member.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>Phone:</strong> {member.cellNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        <strong>National ID:</strong> {member.idNumber}
                      </Typography>
                    </Box>
                    {member.qrcode && (
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img
                          src={member.qrcode}
                          alt="QR Code"
                          style={{ width: '100px', height: '100px' }}
                        />
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadTeamMemberID(member)}
                      sx={{
                        bgcolor: 'secondary.main',
                        '&:hover': { bgcolor: 'secondary.dark' }
                      }}
                    >
                      Download ID
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Review Step */}
      {activeStep === 4 && (
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
      {activeStep === 5 && (
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
  const steps = ['Personal Info', 'ID Picture', 'Team Members', 'Team Member IDs', 'Review', 'Confirmation'];
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
