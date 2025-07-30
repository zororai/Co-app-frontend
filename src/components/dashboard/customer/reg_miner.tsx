
import * as React from 'react';
import { Box, Button, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';

export interface RegMinerDialogProps {
  open: boolean;
  onClose: () => void;
}

function RegMinerForm(): React.JSX.Element {
  const [teamMembers, setTeamMembers] = React.useState([
    { name: '', surname: '', address: '', idNumber: '' }
  ]);
  const [form, setForm] = React.useState({
    name: '',
    surname: '',
    address: '',
    cell: '',
    nationId: '',
    position: 'Representatives',
    cooperative: '',
    idPicture: null,
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<{ name?: string; value: unknown }>
      | React.ChangeEvent<{ value: unknown; name?: string }>
  ) => {
    if ('target' in e && e.target) {
      const { name, value, files, type } = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name as string]: type === 'file' && files ? files[0] : value,
      }));
    } else if ('name' in e && 'value' in e) {
      // For Select component
      const { name, value } = e as { name?: string; value: unknown };
      setForm((prev) => ({
        ...prev,
        [name as string]: value,
      }));
    }
  };

  const handleTeamChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamMembers((prev) => {
      const updated = [...prev];
      (updated[idx] as any)[name] = value;
      return updated;
    });
  };

  const addTeamMember = () => {
    setTeamMembers((prev) => [...prev, { name: '', surname: '', address: '', idNumber: '' }]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ ...form, teamMembers });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 900 }}>
      {/* Form Fields Row Layout */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box flex="1 1 48%">
          <InputLabel>Name</InputLabel>
          <TextField
            name="name"
            placeholder="Please enter name"
            fullWidth
            value={form.name}
            onChange={handleChange}
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Surname</InputLabel>
          <TextField
            name="surname"
            placeholder="Add your surname"
            fullWidth
            value={form.surname}
            onChange={handleChange}
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Address</InputLabel>
          <TextField
            name="address"
            placeholder="Add your address"
            fullWidth
            value={form.address}
            onChange={handleChange}
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Cell Number</InputLabel>
          <TextField
            name="cell"
            placeholder="Add your cell number"
            fullWidth
            value={form.cell}
            onChange={handleChange}
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>National ID Number</InputLabel>
          <TextField
            name="nationId"
            placeholder="Add your national ID"
            fullWidth
            value={form.nationId}
            onChange={handleChange}
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Position</InputLabel>
          <Select
            name="position"
            fullWidth
            value={form.position}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                [e.target.name as string]: e.target.value,
              }));
            }}
          >
            <MenuItem value="Representatives">Representatives</MenuItem>
            <MenuItem value="Owner">Owner</MenuItem>
            <MenuItem value="Member">Member</MenuItem>
          </Select>
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>Name Of Cooperative/Syndicate</InputLabel>
          <TextField
            name="cooperative"
            placeholder="Add name of syndicate"
            fullWidth
            value={form.cooperative}
            onChange={handleChange}
          />
        </Box>
        <Box flex="1 1 48%">
          <InputLabel>ID Picture</InputLabel>
          <Button variant="outlined" component="label" fullWidth>
            Choose Image
            <input type="file" name="idPicture" hidden onChange={handleChange} />
          </Button>
        </Box>
      </Box>

      {/* Team Members Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Add Team Members</Typography>
        <IconButton color="primary" onClick={addTeamMember} sx={{ mb: 2 }}>
          <AddCircleIcon />
        </IconButton>
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, maxWidth: 700 }}>
          {teamMembers.map((member, idx) => (
            <Box key={idx} display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box flex="1 1 48%">
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  value={member.name}
                  onChange={(e) => handleTeamChange(idx, e)}
                />
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  name="surname"
                  label="Surname"
                  fullWidth
                  value={member.surname}
                  onChange={(e) => handleTeamChange(idx, e)}
                />
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  value={member.address}
                  onChange={(e) => handleTeamChange(idx, e)}
                />
              </Box>
              <Box flex="1 1 48%">
                <TextField
                  name="idNumber"
                  label="ID Number"
                  fullWidth
                  value={member.idNumber}
                  onChange={(e) => handleTeamChange(idx, e)}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        sx={{
          mt: 4,
          bgcolor: '#5f4bfa',
          color: '#fff',
          fontWeight: 600,
          fontSize: 18,
          width: 200,
        }}
      >
        Submit
      </Button>
    </Box>
  );
}

export function RegMinerDialog({ open, onClose }: RegMinerDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="span">Register Miner</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <RegMinerForm />
      </DialogContent>
    </Dialog>
  );
}


