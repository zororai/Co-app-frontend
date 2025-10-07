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
  IconButton,
  CircularProgress,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';
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
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [locationAccuracy, setLocationAccuracy] = React.useState<number | null>(null);
  const [manualEntry, setManualEntry] = React.useState(false);
  
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

      // Add minerId and always include status and reason in the payload
      const payload = {
        ...formData,
        status: 'PENDING',
        reason: 'Newly created shaft waiting for approval',
        minerId: customerId
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

  const handleCaptureLocation = () => {
    console.log('🗺️ Starting high-accuracy location capture...');
    setLocationLoading(true);
    setLocationError(null);
    setLocationAccuracy(null);

    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported');
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    console.log('📍 Requesting high-accuracy GPS location...');
    
    // Try to get the most accurate position by watching position changes
    let bestAccuracy = Infinity;
    let bestPosition: GeolocationPosition | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        attempts++;
        const accuracy = position.coords.accuracy;
        
        console.log(`📡 Position update #${attempts}:`, { 
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude, 
          accuracy: `${accuracy.toFixed(2)}m` 
        });

        // Keep the most accurate reading
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestPosition = position;
        }

        // If we got good accuracy (< 10m) or reached max attempts, use it
        if (accuracy < 10 || attempts >= maxAttempts) {
          navigator.geolocation.clearWatch(watchId);
          
          if (bestPosition) {
            const { latitude, longitude } = bestPosition.coords;
            const lat = parseFloat(latitude.toFixed(7)); // 7 decimals = ~1cm precision
            const lng = parseFloat(longitude.toFixed(7));
            
            console.log('✅ Best location selected:', { 
              latitude: lat, 
              longitude: lng, 
              accuracy: `±${bestAccuracy.toFixed(2)}m`,
              attempts 
            });
            
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
            }));
            setLocationAccuracy(bestAccuracy);
            
            if (bestAccuracy > 100) {
              setLocationError(`⚠️ Very poor accuracy (±${bestAccuracy.toFixed(0)}m). GPS not available - using WiFi/IP location. Please go outdoors or enter coordinates manually.`);
            } else if (bestAccuracy > 50) {
              setLocationError(`⚠️ Moderate accuracy (±${bestAccuracy.toFixed(0)}m). For better accuracy, move outdoors with clear sky view.`);
            } else if (bestAccuracy > 20) {
              setLocationError(`Fair accuracy (±${bestAccuracy.toFixed(0)}m). Consider moving outdoors for better precision.`);
            }
          }
          setLocationLoading(false);
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        console.error('❌ Location capture failed:', error);
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            console.error('Permission denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device GPS settings.';
            console.error('Position unavailable');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            console.error('Request timed out');
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    // Fallback timeout to stop after max time
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      if (bestPosition && locationLoading) {
        const { latitude, longitude } = bestPosition.coords;
        const lat = parseFloat(latitude.toFixed(7));
        const lng = parseFloat(longitude.toFixed(7));
        
        console.log('⏱️ Timeout reached, using best available position:', { 
          latitude: lat, 
          longitude: lng, 
          accuracy: `±${bestAccuracy.toFixed(2)}m` 
        });
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setLocationAccuracy(bestAccuracy);
        setLocationLoading(false);
      }
    }, 20000);
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
    setLocationError(null);
    setLocationAccuracy(null);
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
                onChange={async (e) => {
                  const selectedName = e.target.value;
                  // Default: preserve current fallback generation
                  const selectedSection = sections.find(s => s.sectionName === selectedName);
                  let lastNumber = 0;
                  if (selectedSection) {
                    if (Array.isArray(selectedSection.shaftNumbers)) {
                      lastNumber = Math.max(...selectedSection.shaftNumbers.map(Number));
                    } else if (selectedSection.shaftNumbers) {
                      lastNumber = Number.parseInt(selectedSection.shaftNumbers, 10) || 0;
                    }
                  }
                  const firstLetter = selectedName.charAt(0) || '';
                  const lastLetter = selectedName.charAt(selectedName.length - 1) || '';
                  const nextNumber = lastNumber + 1;

                  // Optimistically set sectionName immediately
                  setFormData(prev => ({
                    ...prev,
                    sectionName: selectedName,
                    shaftNumbers: `${firstLetter}${lastLetter}${nextNumber}`,
                  }));

                  // Try to fetch shaft numbers by section from the API
                  try {
                    const apiData = await authClient.fetchShaftNumbersBySection(selectedName);
                    let newShaftValue: string | undefined;
                    if (Array.isArray(apiData)) {
                      // If array, pick the last one (assuming it's the latest)
                      if (apiData.length > 0) {
                        newShaftValue = String(apiData[apiData.length - 1]);
                      }
                    } else if (apiData) {
                      // If single value or object with value
                      if (typeof apiData === 'string' || typeof apiData === 'number') {
                        newShaftValue = String(apiData);
                      } else if (apiData?.shaftNumbers) {
                        newShaftValue = String(apiData.shaftNumbers);
                      }
                    }

                    if (newShaftValue) {
                      setFormData(prev => ({
                        ...prev,
                        sectionName: selectedName,
                        shaftNumbers: newShaftValue,
                      }));
                    }
                  } catch (err) {
                    // On error, keep the fallback-generated value
                    console.error('Failed to fetch shaft numbers by section:', err);
                  }
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

              {/* Location Capture Section */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Shaft Location
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={locationLoading ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                    onClick={handleCaptureLocation}
                    disabled={loading || locationLoading || manualEntry}
                    sx={{
                      bgcolor: '#10b981',
                      '&:hover': {
                        bgcolor: '#059669',
                      },
                    }}
                  >
                    {locationLoading ? 'Capturing...' : 'Auto-Capture GPS'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setManualEntry(!manualEntry);
                      if (!manualEntry) {
                        setLocationError(null);
                        setLocationAccuracy(null);
                      }
                    }}
                    disabled={loading || locationLoading}
                    sx={{ borderColor: '#6366f1', color: '#6366f1' }}
                  >
                    {manualEntry ? 'Switch to GPS' : 'Enter Manually'}
                  </Button>
                </Box>

                {locationError && (
                  <Alert severity={locationAccuracy && locationAccuracy < 50 ? "info" : "warning"} sx={{ mb: 2 }}>
                    {locationError}
                  </Alert>
                )}

                {locationAccuracy && locationAccuracy < 20 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✓ High accuracy location captured (±{locationAccuracy.toFixed(1)}m precision)
                  </Alert>
                )}

                {locationAccuracy && locationAccuracy > 100 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    ❌ GPS not available! Accuracy: ±{locationAccuracy.toFixed(0)}m. Please go outdoors or enter coordinates manually.
                  </Alert>
                )}

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    value={formData.latitude !== 0 ? formData.latitude : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        setFormData(prev => ({ ...prev, latitude: value }));
                      } else if (e.target.value === '' || e.target.value === '-') {
                        setFormData(prev => ({ ...prev, latitude: 0 }));
                      }
                    }}
                    InputProps={{ 
                      readOnly: !manualEntry,
                      sx: formData.latitude !== 0 ? { color: manualEntry ? 'primary.main' : 'success.main', fontWeight: 600 } : {}
                    }}
                    placeholder={manualEntry ? "e.g., -26.123456" : "Click button to capture"}
                    helperText={manualEntry ? 'Enter latitude (e.g., -26.123456)' : (formData.latitude !== 0 ? (locationAccuracy ? `✓ GPS captured (±${locationAccuracy.toFixed(1)}m)` : '✓ GPS captured') : 'Automatically captured from GPS')}
                    type={manualEntry ? "number" : "text"}
                    inputProps={manualEntry ? { step: "0.000001" } : {}}
                  />

                  <TextField
                    fullWidth
                    label="Longitude"
                    value={formData.longitude !== 0 ? formData.longitude : ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        setFormData(prev => ({ ...prev, longitude: value }));
                      } else if (e.target.value === '' || e.target.value === '-') {
                        setFormData(prev => ({ ...prev, longitude: 0 }));
                      }
                    }}
                    InputProps={{ 
                      readOnly: !manualEntry,
                      sx: formData.longitude !== 0 ? { color: manualEntry ? 'primary.main' : 'success.main', fontWeight: 600 } : {}
                    }}
                    placeholder={manualEntry ? "e.g., 28.123456" : "Click button to capture"}
                    helperText={manualEntry ? 'Enter longitude (e.g., 28.123456)' : (formData.longitude !== 0 ? '✓ GPS captured' : 'Automatically captured from GPS')}
                    type={manualEntry ? "number" : "text"}
                    inputProps={manualEntry ? { step: "0.000001" } : {}}
                  />
                </Box>
                
                {manualEntry && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    💡 Tip: Use Google Maps to find exact coordinates. Right-click on the location and select the coordinates to copy them.
                  </Alert>
                )}
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
