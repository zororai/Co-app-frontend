'use client';

import * as React from 'react';
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
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Chip,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { authClient } from '@/lib/auth/client';

interface ShaftInspectionDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  inspectionId?: string | number | null;
  mode?: 'create' | 'edit';
}

interface FormData {
  inspectorName: string;
  location: string;
  inspectionDate: dayjs.Dayjs | null;
  inspectionTime: dayjs.Dayjs | null;
  inspectionType: string[];
  hazardControlProgram: string;
  observations: string;
  pollutionStatus: string;
  correctiveActions: string;
  eapMaterial: string;
  complianceStatus: string;
  status: string;
  shaftNumbers: string[];
  sectionName: string;
  attachments: File[];
}

const inspectionTypes = [
  'Air Quality',
  'Waste Disposal',
  'Safety Check',
  'Equipment Inspection',
  'Environmental Assessment',
  'Structural Integrity',
  'Emergency Preparedness'
];

const pollutionStatuses = [
  'No Pollution',
  'Minor Leak',
  'Major Spill',
  'Other'
];

const complianceStatuses = [
  'Compliant',
  'Non Compliant',
  'Partially Compliant'
];

const statusOptions = [
  'SUSPENDED',
  'CLOSED',
  'APPROVED'
];

const sectionOptions = [
  'Section A',
  'Section B',
  'Section C',
  'Section D',
  'Section E',
  'North Section',
  'South Section',
  'East Section',
  'West Section'
];

const mockShaftNumbers = [
  'SHAFT-001',
  'SHAFT-002',
  'SHAFT-003',
  'SHAFT-004',
  'SHAFT-005'
];

