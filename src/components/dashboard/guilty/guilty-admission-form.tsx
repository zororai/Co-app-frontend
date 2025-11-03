'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { PrinterIcon } from '@phosphor-icons/react/dist/ssr/Printer';
import { authClient } from '@/lib/auth/client';

interface GuiltyAdmissionFormData {
  // Contravention details
  contraventions: string[];
  
  // Personal details
  raisedBy: string;
  idOrNrNumber: string;
  address: string;
  occupation: string;
  holderOf: string;
  holderNumber: string;
  issuedDate: string;
  
  // Admission details
  admitGuilty: string;
  descriptionOfOffence: string;
  
  // Location and signature details
  shaftNumber: string;
  date: string;
  offenderSignature: string;
  dateCharged: string;
  shaftStatus: string;
  
  // Payment details
  totalAmount: string;
  
  // Official signatures
  officialSigned: string;
  sheManagerSigned: string;
  inspectorAccepted: string;
  acceptedDate: string;
  
  // Additional fields for API
  status?: string;
  remarks?: string;
}

export function GuiltyAdmissionForm(): React.JSX.Element {
  const [formData, setFormData] = React.useState<GuiltyAdmissionFormData>({
    contraventions: [
      'MINING (MANAGEMENT AND SAFETY) REGULATIONS, 1990 SI 109 OF 1990',
      'EXPLOSIVES REGULATIONS,1989 S.L 72 OF 1989'
    ],
    raisedBy: '',
    idOrNrNumber: '',
    address: '',
    occupation: '',
    holderOf: '',
    holderNumber: '',
    issuedDate: '',
    admitGuilty: '',
    descriptionOfOffence: '',
    shaftNumber: '',
    date: '',
    offenderSignature: '',
    dateCharged: '',
    shaftStatus: '',
    totalAmount: '',
    officialSigned: '',
    sheManagerSigned: '',
    inspectorAccepted: '',
    acceptedDate: '',
    status: 'Submitted',
    remarks: '',
  });

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [success, setSuccess] = React.useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [suspensionLoading, setSuspensionLoading] = React.useState(false);
  
  // Shaft assignments state
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [selectedShaft, setSelectedShaft] = React.useState<any>(null);
  const [selectedShaftData, setSelectedShaftData] = React.useState<{id: string, minerId: string} | null>(null);

  // Fetch shaft assignments on component mount
  React.useEffect(() => {
    const fetchShaftAssignments = async () => {
      try {
        const data = await authClient.fetchApprovedShaftAssignments();
        if (data && Array.isArray(data)) {
          setShaftAssignments(data);
        }
      } catch (error) {
        console.error('Error fetching shaft assignments:', error);
      }
    };

    fetchShaftAssignments();
  }, []);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate the print content
    const printContent = generatePrintContent();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admission of Guilt Form</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
              color: #000;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              font-weight: bold;
              font-size: 16px;
            }
            .section { 
              margin-bottom: 25px; 
            }
            .section-title { 
              font-weight: bold; 
              margin-bottom: 15px; 
              font-size: 14px;
              text-decoration: underline;
            }
            .field { 
              margin-bottom: 12px; 
              display: flex;
              align-items: flex-start;
            }
            .field-label { 
              font-weight: bold; 
              margin-right: 10px; 
              min-width: 120px;
            }
            .field-value { 
              border-bottom: 1px solid #000; 
              flex: 1; 
              min-height: 20px;
              padding-bottom: 2px;
            }
            .contravention-item {
              margin-bottom: 10px;
              display: flex;
              align-items: flex-start;
            }
            .contravention-number {
              font-weight: bold;
              margin-right: 10px;
              min-width: 20px;
            }
            .contravention-text {
              border-bottom: 1px solid #000;
              flex: 1;
              min-height: 20px;
              padding-bottom: 2px;
            }
            .signature-section {
              margin-top: 40px;
            }
            .signature-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .signature-field {
              width: 45%;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              font-style: italic;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Generate print content
  const generatePrintContent = () => {
    return `
      <div class="header">
        ADMISSION OF GUILT IN TERMS OF SECTION 392 OF THE MINES AND MINERALS ACT CHAPTER 21:05 AND THE EXPLOSIVE 5 ACT CHAPTER 10:07 (AS AMENDED)
      </div>

      <div class="section">
        <div class="section-title">CONTRAVENTION OF:</div>
        ${formData.contraventions.map((contravention, index) => `
          <div class="contravention-item">
            <div class="contravention-number">${index + 1}.</div>
            <div class="contravention-text">${contravention || '___________________________'}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="field">
          <div class="field-label">Raised by:</div>
          <div class="field-value">${formData.raisedBy || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">ID Or NR Number:</div>
          <div class="field-value">${formData.idOrNrNumber || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Address:</div>
          <div class="field-value">${formData.address || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Occupation:</div>
          <div class="field-value">${formData.occupation || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Holder Of:</div>
          <div class="field-value">${formData.holderOf || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Number:</div>
          <div class="field-value">${formData.holderNumber || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date:</div>
          <div class="field-value">${formData.issuedDate || '___________________________'}</div>
        </div>
      </div>

      <div class="section">
        <div class="field">
          <div class="field-label">Admit that I am guilty of contravening:</div>
        </div>
        <div class="field-value" style="margin-top: 10px; min-height: 40px;">
          ${formData.admitGuilty || '___________________________'}
        </div>
      </div>

      <div class="section">
        <div class="field">
          <div class="field-label">Description of Offence:</div>
        </div>
        <div class="field-value" style="margin-top: 10px; min-height: 60px;">
          ${formData.descriptionOfOffence || '___________________________'}
        </div>
      </div>

      <div class="section">
        <div class="field">
          <div class="field-label">Shaft Number:</div>
          <div class="field-value">${formData.shaftNumber || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date:</div>
          <div class="field-value">${formData.date || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Signature (Of Offender):</div>
          <div class="field-value">${formData.offenderSignature || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date Charged:</div>
          <div class="field-value">${formData.dateCharged || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Shaft Status:</div>
          <div class="field-value">${formData.shaftStatus || '___________________________'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="field">
          <div class="field-label">Total Amount:</div>
          <div class="field-value">${formData.totalAmount || '___________________________'}</div>
        </div>
      </div>

      <div class="signature-section">
        <div class="section-title">Official Signatures</div>
        <div class="signature-row">
          <div class="signature-field">
            <div class="field">
              <div class="field-label">Signed:</div>
              <div class="field-value">${formData.officialSigned || '___________________________'}</div>
            </div>
          </div>
          <div class="signature-field">
            <div class="field">
              <div class="field-label">(S.H.E MANAGER):</div>
              <div class="field-value">${formData.sheManagerSigned || '___________________________'}</div>
            </div>
          </div>
        </div>
        <div class="signature-row">
          <div class="signature-field">
            <div class="field">
              <div class="field-label">Accepted (Inspector Of Mines):</div>
              <div class="field-value">${formData.inspectorAccepted || '___________________________'}</div>
            </div>
          </div>
          <div class="signature-field">
            <div class="field">
              <div class="field-label">Date:</div>
              <div class="field-value">${formData.acceptedDate || '___________________________'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        To be completed in TRIPLICATE and all three copies to be sent to the inspector on mines.<br>
        Copies will be returned to the owner of the mine's records.
      </div>
    `;
  };

  const handleInputChange = (field: keyof GuiltyAdmissionFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Handle contravention changes
  const handleContraventionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contraventions: prev.contraventions.map((item, i) => i === index ? value : item)
    }));
  };

  // Add new contravention
  const addContravention = () => {
    setFormData((prev) => ({
      ...prev,
      contraventions: [...prev.contraventions, '']
    }));
  };

  // Remove contravention
  const removeContravention = (index: number) => {
    if (formData.contraventions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        contraventions: prev.contraventions.filter((_, i) => i !== index)
      }));
    }
  };

  // Validate ID number format (flexible for different ID types)
  const validateIdNumber = (idNumber: string): boolean => {
    // Remove any spaces or dashes
    const cleanId = idNumber.replace(/[\s-]/g, '');
    
    // Must be at least 5 characters and contain alphanumeric characters
    if (cleanId.length < 5) return false;
    
    // Check if it contains only alphanumeric characters
    const pattern = /^[A-Za-z0-9]+$/;
    return pattern.test(cleanId);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required field validation
    if (!formData.raisedBy.trim()) {
      newErrors.raisedBy = 'Please fill out this field';
    }
    if (!formData.idOrNrNumber.trim()) {
      newErrors.idOrNrNumber = 'Please fill out this field';
    } else if (!validateIdNumber(formData.idOrNrNumber)) {
      newErrors.idOrNrNumber = 'Invalid ID format. Must be at least 5 alphanumeric characters';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Please fill out this field';
    }
    if (!formData.occupation.trim()) {
      newErrors.occupation = 'Please fill out this field';
    }
    if (!formData.admitGuilty.trim()) {
      newErrors.admitGuilty = 'Please fill out this field';
    }
    if (!formData.descriptionOfOffence.trim()) {
      newErrors.descriptionOfOffence = 'Please fill out this field';
    }

    // Date validation - prevent past dates
    const today = new Date().toISOString().split('T')[0];
    
    if (formData.issuedDate && formData.issuedDate < today) {
      newErrors.issuedDate = 'Date cannot be in the past';
    }
    
    if (formData.date && formData.date < today) {
      newErrors.date = 'Date cannot be in the past';
    }
    
    if (formData.dateCharged && formData.dateCharged < today) {
      newErrors.dateCharged = 'Date cannot be in the past';
    }
    
    if (formData.acceptedDate && formData.acceptedDate < today) {
      newErrors.acceptedDate = 'Date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API submission
      const contraventionData = {
        mineid: selectedShaftData?.minerId || '',
        contraventionOf: formData.contraventions?.filter(c => c?.trim() !== '') || [],
        raisedby: formData.raisedBy || '',
        idOrNrNumber: formData.idOrNrNumber || '',
        address: formData.address || '',
        occupation: formData.occupation || '',
        holderOf: formData.holderOf || '',
        number: formData.holderNumber || '',
        admitof: formData.admitGuilty || '',
        descriptionOfOffence: formData.descriptionOfOffence || '',
        shaftnumber: formData.shaftNumber || '',
        offenceDate: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        signatureOfOffender: formData.offenderSignature || '',
        dateCharged: formData.dateCharged ? new Date(formData.dateCharged).toISOString() : new Date().toISOString(),
        shaftStatus: formData.shaftStatus || '',
        inspectorOfMines: formData.inspectorAccepted || '',
        acceptedDate: formData.acceptedDate ? new Date(formData.acceptedDate).toISOString() : new Date().toISOString(),
        status: 'Submitted',
        remarks: '',
        fineAmount: parseFloat(formData.totalAmount) || 0,
        finePaid: false,
        signed: formData.officialSigned || '',
        sheManager: formData.sheManagerSigned || '',
        inspectorOfMiners: formData.inspectorAccepted || '',
        shaftid: selectedShaftData?.id || '',
      };

      // Debug: Log the data being sent
      console.log('Form data before submission:', formData);
      console.log('Contravention data being sent:', contraventionData);
      
      // Test JSON serialization
      try {
        const jsonString = JSON.stringify(contraventionData);
        console.log('JSON stringified data:', jsonString);
      } catch (jsonError) {
        console.error('JSON serialization error:', jsonError);
        setErrors({ submit: 'Invalid data format. Please check all fields.' });
        return;
      }

      // Submit to API
      const result = await authClient.createContravention(contraventionData);
      
      if (!result.success) {
        setErrors({ submit: result.error || 'Failed to submit admission of guilt' });
        return;
      }
      
      setSuccess(true);
      
      // After successful contravention submission, suspend the shaft for SHE
      if (selectedShaftData?.id && formData.shaftStatus) {
        setSuspensionLoading(true);
        try {
          const suspensionResult = await authClient.suspendShaftForSHE(
            selectedShaftData.id,
            formData.shaftStatus
          );
          
          if (suspensionResult.success) {
            console.log('Shaft suspended successfully for SHE');
            setShowSuccessDialog(true);
          } else {
            console.error('Failed to suspend shaft:', suspensionResult.error);
            setErrors({ submit: `Contravention submitted but failed to suspend shaft: ${suspensionResult.error}` });
          }
        } catch (suspensionError) {
          console.error('Error during shaft suspension:', suspensionError);
          setErrors({ submit: 'Contravention submitted but shaft suspension failed' });
        } finally {
          setSuspensionLoading(false);
        }
      } else {
        // If no shaft selected or status, just show success
        setShowSuccessDialog(true);
      }
    } catch (error_) {
      console.error('Error submitting contravention:', error_);
      setErrors({ submit: error_ instanceof Error ? error_.message : 'Failed to submit admission of guilt' });
    } finally {
      setLoading(false);
    }
  };

  // Handle success dialog close and form reset
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    setSuccess(false);
    
    // Reset form
    setFormData({
      contraventions: [
        'MINING (MANAGEMENT AND SAFETY) REGULATIONS, 1990 SI 109 OF 1990',
        'EXPLOSIVES REGULATIONS,1989 S.L 72 OF 1989'
      ],
      raisedBy: '',
      idOrNrNumber: '',
      address: '',
      occupation: '',
      holderOf: '',
      holderNumber: '',
      issuedDate: '',
      admitGuilty: '',
      descriptionOfOffence: '',
      shaftNumber: '',
      date: '',
      offenderSignature: '',
      dateCharged: '',
      shaftStatus: '',
      totalAmount: '',
      officialSigned: '',
      sheManagerSigned: '',
      inspectorAccepted: '',
      acceptedDate: '',
      status: 'Submitted',
      remarks: '',
    });
    
    // Reset shaft selection
    setSelectedShaft(null);
    setSelectedShaftData(null);
    setErrors({});
  };

  // Get today's date for validation
  const today = new Date().toISOString().split('T')[0];

  // TextField styling to match the project theme
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: 'rgb(5, 5, 68)' },
      '&.Mui-focused fieldset': { borderColor: 'rgb(5, 5, 68)' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(5, 5, 68)' },
  };

  return (
    <>
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={4}>
            {errors.submit && (
              <Alert severity="error" onClose={() => setErrors((prev) => ({ ...prev, submit: '' }))}>
                {errors.submit}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success">
                Admission of guilt submitted successfully!
              </Alert>
            )}

            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                ADMISSION OF GUILT IN TERMS OF SECTION 392 OF THE MINES AND MINERALS ACT CHAPTER 21:05 AND THE EXPLOSIVE 5 ACT CHAPTER 10:07 (AS AMMENDED)
              </Typography>
            </Box>

            {/* Contravention Section */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  CONTRAVENTION OF:
                </Typography>
                <Button
                  startIcon={<PlusIcon fontSize="var(--icon-fontSize-sm)" />}
                  onClick={addContravention}
                  disabled={loading}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderColor: 'rgb(5, 5, 68)', 
                    color: 'rgb(5, 5, 68)', 
                    '&:hover': { 
                      borderColor: 'rgb(5, 5, 68)', 
                      backgroundColor: 'rgba(5, 5, 68, 0.04)' 
                    } 
                  }}
                >
                  Add Contravention
                </Button>
              </Stack>
              
              <Stack spacing={2}>
                {formData.contraventions.map((contravention, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                    <Typography sx={{ mt: 2, minWidth: '20px', fontWeight: 'bold' }}>
                      {index + 1}.
                    </Typography>
                    <TextField
                      value={contravention}
                      onChange={(e) => handleContraventionChange(index, e.target.value)}
                      disabled={loading}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Enter contravention details..."
                      sx={textFieldStyle}
                    />
                    {formData.contraventions.length > 1 && (
                      <IconButton
                        onClick={() => removeContravention(index)}
                        disabled={loading}
                        size="small"
                        sx={{ 
                          mt: 1,
                          color: 'error.main',
                          '&:hover': { backgroundColor: 'error.light', color: 'white' }
                        }}
                      >
                        <TrashIcon fontSize="var(--icon-fontSize-sm)" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Personal Details Section */}
            <Box>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Raised by"
                      value={formData.raisedBy}
                      onChange={handleInputChange('raisedBy')}
                      disabled={loading}
                      fullWidth
                      required
                      error={!!errors.raisedBy}
                      helperText={errors.raisedBy}
                      sx={textFieldStyle}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="ID Or NR Number"
                      value={formData.idOrNrNumber}
                      onChange={handleInputChange('idOrNrNumber')}
                      disabled={loading}
                      fullWidth
                      placeholder="e.g., 12345678901A"
                      error={!!errors.idOrNrNumber}
                      helperText={errors.idOrNrNumber || "Enter a valid ID or NR number (e.g., National ID, Passport, etc.)"}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
                
                <Box>
                  <TextField
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    disabled={loading}
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address}
                    sx={textFieldStyle}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Occupation"
                      value={formData.occupation}
                      onChange={handleInputChange('occupation')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.occupation}
                      helperText={errors.occupation}
                      sx={textFieldStyle}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Holder Of"
                      value={formData.holderOf}
                      onChange={handleInputChange('holderOf')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.holderOf}
                      helperText={errors.holderOf}
                      sx={textFieldStyle}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Number"
                      value={formData.holderNumber}
                      onChange={handleInputChange('holderNumber')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.holderNumber}
                      helperText={errors.holderNumber}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <TextField
                      label="Date"
                      value={formData.issuedDate}
                      onChange={handleInputChange('issuedDate')}
                      disabled={loading}
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.issuedDate}
                      helperText={errors.issuedDate}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Admission Section */}
            <Box>
              <Stack spacing={3}>
                <TextField
                  label="Admit that I am guilty of contravening"
                  value={formData.admitGuilty}
                  onChange={handleInputChange('admitGuilty')}
                  disabled={loading}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.admitGuilty}
                  helperText={errors.admitGuilty}
                  sx={textFieldStyle}
                />
                <TextField
                  label="Description of Offence"
                  value={formData.descriptionOfOffence}
                  onChange={handleInputChange('descriptionOfOffence')}
                  disabled={loading}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  error={!!errors.descriptionOfOffence}
                  helperText={errors.descriptionOfOffence}
                  sx={textFieldStyle}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Signature Section */}
            <Box>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <Autocomplete
                      options={shaftAssignments}
                      getOptionLabel={(option) => `${option.sectionName} - ${option.shaftNumbers}`}
                      value={selectedShaft}
                      onChange={(event, newValue) => {
                        setSelectedShaft(newValue);
                        if (newValue) {
                          setSelectedShaftData({
                            id: newValue.id,
                            minerId: newValue.minerId
                          });
                          setFormData(prev => ({
                            ...prev,
                            shaftNumber: newValue.shaftNumbers
                          }));
                          // You can access the selected data here:
                          console.log('Selected Shaft ID:', newValue.id);
                          console.log('Selected Miner ID:', newValue.minerId);
                        } else {
                          setSelectedShaftData(null);
                          setFormData(prev => ({
                            ...prev,
                            shaftNumber: ''
                          }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Shaft Number"
                          error={!!errors.shaftNumber}
                          helperText={errors.shaftNumber}
                          sx={textFieldStyle}
                        />
                      )}
                      disabled={loading}
                      fullWidth
                      filterOptions={(options, { inputValue }) => {
                        return options.filter(option =>
                          option.sectionName.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.shaftNumbers.toLowerCase().includes(inputValue.toLowerCase())
                        );
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#d1d5db' },
                          '&:hover fieldset': { borderColor: 'rgb(5, 5, 68)' },
                          '&.Mui-focused fieldset': { borderColor: 'rgb(5, 5, 68)' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(5, 5, 68)' },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Date"
                      value={formData.date}
                      onChange={handleInputChange('date')}
                      disabled={loading}
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Signature (Of Offender)"
                      value={formData.offenderSignature}
                      onChange={handleInputChange('offenderSignature')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.offenderSignature}
                      helperText={errors.offenderSignature}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Date Charged"
                      value={formData.dateCharged}
                      onChange={handleInputChange('dateCharged')}
                      disabled={loading}
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateCharged}
                      helperText={errors.dateCharged}
                      sx={textFieldStyle}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <FormControl fullWidth error={!!errors.shaftStatus} sx={textFieldStyle}>
                      <InputLabel>Shaft Status</InputLabel>
                      <Select
                        value={formData.shaftStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, shaftStatus: e.target.value }))}
                        disabled={loading}
                        label="Shaft Status"
                      >
                        <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                        <MenuItem value="CLOSED">CLOSED</MenuItem>
                      </Select>
                      {errors.shaftStatus && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.shaftStatus}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Payment Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Payment Details
              </Typography>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Total Amount"
                      value={formData.totalAmount}
                      onChange={handleInputChange('totalAmount')}
                      disabled={loading}
                      fullWidth
                      type="number"
                      error={!!errors.totalAmount}
                      helperText={errors.totalAmount}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Official Signatures Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Official Signatures
              </Typography>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Signed"
                      value={formData.officialSigned}
                      onChange={handleInputChange('officialSigned')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.officialSigned}
                      helperText={errors.officialSigned}
                      sx={textFieldStyle}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="(S.H.E MANAGER)"
                      value={formData.sheManagerSigned}
                      onChange={handleInputChange('sheManagerSigned')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.sheManagerSigned}
                      helperText={errors.sheManagerSigned}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Accepted (Inspector Of Mines)"
                      value={formData.inspectorAccepted}
                      onChange={handleInputChange('inspectorAccepted')}
                      disabled={loading}
                      fullWidth
                      error={!!errors.inspectorAccepted}
                      helperText={errors.inspectorAccepted}
                      sx={textFieldStyle}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                    <TextField
                      label="Date"
                      value={formData.acceptedDate}
                      onChange={handleInputChange('acceptedDate')}
                      disabled={loading}
                      fullWidth
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.acceptedDate}
                      helperText={errors.acceptedDate}
                      sx={textFieldStyle}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                To be completed in TRIPLICATE and all three copies to be sent to the inspector on mines.
                Copies will be returned to the owner of the mine's records.
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button
                onClick={handlePrint}
                variant="outlined"
                startIcon={<PrinterIcon fontSize="var(--icon-fontSize-md)" />}
                sx={{ 
                  borderColor: 'rgb(5, 5, 68)', 
                  color: 'rgb(5, 5, 68)', 
                  '&:hover': { 
                    borderColor: 'rgb(5, 5, 68)', 
                    backgroundColor: 'rgba(5, 5, 68, 0.04)' 
                  },
                  px: 4,
                  py: 1.5
                }}
              >
                Print Form
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || success || suspensionLoading}
                startIcon={(loading || suspensionLoading) ? <CircularProgress size={16} /> : null}
                sx={{ 
                  bgcolor: 'rgb(5, 5, 68)',
                  '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
                  px: 4,
                  py: 1.5
                }}
              >
                {loading ? 'Submitting...' : suspensionLoading ? 'Suspending Shaft...' : 'Submit Admission of Guilt'}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>

    {/* Success Dialog */}
    <Dialog
      open={showSuccessDialog}
      onClose={handleSuccessDialogClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: 'success.main', 
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        ✅ Success!
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h6" sx={{ textAlign: 'center', color: 'success.main' }}>
            Admission of Guilt Submitted Successfully
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            Your admission of guilt has been submitted and processed.
          </Typography>
          {selectedShaftData?.id && formData.shaftStatus && (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Shaft {formData.shaftNumber} has been suspended with status: <strong>{formData.shaftStatus}</strong>
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={handleSuccessDialogClose}
          variant="contained"
          sx={{ 
            bgcolor: 'rgb(5, 5, 68)',
            '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
            px: 4
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
