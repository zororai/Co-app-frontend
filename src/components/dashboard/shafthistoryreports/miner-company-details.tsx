'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

interface MinerData {
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

interface CompanyData {
  companyName: string;
  address: string;
  cellNumber: string;
  email: string;
  registrationNumber: string;
  shaftnumber: number;
  ownerName: string;
  ownerSurname: string;
  ownerAddress: string;
  ownerCellNumber: string;
  ownerIdNumber: string;
  status: string;
  reason: string;
}

interface MinerCompanyDetailsProps {
  minerData?: MinerData | null;
  companyData?: CompanyData | null;
}

export function MinerCompanyDetails({ minerData, companyData }: MinerCompanyDetailsProps): React.JSX.Element {
  console.log('🎨 MinerCompanyDetails render');
  console.log('   minerData:', minerData);
  console.log('   companyData:', companyData);
  console.log('   typeof minerData:', typeof minerData);
  console.log('   typeof companyData:', typeof companyData);
  
  const data = minerData || companyData;
  const isMiner = !!minerData;
  
  console.log('   data:', data);
  console.log('   isMiner:', isMiner);
  console.log('   !data:', !data);

  if (!data) {
    console.log('⚠️ No data - showing empty message');
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">
            No miner or company data available
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  console.log('✅ Has data - rendering full card');

  const InfoItem = ({ label, value }: { label: string; value: any }) => (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">
        {value || 'N/A'}
      </Typography>
    </Stack>
  );

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Typography variant="h6">
                {isMiner ? 'Miner Details' : 'Company Details'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {isMiner 
                  ? `${minerData.name} ${minerData.surname}` 
                  : (companyData?.companyName ?? 'N/A')
                }
              </Typography>
            </div>
            <Chip
              label={data.status}
              color={data.status === 'active' || data.status === 'approved' ? 'success' : 'default'}
              size="small"
            />
          </Box>

          <Divider />

          {isMiner && minerData ? (
            // Miner Information
            <>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Full Name" value={`${minerData.name} ${minerData.surname}`} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="National ID" value={minerData.nationIdNumber} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Cell Number" value={minerData.cellNumber} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Email" value={minerData.email} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Position" value={minerData.position} />
                </Grid>

            

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Registration Number" value={minerData.registrationNumber} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Registration Date" value={minerData.registrationDate} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Cooperative Name" value={minerData.cooperativename} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <InfoItem label="Address" value={minerData.address} />
                </Grid>

                {minerData.reason && (
                  <Grid size={{ xs: 12 }}>
                    <InfoItem label="Reason" value={minerData.reason} />
                  </Grid>
                )}
              </Grid>

              {minerData.teamMembers && minerData.teamMembers.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Team Members ({minerData.teamMembers.length})
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {minerData.teamMembers.map((member, index) => (
                        <Card key={index} variant="outlined" sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoItem label="Name" value={`${member.name} ${member.surname}`} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoItem label="ID Number" value={member.idNumber} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                              <InfoItem label="Address" value={member.address} />
                            </Grid>
                          </Grid>
                        </Card>
                      ))}
                    </Stack>
                  </div>
                </>
              )}
            </>
          ) : companyData ? (
            // Company Information
            <>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Company Name" value={companyData.companyName} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Registration Number" value={companyData.registrationNumber} />
                </Grid>

                

               

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <InfoItem label="Email" value={companyData.email} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <InfoItem label="Address" value={companyData.address} />
                </Grid>
              </Grid>

              <Divider />

              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Owner Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem label="Owner Name" value={`${companyData.ownerName} ${companyData.ownerSurname}`} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem label="Owner ID Number" value={companyData.ownerIdNumber} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem label="Owner Cell Number" value={companyData.ownerCellNumber} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <InfoItem label="Owner Address" value={companyData.ownerAddress} />
                  </Grid>
                </Grid>
              </div>

              {companyData.reason && (
                <>
                  <Divider />
                  <InfoItem label="Reason" value={companyData.reason} />
                </>
              )}
            </>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
