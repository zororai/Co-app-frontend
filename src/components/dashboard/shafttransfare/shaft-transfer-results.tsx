'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
} from '@mui/material';
import { ArrowRight as TransferIcon } from '@phosphor-icons/react';
import { Eye as ViewIcon } from '@phosphor-icons/react';
import { Buildings as ShaftIcon } from '@phosphor-icons/react';

interface ShaftData {
  id: string;
  shaftNumber: string;
  currentOwner: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  registrationDate: string;
  transferHistory: number;
}

interface ShaftTransferResultsProps {
  searchTerm?: string;
  selectedOwner?: string;
}

const MOCK_SHAFTS: ShaftData[] = [
  {
    id: '1',
    shaftNumber: 'SH001',
    currentOwner: 'Owner 1',
    location: 'Mining District A',
    status: 'Active',
    registrationDate: '2024-01-15',
    transferHistory: 2,
  },
  {
    id: '2',
    shaftNumber: 'SH002',
    currentOwner: 'Owner 2',
    location: 'Mining District B',
    status: 'Active',
    registrationDate: '2024-02-20',
    transferHistory: 0,
  },
  {
    id: '3',
    shaftNumber: 'SH003',
    currentOwner: 'Owner 1',
    location: 'Mining District A',
    status: 'Suspended',
    registrationDate: '2024-03-10',
    transferHistory: 1,
  },
];

export function ShaftTransferResults({ searchTerm, selectedOwner }: ShaftTransferResultsProps): React.JSX.Element {
  const theme = useTheme();
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [selectedShaft, setSelectedShaft] = React.useState<ShaftData | null>(null);
  const [newOwner, setNewOwner] = React.useState('');

  const filteredShafts = React.useMemo(() => {
    return MOCK_SHAFTS.filter(shaft => {
      const matchesSearch = !searchTerm || 
        shaft.shaftNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shaft.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesOwner = !selectedOwner || shaft.currentOwner === selectedOwner;
      
      return matchesSearch && matchesOwner;
    });
  }, [searchTerm, selectedOwner]);

  const handleTransferClick = (shaft: ShaftData) => {
    setSelectedShaft(shaft);
    setTransferDialogOpen(true);
  };

  const handleTransferSubmit = () => {
    if (selectedShaft && newOwner) {
      console.log(`Transferring shaft ${selectedShaft.shaftNumber} to ${newOwner}`);
      // TODO: Implement actual transfer logic
      setTransferDialogOpen(false);
      setNewOwner('');
      setSelectedShaft(null);
    }
  };

  const getStatusColor = (status: ShaftData['status']) => {
    switch (status) {
      case 'Active':
        return { color: '#1B5E20', bgcolor: '#C8E6C9' };
      case 'Inactive':
        return { color: '#F57F17', bgcolor: '#FFF9C4' };
      case 'Suspended':
        return { color: '#B71C1C', bgcolor: '#FFCDD2' };
      default:
        return { color: '#424242', bgcolor: '#E0E0E0' };
    }
  };

  if (!searchTerm && !selectedOwner) {
    return <Box />;
  }

  return (
    <Card sx={{ mt: 3, borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Search Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredShafts.length} shaft{filteredShafts.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Shaft Details
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Current Owner
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Location
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Transfer History
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShafts.map((shaft) => {
                const statusStyle = getStatusColor(shaft.status);
                return (
                  <TableRow key={shaft.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ShaftIcon size={20} color={theme.palette.primary.main} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {shaft.shaftNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Registered: {new Date(shaft.registrationDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {shaft.currentOwner.charAt(shaft.currentOwner.length - 1)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {shaft.currentOwner}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {shaft.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={shaft.status}
                        size="small"
                        sx={{
                          ...statusStyle,
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {shaft.transferHistory} transfer{shaft.transferHistory !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Transfer Ownership">
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleTransferClick(shaft)}
                            disabled={shaft.status === 'Suspended'}
                          >
                            <TransferIcon size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredShafts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No shafts found matching your search criteria
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Transfer Shaft Ownership
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Shaft Information
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Typography variant="body2">
                  <strong>Shaft Number:</strong> {selectedShaft?.shaftNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Current Owner:</strong> {selectedShaft?.currentOwner}
                </Typography>
                <Typography variant="body2">
                  <strong>Location:</strong> {selectedShaft?.location}
                </Typography>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="New Owner"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="Enter new owner name"
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransferSubmit} 
            variant="contained"
            disabled={!newOwner.trim()}
          >
            Transfer Ownership
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}