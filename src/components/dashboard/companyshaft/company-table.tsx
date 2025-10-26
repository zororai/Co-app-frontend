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
import dayjs from 'dayjs';

// Removed incorrect imports for Dialog, DialogContent, DialogTitle, IconButton
import { useSelection } from '@/hooks/use-selection';
import { ReactNode, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { authClient } from '@/lib/auth/client';
import { ShaftAttachmentDialog } from '@/components/dashboard/shaftreg/shaft-attachment-dialog';
import { sortNewestFirst } from '@/utils/sort';

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
  status: 'APPROVED' | 'REJECTED' | 'PENDING  ';
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
  // Dialog state for company details
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyDialogId, setCompanyDialogId] = useState<string | null>(null);
  const [companyDialogData, setCompanyDialogData] = useState<any | null>(null);
  const [companyDialogLoading, setCompanyDialogLoading] = useState(false);
  const [companyDialogError, setCompanyDialogError] = useState<string | null>(null);
  const [isShaftAttachmentDialogOpen, setIsShaftAttachmentDialogOpen] = React.useState(false);
  const [selectedCustomerForShaft, setSelectedCustomerForShaft] = React.useState<string | null>(null);

  const handleOpenCompanyDialog = async (id: string) => {
    setCompanyDialogOpen(true);
    setCompanyDialogId(id);
    setCompanyDialogData(null);
    setCompanyDialogError(null);
    setCompanyDialogLoading(true);
    try {
      const data = await authClient.fetchCompanyDetails(id);
      if (data) {
        setCompanyDialogData(data);
      } else {
        setCompanyDialogError('No company details found or not authorized.');
      }
    } catch (error) {
      setCompanyDialogError(error instanceof Error ? error.message : 'Failed to fetch company details');
    } finally {
      setCompanyDialogLoading(false);
    }
  };

  const handleCloseCompanyDialog = () => {
    setCompanyDialogOpen(false);
    setCompanyDialogId(null);
    setCompanyDialogData(null);
    setCompanyDialogError(null);
    setCompanyDialogLoading(false);
  };

  const handleShaftAttachment = (customerId: string) => {
    setSelectedCustomerForShaft(customerId);
    setIsShaftAttachmentDialogOpen(true);
  };

  const handleCloseShaftAttachment = () => {
    setIsShaftAttachmentDialogOpen(false);
    setSelectedCustomerForShaft(null);
  };
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  

  // Sort then filter the rows based on search and filters
  const sortedRows = React.useMemo(() => sortNewestFirst(rows), [rows]);
  const filteredRows = React.useMemo(() => {
    return sortedRows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [sortedRows, filters]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handleRedirect = (path: string) => {
    globalThis.location.href = path;
  };

  function onRowsPerPageChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    throw new Error('Function not implemented.');
  }


  return (
    <Card>
      {/* Action Buttons */}
     <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#5f4bfa',
            color: '#fff',
            '&:hover': { bgcolor: '#4d3fd6' }
          }}
          onClick={() => handleRedirect('/dashboard/shaftassign')}
        >
          View Syndicate
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#5f4bfa',
            color: '#fff',
            '&:hover': { bgcolor: '#4d3fd6' }
          }}
          onClick={() => handleRedirect('/dashboard/companyshaft')}
        >
          View Company
        </Button>
      </Box>
      <Divider />
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
              <TableCell>Registration Number</TableCell>
              <TableCell>Company Name</TableCell>
              <TableCell>Company Address</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Number Of Shaft</TableCell>
          <TableCell>Status</TableCell>
              <TableCell>View  Miner Details</TableCell>
              <TableCell>Attached Shaft</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.registrationNumber}</TableCell>
                  <TableCell>{row.companyName}</TableCell>
                  <TableCell>{row.address}</TableCell>
                
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.shaftnumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: 
                            row.status === 'APPROVED' ?  '#d0f5e8' : '#ffebee',
                          color: 
                            row.status === 'APPROVED' ? '#1b5e20' : '#c62828',
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        {row.status}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <button 
                        style={{
                          background: 'none',
                          border: '1px solid #17212cff',
                          color: '#17212cff',
                          borderRadius: '6px',
                          padding: '2px 12px',
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                        onClick={() => handleOpenCompanyDialog(row.id)}
                      >
                        View Company Details
                      </button>
      {/* Company Details Dialog */}
      <Dialog open={companyDialogOpen} onClose={handleCloseCompanyDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          Company Details
          <IconButton onClick={handleCloseCompanyDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {companyDialogLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : companyDialogError ? (
            <Box sx={{ color: 'error.main', p: 2 }}>{companyDialogError}</Box>
          ) : companyDialogData ? (
            <Box sx={{ p: 2 }}>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2
              }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Company Information</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Company Name:</strong> {companyDialogData.companyName}</Typography>
                    <Typography><strong>Registration Number:</strong> {companyDialogData.registrationNumber}</Typography>
                    <Typography><strong>Address:</strong> {companyDialogData.address}</Typography>
                    <Typography><strong>Cell Number:</strong> {companyDialogData.cellNumber}</Typography>
                    <Typography><strong>Email:</strong> {companyDialogData.email}</Typography>
                    <Typography><strong>Number of Shafts:</strong> {companyDialogData.shaftnumber}</Typography>
                    <Typography><strong>Status:</strong> {companyDialogData.status}</Typography>
                    <Typography><strong>Reason:</strong> {companyDialogData.reason}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Owner Information</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Owner Name:</strong> {companyDialogData.ownerName}</Typography>
                    <Typography><strong>Owner Surname:</strong> {companyDialogData.ownerSurname}</Typography>
                    <Typography><strong>Owner Address:</strong> {companyDialogData.ownerAddress}</Typography>
                    <Typography><strong>Owner Cell Number:</strong> {companyDialogData.ownerCellNumber}</Typography>
                    <Typography><strong>Owner ID Number:</strong> {companyDialogData.ownerIdNumber}</Typography>
                  </Box>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">Documents</Typography>
                  <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography>
                        <strong>Certificate Of Cooperation:</strong>{' '}
                        {companyDialogData.certificateOfCooperation ? (
                          <a
                            href={companyDialogData.certificateOfCooperation}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#5f4bfa', textDecoration: 'underline', fontWeight: 500 }}
                          >
                            View Document
                          </a>
                        ) : 'Not Uploaded'}{' '}
                        {companyDialogData.certificateOfCooperation ? (
                          <span style={{ color: 'green', fontWeight: 600, marginLeft: 4 }}>✔</span>
                        ) : (
                          <span style={{ color: 'red', fontWeight: 600, marginLeft: 4 }}>✘</span>
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>
                        <strong>CR14 Copy:</strong>{' '}
                        {companyDialogData.cr14Copy ? (
                          <a
                            href={companyDialogData.cr14Copy}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#5f4bfa', textDecoration: 'underline', fontWeight: 500 }}
                          >
                            View Document
                          </a>
                        ) : 'Not Uploaded'}{' '}
                        {companyDialogData.cr14Copy ? (
                          <span style={{ color: 'green', fontWeight: 600, marginLeft: 4 }}>✔</span>
                        ) : (
                          <span style={{ color: 'red', fontWeight: 600, marginLeft: 4 }}>✘</span>
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>
                        <strong>Mining Certificate:</strong>{' '}
                        {companyDialogData.miningCertificate ? (
                          <a
                            href={companyDialogData.miningCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#5f4bfa', textDecoration: 'underline', fontWeight: 500 }}
                          >
                            View Document
                          </a>
                        ) : 'Not Uploaded'}{' '}
                        {companyDialogData.miningCertificate ? (
                          <span style={{ color: 'green', fontWeight: 600, marginLeft: 4 }}>✔</span>
                        ) : (
                          <span style={{ color: 'red', fontWeight: 600, marginLeft: 4 }}>✘</span>
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography>
                        <strong>Tax Clearance:</strong>{' '}
                        {companyDialogData.taxClearance ? (
                          <a
                            href={companyDialogData.taxClearance}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#5f4bfa', textDecoration: 'underline', fontWeight: 500 }}
                          >
                            View Document
                          </a>
                        ) : 'Not Uploaded'}{' '}
                        {companyDialogData.taxClearance ? (
                          <span style={{ color: 'green', fontWeight: 600, marginLeft: 4 }}>✔</span>
                        ) : (
                          <span style={{ color: 'red', fontWeight: 600, marginLeft: 4 }}>✘</span>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary">Images</Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {companyDialogData.companyLogo && (
                      <Box>
                        <Typography variant="caption">Company Logo</Typography>
                        <Box component="img" src={companyDialogData.companyLogo} alt="Company Logo" sx={{ maxWidth: 120, maxHeight: 120, borderRadius: 1, border: '1px solid #e0e0e0', mb: 1 }} />
                      </Box>
                    )}
                    {companyDialogData.passportPhoto && (
                      <Box>
                        <Typography variant="caption">Passport Photo</Typography>
                        <Box component="img" src={companyDialogData.passportPhoto} alt="Passport Photo" sx={{ maxWidth: 120, maxHeight: 120, borderRadius: 1, border: '1px solid #e0e0e0', mb: 1 }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompanyDialog} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
                    
                    </Box>
                  </TableCell>
                   <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                         <button 
                                           onClick={() => handleShaftAttachment(row.id)}
                                           style={{
                                             background: 'none',
                                             border: '1px solid #06131fff',
                                             color: '#081b2fff',
                                             borderRadius: '6px',
                                             padding: '2px 12px',
                                             cursor: 'pointer',
                                             fontWeight: 500,
                                         }}>Shaft Attachment</button>
                                       </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={(event, newPage) => {
          // Implement your page change logic here
          // For now, just call noop or handle as needed
          noop();
        }}
        onRowsPerPageChange={(event) => onRowsPerPageChange(event)}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
      
      {/* Shaft Attachment Dialog */}
      <ShaftAttachmentDialog
        open={isShaftAttachmentDialogOpen}
        onClose={handleCloseShaftAttachment}
        customerId={selectedCustomerForShaft || undefined}
      />
    </Card>
  );
}
