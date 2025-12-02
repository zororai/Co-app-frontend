'use client';

import * as React from 'react';

// Removed duplicate local Customer interface. Use the exported one below.
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

import { useSelection } from '@/hooks/use-selection';
import { ReactNode } from 'react';
import { authClient } from '@/lib/auth/client';
import { CustomerDetailsDialog } from '@/components/dashboard/customer/customer-details-dialog';
import { ShaftAttachmentDialog } from '@/components/dashboard/shaftassing/shaft-attachment-dialog';
import { ShaftActionDialog } from '@/components/dashboard/shaftassing/shaft-action-dialog';
import { UnassignedShaftsDialog } from '@/components/dashboard/shaftassing/unassigned-shafts-dialog';
import { CompanyTable } from '@/components/dashboard/shaftassing/companyshaftassign-table';

function noop(): void {
  // do nothing
}

export interface Customer {
  cooperativeName: ReactNode;
  cellNumber: ReactNode;
  nationIdNumber: any;
  id: string;
  name: string;
  surname: string;
  nationId: string;
  address: string;
  phone: string;
  position: string;
  cooperative: string;
  numShafts: number;
  status: 'APPROVED' | 'REJECTED';
  reason: string;
  attachedShaft: boolean;
  // Optionally, add index signature if you need dynamic keys:
  [key: string]: any;
}

