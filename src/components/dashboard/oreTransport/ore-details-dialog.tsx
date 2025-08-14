import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { authClient } from '@/lib/auth/client';

interface OreDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onRefresh?: () => void; // Optional callback to refresh data after action
}

export function OreDetailsDialog({ open, onClose, userId, onRefresh }: OreDetailsDialogProps): React.JSX.Element {
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
    }
  }, [open]);
  
  // Fetch approved vehicles when dialog opens
  React.useEffect(() => {
    const fetchApprovedVehicles = async () => {
      try {
        const vehiclesData = await authClient.fetchVehiclesByApprovedStatus();
        console.log('Fetched approved vehicles:', vehiclesData);
        setVehicles(vehiclesData || []);
      } catch (err) {
        console.error('Error fetching approved vehicles:', err);
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
      } catch (err) {
        console.error('Error fetching ore details:', err);
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
    } catch (err) {
      console.error(`Error ${actionType === 'reject' ? 'rejecting' : 'pushing back'} ore:`, err);
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
  
  // Handle save changes
  const handleSaveChanges = async () => {
    if (!userId || !selectedVehicle || !transportStatus) return;
    
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    
    try {
      // Here you would implement the API call to update the ore transport details
      // For example:
      // const result = await authClient.updateOreTransport(userId, {
      //   selectedTransport: selectedVehicle,
      //   transportStatus: transportStatus,
      //   selectedTransportdriver: selectedDriver
      // });
      
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setActionSuccess('Transport details updated successfully');
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating ore transport details:', err);
      setActionError('Failed to update transport details. Please try again.');
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
      <DialogTitle sx={{ 
        fontSize: '1.25rem', 
        fontWeight: 600,
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        Assign Ore To Vehicle
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <DetailItem label="Ore Unique ID" value={oreDetails.oreUniqueId || 'N/A'} />
              <DetailItem label="Shaft Numbers" value={oreDetails.shaftNumbers || 'N/A'} />
              <DetailItem label="Weight" value={oreDetails.weight?.toString() || 'N/A'} />
              <DetailItem label="Number of Bags" value={oreDetails.numberOfBags?.toString() || 'N/A'} />
              
              {/* Transport Status Dropdown */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transport Status</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={transportStatus || oreDetails.transportStatus || ''}
                    onChange={handleTransportStatusChange as any}
                    displayEmpty
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="">Select Status</MenuItem>
                    <MenuItem value="in_transit">In Transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {/* Transport Driver (displays based on selected vehicle) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transport Driver</Typography>
                <Typography variant="body2">{selectedDriver}</Typography>
              </Box>
              
              {/* Vehicle Dropdown */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Selected Transport</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedVehicle}
                    onChange={handleVehicleChange as any}
                    displayEmpty
                    sx={{ minWidth: 200 }}
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
              <DetailItem label="Location" value={oreDetails.location || 'N/A'} />
              <DetailItem label="Date" value={oreDetails.date ? new Date(oreDetails.date).toLocaleDateString() : 'N/A'} />
              <DetailItem label="Time" value={oreDetails.time ? new Date(oreDetails.time).toLocaleTimeString() : 'N/A'} />
            </Box>
            
            {oreDetails.transportReason && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Transport Reason</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap'
                }}>
                  <Typography variant="body2">{oreDetails.transportReason}</Typography>
                </Box>
              </Box>
            )}
            
            {oreDetails.tax && oreDetails.tax.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Tax Information</Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1
                }}>
                  {oreDetails.tax.map((taxItem: any, index: number) => (
                    <Box key={index} sx={{ mb: index < oreDetails.tax.length - 1 ? 2 : 0 }}>
                      <Typography variant="body2"><strong>Tax Type:</strong> {taxItem.taxType || 'N/A'}</Typography>
                      <Typography variant="body2"><strong>Tax Rate:</strong> {taxItem.taxRate?.toString() || 'N/A'}</Typography>
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
            disabled={!selectedVehicle || !transportStatus || actionLoading}
            onClick={handleSaveChanges}
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
