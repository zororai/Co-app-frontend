'use client';

import * as React from 'react';
import { Fragment } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import { styled } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';


interface AddSecurityCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

// Define steps for the stepper
const steps = [
  'Company Information',
  'Required Documents',
  'Working Locations',
  'Review Details',
  'Confirmation'
];

// Define location options
const locationOptions = [
  { id: 'main_shaft', name: 'Main Shaft', description: 'Specific location access' },
  { id: 'processing_plant', name: 'Processing Plant', description: 'Specific location access' },
  { id: 'transport_hub', name: 'Transport Hub', description: 'Specific location access' },
  { id: 'mill_section', name: 'Mill Section', description: 'Specific location access' },
  { id: 'tailings_dam', name: 'Tailings Dam', description: 'Specific location access' },
  { id: 'head_office', name: 'Head Office', description: 'Specific location access' },
  { id: 'security_office', name: 'Security Office', description: 'Specific location access' },
  { id: 'all_sites', name: 'All Sites', description: 'Access to all mine locations' }
];

// Define document types
const requiredDocuments = [
  { id: 'registration', name: 'Company registration certificate', required: true },
  { id: 'insurance', name: 'Proof of insurance', required: true },
  { id: 'license', name: 'Valid operating license', required: true },
  { id: 'tax', name: 'Tax clearance certificate', required: true },
  { id: 'risk', name: 'Site risk assessment report', required: true }
];

// Service types
const serviceTypes = [
  { value: 'on-site', label: 'On-site Security' },
  { value: 'remote', label: 'Remote Monitoring' },
  { value: 'escort', label: 'Escort Services' },
  { value: 'consulting', label: 'Security Consulting' }
];

