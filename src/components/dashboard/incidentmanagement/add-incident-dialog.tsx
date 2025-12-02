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
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
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
import { open } from 'fs';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

// Define steps for the stepper
const steps = [
  'Incident Details',
  'Attachments',
  'Persons Involved',
  'Review & Submit',
  'Confirmation'
];

// Define incident type options
const incidentTypeOptions = [
  { value: 'hazard', label: 'Hazard' },
  { value: 'injury', label: 'Injury' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' }
];

// Define severity level options
const severityLevelOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

// Define location options
const locationOptions = [
  { value: 'main_shaft', label: 'Main Shaft' },
  { value: 'processing_plant', label: 'Processing Plant' },
  { value: 'security_office', label: 'Security Office' },
  { value: 'head_office', label: 'Head Office' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'mine_site', label: 'Mine Site' },
  { value: 'office_area', label: 'Office Area' }
];

// Interface for person details
interface PersonDetail {
  id: string;
  name: string;
  surname: string;
  nationalId: string;
  address: string;
}

export function AddOreDialog({ open, onClose, onRefresh }: AddUserDialogProps): React.JSX.Element {
  const theme = useTheme();
  
  // Helper function to create fresh form data
  const getInitialFormData = () => ({
    // Incident Details
    incidentTitle: '',
    incidentType: '',
    severityLevel: '',
    location: '',
    reportedBy: '',
    dateReported: dayjs() as dayjs.Dayjs,
    description: '',
    attachments: [] as File[],
    
    // Persons involved
    persons: [
      {
        id: crypto.randomUUID(),
        name: '',
        surname: '',
        nationalId: '',
        address: ''
      }
    ] as PersonDetail[]
  });
  
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  
  // State for form data
  const [formData, setFormData] = React.useState(getInitialFormData());

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

  // Handle person field changes
  const handlePersonChange = (index: number, field: keyof PersonDetail) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updatedPersons = [...formData.persons];
    updatedPersons[index] = {
      ...updatedPersons[index],
      [field]: event.target.value
    };
    setFormData({
      ...formData,
      persons: updatedPersons
    });
  };

  // Add new person (adds to the beginning of the array)
  const addPerson = () => {
    setFormData({
      ...formData,
      persons: [
        {
          id: crypto.randomUUID(),
          name: '',
          surname: '',
          nationalId: '',
          address: ''
        },
        ...formData.persons
      ]
    });
  };

  // Remove person
  const removePerson = (index: number) => {
    if (formData.persons.length > 1) {
      const updatedPersons = [...formData.persons];
      updatedPersons.splice(index, 1);
      setFormData({
        ...formData,
        persons: updatedPersons
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...files]
      });
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    const updatedAttachments = [...formData.attachments];
    updatedAttachments.splice(index, 1);
    setFormData({
      ...formData,
      attachments: updatedAttachments
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

 

  // Handle next step


  // Handle next step with validation
  const handleNext = () => {
    // Validate current step before proceeding
    if (activeStep === 0) { // Incident Details step
      if (!formData.incidentTitle || !formData.incidentType || !formData.severityLevel || !formData.location) {
        setError('Please fill in all required fields');
        return;
      }
      setError(null);
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      const requiredFields = {
        incidentTitle: 'Incident Title',
        incidentType: 'Incident Type',
        severityLevel: 'Severity Level',
        location: 'Location',
        reportedBy: 'Reported By'
      };
      
      const errors: Record<string, string> = {};
      
      // Type-safe validation
      type FormDataKey = keyof typeof formData;
      
      (Object.entries(requiredFields) as [FormDataKey, string][]).forEach(([key, label]) => {
        const value = formData[key];
        if (typeof value === 'string' && !value.trim()) {
          errors[key] = `${label} is required`;
        } else if (Array.isArray(value) && value.length === 0) {
          errors[key] = `${label} is required`;
        } else if (value === null || value === undefined) {
          errors[key] = `${label} is required`;
        }
      });
      
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors found:', errors);
        setValidationErrors(errors);
        console.log('ValidationErrors state updated to:', errors);
        setActiveStep(0); // Go back to first step to show errors
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      // Process attachments to base64
      const processAttachments = async (files: File[]): Promise<string[]> => {
        return Promise.all(
          files.map(file => 
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                const base64String = result.split(',')[1];
                resolve(`data:${file.type};base64,${base64String}`);
              };
              reader.onerror = () => resolve('');
              reader.readAsDataURL(file);
            })
          )
        ).then(attachments => attachments.filter(Boolean));
      };
      
      // Create incident data object for external API
      const incidentData = {
        incidentTitle: formData.incidentTitle,
        severityLevel: formData.severityLevel,
        location: formData.location,
        reportedBy: formData.reportedBy,
        description: formData.description,
        status: 'OPEN', // Default status for new incidents
        attachments: await processAttachments(formData.attachments),
        participants: formData.persons
          .filter(p => p.name.trim() || p.surname.trim() || p.nationalId.trim() || p.address.trim())
          .map(person => ({
            name: person.name,
            surname: person.surname,
            nationalId: person.nationalId,
            address: person.address
          }))
      };
      
      // Call API to create incident record
      console.log('Sending incident data to API:', incidentData);
      const response = await authClient.createIncident(incidentData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create incident record');
      }
      
      // Generate a reference number (can be updated with actual reference from API if available)
      const reference = 'INC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setReferenceNumber(reference);
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Clear validation errors on success
      setValidationErrors({});
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        console.log('Calling onRefresh to update table');
        onRefresh();
      }
    } catch (error_) {
      console.error('Error creating incident record:', error_);
      
      let errorMessage = 'Failed to create incident record';
      
      // Handle different types of errors
      if (error_ instanceof Error) {
        errorMessage = error_.message;
      } else if (typeof error_ === 'string') {
        errorMessage = error_;
      } else if (error_ && typeof error_ === 'object' && 'message' in error_) {
        errorMessage = String(error_.message);
      }
      
      // Set error state
      setError(errorMessage);
      
      // If we're not on the review step, go to review step to show errors
      if (activeStep !== steps.length - 2) {
        setActiveStep(steps.length - 2);
      }
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      // Reset all form state to initial values
      setActiveStep(0);
      setError(null);
      setSuccess(false);
      setFormSubmitted(false);
      setReferenceNumber('');
      setValidationErrors({});
      setFormData(getInitialFormData());
      onClose();
    }
  };



  // TextField styling with theme colors
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main },
      '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.secondary.main },
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
        bgcolor: theme.palette.secondary.main,
        color: 'white',
        py: 2.5,
        px: 3,
        m: 0
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Report New Incident
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {/* Fixed Stepper Section */}
      <Box sx={{ width: '100%', px: 3, py: 2, background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Report and track incidents with detailed information, attachments, and involved persons
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
      
      <DialogContent sx={{ 
        px: 3, 
        py: 2, 
        maxHeight: '60vh', 
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.secondary.main, borderRadius: '3px' },
      }}>
        
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step content */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Incident Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Incident Title"
                  value={formData.incidentTitle}
                  onChange={handleChange('incidentTitle')}
                  placeholder="Enter incident title"
                  margin="normal"
                  sx={textFieldStyle}
                  error={!!validationErrors.incidentTitle}
                  helperText={validationErrors.incidentTitle}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.incidentType}>
                  <InputLabel id="incident-type-label">Incident Type</InputLabel>
                  <Select
                    labelId="incident-type-label"
                    id="incident-type"
                    value={formData.incidentType}
                    onChange={handleSelectChange('incidentType')}
                    label="Incident Type"
                  >
                    {incidentTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.incidentType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.incidentType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.severityLevel}>
                  <InputLabel id="severity-level-label">Severity Level</InputLabel>
                  <Select
                    labelId="severity-level-label"
                    id="severity-level"
                    value={formData.severityLevel}
                    onChange={handleSelectChange('severityLevel')}
                    label="Severity Level"
                  >
                    {severityLevelOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.severityLevel && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.severityLevel}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.location}>
                  <InputLabel id="location-label">Location</InputLabel>
                  <Select
                    labelId="location-label"
                    id="location"
                    value={formData.location}
                    onChange={handleSelectChange('location')}
                    label="Location"
                  >
                    {locationOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.location && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {validationErrors.location}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Reported By"
                  value={formData.reportedBy}
                  onChange={handleChange('reportedBy')}
                  placeholder="Enter reporter's name"
                  margin="normal"
                  sx={textFieldStyle}
                  error={!!validationErrors.reportedBy}
                  helperText={validationErrors.reportedBy}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date Reported"
                    value={formData.dateReported}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFormData({
                          ...formData,
                          dateReported: newValue
                        });
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Enter incident description"
                  margin="normal"
                  sx={textFieldStyle}
                />
              </Grid>
            </Grid>
            
            {/* Buttons moved to fixed bottom action bar */}
          </Box>
        )}

        {/* Step 1: Attachments */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Attachments (Photos/Documents)
            </Typography>
            
            <input
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={handleFileUpload}
            />
            
            {/* Upload Area */}
            <label htmlFor="raised-button-file" style={{ width: '100%' }}>
              <Box
                sx={{
                  border: `2px dashed ${theme.palette.secondary.main}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  bgcolor: 'rgba(50, 56, 62, 0.02)',
                  '&:hover': {
                    bgcolor: 'rgba(50, 56, 62, 0.08)',
                    borderColor: theme.palette.secondary.dark
                  },
                  component: 'div'
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: theme.palette.secondary.main }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Supported formats: Images (PNG, JPG, GIF), PDF, DOC, DOCX
                </Typography>
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    color: 'white',
                    '&:hover': { bgcolor: theme.palette.secondary.dark }
                  }}
                >
                  Select Files
                </Button>
              </Box>
            </label>

            {/* File Count */}
            {formData.attachments.length > 0 && (
              <Box sx={{ mt: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''} selected
                  </Typography>
                </Box>

                {/* Files Grid */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2
                }}>
                  {formData.attachments.map((file, index) => {
                    const isImage = file.type.startsWith('image/');
                    const isPdf = file.type === 'application/pdf';
                    const isDocument = file.type.includes('word') || file.type.includes('document');
                    
                    let icon = <InsertDriveFileIcon />;
                    if (isImage) icon = <ImageIcon />;
                    else if (isPdf) icon = <DocumentScannerIcon />;
                    else if (isDocument) icon = <InsertDriveFileIcon />;

                    return (
                      <Box
                        key={index}
                        sx={{
                          border: `1px solid ${theme.palette.secondary.main}`,
                          borderRadius: 1.5,
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.2s ease',
                          bgcolor: 'background.paper',
                          '&:hover': {
                            boxShadow: `0 2px 8px rgba(50, 56, 62, 0.12)`,
                            bgcolor: 'rgba(50, 56, 62, 0.02)'
                          }
                        }}
                      >
                        {/* File Icon */}
                        <Box sx={{ color: theme.palette.secondary.main, fontSize: 32 }}>
                          {icon}
                        </Box>

                        {/* File Name */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            textAlign: 'center',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '40px'
                          }}
                          title={file.name}
                        >
                          {file.name}
                        </Typography>

                        {/* File Size */}
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>

                        {/* Delete Button */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            removeAttachment(index);
                          }}
                          sx={{
                            color: 'error.main',
                            marginTop: 'auto',
                            '&:hover': {
                              bgcolor: 'rgba(211, 47, 47, 0.1)'
                            }
                          }}
                          title="Remove file"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>

                {/* Add More Button */}
                <Box sx={{ mt: 3 }}>
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddIcon />}
                      sx={{
                        borderColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.main,
                        '&:hover': {
                          borderColor: theme.palette.secondary.dark,
                          bgcolor: 'rgba(50, 56, 62, 0.04)'
                        }
                      }}
                    >
                      Add More Files
                    </Button>
                  </label>
                </Box>
              </Box>
            )}

            {/* Buttons moved to fixed bottom action bar */}
          </Box>
        )}

        {/* Step 2: Persons Involved */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Persons Involved in the Incident
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add details of all individuals involved in or affected by this incident. At least one person is required.
            </Typography>

            {/* Add Person Button - Sticky at Top */}
            <Box sx={{ mb: 3, pb: 2.5, borderBottom: `1px solid #e0e0e0` }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addPerson}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark
                  }
                }}
              >
                Add Person
              </Button>
            </Box>

            {/* Persons List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {formData.persons.map((person, index) => (
                <Box 
                  key={person.id}
                  sx={{
                    border: `1px solid ${theme.palette.secondary.main}`,
                    borderRadius: 2,
                    p: 2.5,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: `0 2px 8px rgba(50, 56, 62, 0.12)`,
                      bgcolor: 'rgba(50, 56, 62, 0.01)'
                    }
                  }}
                >
                  {/* Person Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, pb: 1.5, borderBottom: `1px solid ${theme.palette.secondary.main}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box 
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: theme.palette.secondary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Person {index + 1}
                        {person.name || person.surname ? ` - ${person.name} ${person.surname}`.trim() : ''}
                      </Typography>
                    </Box>
                    {index > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => removePerson(index)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'rgba(211, 47, 47, 0.1)'
                          }
                        }}
                        title="Remove person"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Form Fields Grid */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      placeholder="Enter first name"
                      value={person.name}
                      onChange={handlePersonChange(index, 'name')}
                        size="small"
                        sx={textFieldStyle}
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        label="Last Name"
                        placeholder="Enter last name"
                        value={person.surname}
                        onChange={handlePersonChange(index, 'surname')}
                        size="small"
                        sx={textFieldStyle}
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        label="National ID"
                        placeholder="Enter national ID number"
                        value={person.nationalId}
                        onChange={handlePersonChange(index, 'nationalId')}
                        size="small"
                        sx={textFieldStyle}
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        label="Address"
                        placeholder="Enter residential address"
                        value={person.address}
                        onChange={handlePersonChange(index, 'address')}
                        size="small"
                        sx={textFieldStyle}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
              ))}
            </Box>

            {/* Buttons moved to fixed bottom action bar */}
          </Box>
        )}

        {/* Step 3: Additional Details - Removed as per requirements */}
        
        {/* Step 3: Review */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Incident Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the information before submitting the incident report.
            </Typography>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              p: 3, 
              mb: 3 
            }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Incident Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.incidentTitle || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.incidentType || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Severity Level</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.severityLevel || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.location || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Reported By</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.reportedBy || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date Reported</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formData.dateReported ? formData.dateReported.format('DD/MM/YYYY') : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {formData.description || 'No description provided'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Persons Involved
              </Typography>
              
              {formData.persons.length > 0 ? (
                formData.persons.map((person, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1">{person.name || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Surname</Typography>
                        <Typography variant="body1">{person.surname || 'Not provided'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">National ID</Typography>
                        <Typography variant="body1">{person.nationalId || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">No persons added</Typography>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Attachments
              </Typography>
              
              {formData.attachments.length > 0 ? (
                <Grid container spacing={2}>
                  {formData.attachments.map((file, index) => (
                    <Grid item key={index} xs={12} sm={6} md={4}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1, 
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                      }}>
                     
                        <Typography variant="body2" noWrap sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">No attachments</Typography>
              )}
            </Box>
            
            {/* Buttons moved to fixed bottom action bar */}
          </Box>
        )}


        {/* Confirmation Step */}
        {activeStep === 4 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Incident Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The incident record has been created. Here is the reference number:
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
                bgcolor: theme.palette.secondary.main,
                color: '#fff',
                '&:hover': { bgcolor: theme.palette.secondary.dark } 
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
              sx={{ 
                borderColor: theme.palette.secondary.main, 
                color: theme.palette.secondary.main, 
                '&:hover': { 
                  borderColor: theme.palette.secondary.dark, 
                  bgcolor: 'rgba(50, 56, 62, 0.04)' 
                } 
              }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
              disabled={isSubmitting}
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                color: '#fff',
                '&:hover': { bgcolor: theme.palette.secondary.dark } 
              }}
            >
              {activeStep === steps.length - 2 ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
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