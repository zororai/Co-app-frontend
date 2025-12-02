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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import GroupIcon from '@mui/icons-material/Group';
import { printElementById } from '@/lib/print';
import { useTheme } from '@mui/material/styles';
import { authClient } from '@/lib/auth/client';

interface TeamMember {
  name: string;
  surname: string;
  cellNumber: string;
  picture: string;
  idNumber: string;
  address: string;
}

interface TeamMembersDialogProps {
  open: boolean;
  onClose: () => void;
  minerId: string | null;
}

export function TeamMembersDialog({ open, onClose, minerId }: TeamMembersDialogProps): React.JSX.Element {
  const theme = useTheme();
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch team members when dialog opens or minerId changes
  React.useEffect(() => {
    if (open && minerId) {
      fetchTeamMembers();
    }
  }, [open, minerId]);

  const fetchTeamMembers = async () => {
    if (!minerId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await authClient.fetchTeamMembers(minerId);
      if (result.success && result.data) {
        setTeamMembers(result.data);
      } else {
        setError(result.error || 'Failed to fetch team members');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching team members');
    } finally {
      setLoading(false);
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
          <GroupIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 600 }}>
            Team Members
          </Typography>
          {!loading && teamMembers.length > 0 && (
            <Chip
              label={`${teamMembers.length} ${teamMembers.length === 1 ? 'Member' : 'Members'}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex' }}>
          <IconButton 
            onClick={() => printElementById('team-members-printable', 'Team Members')} 
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

      <DialogContent sx={{ p: 4, minHeight: 400 }}>
        <Box id="team-members-printable">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress sx={{ color: theme.palette.secondary.main }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : teamMembers.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: 300,
              gap: 2
            }}>
              <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="body1" color="text.secondary">
                No team members found.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
              gap: 3 
            }}>
              {teamMembers.map((member, index) => (
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
                  {/* Card Header */}
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
                    {/* Profile Picture (if available) */}
                    {member.picture && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Box
                          component="img"
                          src={member.picture}
                          alt={`${member.name} ${member.surname}`}
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `2px solid ${theme.palette.secondary.main}`,
                          }}
                        />
                      </Box>
                    )}

                    {/* Name - Prominent */}
                    <Box>
                      <Typography sx={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 700,
                        color: theme.palette.secondary.main,
                        lineHeight: 1.2,
                        mb: 0.5,
                        textAlign: 'center'
                      }}>
                        {member.name} {member.surname}
                      </Typography>
                      <Box sx={{ 
                        width: 40,
                        height: 3,
                        bgcolor: theme.palette.secondary.main,
                        borderRadius: 1,
                        margin: '0 auto'
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

                    {/* Cell Number */}
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
                          Cell Number
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'text.primary'
                        }}>
                          {member.cellNumber || 'N/A'}
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
          )}
        </Box>
      </DialogContent>

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
