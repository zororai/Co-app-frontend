import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { authClient } from '@/lib/auth/client';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Chip, Stack, Dialog as MuiDialog, DialogTitle as MuiDialogTitle, DialogContent as MuiDialogContent, DialogActions as MuiDialogActions } from '@mui/material';
import { useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface DriverDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  driverId: string | null;
  onRefresh?: () => void; // optional callback to refresh table after actions
}

export function DriverDetailsDialog({ open, onClose, driverId, onRefresh }: DriverDetailsDialogProps): React.JSX.Element {
  const [incident, setIncident] = React.useState<any>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Action states
  const [isApproveDialogOpen, setIsApproveDialogOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [isPushbackDialogOpen, setIsPushbackDialogOpen] = React.useState(false);
  const [actionReason, setActionReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Fetch incident details when dialog opens and driverId changes
  React.useEffect(() => {
    if (open && driverId) {
      setLoading(true);
      setError(null);
      
      authClient.fetchIncidentById(driverId)
        .then((data) => {
          if (data) {
            setIncident(data);
          } else {
            setError('Failed to load incident details');
          }
        })
        .catch((error_) => {
          console.error('Error fetching incident details:', error_);
          setError('An error occurred while loading incident details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, driverId]);

  // Handle approve action
  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!driverId) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      // TODO: Implement incident approval endpoint
      // const result = await authClient.approveIncident(driverId);
      setActionSuccess('Incident resolved successfully');
      // Update incident status in the UI
      if (incident) {
        setIncident({ ...incident, status: 'RESOLVED' });
      }
      // Trigger parent refresh if provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error resolving incident:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsApproveDialogOpen(false);
    }
  };

  // Handle reject action
  const handleRejectClick = () => {
    setActionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!driverId) return;
    if (!actionReason.trim()) {
      setActionError('Reason is required for closing');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      // TODO: Implement incident close endpoint
      // const result = await authClient.closeIncident(driverId, actionReason);
      setActionSuccess('Incident closed successfully');
      // Update incident status in the UI
      if (incident) {
        setIncident({ ...incident, status: 'CLOSED', reason: actionReason });
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error closing incident:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsRejectDialogOpen(false);
    }
  };

  // Handle pushback action
  const handlePushbackClick = () => {
    setActionReason('');
    setIsPushbackDialogOpen(true);
  };

  const handlePushbackConfirm = async () => {
    if (!driverId) return;
    if (!actionReason.trim()) {
      setActionError('Reason is required for escalation');
      return;
    }
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      // TODO: Implement incident escalation endpoint
      // const result = await authClient.escalateIncident(driverId, actionReason);
      setActionSuccess('Incident escalated successfully');
      // Update incident status in the UI
      if (incident) {
        setIncident({ ...incident, status: 'ESCALATED', reason: actionReason });
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error escalating incident:', error);
      setActionError('An unexpected error occurred');
    } finally {
      setActionLoading(false);
      setIsPushbackDialogOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle 
        sx={{ 
          pb: 1,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(135deg,rgb(5, 5, 68) 0%,rgb(5, 5, 68) 100%)',
          color: 'white',
          py: 2.5,
          px: 3,
        }}
      >
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            letterSpacing: '0.02em'
          }}
        >
          Incident Details
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : incident ? (
          <Box sx={{ mt: 2 }}>
            {/* Incident Status */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {incident.incidentTitle || 'Untitled Incident'}
              </Typography>
              <Chip 
                label={incident.status || 'INVESTIGATING'} 
                color={
                  incident.status === 'RESOLVED' ? 'success' : 
                  incident.status === 'CLOSED' ? 'error' : 
                  incident.status === 'ESCALATED' ? 'warning' : 
                  'default'
                }
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Incident Information */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Incident Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Severity Level</Typography>
                <Chip 
                  label={incident.severityLevel || 'N/A'}
                  size="small"
                  color={
                    incident.severityLevel === 'Critical' ? 'error' :
                    incident.severityLevel === 'High' ? 'warning' :
                    'default'
                  }
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Reported By</Typography>
                <Typography variant="body1">{incident.reportedBy || 'N/A'}</Typography>
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Typography variant="body2" color="text.secondary">Location</Typography>
                <Typography variant="body1">{incident.location || 'N/A'}</Typography>
              </Box>
            </Box>
            
            {/* Description */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Description
            </Typography>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body1">
                {incident.description || 'No description provided'}
              </Typography>
            </Box>
            
            {/* Participants */}
            {incident.participants && incident.participants.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Participants ({incident.participants.length})
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {incident.participants.map((participant: any, index: number) => (
                    <Box 
                      key={index}
                      sx={{ 
                        p: 2, 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1 
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">Name</Typography>
                          <Typography variant="body1">
                            {participant.name} {participant.surname}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body2" color="text.secondary">National ID</Typography>
                          <Typography variant="body1">{participant.nationalId || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">Address</Typography>
                          <Typography variant="body1">{participant.address || 'N/A'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
            
            {/* Attachments */}
            {incident.attachments && incident.attachments.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Attachments ({incident.attachments.length})
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Stack spacing={1}>
                    {incident.attachments.map((attachment: string, index: number) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 1.5,
                          bgcolor: 'grey.50',
                          borderRadius: 1
                        }}
                      >
                        <CheckCircleOutlineIcon fontSize="small" color="success" />
                        <Typography variant="body2">{attachment}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
            
            {/* Additional space at the bottom */}
            <Box sx={{ height: 20 }} />
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No incident information available
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
       
        
      </DialogActions>
      
      {/* Resolve Confirmation Dialog */}
      <Dialog
        open={isApproveDialogOpen}
        onClose={() => setIsApproveDialogOpen(false)}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">Confirm Resolution</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this incident as resolved?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsApproveDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleApproveConfirm} 
            color="primary" 
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Resolve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Dialog */}
      <Dialog
        open={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">Close Incident</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide a reason for closing this incident:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRejectDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            variant="contained"
            disabled={actionLoading || !actionReason.trim()}
          >
            {actionLoading ? 'Processing...' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog
        open={isPushbackDialogOpen}
        onClose={() => setIsPushbackDialogOpen(false)}
        aria-labelledby="pushback-dialog-title"
      >
        <DialogTitle id="pushback-dialog-title">Escalate Incident</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide a reason for escalating this incident:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPushbackDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handlePushbackConfirm} 
            color="warning" 
            variant="contained"
            disabled={actionLoading || !actionReason.trim()}
          >
            {actionLoading ? 'Processing...' : 'Escalate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
