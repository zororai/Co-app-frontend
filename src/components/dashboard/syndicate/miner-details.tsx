'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
  onRefresh?: () => void; // Optional callback to refresh the table data
}

export function MinerDetailsDialog({ open, onClose, customer, onRefresh }: CustomerDetailsDialogProps): React.JSX.Element | null {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [status, setStatus] = React.useState<string>('');
  const [reason, setReason] = React.useState<string>('');
  const [showReasonField, setShowReasonField] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [shaftLoading, setShaftLoading] = React.useState(false);
  const [shaftError, setShaftError] = React.useState<string | null>(null);

  if (!customer) return null;

  const hasTeamMembers = customer.teamMembers && customer.teamMembers.length > 0;
  const hasIdPicture = !!customer.idPicture;
  const hasAdditionalInfo = !!customer.reason;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    // future: fetch shaft assignments when switching to that tab
    // if (newValue === getShaftTabIndex() && shaftAssignments.length === 0 && !shaftLoading) { fetchShaftAssignments(); }
  };

  const getShaftTabIndex = () => {
    let index = 2; // Personal (0), Cooperative (1)
    if (hasTeamMembers) index++;
    return index;
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setShowReasonField(newStatus === 'REJECTED' || newStatus === 'PUSHED_BACK');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!status) return;
 if(status === 'REJECTED' || status === 'APPROVED' ) {}
    setIsSubmitting(true);
    try {
      switch (status) {
        case 'APPROVED': {
          await authClient.setMinerForApproval(customer.id);
          break;
        }
        case 'REJECTED': {
          if (!reason) {
            alert('Please provide a reason for rejection');
            setIsSubmitting(false);
            return;
          }
          await authClient.setMinerForRejection(customer.id, reason);
          break;
        }
        case 'PUSHED_BACK': {
          if (!reason) {
            alert('Please provide a reason for pushing back');
            setIsSubmitting(false);
            return;
          }
          await authClient.setMinerForPushBack(customer.id, reason);
          break;
        }
        default: {
          throw new Error(`Unsupported status: ${status}`);
        }
      }

      // Close the dialog after successful update
      onClose();

      // Refresh the table data if onRefresh callback is provided
      if (onRefresh) {
        onRefresh();
      }

      // Force a full page reload
      globalThis.location.reload();
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert(`Failed to update status to ${status}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2.5,
          bgcolor: theme.palette.secondary.main,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Miner Details
          </Typography>
          <Chip
            label={customer.status || 'PENDING'}
            size="small"
            sx={{
              bgcolor: customer.status === 'APPROVED' ? 'rgba(76, 175, 80, 0.2)' :
                       customer.status === 'REJECTED' ? 'rgba(244, 67, 54, 0.2)' :
                       'rgba(255, 152, 0, 0.2)',
              color: customer.status === 'APPROVED' ? '#4caf50' :
                     customer.status === 'REJECTED' ? '#f44336' :
                     '#ff9800',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          />
        </Box>
        <Box sx={{ display: 'flex' }}>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 2,
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'text.secondary',
          },
          '& .MuiTab-root.Mui-selected': {
            color: theme.palette.secondary.main,
            fontWeight: 600,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.secondary.main,
            height: 3
          }
        }}
      >
        <Tab icon={<PersonIcon />} iconPosition="start" label="Personal Info" />
        <Tab icon={<BusinessIcon />} iconPosition="start" label="Cooperative" />
        {hasTeamMembers && <Tab icon={<GroupIcon />} iconPosition="start" label={`Team Members (${customer.teamMembers.length})`} />}
        <Tab icon={<ConstructionIcon />} iconPosition="start" label="Attached Shafts" />
        {hasIdPicture && <Tab icon={<ImageIcon />} iconPosition="start" label="ID Picture" />}
        {hasAdditionalInfo && <Tab icon={<InfoIcon />} iconPosition="start" label="Additional Info" />}
      </Tabs>

      <DialogContent sx={{ p: 4, minHeight: 400 }}>
        <Box id="miner-details-printable">
          {currentTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: `${theme.palette.secondary.main}40`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  },
                  transition: 'all 0.2s'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}>
                    {customer.name} {customer.surname}
                  </Typography>
                </Box>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: `${theme.palette.secondary.main}40`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  },
                  transition: 'all 0.2s'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    National ID Number
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}>
                    {customer.nationIdNumber || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: `${theme.palette.secondary.main}40`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  },
                  transition: 'all 0.2s'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}>
                    {customer.cellNumber || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: `${theme.palette.secondary.main}40`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  },
                  transition: 'all 0.2s'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Position
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}>
                    {customer.position || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  gridColumn: { xs: '1', md: '1 / -1' },
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: `${theme.palette.secondary.main}40`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  },
                  transition: 'all 0.2s'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Address
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}>
                    {customer.address || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
                Miner Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>Cooperative/Syndicate Name</Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, color: theme.palette.secondary.main }}>{customer.cooperativeName || 'N/A'}</Typography>
                </Box>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>Number of Shafts</Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600, color: theme.palette.secondary.main }}>{customer.numShafts || '0'}</Typography>
                </Box>
                <Box sx={{
                  p: 2.5,
                  border: `1px solid ${theme.palette.secondary.main}20`,
                  borderRadius: '8px',
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>Application Status</Typography>
                  <Chip label={customer.status || 'PENDING'} sx={{ mt: 1, bgcolor: customer.status === 'APPROVED' ? '#C8E6C9' : customer.status === 'REJECTED' ? '#FFCDD2' : '#FFF9C4', color: customer.status === 'APPROVED' ? '#1B5E20' : customer.status === 'REJECTED' ? '#B71C1C' : '#F57F17', fontWeight: 600, height: 32 }} />
                </Box>
              </Box>
            </Box>
          )}

          {hasTeamMembers && currentTab === (hasTeamMembers ? 2 : -1) && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>Team Members</Typography>
                <Chip label={`${customer.teamMembers.length} Members`} sx={{ bgcolor: theme.palette.secondary.main, color: 'white', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
                {customer.teamMembers.map((member: any, index: number) => (
                  <Box key={index} sx={{ position: 'relative', aspectRatio: '1.586 / 1', border: `3px solid ${theme.palette.secondary.main}`, borderRadius: '16px', bgcolor: 'white', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <Box sx={{ p: 2 }}>{/* compact member card */}
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{member.name} {member.surname}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>ID: {member.idNumber}</Typography>
                      <Typography variant="body2">Address: {member.address}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {currentTab === getShaftTabIndex() && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main, fontWeight: 600 }}>Attached Shafts</Typography>
              {/* Placeholder: If shaft assignments are available, they can be displayed here. */}
              <Box sx={{ p: 2, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">{customer.shafts ? JSON.stringify(customer.shafts, null, 2) : 'No shafts attached'}</Typography>
              </Box>
            </Box>
          )}

          {hasIdPicture && currentTab === (getShaftTabIndex() + 1) && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main, fontWeight: 600 }}>ID Picture</Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {customer.idPicture && (
                  <Box component="img" src={customer.idPicture} alt="ID Picture" sx={{ maxWidth: '100%', height: 'auto', maxHeight: '300px', borderRadius: 1, border: '1px solid #e0e0e0' }} />
                )}
              </Box>
            </Box>
          )}

          {hasAdditionalInfo && currentTab === (getShaftTabIndex() + (hasIdPicture ? 2 : 1)) && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.secondary.main, fontWeight: 600 }}>Additional Information</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Reason:</strong> {customer.reason}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: 'column', alignItems: 'stretch' }}>
        {showReasonField && (
          <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth margin="normal" multiline rows={3} sx={{ mb: 2 }} required error={showReasonField && !reason} helperText={showReasonField && !reason ? 'Reason is required' : ''} />
        )}
        {((!customer.status || (customer.status !== 'REJECTED' && customer.status !== 'APPROVED')) && (status !== 'REJECTED' && status !== 'APPROVED')) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button onClick={() => handleStatusChange('APPROVED')} variant={status === 'APPROVED' ? 'contained' : 'outlined'} color="success" disabled={isSubmitting} sx={{ minWidth: '120px' }}>Approve</Button>
            <Button onClick={() => handleStatusChange('PUSHED_BACK')} variant={status === 'PUSHED_BACK' ? 'contained' : 'outlined'} color="warning" disabled={isSubmitting} sx={{ minWidth: '120px' }}>Push Back</Button>
            <Button onClick={() => handleStatusChange('REJECTED')} variant={status === 'REJECTED' ? 'contained' : 'outlined'} color="error" disabled={isSubmitting} sx={{ minWidth: '120px' }}>Reject</Button>
          </Box>
        )}
        {status && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isSubmitting || (showReasonField && !reason)} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null} sx={{ minWidth: '200px', bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}>{isSubmitting ? 'Submitting...' : `Submit ${status.toLowerCase()} status`}</Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