export interface CustomersTableProps {
  count?: number;
  rows?: Customer[];
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function CustomersTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange
}: CustomersTableProps): React.JSX.Element {
  // State to manage which table to show
  const [activeTable, setActiveTable] = React.useState<'syndicate' | 'company'>('syndicate');
  // Local state for pagination if not controlled by parent
  const [internalPage, setInternalPage] = React.useState(page);
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState(rowsPerPage);

  // Use controlled or internal state
  const currentPage = onPageChange ? page : internalPage;
  const currentRowsPerPage = onRowsPerPageChange ? rowsPerPage : internalRowsPerPage;
  const [filters, setFilters] = React.useState({
    search: '',
    status: 'all',
    position: 'all'
  });

  // Filter the rows based on search and filters
  const filteredRows = React.useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = filters.search === '' || 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesPosition = filters.position === 'all' || row.position === filters.position;
      return matchesSearch && matchesStatus && matchesPosition;
    });
  }, [rows, filters]);

  // Paginate filtered rows
  const paginatedRows = React.useMemo(() => {
    return filteredRows.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);
  }, [filteredRows, currentPage, currentRowsPerPage]);

  const rowIds = React.useMemo(() => {
    return filteredRows.map((customer) => customer.id);
  }, [filteredRows]);

  // Initialize selection handling
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);
  const theme = useTheme();

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;


  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isShaftActionDialogOpen, setIsShaftActionDialogOpen] = React.useState(false);
  const [isShaftAttachmentDialogOpen, setIsShaftAttachmentDialogOpen] = React.useState(false);
  const [isUnassignedShaftsDialogOpen, setIsUnassignedShaftsDialogOpen] = React.useState(false);
  const [selectedCustomerForShaft, setSelectedCustomerForShaft] = React.useState<string | null>(null);

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customerDetails = await authClient.fetchCustomerDetails(customerId);
      if (customerDetails) {
        setSelectedCustomer(customerDetails);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to load customer details');
    }
  };

  const handleShaftAttachment = (customerId: string) => {
    setSelectedCustomerForShaft(customerId);
    setIsShaftActionDialogOpen(true);
  };

  const handleAttachExisting = (customerId: string) => {
    setSelectedCustomerForShaft(customerId);
    setIsUnassignedShaftsDialogOpen(true);
  };

  const handleCreateNew = (customerId: string) => {
    setSelectedCustomerForShaft(customerId);
    setIsShaftAttachmentDialogOpen(true);
  };

  const handleAssignShaft = (customerId: string, shaftId: string) => {
    // TODO: Implement the actual shaft assignment logic here
    console.log('Assigning shaft', shaftId, 'to customer', customerId);
    // You can add the API call to assign the shaft here
    alert(`Shaft ${shaftId} assigned to customer ${customerId}`);
  };

  const handleTableSwitch = (table: 'syndicate' | 'company') => {
    setActiveTable(table);
  };

  return (
    <Card>
      {/* Action Buttons */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: activeTable === 'syndicate' ? '#2d3748' : '#4a5568',
            color: '#fff',
            borderRadius: '25px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: '#2d3748' }
          }}
          onClick={() => handleTableSwitch('syndicate')}
        >
          Assign Shaft to Syndicate
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: activeTable === 'company' ? '#2d3748' : '#4a5568',
            color: '#fff',
            borderRadius: '25px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: '#2d3748' }
          }}
          onClick={() => handleTableSwitch('company')}
        >
          Assign Shaft to Company
        </Button>
      </Box>
      <Divider />
      
      {/* Conditionally render tables based on activeTable state */}
      {activeTable === 'syndicate' ? (
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
              <TableCell>Registration Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Surname</TableCell>
            
              <TableCell>Name Of Cooperative</TableCell>
              <TableCell>No.Of.Shafts</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View Miner Details</TableCell>
              <TableCell>Attach Shaft</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => {
              const isSelected = selected?.has(row.id);
              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell>{row.registrationNumber}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.surname}</TableCell>
                  <TableCell>{row.cooperativename}</TableCell>
                  <TableCell>{row.shaftnumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: row.status === 'APPROVED' ? '#d0f5e8' : '#ffebee', // vivid green or light red
                          color: row.status === 'APPROVED' ? '#1b5e20' : '#c62828',   // deep green or deep red
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
                      <Tooltip title="View Miner Details">
                        <IconButton
                          onClick={() => handleViewCustomer(row.id)}
                          size="small"
                          sx={{
                            color: theme.palette.secondary.main,
                            '&:hover': { bgcolor: 'rgba(50, 56, 62, 0.08)' }
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
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={filteredRows.length}
        page={currentPage}
        rowsPerPage={currentRowsPerPage}
        onPageChange={onPageChange || ((_e, newPage) => setInternalPage(newPage))}
        onRowsPerPageChange={onRowsPerPageChange || ((e) => {
          setInternalRowsPerPage(Number.parseInt(e.target.value, 10));
          setInternalPage(0);
        })}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        open={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />
      
      {/* Shaft Action Selection Dialog */}
      <ShaftActionDialog
        open={isShaftActionDialogOpen}
        onClose={() => {
          setIsShaftActionDialogOpen(false);
          // Don't clear selectedCustomerForShaft here as it might be needed for the next dialog
        }}
        onAttachExisting={handleAttachExisting}
        onCreateNew={handleCreateNew}
        customerId={selectedCustomerForShaft}
      />
      
      {/* Unassigned Shafts Dialog */}
      <UnassignedShaftsDialog
        open={isUnassignedShaftsDialogOpen}
        onClose={() => {
          setIsUnassignedShaftsDialogOpen(false);
          setSelectedCustomerForShaft(null); // Clear when truly closing
        }}
        customerId={selectedCustomerForShaft}
        onAssignShaft={handleAssignShaft}
      />
      
      {/* Shaft Attachment Dialog */}
      <ShaftAttachmentDialog
        open={isShaftAttachmentDialogOpen}
        onClose={() => {
          setIsShaftAttachmentDialogOpen(false);
          setSelectedCustomerForShaft(null); // Clear when truly closing
        }}
        customerId={selectedCustomerForShaft ?? undefined}
      />
        </>
      ) : (
        /* Render Company Table */
        <CompanyTable 
          count={0}
          rows={[]}
          page={0}
          rowsPerPage={5}
        />
      )}
    </Card>
  );
}
