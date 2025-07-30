"use client";
import * as React from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';

import { config } from '@/config';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import type { Customer } from '@/components/dashboard/customer/customers-table';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { RegMinerDialog } from '@/components/dashboard/customer/reg_miner';


const customers = [
  {
    id: '1',
    name: 'zororai',
    nationId: '9988875446',
    address: 'wh6rhgf',
    phone: '0772167755',
    position: 'Representatives',
    cooperative: 'chitwn',
    numShafts: 0,
    status: 'Approved',
    reason: 'Valid documents',
    attachedShaft: true,
  },
  {
    id: '2',
    name: 'zororai',
    nationId: '766455',
    address: 'e',
    phone: '102837',
    position: 'Representatives',
    cooperative: 'zorro',
    numShafts: 0,
    status: 'Approved',
    reason: 'Valid documents',
    attachedShaft: true,
  },
  {
    id: '3',
    name: 'carlos',
    nationId: 'u832u8217',
    address: '4828 Unit C',
    phone: '0775219766',
    position: 'Representatives',
    cooperative: 'seke',
    numShafts: 1,
    status: 'Approved',
    reason: 'Valid documents',
    attachedShaft: true,
  },
  {
    id: '4',
    name: 'patrick',
    nationId: '63-553652h00',
    address: 'Gadzima 23',
    phone: '0715625673',
    position: 'Owner',
    cooperative: 'gomba',
    numShafts: 4,
    status: 'Approved',
    reason: 'Valid documents',
    attachedShaft: true,
  },
  {
    id: '5',
    name: 'Zororai',
    nationId: '50-876567D76',
    address: 'chegutu',
    phone: '0775219766',
    position: 'Representatives',
    cooperative: 'Nhava',
    numShafts: 0,
    status: 'Rejected',
    reason: 'Incomplete documents',
    attachedShaft: true,
  },
] satisfies Customer[];

export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 5;
  const [open, setOpen] = React.useState(false);

  const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Registered Miners</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Import
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Export
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => setOpen(true)}>
            Reg Miner
          </Button>
        </div>
      </Stack>

      <CustomersTable
        count={paginatedCustomers.length}
        page={page}
        rows={paginatedCustomers}
        rowsPerPage={rowsPerPage}
      />

      <RegMinerDialog open={open} onClose={() => setOpen(false)} />
    </Stack>
  );
}

function applyPagination(rows: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