export function ShaftInspectionDialog({
  open,
  onClose,
  onRefresh,
  inspectionId = null,
  mode = 'create'
}: ShaftInspectionDialogProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<FormData>({
    inspectorName: '',
    location: '',
    inspectionDate: null,
    inspectionTime: null,
    inspectionType: [],
    hazardControlProgram: '',
    observations: '',
    pollutionStatus: '',
    correctiveActions: '',
    eapMaterial: '',
    complianceStatus: '',
    status: '',
    shaftNumbers: [],
    sectionName: '',
    attachments: []
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [loadingData, setLoadingData] = React.useState(false);

  // Approved shafts for selection
  interface ApprovedShaftOption {
    sectionName: string;
    shaftNumbers: string; // API seems to return single shaft number per item
    [key: string]: any;
  }
  const [approvedShafts, setApprovedShafts] = React.useState<ApprovedShaftOption[]>([]);
  const [approvedShaftsLoading, setApprovedShaftsLoading] = React.useState(false);
  const [approvedShaftsError, setApprovedShaftsError] = React.useState<string | null>(null);
  const [selectedShaftAssignmentId, setSelectedShaftAssignmentId] = React.useState<string | number | null>(null);

  // Load approved shafts
  React.useEffect(() => {
    let isMounted = true;
    const loadApproved = async () => {
      setApprovedShaftsLoading(true);
      setApprovedShaftsError(null);
      try {
        const data = await authClient.fetchapprovedshaft();
        if (!isMounted) return;
        // Normalize items to expected shape
        const normalized: ApprovedShaftOption[] = (Array.isArray(data) ? data : []).map((item: any) => ({
          sectionName: item.sectionName ?? item.section ?? '',
          shaftNumbers: item.shaftNumbers ?? item.shaftNumber ?? '',
          id: item.id ?? item.assignmentId ?? item.shaftId ?? item.shaftAssignmentId,
          ...item,
        })).filter(opt => opt.shaftNumbers);
        setApprovedShafts(normalized);
      } catch (e: any) {
        if (!isMounted) return;
        setApprovedShaftsError(e?.message || 'Failed to load approved shafts');
      } finally {
        if (isMounted) setApprovedShaftsLoading(false);
      }
    };
    loadApproved();
    return () => { isMounted = false; };
  }, []);

  // Load existing inspection data for edit mode
  React.useEffect(() => {
    let isMounted = true;
    const loadInspectionData = async () => {
      if (mode === 'edit' && inspectionId && open) {
        setLoadingData(true);
        setError(null);
        try {
          const result = await authClient.fetchShaftInspectionById(String(inspectionId));
          if (!isMounted) return;
          
          if (result.success && result.data) {
            const data = result.data;
            // Convert the data to match form structure
            setFormData({
              inspectorName: data.inspectorName || '',
              location: data.location || '',
              inspectionDate: data.inspectionDate ? dayjs(data.inspectionDate) : null,
              inspectionTime: data.inspectionDate ? dayjs(data.inspectionDate) : null,
              inspectionType: data.inspectionType ? [data.inspectionType] : [],
              hazardControlProgram: data.hazardControlProgram || '',
              observations: data.observations || '',
              pollutionStatus: data.pollutionStatus || '',
              correctiveActions: data.correctiveActions || '',
              eapMaterial: data.esapMaterials || '',
              complianceStatus: data.complianceStatus || '',
              status: data.status || '',
              shaftNumbers: data.shaftNumbers ? [data.shaftNumbers] : [],
              sectionName: '',
              attachments: [] // Attachments will be handled separately
            });
          } else {
            setError(result.error || 'Failed to load inspection data');
          }
        } catch (err: any) {
          if (!isMounted) return;
          setError(err?.message || 'Failed to load inspection data');
        } finally {
          if (isMounted) setLoadingData(false);
        }
      }
    };
    loadInspectionData();
    return () => { isMounted = false; };
  }, [mode, inspectionId, open]);

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form
      setFormData({
        inspectorName: '',
        location: '',
        inspectionDate: null,
        inspectionTime: null,
        inspectionType: [],
        hazardControlProgram: '',
        observations: '',
        pollutionStatus: '',
        correctiveActions: '',
        eapMaterial: '',
        complianceStatus: '',
        status: '',
        shaftNumbers: [],
        sectionName: '',
        attachments: []
      });
      setError(null);
      setValidationErrors({});
      setSuccessMessage(null);
    }
  };

  const handleChange = (field: keyof FormData) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const handleInspectionTypeChange = (event: any, newValue: string[]) => {
    setFormData(prev => ({ ...prev, inspectionType: newValue }));
  };

  const handleShaftNumbersChange = (event: any, newValue: string[]) => {
    setFormData(prev => ({ ...prev, shaftNumbers: newValue }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.inspectorName.trim()) {
      errors.inspectorName = 'Inspector name is required';
    }
   
    if (!formData.inspectionDate) {
      errors.inspectionDate = 'Inspection date is required';
    }
    if (!formData.status) {
      errors.status = 'Status is required';
    }
 
    if (formData.inspectionType.length === 0) {
      errors.inspectionType = 'At least one inspection type is required';
    }
    if (!formData.observations.trim()) {
      errors.observations = 'Observations are required';
    }
    if (!formData.pollutionStatus) {
      errors.pollutionStatus = 'Pollution status is required';
    }
    if (!formData.complianceStatus) {
      errors.complianceStatus = 'Compliance status is required';
    }
    if (!formData.shaftNumbers || formData.shaftNumbers.length === 0) {
      errors.shaftNumbers = 'Select a shaft';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Ensure user is authenticated before proceeding
    const token = typeof window !== 'undefined' ? localStorage.getItem('custom-auth-token') : null;
    if (!token) {
      setError('Authentication required. Please sign in first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Convert files to base64 strings for attachments
      const attachments: string[] = [];
      for (const file of formData.attachments) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        attachments.push(base64);
      }

      // Combine date and time to ISO string per API expectations
      let inspectionDateISO = '';
      if (formData.inspectionDate) {
        let dt = dayjs(formData.inspectionDate);
        if (formData.inspectionTime) {
          dt = dt
            .hour(formData.inspectionTime.hour())
            .minute(formData.inspectionTime.minute())
            .second(formData.inspectionTime.second() || 0)
            .millisecond(0);
        } else {
          dt = dt.startOf('day');
        }
        inspectionDateISO = dt.toISOString();
      }

      // Prepare the data according to the API specification
      const inspectionData = {
        inspectorName: formData.inspectorName,
        inspectionDate: inspectionDateISO,
        status: formData.status,
        inspectionType: formData.inspectionType.length > 0 ? formData.inspectionType[0] : '',
        hazardControlProgram: formData.hazardControlProgram,
        observations: formData.observations,
        pollutionStatus: formData.pollutionStatus,
        correctiveActions: formData.correctiveActions,
        esapMaterials: formData.eapMaterial,
        complianceStatus: formData.complianceStatus,
        shaftNumbers: formData.shaftNumbers[0] || '',
        attachments: attachments
      };

      console.log('Submitting shaft inspection data:', inspectionData);
      console.log('Form data before transformation:', formData);
      
      let result;
      if (mode === 'edit' && inspectionId) {
        result = await authClient.updateShaftInspection(inspectionId, inspectionData);
      } else {
        result = await authClient.createShaftInspection(inspectionData);
      }
      
      if (result.success) {
        // After creating inspection, update the selected shaft assignment status via SHE endpoint
        if (selectedShaftAssignmentId && formData.status) {
          try {
            const suspendRes = await authClient.suspendShaftForSHE(selectedShaftAssignmentId, formData.status);
            if (!suspendRes.success) {
              setError(suspendRes.error || 'Failed to update shaft status for SHE.');
            }
          } catch (e:any) {
            setError(e?.message || 'Failed to update shaft status for SHE.');
          }
        }

        setSuccessMessage(mode === 'edit' ? 'Shaft inspection updated successfully!' : 'Shaft inspection submitted successfully!');
        // Refresh the table if callback is provided
        if (onRefresh) {
          onRefresh();
        }
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit shaft inspection. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting shaft inspection:', err);
      setError('Failed to submit shaft inspection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: 'rgb(5, 5, 68)' },
      '&.Mui-focused fieldset': { borderColor: 'rgb(5, 5, 68)' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(5, 5, 68)' },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          background: ' rgb(5, 5, 68)',
          color: 'white',
          py: 2,
          px: 3,
          m: 0
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {mode === 'edit' ? 'Edit Shaft Inspection' : 'Shaft Inspection Form'}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {/* Header Section */}
        <Box sx={{ width: '100%', px: 3, py: 2, background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Comprehensive Shaft Assessment Form
          </Typography>
        </Box>
        
        <DialogContent sx={{ 
          px: 0, 
          py: 0, 
          maxHeight: '70vh', 
          overflowY: 'auto' 
        }}>
          
          {/* Loading Data Indicator */}
          {loadingData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={32} sx={{ color: 'rgb(5, 5, 68)' }} />
              <Typography variant="body2" sx={{ ml: 2 }}>Loading inspection data...</Typography>
            </Box>
          )}
          
          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mx: 3, mt: 2, mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mx: 3, mt: 2, mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {/* Inspection Details Section */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Inspection Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Inspector Name"
                  value={formData.inspectorName}
                  onChange={handleChange('inspectorName')}
                  placeholder="Enter inspector's name"
                  size="small"
                  sx={textFieldStyle}
                  error={!!validationErrors.inspectorName}
                  helperText={validationErrors.inspectorName}
                />
              
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Inspection Date"
                  value={formData.inspectionDate}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, inspectionDate: newValue }))}
                  disabled={true}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: textFieldStyle,
                      error: !!validationErrors.inspectionDate,
                      helperText: validationErrors.inspectionDate
                    }
                  }}
                />
                <TimePicker
                  label="Inspection Time"
                  value={formData.inspectionTime}
                  onChange={(newValue) => setFormData(prev => ({ ...prev, inspectionTime: newValue }))}
                  disabled={true}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: textFieldStyle,
                    }
                  }}
                />
              </Box>

              <FormControl fullWidth size="small" sx={textFieldStyle}>
                <InputLabel>Inspection Type</InputLabel>
                <Select
                  value={formData.inspectionType.length > 0 ? formData.inspectionType[0] : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, inspectionType: e.target.value ? [e.target.value] : [] }))}
                >
                  <MenuItem value="">
                    <em>e.g. Air Quality, Waste Disposal</em>
                  </MenuItem>
                  {inspectionTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.inspectionType && (
                  <FormHelperText error>{validationErrors.inspectionType}</FormHelperText>
                )}
              </FormControl>

              <TextField
                fullWidth
                label="Hazard Control Program"
                value={formData.hazardControlProgram}
                onChange={handleChange('hazardControlProgram')}
                placeholder="Program being evaluated"
                size="small"
                sx={textFieldStyle}
              />
            </Box>
          </Box>

          {/* Findings & Evaluation Section */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Findings & Evaluation
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observations"
              value={formData.observations}
              onChange={handleChange('observations')}
              placeholder="Observed minor leak in waste water treatment pipe near Shaft 5. Ventilation system is functioning below optimal capacity."
              size="small"
              sx={textFieldStyle}
              error={!!validationErrors.observations}
              helperText={validationErrors.observations}
              disabled={true}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} disabled>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Box>

          {/* Pollution Status Section */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Pollution Status
            </Typography>
            
            <FormControl component="fieldset" error={!!validationErrors.pollutionStatus}>
              <RadioGroup
                value={formData.pollutionStatus}
                onChange={handleChange('pollutionStatus')}
                row
                sx={{ gap: 2 }}
              >
                {pollutionStatuses.map((status) => (
                  <FormControlLabel
                    key={status}
                    value={status}
                    control={<Radio sx={{ color: 'rgb(5, 5, 68)', '&.Mui-checked': { color: 'rgb(5, 5, 68)' } }} />}
                    label={status}
                  />
                ))}
              </RadioGroup>
              {validationErrors.pollutionStatus && (
                <FormHelperText>{validationErrors.pollutionStatus}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Corrective Actions Section */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Corrective Actions
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Corrective Actions"
              value={formData.correctiveActions}
              onChange={handleChange('correctiveActions')}
              placeholder="Repair waste water pipe, recalibrate ventilation system M1, and implement daily review for leaks."
              size="small"
              sx={textFieldStyle}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">EAP Material:</Typography>
              <RadioGroup
                value={formData.eapMaterial}
                onChange={handleChange('eapMaterial')}
                row
                sx={{ gap: 1 }}
              >
                <FormControlLabel
                  control={<Radio size="small" sx={{ color: 'rgb(5, 5, 68)', '&.Mui-checked': { color: 'rgb(5, 5, 68)' } }} />}
                  label="Major Leak"
                  value="major"
                />
                <FormControlLabel
                  control={<Radio size="small" sx={{ color: 'rgb(5, 5, 68)', '&.Mui-checked': { color: 'rgb(5, 5, 68)' } }} />}
                  label="Minor"
                  value="minor"
                />
              </RadioGroup>
            </Box>
          </Box>

          {/* Compliance Status Section */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Compliance Status
            </Typography>
            
            <FormControl component="fieldset" error={!!validationErrors.complianceStatus} sx={{ mb: 2 }}>
              <RadioGroup
                value={formData.complianceStatus}
                onChange={handleChange('complianceStatus')}
                row
                sx={{ gap: 2 }}
              >
                {complianceStatuses.map((status) => (
                  <FormControlLabel
                    key={status}
                    value={status}
                    control={<Radio sx={{ color: 'rgb(5, 5, 68)', '&.Mui-checked': { color: 'rgb(5, 5, 68)' } }} />}
                    label={status}
                  />
                ))}
              </RadioGroup>
              {validationErrors.complianceStatus && (
                <FormHelperText>{validationErrors.complianceStatus}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth size="small" sx={textFieldStyle} error={!!validationErrors.status}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || ''}
                onChange={handleChange('status')}
                label="Status"
              >
                <MenuItem value="">
                  <em>Select status</em>
                </MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.status && (
                <FormHelperText>{validationErrors.status}</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Shaft Numbers Section */}
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Shaft Numbers
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          
              
              <Autocomplete
                options={approvedShafts}
                loading={approvedShaftsLoading}
                value={approvedShafts.find(opt => formData.shaftNumbers[0] === opt.shaftNumbers) || null}
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    shaftNumbers: newValue ? [newValue.shaftNumbers] : []
                  }));
                  setSelectedShaftAssignmentId(newValue ? (newValue as any).id ?? null : null);
                }}
                getOptionLabel={(option) => {
                  const sec = option.sectionName || '';
                  const num = option.shaftNumbers || '';
                  return sec && num ? `${sec} - ${num}` : num || sec;
                }}
                isOptionEqualToValue={(a, b) => a.shaftNumbers === b.shaftNumbers}
                sx={textFieldStyle}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Shaft Selection"
                    placeholder="Search and select shafts..."
                    size="small"
                    error={!!validationErrors.shaftNumbers}
                    helperText={validationErrors.shaftNumbers}
                  />
                )}
                noOptionsText={approvedShaftsError ? `Error: ${approvedShaftsError}` : 'No shafts found'}
              />
              
             
            </Box>
          </Box>

          {/* Attachments Section */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'rgb(5, 5, 68)', fontWeight: 'bold', mb: 2 }}>
              Attachments
            </Typography>
            
            <Box sx={{ 
              border: '2px dashed #d1d5db', 
              borderRadius: 1, 
              p: 2, 
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'rgb(5, 5, 68)' }
            }}>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <AttachFileIcon sx={{ fontSize: 32, color: '#9ca3af', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload files or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Inspection photos, logs, water disposal reports
                </Typography>
              </label>

              {formData.attachments.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'left' }}>
                  {formData.attachments.map((file, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      border: '1px solid #e5e7eb',
                      borderRadius: 1,
                      mb: 1,
                      fontSize: '0.875rem'
                    }}>
                      <Typography variant="body2">{file.name}</Typography>
                      <IconButton size="small" onClick={() => removeFile(index)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: 'rgb(5, 5, 68)',
              borderColor: 'rgb(5, 5, 68)',
              '&:hover': { borderColor: 'rgb(5, 5, 68)', backgroundColor: 'rgba(5, 5, 68, 0.04)' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
            sx={{
              bgcolor: 'rgb(5, 5, 68)',
              '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
              px: 3
            }}
          >
            {loading ? (mode === 'edit' ? 'Updating...' : 'Submitting...') : (mode === 'edit' ? 'Update Report' : 'Submit Report')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
