import * as React from 'react';
import { 
  Alert,
  Box, 
  Button, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Select, 
  Stack, 
  TextField, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Snackbar 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';

interface TeamMemberError {
  name: string;
  surname: string;
  address: string;
  idNumber: string;
}

interface ErrorState {
  companyName: string;
  registrationNumber: string;
  address: string;
  contactNumber: string;
  email: string;
  industry: string;
  companyLogo: string;
  cr14Document: string;
  taxClearance: string;
  certificateOfCooperation: string;
  miningCertificate: string;
  passportPhotos: string;
  ownerName: string;
  ownerSurname: string;
  ownerAddress: string;
  ownerCellNumber: string;
  ownerIdNumber: string;
  // teamMembers field removed
}

export interface RegMinerDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface RegMinerFormProps {
  onClose?: () => void;
  onRefresh?: () => void;
}

function RegMinerForm({ onClose, onRefresh }: RegMinerFormProps): React.JSX.Element {
  // Team members state removed as requested
  const [selectedFileNames, setSelectedFileNames] = React.useState({
    companyLogo: '',
    cr14Document: '',
    taxClearance: '',
    certificateOfCooperation: '',
    miningCertificate: '',
    passportPhotos: ''
  });
  
  // State for success alert
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);

  const [form, setForm] = React.useState({
    companyName: '',
    registrationNumber: '',
    address: '',
    contactNumber: '',
    email: '',
    industry: 'Mining',
    companyLogo: '',
    cr14Document: '',
    taxClearance: '',
    certificateOfCooperation: '',
    miningCertificate: '',
    passportPhotos: '',
    ownerName: '',
    ownerSurname: '',
    ownerAddress: '',
    ownerCellNumber: '',
    ownerIdNumber: ''
  });
  
  // State for form validation errors
  const [errors, setErrors] = React.useState<ErrorState>({
    companyName: '',
    registrationNumber: '',
    address: '',
    contactNumber: '',
    email: '',
    industry: '',
    companyLogo: '',
    cr14Document: '',
    taxClearance: '',
    certificateOfCooperation: '',
    miningCertificate: '',
    passportPhotos: '',
    ownerName: '',
    ownerSurname: '',
    ownerAddress: '',
    ownerCellNumber: '',
    ownerIdNumber: ''
  });

  // Validation function

  const validateForm = () => {
    const newErrors: ErrorState = {
      companyName: '',
      registrationNumber: '',
      address: '',
      contactNumber: '',
      email: '',
      industry: '',
      companyLogo: '',
      cr14Document: '',
      taxClearance: '',
      certificateOfCooperation: '',
      miningCertificate: '',
      passportPhotos: '',
      ownerName: '',
      ownerSurname: '',
      ownerAddress: '',
      ownerCellNumber: '',
      ownerIdNumber: ''
    };
    let isValid = true;

    // Validate main form fields
    if (!form.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      isValid = false;
    }
    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(form.contactNumber.trim())) {
      newErrors.contactNumber = 'Invalid contact number format';
      isValid = false;
    }
    if (!form.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
      isValid = false;
    }
    if (!form.industry.trim()) {
      newErrors.industry = 'Industry is required';
      isValid = false;
    }
    
    if (!form.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
      isValid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    
    // Validate required documents
    if (!form.companyLogo) {
      newErrors.companyLogo = 'Company logo is required';
      isValid = false;
    }
    if (!form.cr14Document) {
      newErrors.cr14Document = 'CR14 document is required';
      isValid = false;
    }
    if (!form.taxClearance) {
      newErrors.taxClearance = 'Tax clearance is required';
      isValid = false;
    }
    if (!form.certificateOfCooperation) {
      newErrors.certificateOfCooperation = 'Certificate of cooperation is required';
      isValid = false;
    }
    if (!form.miningCertificate) {
      newErrors.miningCertificate = 'Mining certificate is required';
      isValid = false;
    }
    if (!form.passportPhotos) {
      newErrors.passportPhotos = 'Passport photos are required';
      isValid = false;
    }

    // Validate owner details
    if (!form.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
      isValid = false;
    }
    if (!form.ownerSurname.trim()) {
      newErrors.ownerSurname = 'Owner surname is required';
      isValid = false;
    }
    if (!form.ownerAddress.trim()) {
      newErrors.ownerAddress = 'Owner address is required';
      isValid = false;
    }
    if (!form.ownerCellNumber.trim()) {
      newErrors.ownerCellNumber = 'Owner cell number is required';
      isValid = false;
    }
    if (!form.ownerIdNumber.trim()) {
      newErrors.ownerIdNumber = 'Owner ID number is required';
      isValid = false;
    }

    // Team members validation removed as requested

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    if ('target' in e && e.target) {
      const { name, value, files, type } = e.target as HTMLInputElement;
      
      if (type === 'file' && files) {
        // Passport photo validation: must upload exactly 1
        if (name === 'passportPhotos') {
          if (files.length !== 1) {
            setErrors(prev => ({
              ...prev,
              [name]: 'Please upload exactly 1 passport photo.'
            }));
            setSelectedFileNames(prev => ({
              ...prev,
              [name]: ''
            }));
            setForm(prev => ({
              ...prev,
              [name]: ''
            }));
            return;
          }
          // Validate file is an image
          if (!files[0].type.startsWith('image/')) {
            setErrors(prev => ({
              ...prev,
              [name]: 'File must be an image.'
            }));
            return;
          }
          // Store file name
          setSelectedFileNames(prev => ({
            ...prev,
            [name]: files[0].name
          }));
          setErrors(prev => ({
            ...prev,
            [name]: ''
          }));
          // Convert file to base64 and save as string
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            setForm(prev => ({
              ...prev,
              [name]: base64String
            }));
          };
          reader.readAsDataURL(files[0]);
          return;
        }
        // ...existing code for other file fields...
        const file = files[0];
        if (!file) return;
        setSelectedFileNames(prev => ({
          ...prev,
          [name]: file.name
        }));
        const isImageField = ['companyLogo'].includes(name);
        const isPDFField = ['cr14Document', 'taxClearance', 'certificateOfCooperation', 'miningCertificate'].includes(name);
        if (isImageField && !file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            [name]: 'Please select an image file'
          }));
          return;
        }
        if (isPDFField && !file.type.match('application/pdf') && !file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            [name]: 'Please select a PDF or image file'
          }));
          return;
        }
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setForm(prev => ({
            ...prev,
            [name]: base64String
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setForm(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  // Team member functions removed as requested

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validation removed as requested

    // Show form data in console for debugging
    console.log('Form data:', form);

    try {
      // Prepare form data in the correct structure for the API
      // Send owner fields at top level as expected by the backend
      const formData = {
        companyName: form.companyName,
        address: form.address,
        cellNumber: form.contactNumber, // Mapping contactNumber to cellNumber
        email: form.email,
        companyLogo: form.companyLogo,
        certificateOfCooperation: form.certificateOfCooperation,
        cr14Copy: form.cr14Document, // Mapping cr14Document to cr14Copy
        miningCertificate: form.miningCertificate,
        taxClearance: form.taxClearance,
        passportPhoto: form.passportPhotos, // Mapping passportPhotos to passportPhoto
        ownerName: form.ownerName,
        ownerSurname: form.ownerSurname,
        ownerAddress: form.ownerAddress,
        ownerCellNumber: form.ownerCellNumber,
        ownerIdNumber: form.ownerIdNumber,
        status: "", // Empty string for status as it's not in the form
        reason: "" // Empty string for reason as it's not in the form
      };

      console.log('Submitting form data:', formData);
      const { error, success } = await authClient.registerCompany(formData);

      if (error) {
        setErrors(prev => ({
          ...prev,
          submit: error
        }));
        
        return;
      }

      if (success) {
        // Show success alert
        setShowSuccessAlert(true);
        
        // Set a timeout to close dialog and trigger parent refresh after alert is shown
        setTimeout(() => {
          if (onRefresh) {
            onRefresh();
          }
          if (onClose) {
            onClose();
          }
        }, 2000); // 2 seconds delay
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      window.alert('An error occurred during registration. Please try again.');
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
      
      {/* Company Information */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box flex="1 1 48%">
          <InputLabel>Company Name</InputLabel>
          <TextField
            name="companyName"
            placeholder="Please enter Company name"
            fullWidth
            value={form.companyName}
            onChange={handleChange}
            error={!!errors.companyName}
            helperText={errors.companyName}
            required
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Address</InputLabel>
          <TextField
            name="address"
            placeholder="Please enter company address"
            fullWidth
            value={form.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Cell number</InputLabel>
          <TextField
            name="contactNumber"
            placeholder="Enter your mobile number"
            fullWidth
            value={form.contactNumber}
            onChange={handleChange}
            error={!!errors.contactNumber}
            helperText={errors.contactNumber}
            required
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Email</InputLabel>
          <TextField
            name="email"
            type="email"
            placeholder="Please enter email address"
            fullWidth
            value={form.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Box>

        {/* Document Upload Section */}
        <Box flex="1 1 48%">
          <InputLabel>Company log</InputLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color={errors.companyLogo ? 'error' : 'primary'}
          >
            Choose Image
            <input
              type="file"
              name="companyLogo"
              hidden
              onChange={handleChange}
              accept="image/*"
            />
          </Button>
          {errors.companyLogo && (
            <Typography color="error" variant="caption" display="block">
              {errors.companyLogo}
            </Typography>
          )}
          {selectedFileNames.companyLogo && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
              Selected: {selectedFileNames.companyLogo}
            </Typography>
          )}
        </Box>

        <Box flex="1 1 48%">
          <InputLabel>Upload Copy Of CR14</InputLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color={errors.cr14Document ? 'error' : 'primary'}
          >
            Choose Image
            <input
              type="file"
              name="cr14Document"
              hidden
              onChange={handleChange}
              accept="image/*,.pdf"
            />
          </Button>
          {errors.cr14Document && (
            <Typography color="error" variant="caption" display="block">
              {errors.cr14Document}
            </Typography>
          )}
          {selectedFileNames.cr14Document && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
              Selected: {selectedFileNames.cr14Document}
            </Typography>
          )}
        </Box>

        <Box flex="1 1 48%">
          <InputLabel>Upload Tax Clearance</InputLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color={errors.taxClearance ? 'error' : 'primary'}
          >
            Choose Image
            <input
              type="file"
              name="taxClearance"
              hidden
              onChange={handleChange}
              accept="image/*,.pdf"
            />
          </Button>
          {errors.taxClearance && (
            <Typography color="error" variant="caption" display="block">
              {errors.taxClearance}
            </Typography>
          )}
          {selectedFileNames.taxClearance && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
              Selected: {selectedFileNames.taxClearance}
            </Typography>
          )}
        </Box>

        <Box flex="1 1 48%">
          <InputLabel>Upload certificate Of Cooperation</InputLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color={errors.certificateOfCooperation ? 'error' : 'primary'}
          >
            Choose Image
            <input
              type="file"
              name="certificateOfCooperation"
              hidden
              onChange={handleChange}
              accept="image/*,.pdf"
            />
          </Button>
          {errors.certificateOfCooperation && (
            <Typography color="error" variant="caption" display="block">
              {errors.certificateOfCooperation}
            </Typography>
          )}
          {selectedFileNames.certificateOfCooperation && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
              Selected: {selectedFileNames.certificateOfCooperation}
            </Typography>
          )}
        </Box>

        <Box flex="1 1 48%">
          <InputLabel>Upload Mining Certificate</InputLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color={errors.miningCertificate ? 'error' : 'primary'}
          >
            Choose Image
            <input
              type="file"
              name="miningCertificate"
              hidden
              onChange={handleChange}
              accept="image/*,.pdf"
            />
          </Button>
          {errors.miningCertificate && (
            <Typography color="error" variant="caption" display="block">
              {errors.miningCertificate}
            </Typography>
          )}
          {selectedFileNames.miningCertificate && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
              Selected: {selectedFileNames.miningCertificate}
            </Typography>
          )}
        </Box>

        <Box flex="1 1 48%">
          <InputLabel>Upload Passport Photo Picture</InputLabel>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            color={errors.passportPhotos ? 'error' : 'primary'}
          >
            Choose Image
            <input
              type="file"
              name="passportPhotos"
              hidden
              onChange={handleChange}
              accept="image/*"
            />
          </Button>
          {errors.passportPhotos && (
            <Typography color="error" variant="caption" display="block">
              {errors.passportPhotos}
            </Typography>
          )}
          {selectedFileNames.passportPhotos && (
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
              Selected: {selectedFileNames.passportPhotos}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Owner Detail Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Owner Detail</Typography>
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box flex="1 1 48%">
              <TextField
                name="ownerName"
                label="Owner Name"
                fullWidth
                value={form.ownerName}
                onChange={handleChange}
                error={!!errors.ownerName}
                helperText={errors.ownerName}
                required
              />
            </Box>
            <Box flex="1 1 48%">
              <TextField
                name="ownerSurname"
                label="Owner Surname"
                fullWidth
                value={form.ownerSurname}
                onChange={handleChange}
                error={!!errors.ownerSurname}
                helperText={errors.ownerSurname}
                required
              />
            </Box>
            <Box flex="1 1 48%">
              <TextField
                name="ownerAddress"
                label="Owner Address"
                fullWidth
                value={form.ownerAddress}
                onChange={handleChange}
                error={!!errors.ownerAddress}
                helperText={errors.ownerAddress}
                required
              />
            </Box>
            <Box flex="1 1 48%">
              <TextField
                name="ownerCellNumber"
                label="Owner Cell Number"
                fullWidth
                value={form.ownerCellNumber}
                onChange={handleChange}
                error={!!errors.ownerCellNumber}
                helperText={errors.ownerCellNumber}
                required
              />
            </Box>
            <Box flex="1 1 100%">
              <TextField
                name="ownerIdNumber"
                label="Owner ID Number"
                fullWidth
                value={form.ownerIdNumber}
                onChange={handleChange}
                error={!!errors.ownerIdNumber}
                helperText={errors.ownerIdNumber}
                required
              />
            </Box>
          </Box>
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

export function RegMinerDialog({ open, onClose, onRefresh }: RegMinerDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Company Miner Registration</span>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <RegMinerForm onClose={onClose} onRefresh={onRefresh} />
      </DialogContent>
    </Dialog>
  );
}


