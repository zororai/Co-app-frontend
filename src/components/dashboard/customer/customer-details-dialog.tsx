'use client';

import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import ImageIcon from '@mui/icons-material/Image';
import InfoIcon from '@mui/icons-material/Info';
import ConstructionIcon from '@mui/icons-material/Construction';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any | null;
  customerId?: string | null;
}

export function CustomerDetailsDialog({ open, onClose, customer, customerId }: CustomerDetailsDialogProps): React.JSX.Element | null {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [shaftAssignments, setShaftAssignments] = React.useState<any[]>([]);
  const [shaftLoading, setShaftLoading] = React.useState(false);
  const [shaftError, setShaftError] = React.useState<string | null>(null);
  
  if (!customer) return null;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Fetch shaft assignments when switching to that tab
    if (newValue === getShaftTabIndex() && shaftAssignments.length === 0 && !shaftLoading) {
      fetchShaftAssignments();
    }
  };

  // Fetch shaft assignments
  const fetchShaftAssignments = async () => {
    if (!customerId && !customer.id) return;
    
    setShaftLoading(true);
    setShaftError(null);
    try {
      const data = await authClient.fetchShaftAssignmentsByMiner(customerId || customer.id);
      setShaftAssignments(Array.isArray(data) ? data : [data]);
    } catch (error: any) {
      setShaftError(error.message || 'Failed to fetch shaft assignments');
    } finally {
      setShaftLoading(false);
    }
  };

  // Determine which tabs to show based on available data
  const hasTeamMembers = customer.teamMembers && customer.teamMembers.length > 0;
  const hasIdPicture = customer.idPicture;
  const hasAdditionalInfo = customer.reason;

  // Helper function to get the shaft tab index
  const getShaftTabIndex = () => {
    let index = 2; // Base tabs: Personal (0), Cooperative (1)
    if (hasTeamMembers) index++;
    return index;
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
            Syndicate Application Details
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
          <IconButton 
            onClick={() => printElementById('customer-details-printable', 'Syndicate Application Details')} 
            size="small" 
            sx={{ 
              mr: 1, 
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
        <Box id="customer-details-printable">
          {/* Personal Information Tab */}
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
                    Registration Number
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontSize: '1rem', fontWeight: 500 }}>
                    {customer.registrationNumber || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Cooperative Information Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
                Cooperative Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ 
                  gridColumn: { xs: '1', md: '1 / -1' },
                  p: 3,
                  border: `2px solid ${theme.palette.secondary.main}`,
                  borderRadius: '12px',
                  bgcolor: `${theme.palette.secondary.main}05`,
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    Cooperative/Syndicate Name
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontSize: '1.3rem', fontWeight: 700, color: theme.palette.secondary.main }}>
                    {customer.cooperativeName || 'N/A'}
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
                    Number of Shafts
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontSize: '1.5rem', fontWeight: 600, color: theme.palette.secondary.main }}>
                    {customer.numShafts || customer.shaftnumber || '0'}
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
                  <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', mb: 1, display: 'block' }}>
                    Application Status
                  </Typography>
                  <Chip
                    label={customer.status || 'PENDING'}
                    sx={{
                      bgcolor: customer.status === 'APPROVED' ? '#C8E6C9' : 
                               customer.status === 'REJECTED' ? '#FFCDD2' : 
                               '#FFF9C4',
                      color: customer.status === 'APPROVED' ? '#1B5E20' : 
                             customer.status === 'REJECTED' ? '#B71C1C' : 
                             '#F57F17',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 32
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Team Members Tab */}
          {hasTeamMembers && currentTab === (hasTeamMembers ? 2 : -1) && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
                  Team Members
                </Typography>
                <Chip 
                  label={`${customer.teamMembers.length} Members`}
                  sx={{ 
                    bgcolor: theme.palette.secondary.main,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                gap: 3 
              }}>
                {customer.teamMembers.map((member: any, index: number) => (
                  <Box 
                    key={index}
                    sx={{
                      position: 'relative',
                      aspectRatio: '1.586 / 1', // Standard ID card ratio
                      border: `3px solid ${theme.palette.secondary.main}`,
                      borderRadius: '16px',
                      bgcolor: 'white',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        transform: 'translateY(-4px) scale(1.02)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {/* Card Header with dark navy background */}
                    <Box sx={{ 
                      bgcolor: theme.palette.secondary.main,
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Team Member
                      </Typography>
                      <Chip 
                        label={`#${String(index + 1).padStart(2, '0')}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'white',
                          color: theme.palette.secondary.main,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    </Box>

                    {/* Card Body */}
                    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {/* Name - Prominent */}
                      <Box>
                        <Typography sx={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 700,
                          color: theme.palette.secondary.main,
                          lineHeight: 1.2,
                          mb: 0.5
                        }}>
                          {member.name} {member.surname}
                        </Typography>
                        <Box sx={{ 
                          width: 40,
                          height: 3,
                          bgcolor: theme.palette.secondary.main,
                          borderRadius: 1
                        }} />
                      </Box>

                      {/* ID Number */}
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Box sx={{ 
                          width: 4,
                          height: 4,
                          bgcolor: theme.palette.secondary.main,
                          borderRadius: '50%'
                        }} />
                        <Box>
                          <Typography sx={{ 
                            fontSize: '0.65rem',
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                          }}>
                            ID Number
                          </Typography>
                          <Typography sx={{ 
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            fontFamily: 'monospace'
                          }}>
                            {member.idNumber || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Address */}
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1
                      }}>
                        <Box sx={{ 
                          width: 4,
                          height: 4,
                          bgcolor: theme.palette.secondary.main,
                          borderRadius: '50%',
                          mt: 0.5
                        }} />
                        <Box>
                          <Typography sx={{ 
                            fontSize: '0.65rem',
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                          }}>
                            Address
                          </Typography>
                          <Typography sx={{ 
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: 'text.primary',
                            lineHeight: 1.4
                          }}>
                            {member.address || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Footer Stripe */}
                    <Box sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 6,
                      bgcolor: theme.palette.secondary.main,
                    }} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Attached Shafts Tab */}
          {currentTab === getShaftTabIndex() && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
                Attached Shaft Assignments
              </Typography>
              
              {shaftLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                  <CircularProgress sx={{ color: theme.palette.secondary.main }} />
                </Box>
              ) : shaftError ? (
                <Alert severity="error">{shaftError}</Alert>
              ) : shaftAssignments.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: 300,
                  gap: 2
                }}>
                  <ConstructionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
                  <Typography variant="body1" color="text.secondary">
                    No shaft assignments found for this syndicate.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                  {shaftAssignments.map((assignment, idx) => (
                    <Box 
                      key={assignment.id || idx}
                      sx={{
                        border: `2px solid ${theme.palette.secondary.main}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        bgcolor: 'white',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      {/* Card Header */}
                      <Box sx={{ 
                        bgcolor: theme.palette.secondary.main,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}>
                        <Box 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white'
                          }}
                        >
                          <ConstructionIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                            Shaft #{assignment.shaftNumbers || 'N/A'}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' }}>
                            {assignment.sectionName || 'No Section'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Card Body */}
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {/* Status Badge */}
                          {assignment.status && (
                            <Box>
                              <Chip
                                label={assignment.status}
                                size="small"
                                sx={{
                                  bgcolor: assignment.status === 'APPROVED' ? '#C8E6C9' : 
                                           assignment.status === 'REJECTED' ? '#FFCDD2' : 
                                           assignment.status === 'PENDING' ? '#FFF9C4' :
                                           '#FFE0B2',
                                  color: assignment.status === 'APPROVED' ? '#1B5E20' : 
                                         assignment.status === 'REJECTED' ? '#B71C1C' : 
                                         assignment.status === 'PENDING' ? '#F57F17' :
                                         '#E65100',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            </Box>
                          )}

                          {/* Details Grid */}
                          <Box sx={{ display: 'grid', gap: 1.2 }}>
                            {assignment.medicalFee && (
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                  Medical Fee
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                  {assignment.medicalFee}
                                </Typography>
                              </Box>
                            )}
                            {assignment.regFee && (
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                  Registration Fee
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                  {assignment.regFee}
                                </Typography>
                              </Box>
                            )}
                            {assignment.startContractDate && (
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                  Contract Period
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                  {assignment.startContractDate} - {assignment.endContractDate || 'Ongoing'}
                                </Typography>
                              </Box>
                            )}
                            {assignment.reason && (
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                  Reason
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                  {assignment.reason}
                                </Typography>
                              </Box>
                            )}
                            {assignment.createdAt && (
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                  Created
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                  {assignment.createdAt}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* ID Picture Tab */}
          {hasIdPicture && currentTab === (hasTeamMembers ? (getShaftTabIndex() + 1) : (getShaftTabIndex() + 1)) && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
                National ID Picture
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'background.default',
                borderRadius: '12px',
                p: 3,
                minHeight: 400
              }}>
                <Box
                  component="img"
                  src={customer.idPicture}
                  alt="National ID"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: `2px solid ${theme.palette.secondary.main}20`
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Additional Information Tab */}
          {hasAdditionalInfo && currentTab === (hasTeamMembers && hasIdPicture ? (getShaftTabIndex() + 2) : hasTeamMembers || hasIdPicture ? (getShaftTabIndex() + 1) : getShaftTabIndex()) && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
                Additional Information
              </Typography>
              <Box sx={{
                p: 3,
                border: `2px solid ${theme.palette.secondary.main}`,
                borderRadius: '12px',
                bgcolor: `${theme.palette.secondary.main}05`
              }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px', mb: 2, display: 'block' }}>
                  Notes / Reason
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.8, color: 'text.primary' }}>
                  {customer.reason}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2.5, bgcolor: 'background.default' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            bgcolor: theme.palette.secondary.main,
            color: '#fff',
            '&:hover': { bgcolor: theme.palette.secondary.dark },
            px: 4
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
