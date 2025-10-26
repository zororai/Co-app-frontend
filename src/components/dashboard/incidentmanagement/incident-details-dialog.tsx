'use client';

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
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import PrintIcon from '@mui/icons-material/Print';
import { authClient } from '@/lib/auth/client';
import { printElementById } from '@/lib/print';
import dayjs from 'dayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import { printElementById } from '@/lib/print';

interface IncidentDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  incidentId: string | null;
  onRefresh?: () => void; // optional callback to refresh table after actions
}

export function IncidentDetailsDialog({ open, onClose, incidentId, onRefresh }: IncidentDetailsDialogProps): React.JSX.Element {
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

  // Fetch incident details when dialog opens and incidentId changes
  React.useEffect(() => {
    if (open && incidentId) {
      setLoading(true);
      setError(null);
      
      authClient.fetchIncidentById(incidentId)
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
  }, [open, incidentId]);

  // Handle approve action
  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!incidentId) return;
    
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
    if (!incidentId) return;
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
    if (!incidentId) return;
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
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: '#15073d'
        }}
      >
        <Typography variant="subtitle1" component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Incident Details</Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={() => printElementById('incident-details-printable', 'Incident Details')} size="small" sx={{ mr: 1, color: '#9e9e9e' }}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: '#9e9e9e' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ p: 2 }} id="incident-details-printable">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>Loading incident details...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : incident ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 2 
            }}>
              <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Incident Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1 }}><strong>Title:</strong> {incident.incidentTitle || 'Untitled Incident'}</Typography>
                  <Typography sx={{ mb: 1 }}><strong>Severity Level:</strong> 
                    <Chip 
                      label={incident.severityLevel || 'N/A'}
                      size="small"
                      color={
                        incident.severityLevel === 'Critical' ? 'error' :
                        incident.severityLevel === 'High' ? 'warning' :
                        'default'
                      }
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography sx={{ mb: 1 }}><strong>Reported By:</strong> {incident.reportedBy || 'N/A'}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Box 
                      component="span" 
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        ml: 1,
                        bgcolor: incident.status === 'RESOLVED' ? '#C8E6C9' : 
                                 incident.status === 'CLOSED' ? '#FFCDD2' : 
                                 incident.status === 'ESCALATED' ? '#FFE0B2' : '#FFF9C4',
                        color: incident.status === 'RESOLVED' ? '#1B5E20' : 
                               incident.status === 'CLOSED' ? '#B71C1C' : 
                               incident.status === 'ESCALATED' ? '#E65100' : '#F57F17',
                      }}
                    >
                      {incident.status || 'INVESTIGATING'}
                    </Box>
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ border: '1px solid #000080', borderRadius: '8px', p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Location Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1 }}><strong>Location:</strong> {incident.location || 'N/A'}</Typography>
                  <Typography sx={{ mb: 1 }}><strong>Date Reported:</strong> {formatDate(incident.dateReported)}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ gridColumn: '1 / -1', border: '1px solid #000080', borderRadius: '8px', p: 2, mt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                  Description
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography>{incident.description || 'No description'}</Typography>
                </Box>
              </Box>
              
              {incident.participants && incident.participants.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', border: '1px solid #000080', borderRadius: '8px', p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                    Participants ({incident.participants.length})
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {incident.participants.map((participant: any, index: number) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 2, 
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          bgcolor: '#fafafa'
                        }}
                      >
                     <Box display="flex" flexWrap="wrap" gap={2}>
  <Box flex="1 1 45%">
    <Typography><strong>Name:</strong> {participant.name} {participant.surname}</Typography>
  </Box>
  <Box flex="1 1 45%">
    <Typography><strong>National ID:</strong> {participant.nationalId || 'N/A'}</Typography>
  </Box>
  <Box flex="1 1 100%">
    <Typography><strong>Address:</strong> {participant.address || 'N/A'}</Typography>
  </Box>
</Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
              
              {incident.attachments && incident.attachments.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', border: '1px solid #000080', borderRadius: '8px', p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FF8F00', fontWeight: 'bold', mb: 2 }}>
                    Attachments ({incident.attachments.length})
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Stack spacing={1}>
                      {incident.attachments.map((attachment: string, index: number) => (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            p: 1.5,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1
                          }}
                        >
                          <CheckCircleOutlineIcon fontSize="small" color="success" />
                          <Typography variant="body2">{attachment}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No incident information available
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
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
