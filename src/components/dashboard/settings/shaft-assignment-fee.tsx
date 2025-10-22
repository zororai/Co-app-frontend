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

import { authClient } from '@/lib/auth/client';

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
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [existingId, setExistingId] = React.useState<string | number | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await authClient.fetchShaftAssignmentFees();
        if (!active) return;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const first = res.data[0] as any;
          const id = first?.id ?? first?.ID ?? first?.feeId ?? first?.feeID ?? first?._id;
          setExistingId(id ?? null);
          if (typeof first?.regFee !== 'undefined') setRegFee(String(first.regFee));
          if (typeof first?.medicalFee !== 'undefined') setMedicalFee(String(first.medicalFee));
          setEditing(false);
        } else {
          setExistingId(null);
          setEditing(true); // allow creation when no record exists
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load shaft assignment fees', e);
        setExistingId(null);
        setEditing(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      if (existingId != null) {
        const res = await authClient.deleteShaftAssignmentFee(existingId, 'zororo');
        if (!res.success) {
          // eslint-disable-next-line no-alert
          alert(res.error || 'Failed to delete');
          return;
        }
      }
      setRegFee('');
      setMedicalFee('');
      setExistingId(null);
      setEditing(true);
      onDelete?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    // First click enables editing when a record exists
    if (existingId != null && !editing) {
      setEditing(true);
      return;
    }
    // Save/PUT when already editing
    if (existingId != null && editing) {
      try {
        setSubmitting(true);
        const payload = {
          regFee: Number(regFee || 0),
          medicalFee: Number(medicalFee || 0),
        };
        const res = await authClient.updateShaftAssignmentFee(existingId, payload);
        if (!res.success) {
          // eslint-disable-next-line no-alert
          alert(res.error || 'Failed to update');
          return;
        }
        setEditing(false);
        onUpdate?.({ regFee, medicalFee });
        // eslint-disable-next-line no-alert
        alert('Updated successfully');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        // eslint-disable-next-line no-alert
        alert(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.({ regFee, medicalFee });
    try {
      setSubmitting(true);
      const payload = {
        regFee: Number(regFee || 0),
        medicalFee: Number(medicalFee || 0),
      };
      const res = await authClient.createShaftAssignmentFee(payload);
      if (!res.success) {
        // eslint-disable-next-line no-alert
        alert(res.error || 'Failed to submit');
        return;
      }
      // eslint-disable-next-line no-alert
      alert('Shaft assignment fee saved');
      // After create, mark as existing (hide submit, disable inputs)
      setExistingId((res.data as any)?.id ?? (res.data as any)?._id ?? null);
      setEditing(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      alert(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputsDisabled = (existingId != null && !editing) || loading || submitting;

  return (
    <form onSubmit={handleSubmit}>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegFee(e.target.value)}
                inputProps={{ min: 0 }}
                disabled={inputsDisabled}
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>medicalFee</InputLabel>
              <OutlinedInput
                label="medicalFee"
                name="medicalFee"
                type="number"
                value={medicalFee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMedicalFee(e.target.value)}
                inputProps={{ min: 0 }}
                disabled={inputsDisabled}
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end', gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleDelete}
            disabled={submitting || loading || existingId == null}
          >
            Delete
          </Button>
          <Button
            type="button"
            variant="outlined"
            startIcon={<UpdateIcon />}
            onClick={handleUpdate}
            disabled={(submitting || loading) || (existingId == null && !editing)}
          >
            {existingId != null && editing ? 'Save' : 'Update'}
          </Button>
          {existingId == null && (
            <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={submitting || loading}>
              Submit
            </Button>
          )}
        </CardActions>
      </Card>
    </form>
  );
}
