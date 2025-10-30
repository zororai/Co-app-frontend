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
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
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
  issuedAt: string;
  issuedDate: string;
  time: string;
  
  // Admission details
  admitGuilty: string;
  descriptionOfOffence: string;
  
  // Location and signature details
  place: string;
  date: string;
  signatureTime: string;
  offenderSignature: string;
  dateCharged: string;
  mineNumber: string;
  
  // Payment details
  totalAmount: string;
  firstAccountAmount: string;
  secondAccountAmount: string;
  thirdAccountAmount: string;
  
  // Official signatures
  officialSigned: string;
  sheManagerSigned: string;
  inspectorAccepted: string;
  acceptedDate: string;
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
    issuedAt: '',
    issuedDate: '',
    time: '',
    admitGuilty: '',
    descriptionOfOffence: '',
    place: '',
    date: '',
    signatureTime: '',
    offenderSignature: '',
    dateCharged: '',
    mineNumber: '',
    totalAmount: '',
    firstAccountAmount: '',
    secondAccountAmount: '',
    thirdAccountAmount: '',
    officialSigned: '',
    sheManagerSigned: '',
    inspectorAccepted: '',
    acceptedDate: '',
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Print function
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
          <div class="field-label">Issued At:</div>
          <div class="field-value">${formData.issuedAt || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date:</div>
          <div class="field-value">${formData.issuedDate || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Time:</div>
          <div class="field-value">${formData.time || '___________________________'}</div>
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
          <div class="field-label">Place:</div>
          <div class="field-value">${formData.place || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date:</div>
          <div class="field-value">${formData.date || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">Time:</div>
          <div class="field-value">${formData.signatureTime || '___________________________'}</div>
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
          <div class="field-label">Mine Number:</div>
          <div class="field-value">${formData.mineNumber || '___________________________'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="field">
          <div class="field-label">Total Amount:</div>
          <div class="field-value">${formData.totalAmount || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">1st Account Amount:</div>
          <div class="field-value">${formData.firstAccountAmount || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">2nd Account Amount:</div>
          <div class="field-value">${formData.secondAccountAmount || '___________________________'}</div>
        </div>
        <div class="field">
          <div class="field-label">3rd Account Amount:</div>
          <div class="field-value">${formData.thirdAccountAmount || '___________________________'}</div>
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
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (error) {
      setError(null);
    }
  };

  // Handle contravention changes
  const handleContraventionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contraventions: prev.contraventions.map((item, i) => i === index ? value : item)
    }));
    if (error) {
      setError(null);
    }
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!formData.raisedBy.trim()) {
      setError('Raised by field is required');
      return;
    }
    if (!formData.admitGuilty.trim()) {
      setError('Admission of guilt statement is required');
      return;
    }
    if (!formData.descriptionOfOffence.trim()) {
      setError('Description of offence is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Here you would typically call an API to submit the form
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
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
          issuedAt: '',
          issuedDate: '',
          time: '',
          admitGuilty: '',
          descriptionOfOffence: '',
          place: '',
          date: '',
          signatureTime: '',
          offenderSignature: '',
          dateCharged: '',
          mineNumber: '',
          totalAmount: '',
          firstAccountAmount: '',
          secondAccountAmount: '',
          thirdAccountAmount: '',
          officialSigned: '',
          sheManagerSigned: '',
          inspectorAccepted: '',
          acceptedDate: '',
        });
        setSuccess(false);
      }, 3000);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to submit admission of guilt');
    } finally {
      setLoading(false);
    }
  };

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
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
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
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Raised by"
                    value={formData.raisedBy}
                    onChange={handleInputChange('raisedBy')}
                    disabled={loading}
                    fullWidth
                    required
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="ID Or NR Number"
                    value={formData.idOrNrNumber}
                    onChange={handleInputChange('idOrNrNumber')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    disabled={loading}
                    fullWidth
                    multiline
                    rows={2}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Occupation"
                    value={formData.occupation}
                    onChange={handleInputChange('occupation')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Holder Of"
                    value={formData.holderOf}
                    onChange={handleInputChange('holderOf')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Number"
                    value={formData.holderNumber}
                    onChange={handleInputChange('holderNumber')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Issued At"
                    value={formData.issuedAt}
                    onChange={handleInputChange('issuedAt')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Date"
                    value={formData.issuedDate}
                    onChange={handleInputChange('issuedDate')}
                    disabled={loading}
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Time"
                    value={formData.time}
                    onChange={handleInputChange('time')}
                    disabled={loading}
                    fullWidth
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Admission Section */}
            <Box>
              <TextField
                label="Admit that I am guilty of contravening"
                value={formData.admitGuilty}
                onChange={handleInputChange('admitGuilty')}
                disabled={loading}
                fullWidth
                required
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Box>

            <Box>
              <TextField
                label="Description of Offence"
                value={formData.descriptionOfOffence}
                onChange={handleInputChange('descriptionOfOffence')}
                disabled={loading}
                fullWidth
                required
                multiline
                rows={4}
                sx={textFieldStyle}
              />
            </Box>

            <Divider />

            {/* Signature Section */}
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Place"
                    value={formData.place}
                    onChange={handleInputChange('place')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date"
                    value={formData.date}
                    onChange={handleInputChange('date')}
                    disabled={loading}
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Time"
                    value={formData.signatureTime}
                    onChange={handleInputChange('signatureTime')}
                    disabled={loading}
                    fullWidth
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Signature (Of Offender)"
                    value={formData.offenderSignature}
                    onChange={handleInputChange('offenderSignature')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date Charged"
                    value={formData.dateCharged}
                    onChange={handleInputChange('dateCharged')}
                    disabled={loading}
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mine Number"
                    value={formData.mineNumber}
                    onChange={handleInputChange('mineNumber')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Payment Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Payment Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Amount"
                    value={formData.totalAmount}
                    onChange={handleInputChange('totalAmount')}
                    disabled={loading}
                    fullWidth
                    type="number"
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="1st Account Amount"
                    value={formData.firstAccountAmount}
                    onChange={handleInputChange('firstAccountAmount')}
                    disabled={loading}
                    fullWidth
                    type="number"
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="2nd Account Amount"
                    value={formData.secondAccountAmount}
                    onChange={handleInputChange('secondAccountAmount')}
                    disabled={loading}
                    fullWidth
                    type="number"
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="3rd Account Amount"
                    value={formData.thirdAccountAmount}
                    onChange={handleInputChange('thirdAccountAmount')}
                    disabled={loading}
                    fullWidth
                    type="number"
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Official Signatures Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Official Signatures
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Signed"
                    value={formData.officialSigned}
                    onChange={handleInputChange('officialSigned')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="(S.H.E MANAGER)"
                    value={formData.sheManagerSigned}
                    onChange={handleInputChange('sheManagerSigned')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Accepted (Inspector Of Mines)"
                    value={formData.inspectorAccepted}
                    onChange={handleInputChange('inspectorAccepted')}
                    disabled={loading}
                    fullWidth
                    sx={textFieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date"
                    value={formData.acceptedDate}
                    onChange={handleInputChange('acceptedDate')}
                    disabled={loading}
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldStyle}
                  />
                </Grid>
              </Grid>
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
                disabled={loading || success}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{ 
                  bgcolor: 'rgb(5, 5, 68)',
                  '&:hover': { bgcolor: 'rgba(5, 5, 68, 0.9)' },
                  px: 4,
                  py: 1.5
                }}
              >
                {loading ? 'Submitting...' : 'Submit Admission of Guilt'}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
