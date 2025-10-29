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
  Snackbar,
  Stepper,
  Step,
  StepLabel 
} from '@mui/material';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { authClient } from '@/lib/auth/client';
import { useTheme } from '@mui/material/styles';

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
  cellNumber: string;
  certificateOfCooperation: string;
  miningCertificate: string;
  passportPhotos: string;
  ownerName: string;
  ownerSurname: string;
  ownerAddress: string;
  ownerCellNumber: string;
  ownerIdNumber: string;
}

export interface RegMinerDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

interface RegMinerFormProps {
  onClose?: () => void;
  onRefresh?: () => void;
  onStepChange?: (step: number) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const RegMinerForm = React.forwardRef<{ handleNext: () => void; handleBack: () => void }, RegMinerFormProps>(({ onClose, onRefresh, onStepChange }, ref) => {
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
  // Stepper state
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Company Info', 'Required Documents', 'Owner Details', 'Review', 'Confirmation'];

  const [form, setForm] = React.useState({
    companyName: '',
    registrationNumber: '',
    address: '',
    cellNumber: '',
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
    cellNumber: '',
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
      cellNumber: '',
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
      if (!name) {
        console.warn('Change event without a name attribute', e);
        return;
      }
      
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
          reader.addEventListener('load', () => {
            const base64String = reader.result as string;
            setForm(prev => ({
              ...prev,
              [name]: base64String
            }));
          });
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
        reader.addEventListener('load', () => {
          const base64String = reader.result as string;
          setForm(prev => ({
            ...prev,
            [name]: base64String
          }));
        });
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
        cellNumber: form.cellNumber, // Mapping cellNumber to cellNumber
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
        // Show success alert and move to confirmation step
        setShowSuccessAlert(true);
        setActiveStep(4);
        // Optionally trigger onRefresh
        setTimeout(() => {
          if (onRefresh) {
            onRefresh();
          }
        }, 1200);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      globalThis.alert('An error occurred during registration. Please try again.');
    }
  };

  // Step validations similar to add-security-company-dialog
  const validateCompanyInfo = () => {
    const valid = !!form.companyName && !!form.address && !!form.cellNumber && !!form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!valid) {
      validateForm();
    }
    return valid;
  };
  const validateDocuments = () => {
    const valid = !!form.companyLogo && !!form.cr14Document && !!form.taxClearance && !!form.certificateOfCooperation && !!form.miningCertificate && !!form.passportPhotos;
    if (!valid) {
      validateForm();
    }
    return valid;
  };
  const validateOwner = () => {
    const valid = !!form.ownerName && !!form.ownerSurname && !!form.ownerAddress && !!form.ownerCellNumber && !!form.ownerIdNumber;
    if (!valid) {
      validateForm();
    }
    return valid;
  };

  const handleNext = async () => {
    if (activeStep === 0 && !validateCompanyInfo()) return;
    if (activeStep === 1 && !validateDocuments()) return;
    if (activeStep === 2 && !validateOwner()) return;
    if (activeStep === 3) {
      // Submit the form before moving to confirmation
      await handleSubmit(new Event('submit') as any);
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

      {/* Step 0: Company Information */}
      {activeStep === 0 && (
      <>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Company Information</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
          <InputLabel>Cell Number</InputLabel>
          <TextField
            name="cellNumber"
            placeholder="Enter your mobile number"
            fullWidth
            value={form.cellNumber}
            onChange={handleChange}
            error={!!errors.cellNumber}
            helperText={errors.cellNumber}
            required
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
      </Box>
      </>
      )}

      {/* Step 1: Documents */}
      {activeStep === 1 && (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
        {/* Document Upload Section */}
        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
          <InputLabel>Company Logo</InputLabel>
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

        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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

        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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

        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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

        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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

        <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
      )}

      {/* Step 2: Owner Detail Section */}
      {activeStep === 2 && (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Owner Detail</Typography>
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
            <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
            <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
            <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
            <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
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
            <Box sx={{ width: '100%', px: 1.5 }}>
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
      )}

      {/* Step 3: Review */}
      {activeStep === 3 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Review Company Details</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>Company Information</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2"><strong>Name:</strong> {form.companyName}</Typography>
                <Typography variant="body2"><strong>Registration:</strong> {form.registrationNumber}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {form.email}</Typography>
                <Typography variant="body2"><strong>Cell:</strong> {form.cellNumber}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {form.address}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>Owner Details</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2"><strong>Name:</strong> {form.ownerName} {form.ownerSurname}</Typography>
                <Typography variant="body2"><strong>Cell:</strong> {form.ownerCellNumber}</Typography>
                <Typography variant="body2"><strong>ID:</strong> {form.ownerIdNumber}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Step 4: Confirmation */}
      {activeStep === 4 && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
            Company Submitted Successfully!
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
  const steps = ['Company Info', 'Required Documents', 'Owner Details', 'Review', 'Confirmation'];
  // useRef to hold child imperative handlers without causing re-renders
  const formRef = React.useRef<{ handleNext: () => void; handleBack: () => void } | null>(null);

  const handleStepChange = React.useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const handleNext = React.useCallback(() => {
    if (formRef.current?.handleNext) {
      formRef.current.handleNext();
    }
  }, []);

  const handleBack = React.useCallback(() => {
    if (formRef.current?.handleBack) {
      formRef.current.handleBack();
    }
  }, []);

  const handleRefCallback = React.useCallback((ref: any) => {
    // assign to ref.current directly to avoid setState inside a ref callback
    formRef.current = ref;
  }, []);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          Company Miner Registration
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
          /// Register a new mining company with complete documentation and owner details
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
          onClose={onClose} 
          onRefresh={onRefresh} 
          onStepChange={handleStepChange}
          ref={handleRefCallback}
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


