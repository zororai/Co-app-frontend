'use client';

import * as React from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { sortNewestFirst } from '@/utils/sort';

// Removed incorrect imports for Dialog, DialogContent, DialogTitle, IconButton
import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { CompanyShaftActionDialog } from './company-shaft-action-dialog';
import { CompanyDetailsDialog } from './company-details-dialog';

function noop(): void {
  // do nothing
}
export interface Company {
    id: string;
    companyName: string;
    address: string;
    cellNumber: string;
  email: string;
  companyLogo: string;
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
  status: 'Approved' | 'Rejected' | 'Pending';
  reason: string;
  [key: string]: any;
}

export interface CompanyTableProps {
  count?: number;
  rows?: Company[];
  page?: number;
  rowsPerPage?: number;
}

export function CompanyTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
}: CompanyTableProps): React.JSX.Element {
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [internalPage, setInternalPage] = React.useState(page);
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState(rowsPerPage || 5);
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });
  const [shaftDialogOpen, setShaftDialogOpen] = React.useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = React.useState<string>('');
  const [companyDetailsDialogOpen, setCompanyDetailsDialogOpen] = React.useState(false);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = React.useState<any>(null);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = React.useState(false);

  // Fetch approved companies on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await authClient.fetchApprovedCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching approved companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter the companies based on search and filters
  const filteredRows = React.useMemo(() => {
    const dataToFilter = companies.length > 0 ? companies : rows;
    return dataToFilter.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [companies, rows, filters]);

  // Paginate filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(internalPage * internalRowsPerPage, internalPage * internalRowsPerPage + internalRowsPerPage);
  }, [filteredRows, internalPage, internalRowsPerPage]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const theme = useTheme();

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleRedirect = (path: string) => {
    globalThis.location.href = path;
  };

  const handleViewCustomer = async (companyId: string) => {
    setLoadingCompanyDetails(true);
    try {
      const companyData = await authClient.fetchCompanyById(companyId);
      if (companyData) {
        setSelectedCompanyDetails(companyData);
        setCompanyDetailsDialogOpen(true);
      } else {
        console.error('Failed to fetch company details');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setLoadingCompanyDetails(false);
    }
  };

  const handleShaftAttachment = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompanyId(companyId);
    setSelectedCompanyName(company?.companyName || '');
    setShaftDialogOpen(true);
  };

  const handleAttachExistingShaft = (companyId: string) => {
    // Navigate to existing shaft attachment page
    handleRedirect(`/dashboard/shafts/attach-existing?companyId=${companyId}`);
  };

  const handleCreateNewShaft = (companyId: string) => {
    // Navigate to new shaft creation page
    handleRedirect(`/dashboard/shafts/create-new?companyId=${companyId}`);
  };

  const handleCloseShaftDialog = () => {
    setShaftDialogOpen(false);
    setSelectedCompanyId(null);
    setSelectedCompanyName('');
  };

  const handleCloseCompanyDetailsDialog = () => {
    setCompanyDetailsDialogOpen(false);
    setSelectedCompanyDetails(null);
  };

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      {/* Filters Section */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          sx={{ minWidth: 200 }}
          placeholder="Search by any field..."
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Position</InputLabel>
          <Select
            value={filters.position}
            label="Position"
            onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
          >
            <MenuItem value="all">All Positions</MenuItem>
            <MenuItem value="Representatives">Representatives</MenuItem>
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Member">Member</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Company Address</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>No of Shaft</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View Miner Details</TableCell>
              <TableCell>Attach Shaft</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading approved companies...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No approved companies found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const isSelected = selected?.has(row.id);
                return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.companyName}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.cellNumber || 'N/A'}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.shaftCount || 0}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 
                            row.status === 'Approved' ? '#d0f5e8' : 
                            row.status === 'Rejected' ? '#ffebee' : '#fff3e0',
                          color: 
                            row.status === 'Approved' ? '#1b5e20' : 
                            row.status === 'Rejected' ? '#c62828' : '#e65100',
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        {row.status}
                      </Box>
                    </Box>
                  </TableCell>
                 <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Tooltip title="View Company Details">
                                        <IconButton
                                          onClick={() => handleViewCustomer(row.id)}
                                          disabled={loadingCompanyDetails}
                                          size="small"
                                          sx={{
                                            color: theme.palette.secondary.main,
                                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' },
                                            '&:disabled': { color: 'rgba(0, 0, 0, 0.26)' }
                                          }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Button
                                        onClick={() => handleShaftAttachment(row.id)}
                                        variant="contained"
                                        size="small"
                                        sx={{
                                          bgcolor: 'secondary.dark',
                                          color: 'white',
                                          borderRadius: '999px',
                                          textTransform: 'none',
                                          minWidth: 140,
                                          px: 2,
                                          py: '6px',
                                          boxShadow: 'none',
                                          '&:hover': { bgcolor: 'secondary.main' }
                                        }}
                                      >
                                        Shaft Attachment
                                      </Button>
                                    </Box>
                                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={filteredRows.length}
        onPageChange={(event, newPage) => {
          setInternalPage(newPage);
        }}
        onRowsPerPageChange={(event) => {
          setInternalRowsPerPage(Number.parseInt(event.target.value, 10));
          setInternalPage(0);
        }}
        page={internalPage}
        rowsPerPage={internalRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
      
      <CompanyShaftActionDialog
        open={shaftDialogOpen}
        onClose={handleCloseShaftDialog}
        onAttachExisting={handleAttachExistingShaft}
        onCreateNew={handleCreateNewShaft}
        companyId={selectedCompanyId}
        companyName={selectedCompanyName}
      />
      
      <CompanyDetailsDialog
        open={companyDetailsDialogOpen}
        onClose={handleCloseCompanyDetailsDialog}
        company={selectedCompanyDetails}
      />
    </>
  );
}
