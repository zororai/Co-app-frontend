'use client';

import * as React from 'react';
import { 
  Box, 
  Container, 
  Stack, 
  Typography, 
  Card, 
  CardContent,
  TextField,
  Autocomplete,
  useTheme,
  alpha,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Grid
} from '@mui/material';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react';
import { User as UserIcon } from '@phosphor-icons/react';
import { ArrowsClockwise as RefreshIcon } from '@phosphor-icons/react';
import { authClient } from '@/lib/auth/client';

// Mock data for shaft owners
const SHAFT_OWNERS = [
  { id: '1', name: 'Owner 1', shaftsCount: 5 },
  { id: '2', name: 'Owner 2', shaftsCount: 3 },
  { id: '3', name: 'Owner 3', shaftsCount: 8 },
  { id: '4', name: 'Owner 4', shaftsCount: 2 },
  { id: '5', name: 'Owner 5', shaftsCount: 6 },
];

interface ShaftOwner {
  id: string;
  name: string;
  shaftsCount: number;
}

interface ShaftAssignment {
  id: string;
  sectionName: string;
  shaftNumbers: string;
  operationStatus: boolean;
  startContractDate: number[];
  status: string;
  assignStatus: string;
  regFee: number;
  medicalFee: number;
  latitude: number;
  longitude: number;
  minerId?: string; // Add minerId field
}

interface Miner {
  name: string;
  surname: string;
  nationIdNumber: string;
  address: string;
  cellNumber: string;
  shaftnumber: number;
  email: string;
  status: string;
  reason: string;
  registrationNumber: string;
  registrationDate: string;
  cooperativename: string;
  position: string;
  idPicture: string;
  teamMembers: Array<{
    name: string;
    surname: string;
    idNumber: string;
    address: string;
  }>;
}

interface Company {
  companyName: string;
  address: string;
  cellNumber: string;
  email: string;
  registrationNumber: string;
  companyLogo: string;
  shaftnumber: number;
  certificateOfCooperation: string;
  cr14Copy: string;
  miningCertificate: string;
  taxClearance: string;
  passportPhoto: string;
  ownerName: string;
  ownerSurname: string;
  ownerAddress: string;
  ownerCellNumber: string;
  ownerIdNumber: string;
  status: string;
  reason: string;
}

