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
import { authClient } from '@/lib/auth/client';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
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
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  
  // State for form data
  const [formData, setFormData] = React.useState({
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

  // Add new person
  const addPerson = () => {
    setFormData({
      ...formData,
      persons: [
        ...formData.persons,
        {
          id: crypto.randomUUID(),
          name: '',
          surname: '',
          nationalId: '',
          address: ''
        }
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
      // Create incident data object with all fields
      const incidentData = {
        // Incident details
        title: formData.incidentTitle,
        type: formData.incidentType,
        severity: formData.severityLevel,
        location: formData.location,
        reportedBy: formData.reportedBy,
        dateReported: formData.dateReported ? formData.dateReported.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        description: formData.description,
        
        // Persons involved
        personsInvolved: formData.persons.filter(p => 
          p.name.trim() !== '' || 
          p.surname.trim() !== '' || 
          p.nationalId.trim() !== '' || 
          p.address.trim() !== ''
        ),
        
        // Attachments (convert to base64 or handle file upload)
        attachments: formData.attachments
      };
      
      // Call API to create incident record
      console.log('Sending incident data to API:', incidentData);
      // Replace with actual API call
      // const response = await authClient.createIncident(incidentData);
      
      // Mock response for now
      const response = { success: true, reference: 'INC-' + Math.random().toString(36).substr(2, 9).toUpperCase() };
      
      // Check if the response was successful
      if (!response.success) {
        throw new Error('Failed to create incident record');
      }
      
      // Set reference number for the incident
      setReferenceNumber(response.reference);
      setSuccess(true);
      
      // Move to success step
      setActiveStep(steps.length - 1);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error('Error creating ore record:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to create ore record');
      // Show error in UI
      setActiveStep(activeStep); // Stay on current step
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch approved shaft assignments and tax directions when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchApprovedShaftAssignments();
      fetchApprovedTaxDirections();
    }
  }, [open]);
  
  // Function to fetch approved tax directions
  const fetchApprovedTaxDirections = async () => {
    setLoadingTaxDirections(true);
    setTaxDirectionsError('');
    try {
      const response = await authClient.fetchApprovedTaxDirections();
      console.log('Tax directions response:', response);
      
      if (response && Array.isArray(response)) {
        setTaxDirections(response);
        console.log('Setting tax directions:', response);
      } else {
        setTaxDirectionsError('Invalid response format');
        console.error('Invalid tax directions response format');
      }
    } catch (error) {
      console.error('Error fetching tax directions:', error);
      setTaxDirectionsError('Failed to load tax directions');
    } finally {
      setLoadingTaxDirections(false);
    }
  };

  // Function to fetch approved shaft assignments
  const fetchApprovedShaftAssignments = async () => {
    setLoadingShafts(true);
    setShaftError('');
    try {
      const response = await authClient.fetchApprovedShaftAssignments();
      console.log('Shaft assignments response:', response);
      
      if (response && Array.isArray(response)) {
        // Use mock data for testing if response is empty
        if (response.length === 0) {
          const mockData = [
            { id: '1', shaftNumber: 'SA1' },
            { id: '2', shaftNumber: 'SA2' },
            { id: '3', shaftNumber: 'SA3' }
          ];
          
          console.log('Using mock data:', mockData);
        } else {
          setShaftAssignments(response);
          console.log('Setting shaft assignments:', response);
        }
      } else {
        // Use mock data if response is not as expected
        const mockData = [
          { id: '1', shaftNumber: 'SA1' },
          { id: '2', shaftNumber: 'SA2' },
          { id: '3', shaftNumber: 'SA3' }
        ];
        setShaftAssignments(mockData);
        console.log('Using mock data due to invalid response:', mockData);
      }
    } catch (error) {
      console.error('Error fetching shaft assignments:', error);
      setShaftError('Failed to load shaft assignments');
      
      // Use mock data on error
      const mockData = [
        { id: '1', shaftNumber: 'SA1' },
        { id: '2', shaftNumber: 'SA2' },
        { id: '3', shaftNumber: 'SA3' }
      ];
      setShaftAssignments(mockData);
      console.log('Using mock data due to error:', mockData);
    } finally {
      setLoadingShafts(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      // Reset form state
      setActiveStep(0);
      setError(null);
      setSuccess(false);
      setFormSubmitted(false);
      onClose();
    }
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
        Report New Incident
    
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
  
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
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
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
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
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
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
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
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reported By"
                  value={formData.reportedBy}
                  onChange={handleChange('reportedBy')}
                  placeholder="Enter reporter's name"
                  margin="normal"
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
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
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
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" startIcon={<AddIcon />}>
                    Add Files
                  </Button>
                </label>
                
                {formData.attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {formData.attachments.map((file, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1
                      }}>
                        <Typography variant="body2">
                          {file.name}
                        </Typography>
                        <IconButton size="small" onClick={() => removeAttachment(index)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Persons Involved
                </Typography>
                
                {formData.persons.map((person, index) => (
                  <Box key={person.id} sx={{ 
                    p: 2, 
                    mb: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    position: 'relative'
                  }}>
                    {index > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => removePerson(index)}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          color: 'error.main'
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Name"
                          value={person.name}
                          onChange={handlePersonChange(index, 'name')}
                          margin="normal"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Surname"
                          value={person.surname}
                          onChange={handlePersonChange(index, 'surname')}
                          margin="normal"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="National ID"
                          value={person.nationalId}
                          onChange={handlePersonChange(index, 'nationalId')}
                          margin="normal"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={person.address}
                          onChange={handlePersonChange(index, 'address')}
                          margin="normal"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addPerson}
                  sx={{ mt: 1 }}
                >
                  Add Person
                </Button>
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
                Next: Review
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Additional Details - Removed as per requirements */}
        
        {/* Step 4: Review */}
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
                  '&:hover': { bgcolor: '#333' },
                  mr: 1
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Save Incident'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={isSubmitting}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            </Box>
          </Box>
        )}


        {/* Make sure we're accessing the correct activeStep variable */}
        {activeStep === 4 && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Ore Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The ore record has been created. Here is the reference number:
              </Typography>
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