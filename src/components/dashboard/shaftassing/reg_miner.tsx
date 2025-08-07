
import * as React from 'react';
import { Box, Button, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';

export interface RegMinerDialogProps {
  open: boolean;
  onClose: () => void;
}

function RegMinerForm(): React.JSX.Element {
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
        reader.onload = () => {
          const base64String = reader.result as string;
          setForm(prev => ({
            ...prev,
            idPicture: base64String
          }));
        };
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
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
        console.log('Miner registered successfully');
        // Show success message and refresh the page
        alert('Registration successful!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 900 }}>
      {/* Form Fields Row Layout */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
        <Box flex="1 1 48%">
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
                    border: '1px solid #ddd',
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

      {/* Team Members Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Add Team Members</Typography>
        <IconButton color="primary" onClick={addTeamMember} sx={{ mb: 2 }}>
          <AddCircleIcon />
        </IconButton>
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, maxWidth: 700 }}>
          {teamMembers.map((member, idx) => (
            <Box key={idx} display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 48%">
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
              <Box flex="1 1 48%">
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
              <Box flex="1 1 48%">
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  value={member.address}
                  onChange={(e) => handleTeamChange(idx, e)}
                />
              </Box>
              <Box flex="1 1 48%">
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

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        sx={{
          mt: 4,
          bgcolor: '#5f4bfa',
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
          width: 200,
        }}
      >
        Submit
      </Button>
    </Box>
  );
}

export function RegMinerDialog({ open, onClose }: RegMinerDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span"> Syndicate Miner Registration </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <RegMinerForm />
      </DialogContent>
    </Dialog>
  );
}