export function ShaftTransferPage(): React.JSX.Element {
  const theme = useTheme();
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedOwner, setSelectedOwner] = React.useState<ShaftOwner | null>(null);
  const [showResults, setShowResults] = React.useState(false);
  const [shaftAssignments, setShaftAssignments] = React.useState<ShaftAssignment[]>([]);
  const [filteredShafts, setFilteredShafts] = React.useState<ShaftAssignment[]>([]);
  const [selectedShaft, setSelectedShaft] = React.useState<ShaftAssignment | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = React.useState(false);
  const [ownerDetails, setOwnerDetails] = React.useState<{
    type: 'miner' | 'company' | null;
    data: Miner | Company | null;
  }>({ type: null, data: null });
  const [ownerLoading, setOwnerLoading] = React.useState(false);

  // Fetch shaft assignments on component mount
  React.useEffect(() => {
    const fetchShaftAssignments = async () => {
      setLoading(true);
      try {
        const data = await authClient.fetchAllShaftAssignments();
        setShaftAssignments(data);
      } catch (error) {
        console.error('Error fetching shaft assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShaftAssignments();
  }, []);

  // Filter shafts based on search input
  React.useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredShafts([]);
      return;
    }

    const filtered = shaftAssignments.filter((shaft) =>
      shaft.sectionName.toLowerCase().includes(searchValue.toLowerCase()) ||
      shaft.shaftNumbers.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredShafts(filtered);
  }, [searchValue, shaftAssignments]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setShowResults(true);
  };

  const handleShaftSelect = (event: React.SyntheticEvent, newValue: ShaftAssignment | null) => {
    setSelectedShaft(newValue);
    setShowResults(true);
  };

  const handleOwnerChange = (event: React.SyntheticEvent, newValue: ShaftOwner | null) => {
    setSelectedOwner(newValue);
    setShowResults(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await authClient.fetchAllShaftAssignments();
      setShaftAssignments(data);
    } catch (error) {
      console.error('Error refreshing shaft assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewShaftOwner = async () => {
    if (!selectedShaft) return;

    setOwnerLoading(true);
    setOwnerDialogOpen(true);
    
    // Reset previous data
    setOwnerDetails({ type: null, data: null });

    try {
      // Use the shaft ID as minerId since we don't have a separate minerId field
      const minerId = selectedShaft.id;

      // Try to fetch miner details first
      const minerResult = await authClient.fetchMinerById(minerId);
      if (minerResult.success && minerResult.data) {
        setOwnerDetails({ type: 'miner', data: minerResult.data });
        setOwnerLoading(false);
        return;
      }

      // If miner not found, try company
      const companyResult = await authClient.fetchCompanyById(minerId);
      if (companyResult && companyResult.companyName) {
        setOwnerDetails({ type: 'company', data: companyResult });
        setOwnerLoading(false);
        return;
      }

      // If both failed, show "not found" state
      setOwnerDetails({ type: null, data: null });
    } catch (error) {
      console.error('Error fetching owner details:', error);
      setOwnerDetails({ type: null, data: null });
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleCloseOwnerDialog = () => {
    setOwnerDialogOpen(false);
    setOwnerDetails({ type: null, data: null });
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 3,
        bgcolor: '#fafafa',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Shaft Transfer Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search and manage shaft ownership transfers across different owners
            </Typography>
          </Box>
          
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              border: `1px solid ${alpha('#E5E5E5', 0.8)}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1
                  }}
                >
                  Search Shaft Transfers
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary 
                  }}
                >
                  Find and manage shaft ownership transfers
                </Typography>
              </Box>

              {/* Search Interface */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: 800,
                  mx: 'auto',
                  py: 3,
                }}
              >
                {/* Shaft Search Dropdown */}
                <Box sx={{ flex: 1, maxWidth: 300 }}>
                  <Autocomplete
                    options={filteredShafts}
                    getOptionLabel={(option) => `${option.sectionName} - ${option.shaftNumbers}`}
                    value={selectedShaft}
                    onChange={handleShaftSelect}
                    inputValue={searchValue}
                    onInputChange={(event, newInputValue) => {
                      setSearchValue(newInputValue);
                      setShowResults(true);
                    }}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search Shaft to be transferred"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <SearchIcon 
                              size={20} 
                              color={theme.palette.text.secondary}
                              style={{ marginRight: 8 }}
                            />
                          ),
                          sx: {
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#E5E5E5', 0.8),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#635bff', 0.5),
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#635bff',
                            },
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            py: 1.5,
                            fontSize: '0.95rem',
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box
                          key={key}
                          component="li"
                          {...otherProps}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              bgcolor: alpha('#635bff', 0.08),
                            },
                          }}
                        >
                          <Stack direction="column" spacing={0.5} width="100%">
                            <Typography variant="body2" fontWeight={500}>
                              {option.sectionName} - {option.shaftNumbers}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Status: {option.status} | Assign: {option.assignStatus}
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    }}
                    noOptionsText={searchValue ? "No shafts found" : "Type to search shafts"}
                  />
                </Box>

                {/* Refresh Button */}
                <Box
                  onClick={handleRefresh}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: alpha('#635bff', 0.1),
                    color: '#635bff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: alpha('#635bff', 0.2),
                      transform: 'rotate(90deg)',
                    },
                  }}
                >
                  <RefreshIcon size={20} />
                </Box>

                {/* Shaft Owner Search Field */}
                <Box sx={{ flex: 1, maxWidth: 300 }}>
                  <Autocomplete
                    options={SHAFT_OWNERS}
                    getOptionLabel={(option) => option.name}
                    value={selectedOwner}
                    onChange={handleOwnerChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Shaft Owner"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <UserIcon 
                              size={20} 
                              color={theme.palette.text.secondary}
                              style={{ marginRight: 8 }}
                            />
                          ),
                          sx: {
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#E5E5E5', 0.8),
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: alpha('#635bff', 0.5),
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#635bff',
                            },
                          }
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            py: 1.5,
                            fontSize: '0.95rem',
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&:hover': {
                            bgcolor: alpha('#635bff', 0.08),
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} width="100%">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: alpha('#635bff', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <UserIcon size={16} color="#635bff" />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.shaftsCount} shafts
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}
                  />
                </Box>
              </Box>

              {/* Results Section */}
              {showResults && selectedShaft && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ py: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Shaft Transfer Details
                    </Typography>
                    
                    {/* Two Column Layout */}
                    <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                      {/* Left Column - Shaft Transfer Details Card */}
                      <Card
                        sx={{
                          flex: 1,
                          p: 3,
                          border: `1px solid ${alpha('#22c55e', 0.3)}`,
                          borderRadius: 3,
                          bgcolor: '#22c55e',
                          color: 'white',
                          position: 'relative',
                          minHeight: 200,
                        }}
                      >

                        
                        {/* Well Icon */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255,255,255,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 2h12v2H6V2zm0 18h12v2H6v-2zM8 6h8v2H8V6zm0 10h8v2H8v-2zM4 9h2v6H4V9zm14 0h2v6h-2V9zM9 10h6v4H9v-4z"/>
                            </svg>
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            Shaft Transfer Details
                          </Typography>
                        </Box>
                        
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                              Section: {selectedShaft.sectionName}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                              Shaft Number: {selectedShaft.shaftNumbers}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Status: {selectedShaft.status}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Assignment: {selectedShaft.assignStatus}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Operation: {selectedShaft.operationStatus ? 'Active' : 'Inactive'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Registration Fee: ${selectedShaft.regFee}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Medical Fee: ${selectedShaft.medicalFee}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Contract Start: {selectedShaft.startContractDate.length >= 3 
                                ? `${selectedShaft.startContractDate[0]}-${String(selectedShaft.startContractDate[1]).padStart(2, '0')}-${String(selectedShaft.startContractDate[2]).padStart(2, '0')}`
                                : 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Location: {selectedShaft.latitude.toFixed(6)}, {selectedShaft.longitude.toFixed(6)}
                            </Typography>
                          </Box>
                          

                        </Stack>
                      </Card>

                      {/* Right Column - Owner Information Card */}
                      <Card
                        sx={{
                          flex: 1,
                          p: 3,
                          border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                          borderRadius: 3,
                          bgcolor: '#3b82f6',
                          color: 'white',
                          position: 'relative',
                          minHeight: 200,
                        }}
                      >
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Shaft Owner Management
                        </Typography>
                        
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                          <Box
                            component="button"
                            onClick={handleViewShaftOwner}
                            sx={{
                              px: 4,
                              py: 2,
                              borderRadius: 2,
                              border: '2px solid rgba(255,255,255,0.3)',
                              bgcolor: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              fontSize: '1rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                                border: '2px solid rgba(255,255,255,0.5)',
                                transform: 'translateY(-2px)',
                              },
                              '&:disabled': {
                                opacity: 0.6,
                                cursor: 'not-allowed',
                                transform: 'none',
                              },
                            }}
                            disabled={ownerLoading}
                          >
                            {ownerLoading ? 'Loading...' : 'View Shaft Owner'}
                          </Box>
                        </Box>
                      </Card>
                    </Box>
                  </Box>
                </>
              )}
              
              {showResults && !selectedShaft && searchValue && !loading && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body1">
                      {filteredShafts.length === 0 && searchValue
                        ? `No shafts found for "${searchValue}"`
                        : selectedOwner && !selectedShaft
                        ? `Showing shafts owned by ${selectedOwner.name}`
                        : searchValue && !selectedShaft
                        ? 'Select a shaft from the dropdown to view details'
                        : 'Enter search terms to view results'}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* Owner Details Dialog */}
      <Dialog
        open={ownerDialogOpen}
        onClose={handleCloseOwnerDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          bgcolor: ownerDetails.type === 'miner' ? '#22c55e' : ownerDetails.type === 'company' ? '#3b82f6' : '#f3f4f6',
          color: ownerDetails.type ? 'white' : 'black'
        }}>
          <Typography variant="h6" fontWeight={600}>
            {ownerLoading ? 'Loading Owner Details...' : 
             ownerDetails.type === 'miner' ? 'Miner Details' :
             ownerDetails.type === 'company' ? 'Company Details' :
             'Owner Not Found'}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {ownerLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Searching for owner details...
              </Typography>
            </Box>
          ) : ownerDetails.type === 'miner' && ownerDetails.data ? (
            <Stack spacing={3}>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label="Miner" 
                  color="success" 
                  sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).name} {(ownerDetails.data as Miner).surname}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    National ID
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).nationIdNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Cell Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).cellNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).email}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {(ownerDetails.data as Miner).address}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Cooperative Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).cooperativename}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Position
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).position}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={(ownerDetails.data as Miner).status} 
                    color={(ownerDetails.data as Miner).status.toLowerCase() === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Registration Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Miner).registrationDate}
                  </Typography>
                </Box>
              </Box>
              
              {(ownerDetails.data as Miner).teamMembers && (ownerDetails.data as Miner).teamMembers.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Team Members
                  </Typography>
                  <Stack spacing={1}>
                    {(ownerDetails.data as Miner).teamMembers.map((member, index) => (
                      <Card key={index} variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {member.name} {member.surname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {member.idNumber} | Address: {member.address}
                        </Typography>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : ownerDetails.type === 'company' && ownerDetails.data ? (
            <Stack spacing={3}>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label="Company" 
                  color="primary" 
                  sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Company Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).companyName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Registration Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).registrationNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Cell Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).cellNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).email}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {(ownerDetails.data as Company).address}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Owner Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).ownerName} {(ownerDetails.data as Company).ownerSurname}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Owner Cell Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).ownerCellNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Owner ID Number
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {(ownerDetails.data as Company).ownerIdNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip 
                    label={(ownerDetails.data as Company).status} 
                    color={(ownerDetails.data as Company).status.toLowerCase() === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Miner not found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No miner or company details were found for this shaft assignment.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseOwnerDialog} 
            variant="contained"
            sx={{ px: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}