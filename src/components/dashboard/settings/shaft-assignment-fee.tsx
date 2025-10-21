'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UpdateIcon from '@mui/icons-material/Update';
import SendIcon from '@mui/icons-material/Send';

export interface ShaftAssignmentFeeValues {
  regFee: string;
  medicalFee: string;
}

interface ShaftAssignmentFeeProps {
  initialValues?: Partial<ShaftAssignmentFeeValues>;
  onDelete?: () => void;
  onUpdate?: (values: ShaftAssignmentFeeValues) => void;
  onSubmit?: (values: ShaftAssignmentFeeValues) => void;
}

export function ShaftAssignmentFeeCard({
  initialValues,
  onDelete,
  onUpdate,
  onSubmit,
}: ShaftAssignmentFeeProps): React.JSX.Element {
  const [regFee, setRegFee] = React.useState<string>(initialValues?.regFee ?? '');
  const [medicalFee, setMedicalFee] = React.useState<string>(initialValues?.medicalFee ?? '');

  const handleDelete = () => {
    setRegFee('');
    setMedicalFee('');
    onDelete?.();
  };

  const handleUpdate = () => {
    onUpdate?.({ regFee, medicalFee });
  };

  const handleSubmit = () => {
    onSubmit?.({ regFee, medicalFee });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Card>
        <CardHeader subheader="Configure fees" title="Shaft assignment fee" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>regFee</InputLabel>
              <OutlinedInput
                label="regFee"
                name="regFee"
                type="number"
                value={regFee}
                onChange={(e) => setRegFee(e.target.value)}
                inputProps={{ min: 0 }}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>medicalFee</InputLabel>
              <OutlinedInput
                label="medicalFee"
                name="medicalFee"
                type="number"
                value={medicalFee}
                onChange={(e) => setMedicalFee(e.target.value)}
                inputProps={{ min: 0 }}
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Button type="button" variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={handleDelete}>
            Delete
          </Button>
          <Button type="button" variant="outlined" startIcon={<UpdateIcon />} onClick={handleUpdate}>
            Update
          </Button>
          <Button type="submit" variant="contained" startIcon={<SendIcon />}>
            Submit
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