export function AddSecurityCompanyDialog({ open, onClose, onRefresh }: AddSecurityCompanyDialogProps): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [referenceNumber, setReferenceNumber] = React.useState('');
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    companyName: '',
    registrationNumber: '',
    contactPersonName: '',
    contactEmail: '',
    contactPhone: '',
    serviceType: '',
    headOfficeAddress: '',
    siteOfficeAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    numberOfEmployees: '',
    contractStartDate: null as dayjs.Dayjs | null,
    contractExpiryDate: null as dayjs.Dayjs | null,
    documents: {} as Record<string, File | null>,
    locations: [] as string[],
    status: 'PENDING'
  });

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

  // Handle document upload
  const handleDocumentUpload = (documentId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [documentId]: file
      }
    });
  };

  // Handle location selection
  const handleLocationToggle = (locationId: string) => () => {
    const currentLocations = [...formData.locations];
    const locationIndex = currentLocations.indexOf(locationId);
    
    if (locationId === 'all_sites') {
      // If "All Sites" is selected, clear other selections
      if (locationIndex === -1) {
        setFormData({
          ...formData,
          locations: ['all_sites']
        });
      } else {
        setFormData({
          ...formData,
          locations: []
        });
      }
    } else {
      // If a specific location is selected, remove "All Sites" if present
      if (locationIndex === -1) {
        const newLocations = currentLocations.filter(loc => loc !== 'all_sites');
        newLocations.push(locationId);
        setFormData({
          ...formData,
          locations: newLocations
        });
      } else {
        const newLocations = currentLocations.filter(loc => loc !== locationId);
        setFormData({
          ...formData,
          locations: newLocations
        });
      }
    }
  };

  // Check if a location is selected
  const isLocationSelected = (locationId: string) => {
    return formData.locations.includes(locationId);
  };

  // Handle next step
  const handleNext = () => {
    // For the first step, validate required fields
    if (activeStep === 0) {
      setFormSubmitted(true);
      
      // Check required fields
      if (
        !formData.companyName ||
        !formData.registrationNumber ||
        !formData.contactPersonName ||
        !formData.contactEmail ||
        !validateEmail(formData.contactEmail) ||
        !formData.contactPhone ||
        !formData.serviceType
      ) {
        return; // Don't proceed if validation fails
      }
    }
    
    if (activeStep === steps.length - 2) {
      // Submit form before going to confirmation step
      handleSubmit();
      
      // Refresh the table immediately when moving to confirmation step
      if (onRefresh) {
        onRefresh();
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the data for submission
      const securityCompanyData = {
        companyName: formData.companyName,
        registrationNumber: formData.registrationNumber,
        contactPhone: formData.contactPhone,
        contactPersonName: formData.contactPersonName,
        contactEmail: formData.contactEmail,
        siteAddress: formData.siteOfficeAddress,
        serviceType: formData.serviceType,
        headOfficeAddress: formData.headOfficeAddress,
        numberOfWorks: formData.numberOfEmployees || "0", // Assuming this field exists or defaulting to "0"
        startContractDate: formData.contractStartDate ? formData.contractStartDate.format('YYYY-MM-DD') : '',
        endContractDate: formData.contractExpiryDate ? formData.contractExpiryDate.format('YYYY-MM-DD') : '',
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactName: formData.emergencyContactName,
        locations: formData.locations,
        validTaxClearance: formData.documents?.taxClearance ? 'Uploaded' : '',
        companyLogo: formData.documents?.companyLogo ? 'Uploaded' : '',
        getCertificateOfCooperation: formData.documents?.certificateOfCooperation ? 'Uploaded' : '',
        operatingLicense: formData.documents?.operatingLicense ? 'Uploaded' : '',
        proofOfInsurance: formData.documents?.proofOfInsurance ? 'Uploaded' : '',
        siteRiskAssessmentReport: formData.documents?.riskAssessment ? 'Uploaded' : ''
      };

      // Submit the data using the authClient
      const response = await authClient.registerSecurityCompany(securityCompanyData);
      
      if (response.success) {
        // Generate a reference number
        const refNumber = `SEC-${Math.floor(Math.random() * 900000) + 100000}`;
        setReferenceNumber(refNumber);
        
        setSuccess(true);
        setActiveStep(steps.length - 1);
        
        // Refresh the parent component if needed
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(response.error || 'Failed to submit security company information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit security company information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!loading) {
      // Refresh the parent component if needed
      if (onRefresh && success) {
        onRefresh();
      }
      
      // Reset the form
      setActiveStep(0);
      setError(null);
      setSuccess(false);
      setReferenceNumber('');
      setFormData({
        companyName: '',
        registrationNumber: '',
        contactPersonName: '',
        contactEmail: '',
        contactPhone: '',
        serviceType: '',
        headOfficeAddress: '',
        siteOfficeAddress: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        numberOfEmployees: '',
        contractStartDate: null,
        contractExpiryDate: null,
        documents: {},
        locations: [],
        status: 'PENDING'
      });
      onClose();
    }
  };

  // Render step content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Company Information</Typography>
            
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5 }}>
              {/* Row 1: Company Name | Registration Number */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <TextField
                  required
                  fullWidth
                  label="Company Name *"
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  placeholder="Enter company name"
                  error={formSubmitted && !formData.companyName}
                  helperText={formSubmitted && !formData.companyName ? "Company name is required" : ""}
                 
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <TextField
                  required
                  fullWidth
                  label="Registration Number *"
                  value={formData.registrationNumber}
                  onChange={handleChange('registrationNumber')}
                  placeholder="2019/12345/07"
                  error={formSubmitted && !formData.registrationNumber}
                  helperText={formSubmitted && !formData.registrationNumber ? "Registration number is required" : ""}
                 
                />
              </Box>
              
              {/* Row 2: Contact Person Name | Contact Email */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <TextField
                  required
                  fullWidth
                  label="Contact Person Name *"
                  value={formData.contactPersonName}
                  onChange={handleChange('contactPersonName')}
                  placeholder="Enter contact person name"
                  error={formSubmitted && !formData.contactPersonName}
                  helperText={formSubmitted && !formData.contactPersonName ? "Contact person name is required" : ""}
                  sx={{ padding: 1 }}
                 
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <TextField
                  required
                  fullWidth
                  label="Contact Email *"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange('contactEmail')}
                  placeholder="contact@company.com"
                  error={formSubmitted && (!formData.contactEmail || !validateEmail(formData.contactEmail))}
                  helperText={
                    formSubmitted && !formData.contactEmail 
                      ? "Email is required" 
                      : formSubmitted && !validateEmail(formData.contactEmail)
                      ? "Please enter a valid email address"
                      : ""
                  }
                  sx={{ padding: 1 }}                 
                />
              </Box>
              
              {/* Row 3: Contact Phone | Service Type */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <TextField
                  required
                  fullWidth
                  label="Contact Phone *"
                  value={formData.contactPhone}
                  onChange={handleChange('contactPhone')}
                  placeholder="+27 11 123 4567"
                  error={formSubmitted && !formData.contactPhone}
                  helperText={formSubmitted && !formData.contactPhone ? "Contact phone is required" : ""}
                  sx={{ padding: 1 }}                 
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <FormControl 
                  fullWidth 
                  required 
                  error={formSubmitted && !formData.serviceType}
                >
                  <InputLabel id="service-type-label">Service Type *</InputLabel>
                  <Select
                    labelId="service-type-label"
                    value={formData.serviceType}
                    onChange={handleSelectChange('serviceType')}
                    label="Service Type *"
                    sx={{ height: 56, borderRadius: 1 }}
                  
                  >
                    {serviceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formSubmitted && !formData.serviceType && (
                    <FormHelperText>Service type is required</FormHelperText>
                  )}
                </FormControl>
              </Box>
              
              {/* Row 4: Head Office Address (Full width) */}
              <Box sx={{ width: '100%', px: 1.5 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Head Office Address"
                  value={formData.headOfficeAddress}
                  onChange={handleChange('headOfficeAddress')}
                  placeholder="Enter head office address"
                  sx={{ padding: 1 }}
                />
              </Box>
              
              {/* Row 5: Site Office Address (Full width) */}
              <Box sx={{ width: '100%', px: 1.5 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Site Office Address"
                  value={formData.siteOfficeAddress}
                  onChange={handleChange('siteOfficeAddress')}
                  placeholder="Enter site office address"
                  sx={{ padding: 1 }}
                />
              </Box>
              
              {/* Row 6: Emergency Contact Name | Emergency Contact Phone */}
              <Fragment>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    value={formData.emergencyContactName}
                    onChange={handleChange('emergencyContactName')}
                    placeholder="Emergency contact person"
                    sx={{ padding: 1 }}
                 
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange('emergencyContactPhone')}
                    placeholder="+27 11 987 6543"
                    sx={{ padding: 1 }}
                  />
                </Box>
              </Fragment>
              
              {/* Row 6.5: Number of Employees */}
              <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                <TextField
                  fullWidth
                  label="Number of Employees"
                  value={formData.numberOfEmployees}
                  onChange={handleChange('numberOfEmployees')}
                  placeholder="Enter number of employees"
                  type="number"
                  sx={{ padding: 1 }}
                />
              </Box>
              
              {/* Row 7: Contract Start Date | Contract Expiry Date */}
              <Fragment>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Contract Start Date"
                      value={formData.contractStartDate}
                      onChange={handleDateChange('contractStartDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          sx: { height: 56 }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Contract Expiry Date"
                      value={formData.contractExpiryDate}
                      onChange={handleDateChange('contractExpiryDate')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          sx: { height: 56 }
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Fragment>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <Typography variant="caption" color="text.secondary">
                * Required fields
              </Typography>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Required Documents</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload all required company documents for verification
            </Typography>
            
            {requiredDocuments.map((doc) => (
              <Box 
                key={doc.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 2, color: '#aaa' }}>
                    {formData.documents[doc.id] ? (
                      <CheckCircleOutlineIcon color="success" />
                    ) : (
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">📄</Typography>
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body1">{doc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doc.required ? 'Required document' : 'Optional document'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleDocumentUpload(doc.id)}
                  />
                </Button>
              </Box>
            ))}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Note: All documents must be in PDF format and not exceed 5MB each. Documents will be reviewed as part of the approval process.
            </Alert>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Working Locations
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select the mine locations where this company can operate
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {locationOptions.map((location) => (
                <Box key={location.id} sx={{ width: { xs: '100%', sm: '50%' }, px: 1.5 }}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: isLocationSelected(location.id) ? '#2196f3' : '#e0e0e0',
                      borderRadius: 1,
                      bgcolor: isLocationSelected(location.id) ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#2196f3',
                        bgcolor: 'rgba(33, 150, 243, 0.04)'
                      }
                    }}
                    onClick={handleLocationToggle(location.id)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>{location.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{location.description}</Typography>
                      </Box>
                      {isLocationSelected(location.id) && (
                        <CheckCircleOutlineIcon color="primary" />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Alert severity="warning" sx={{ mt: 3 }}>
              Note: Location assignments can be modified after approval. Selecting "All Sites" grants access to all current and future mine locations.
            </Alert>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Review Company Details</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review all information before submitting for approval
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>Company Information</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {formData.companyName || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Registration:</strong> {formData.registrationNumber || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {serviceTypes.find(t => t.value === formData.serviceType)?.label || 'Not selected'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {formData.contactPersonName || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {formData.contactEmail || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {formData.contactPhone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}></Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Typography variant="subtitle1" fontWeight={500}>Contract Details</Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Start Date:</strong> {formData.contractStartDate ? formData.contractStartDate.format('MMMM D, YYYY') : 'Not set'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Expiry Date:</strong> {formData.contractExpiryDate ? formData.contractExpiryDate.format('MMMM D, YYYY') : 'Not set'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> <span style={{ color: '#F57F17', fontWeight: 500 }}>Pending approval</span>
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>Uploaded Documents ({Object.values(formData.documents).filter(Boolean).length})</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {requiredDocuments.map(doc => (
                    formData.documents[doc.id] ? (
                      <Chip 
                        key={doc.id}
                        label={doc.name}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : null
                  ))}
                  {Object.values(formData.documents).filter(Boolean).length === 0 && (
                    <Typography variant="body2" color="text.secondary">No documents uploaded</Typography>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>
                  Assigned Locations ({formData.locations.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {formData.locations.map(locId => {
                    const location = locationOptions.find(l => l.id === locId);
                    return location ? (
                      <Chip 
                        key={locId}
                        label={location.name}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    ) : null;
                  })}
                  {formData.locations.length === 0 && (
                    <Typography variant="body2" color="text.secondary">No locations selected</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {error ? (
              <>
                <CheckCircleOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="error.main" sx={{ mb: 1 }}>
                  Error Submitting Company
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  {error}
                </Typography>
              </>
            ) : (
              <>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                  Company Submitted Successfully!
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  {formData.companyName} has been submitted for approval and is now pending review.
                </Typography>
              </>
            )}
            
            {!error && (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2">Next Steps:</Typography>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>Company profile has been created with "Pending Approval" status</li>
                  <li>Notification sent to Loss Control Manager and Mine Manager for review</li>
                  <li>Managers will review company details and uploaded documents</li>
                  <li>You will be notified once the approval decision is made</li>
                  <li>Upon approval, the company can begin onboarding workers</li>
                </ul>
              </Alert>
            )}
            
            {error && (
              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2">Troubleshooting Steps:</Typography>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>Check your network connection</li>
                  <li>Verify all required fields are filled correctly</li>
                  <li>Try submitting the form again</li>
                  <li>Contact system administrator if the issue persists</li>
                </ul>
              </Alert>
            )}
      
          </Box>
        );
      default:
        return <Box>Unknown step</Box>;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Add New Security Company
        <Typography variant="body2" color="text.secondary">
          Onboard a new security service provider with complete documentation and location assignments.
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ width: '100%', px: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
      </DialogContent>
      
      {activeStep !== steps.length - 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            sx={{
              bgcolor: activeStep === steps.length - 2 ? '#4caf50' : undefined,
              '&:hover': {
                bgcolor: activeStep === steps.length - 2 ? '#388e3c' : undefined
              }
            }}
          >
            {activeStep === steps.length - 2 ? 'Send for Approval' : 'Next'}
          </Button>
        </Box>
      )}
      
      {activeStep === steps.length - 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant="contained"
            onClick={handleDialogClose}
          >
            Close
          </Button>
        </Box>
      )}
    </Dialog>
  );
}
