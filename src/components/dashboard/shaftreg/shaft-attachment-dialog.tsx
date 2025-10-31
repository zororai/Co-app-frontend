'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { authClient } from '@/lib/auth/client';

export interface ShaftAttachmentDialogProps {
  open: boolean;
  onClose: () => void;
  customerId?: string;

}

interface ShaftAssignmentData {
  sectionName: string;
  shaftNumbers: string;
  medicalFee: string;
  regFee: string;
  startContractDate: string;
  endContractDate: string;
  status: string;
  reason: string;
  latitude: number;
  longitude: number;
}

export function ShaftAttachmentDialog({
  open,
  onClose,
  customerId,
}: ShaftAttachmentDialogProps): React.JSX.Element {
  const [formData, setFormData] = React.useState<ShaftAssignmentData>({
    sectionName: '',
    shaftNumbers: '',
    medicalFee: '',
    regFee: '',
    startContractDate: '',
    endContractDate: '',
    status: 'PENDING',
    reason: '',
    latitude: 0,
    longitude: 0,
  });
  const [sections, setSections] = React.useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (open) {
      fetchSections();
    }
  }, [open]);

  const fetchSections = async () => {
    setSectionsLoading(true);
    try {
      const sectionsData = await authClient.fetchSectionsApproved();
      setSections(sectionsData);
    } catch {
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  };
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleInputChange = (field: keyof ShaftAssignmentData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue);
    setFormData(prev => ({
      ...prev,
      startContractDate: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    setEndDate(newValue);
    setFormData(prev => ({
      ...prev,
      endContractDate: newValue ? newValue.format('YYYY-MM-DD') : '',
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.sectionName || !formData.shaftNumbers || !formData.medicalFee || 
          !formData.regFee || !formData.startContractDate || !formData.endContractDate) {
        throw new Error('Please fill in all required fields');
      }

      // Add minerId and always include status, reason, latitude, and longitude in the payload
      const payload = {
        ...formData,
        status: 'PENDING',
        reason: 'Newly created shaft waiting for approval',
        minerId: customerId,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0
      };
      console.log('Submitting shaft assignment:', payload);
      let result;
      try {
        result = await authClient.createShaftAssignment(payload);
        console.log('Shaft assignment result:', result);
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          globalThis.location.reload();
        }, 2000);
      } catch (error_: any) {
        // If the error is from the API and has status info, show it
        if (error_ && error_.message && error_.message !== '{}' && error_.message.trim() !== '') {
          setError(error_.message);
        } else {
          setError('API Error: Unable to create shaft assignment. Please check your input or try again later.');
        }
        return;
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sectionName: '',
      shaftNumbers: '',
      medicalFee: '',
      regFee: '',
      startContractDate: '',
      endContractDate: '',
      status: 'PENDING',
      reason: '',
      latitude: 0,
      longitude: 0,
    });
    setStartDate(null);
    setEndDate(null);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Shaft Attachment
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Shaft assignment created successfully!
              </Alert>
            )}

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr' }}>
              <TextField
                select
                fullWidth
                label="Section Name"
                value={formData.sectionName || ''}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  // Find the selected section
                  const selectedSection = sections.find(s => s.sectionName === selectedName);
                  // Get the last shaft number (assume section.shaftNumbers is an array or a string)
                  let lastNumber = 0;
                  if (selectedSection) {
                    if (Array.isArray(selectedSection.shaftNumbers)) {
                      lastNumber = Math.max(...selectedSection.shaftNumbers.map(Number));
                    } else if (selectedSection.shaftNumbers) {
                      lastNumber = Number.parseInt(selectedSection.shaftNumbers, 10) || 0;
                    }
                  }
                  // Generate sequence: first letter + last letter + next number
                  const firstLetter = selectedName.charAt(0) || '';
                  const lastLetter = selectedName.charAt(selectedName.length - 1) || '';
                  const nextNumber = lastNumber + 1;
                  setFormData(prev => ({
                    ...prev,
                    sectionName: selectedName,
                    shaftNumbers: `${firstLetter}${lastLetter}${nextNumber}`
                  }));
                }}
                required
                disabled={loading || sectionsLoading}
                helperText={sectionsLoading ? "Loading sections..." : `${sections.length} sections available`}
              >
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.sectionName}>
                    {section.sectionName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Shaft Numbers"
                placeholder="Please enter number"
                value={formData.shaftNumbers || ''}
                onChange={handleInputChange('shaftNumbers')}
                required
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Status"
                value="PENDING"
                InputProps={{ readOnly: true }}
                required
                disabled={loading}
                placeholder="Status (default: PENDING)"
                helperText="Default status is PENDING and cannot be changed"
              />

              <TextField
                fullWidth
                label="Reason"
                value="Newly created shaft waiting for approval"
                InputProps={{ readOnly: true }}
                required
                disabled={loading}
                multiline
                rows={2}
                placeholder="Reason for shaft assignment (default)"
              />

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <TextField
                  fullWidth
                  label="Medical Fee"
                  placeholder="Please enter Medical Fee"
                  value={formData.medicalFee || ''}
                  onChange={e => {
                    const value = e.target.value;
                    // Allow only valid double values
                    if (/^\d*(\.\d*)?$/.test(value)) {
                      setFormData(prev => ({ ...prev, medicalFee: value }));
                    }
                  }}
                  required
                  disabled={loading}
                  inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
                />

                <TextField
                  fullWidth
                  label="Reg Fee"
                  placeholder="Please enter Registration Fee"
                  value={formData.regFee || ''}
                  onChange={e => {
                    const value = e.target.value;
                    // Allow only valid double values
                    if (/^\d*(\.\d*)?$/.test(value)) {
                      setFormData(prev => ({ ...prev, regFee: value }));
                    }
                  }}
                  required
                  disabled={loading}
                  inputProps={{ inputMode: 'decimal', pattern: '[0-9]*[.,]?[0-9]*' }}
                />
              </Box>

              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                <DatePicker
                  label="Start Contract Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />

                <DatePicker
                  label="End Contract Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={loading}
                  minDate={startDate || undefined}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#6366f1',
              '&:hover': {
                bgcolor: '#5048e5',
              },
              px: 4,
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
