import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { authClient } from '@/lib/auth/client';
import IconButton from '@mui/material/IconButton';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';
import CloseIcon from '@mui/icons-material/Close';

interface OreDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function AssignOreDetailsDialog({ open, onClose, userId, onRefresh }: OreDetailsDialogProps): React.JSX.Element {
  const [oreDetails, setOreDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);
  const [actionError, setActionError] = React.useState<string>('');
  const [actionSuccess, setActionSuccess] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [actionType, setActionType] = React.useState<'reject' | 'pushback' | null>(null);
  
  // New state variables for vehicle selection
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = React.useState<string>('');
  const [selectedDriver, setSelectedDriver] = React.useState<string>('Not Selected');
  const [transportStatus, setTransportStatus] = React.useState<string>('');
  const [location, setLocation] = React.useState<string>('');
  const [transportReason, setTransportReason] = React.useState<string>('picking ore from shaft to tax deduction');
  
  // Field validation states
  const [fieldErrors, setFieldErrors] = React.useState<{
    vehicle: boolean;
    driver: boolean;
    status: boolean;
  }>({ vehicle: false, driver: false, status: false });
  const [validationMessage, setValidationMessage] = React.useState<string>('');

  // Reset states when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setActionError('');
      setActionSuccess('');
      setReason('');
      setShowReasonField(false);
      setActionType(null);
      setSelectedVehicle('');
      setSelectedDriver('Not Selected');
      setTransportStatus('');
      setLocation('');
      setTransportReason('picking ore from shaft to tax deduction');
    }
  }, [open]);
  
  // Fetch approved vehicles when dialog opens
  React.useEffect(() => {
    const fetchApprovedVehicles = async () => {
      try {
        const vehiclesData = await authClient.fetchVehiclesByApprovedStatus();
        console.log('Fetched approved vehicles:', vehiclesData);
        setVehicles(vehiclesData || []);
      } catch (error_) {
        console.error('Error fetching approved vehicles:', error_);
      }
    };

    if (open) {
      fetchApprovedVehicles();
    }
  }, [open]);

  // Fetch ore details when dialog opens
  React.useEffect(() => {
    const fetchOreDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError('');
      try {
        const details = await authClient.fetchOreDetails(userId);
        setOreDetails(details);
      } catch (error_) {
        console.error('Error fetching ore details:', error_);
        setError('Failed to load ore details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchOreDetails();
    } else {
      // Reset state when dialog closes
      setOreDetails(null);
      setError('');
    }
  }, [open, userId]);
  
  // Cancel action
  const cancelAction = () => {
    setShowReasonField(false);
    setReason('');
    setActionType(null);
    setActionError('');
  };

  // Handle action (reject/pushback)
  const handleAction = async () => {
    if (!actionType || !reason.trim() || !userId) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      // Here you would call the appropriate API method based on actionType
      // For example: await authClient.rejectOre(userId, reason) or await authClient.pushbackOre(userId, reason)
      
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActionSuccess(`Ore has been ${actionType === 'reject' ? 'rejected' : 'pushed back'} successfully.`);
      setShowReasonField(false);
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error_) {
      console.error(`Error ${actionType === 'reject' ? 'rejecting' : 'pushing back'} ore:`, error_);
      setActionError(`Failed to ${actionType === 'reject' ? 'reject' : 'push back'} ore. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle vehicle selection change
  const handleVehicleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const vehicleId = event.target.value as string;
    setSelectedVehicle(vehicleId);
    
    // Find the selected vehicle to get its assigned driver
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle && vehicle.assignedDriver) {
      setSelectedDriver(vehicle.assignedDriver);
    } else {
      setSelectedDriver('Not Selected');
    }
  };
  
  // Handle transport status change
  const handleTransportStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTransportStatus(event.target.value as string);
  };

  // Handle location change
  const handleLocationChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLocation(event.target.value as string);
  };
  
  // Handle save changes
  const handleSaveChanges = async () => {
    console.log('Save Changes clicked');
    console.log('Ore details ID:', oreDetails?.id);
    console.log('Selected vehicle:', selectedVehicle);
    console.log('Transport status:', transportStatus);
    console.log('Selected driver:', selectedDriver);
    console.log('Transport reason:', transportReason);
    
    // Reset validation states
    setFieldErrors({ vehicle: false, driver: false, status: false });
    setValidationMessage('');
    
    // Check for missing fields and highlight them
    const missingVehicle = !selectedVehicle;
    const missingStatus = !transportStatus;
    const missingDriver = !selectedDriver || selectedDriver === 'Not Selected';
    
    if (!oreDetails?.id || missingVehicle || missingStatus || missingDriver) {
      setFieldErrors({
        vehicle: missingVehicle,
        status: missingStatus,
        driver: missingDriver
      });
      setValidationMessage('Missing required fields for save');
      return;
    }
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      console.log('Calling updateOreTransportFields with:', {
        oreId: oreDetails.id.toString(),
        fields: {
          selectedTransport: selectedVehicle,
          transportStatus: transportStatus,
          selectedTransportdriver: selectedDriver,
          transportReason: transportReason
        }
      });
      
      // Find the vehicle to get the correct driver name
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      const driverName = vehicle?.assignedDriver || selectedDriver;
      
      // Call the API to update ore transport fields
      const result = await authClient.updateOreTransportFields(
        oreDetails.id.toString(),
        {
          selectedTransport: selectedVehicle,
          transportStatus: transportStatus,
          selectedTransportdriver: driverName, // Use the driver name, not vehicle ID
          transportReason: transportReason,
          location: location || oreDetails.location // Use the selected location
        }
      );
      
      console.log('API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update transport details');
      }
      
      setActionSuccess('Transport details updated successfully');
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
      // Close the dialog after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error_) {
      console.error('Error updating ore transport details:', error_);
      setActionError(error_ instanceof Error ? error_.message : 'Failed to update transport details. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#323E3E',
          color: 'white',
          py: 2.5,
          px: 3,
          m: 0
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 600 }}>
          Assign Ore To Vehicle
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            onClick={() => printElementById('assign-ore-details-printable', 'Assign Ore To Vehicle')} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <PrintIcon />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ 
        px: 3,
        py: 2,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { 
          backgroundColor: '#323E3E', 
          borderRadius: '3px' 
        },
      }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {!loading && !error && oreDetails && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} id="assign-ore-details-printable">
            {validationMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationMessage}
              </Alert>
            )}
            <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#323E3E', fontWeight: 'bold', mb: 2 }}>Ore Assignment</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <DetailItem label="Ore Unique ID" value={oreDetails.oreUniqueId || 'N/A'} />
                <DetailItem label="Shaft Numbers" value={oreDetails.shaftNumbers || 'N/A'} />
                <DetailItem label="Weight" value={oreDetails.weight?.toString() || 'N/A'} />
                <DetailItem label="Number of Bags" value={oreDetails.numberOfBags?.toString() || 'N/A'} />
                {/* Transport Status Dropdown */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transport Status</Typography>
                  <FormControl fullWidth size="small" error={fieldErrors.status}>
                    <Select
                      value={transportStatus || oreDetails.transportStatus || ''}
                      onChange={handleTransportStatusChange as any}
                      displayEmpty
                      sx={{ minWidth: 200, border: fieldErrors.status ? '1px solid #d32f2f' : 'none' }}
                    >
                      <MenuItem value="">Select Status</MenuItem>
                      <MenuItem value="in_transit">In Transit</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {/* Transport Driver (displays based on selected vehicle) */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transport Driver</Typography>
                  <Typography variant="body2" sx={{ color: fieldErrors.driver ? '#d32f2f' : 'inherit', p: 1, border: fieldErrors.driver ? '1px solid #d32f2f' : 'none', borderRadius: '4px' }}>{selectedDriver}</Typography>
                </Box>
                {/* Vehicle Dropdown */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Selected Transport</Typography>
                  <FormControl fullWidth size="small" error={fieldErrors.vehicle}>
                    <Select
                      value={selectedVehicle}
                      onChange={handleVehicleChange as any}
                      displayEmpty
                      sx={{ minWidth: 200, border: fieldErrors.vehicle ? '1px solid #d32f2f' : 'none' }}
                    >
                      <MenuItem value="">Not Selected</MenuItem>
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.regNumber || 'Unknown'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <DetailItem label="Process Status" value={oreDetails.processStatus || 'N/A'} />
                {/* Location Dropdown */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Location</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={location || oreDetails.location || ''}
                      onChange={handleLocationChange as any}
                      displayEmpty
                      sx={{ minWidth: 200 }}
                    >
                      <MenuItem value="">Select Location</MenuItem>
                      <MenuItem value="on_site_processing">On site processing</MenuItem>
                      <MenuItem value="off_site_processing">Off site processing</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <DetailItem label="Date" value={oreDetails.date ? new Date(oreDetails.date).toLocaleDateString() : 'N/A'} />
                <DetailItem label="Time" value={oreDetails.time ? new Date(oreDetails.time).toLocaleTimeString() : 'N/A'} />
              </Box>
            </Box>
            {/* Transport Reason Section */}
            <Box sx={{ mt: 2, gridColumn: '1 / span 2', border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#323E3E' }}>Transport Reason</Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={transportReason}
                onChange={(e) => setTransportReason(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>
            {/* Tax Information Section */}
            {oreDetails.tax && oreDetails.tax.length > 0 && (
              <Box sx={{ mt: 2, border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#323E3E' }}>Tax Information</Typography>
                <Box>
                  {oreDetails.tax.map((taxItem: any, index: number) => (
                    <Box key={index} sx={{ mb: index < oreDetails.tax.length - 1 ? 2 : 0 }}>
                      <Typography variant="body2"><strong>Tax Type:</strong> {taxItem.taxType || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Tax Rate:</strong> {taxItem.taxRate?.toString() || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Location:</strong> {taxItem.location || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Description:</strong> {taxItem.description || 'N/A'}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      {/* Action feedback messages */}
      {(actionError || actionSuccess) && (
        <Box sx={{ px: 3, pb: 2 }}>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}
          {actionSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {actionSuccess}
            </Alert>
          )}
        </Box>
      )}
      
      {/* Reason input field for reject/pushback */}
      {showReasonField && (
        <Box sx={{ px: 3, pb: 2 }}>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            error={actionType !== null && reason.trim() === ''}
            helperText={actionType !== null && reason.trim() === '' ? `Please provide a reason for ${actionType === 'reject' ? 'rejection' : 'pushing back'}` : ''}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={cancelAction}
              variant="outlined"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleAction()}
              variant="contained"
              color="primary"
              disabled={actionLoading || reason.trim() === ''}
              sx={{ bgcolor: actionType === 'reject' ? '#d32f2f' : '#ed6c02', '&:hover': { bgcolor: actionType === 'reject' ? '#b71c1c' : '#e65100' } }}
            >
              {actionLoading ? 'Processing...' : actionType === 'reject' ? 'Confirm Reject' : 'Confirm Push Back'}
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Action buttons */}
      {!showReasonField && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
          //  disabled={!selectedVehicle || !transportStatus || !selectedDriver || !transportReason || actionLoading}
            onClick={() => {
              console.log('Button clicked directly');
              handleSaveChanges();
            }}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
