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
  Divider
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
                        <Stack direction="column" spacing={0.5} width="100%">
                          <Typography variant="body2" fontWeight={500}>
                            {option.sectionName} - {option.shaftNumbers}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Status: {option.status} | Assign: {option.assignStatus}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
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
                    <Stack spacing={3}>
                      {/* Shaft Information Card */}
                      <Card
                        sx={{
                          p: 3,
                          border: `1px solid ${alpha('#635bff', 0.2)}`,
                          borderRadius: 2,
                          bgcolor: alpha('#635bff', 0.02),
                        }}
                      >
                        <Typography variant="h6" fontWeight={600} color="#635bff" gutterBottom>
                          {selectedShaft.sectionName} - {selectedShaft.shaftNumbers}
                        </Typography>
                        
                        <Stack direction="row" spacing={4} flexWrap="wrap">
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Status
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {selectedShaft.status}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Assignment Status
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {selectedShaft.assignStatus}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Operation Status
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {selectedShaft.operationStatus ? 'Active' : 'Inactive'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Registration Fee
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              ${selectedShaft.regFee}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Medical Fee
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              ${selectedShaft.medicalFee}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Start Contract Date
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {selectedShaft.startContractDate.length >= 3 
                                ? `${selectedShaft.startContractDate[0]}-${String(selectedShaft.startContractDate[1]).padStart(2, '0')}-${String(selectedShaft.startContractDate[2]).padStart(2, '0')}`
                                : 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Location
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {selectedShaft.latitude.toFixed(6)}, {selectedShaft.longitude.toFixed(6)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Stack>
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
    </Box>
  );
}