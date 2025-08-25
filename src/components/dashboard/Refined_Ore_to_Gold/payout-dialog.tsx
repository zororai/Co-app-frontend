"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import dayjs from "dayjs";

export type PayoutAssignment = {
  assignmentId?: string | number;
  shaftNumber?: string;
  shaftOwner?: string;
  oreWeightKg?: number;
  mill?: string;
  defaultPricePerGram?: number;
};

export interface PayoutDialogProps {
  open: boolean;
  onClose: () => void;
  assignment?: PayoutAssignment;
  onSubmit?: (payload: {
    receiptNumber: string;
    shaftOwner: string;
    shaftNumber: string;
    goldWeightGrams: number;
    pricePerGram: number;
    loanType: string;
    transportCost: number;
    netPayout: number;
  }) => Promise<void> | void;
}

export function PayoutDialog({ open, onClose, assignment, onSubmit }: PayoutDialogProps) {
  const generatedReceipt = React.useMemo(
    () => `RCP-${dayjs().format("YYYYMMDD-HHmmss")}`,
    []
  );

  const [shaftOwner, setShaftOwner] = React.useState(assignment?.shaftOwner ?? "");
  const [shaftNumber, setShaftNumber] = React.useState(assignment?.shaftNumber ?? "");
  const [goldWeightGrams, setGoldWeightGrams] = React.useState<number>(0);
  const [pricePerGram, setPricePerGram] = React.useState<number>(assignment?.defaultPricePerGram ?? 0);
  const [loanType, setLoanType] = React.useState<string>("");
  const [transportCost, setTransportCost] = React.useState<number>(0);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setShaftOwner(assignment?.shaftOwner ?? "");
      setShaftNumber(assignment?.shaftNumber ?? "");
      setGoldWeightGrams(0);
      setPricePerGram(assignment?.defaultPricePerGram ?? 0);
      setLoanType("");
      setTransportCost(0);
    }
  }, [open, assignment]);

  const grossAmount = (goldWeightGrams || 0) * (pricePerGram || 0);
  const netPayout = grossAmount - (transportCost || 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        receiptNumber: generatedReceipt,
        shaftOwner,
        shaftNumber,
        goldWeightGrams: Number(goldWeightGrams) || 0,
        pricePerGram: Number(pricePerGram) || 0,
        loanType,
        transportCost: Number(transportCost) || 0,
        netPayout,
      };
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Placeholder: integrate API call here
        // await authClient.createPayout( ...payload )
        console.log("Payout submitted:", payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Payout</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {/* Assignment Information */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assignment Information
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Details of the current assignment
                </Typography>
                <Box sx={{ display: "grid", rowGap: 1.25 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Assignment ID</Typography>
                    <Typography variant="body2">{assignment?.assignmentId ?? "-"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Shaft Number</Typography>
                    <Typography variant="body2">{assignment?.shaftNumber ?? "-"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Shaft Owner</Typography>
                    <Typography variant="body2">{assignment?.shaftOwner ?? "-"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ore Weight</Typography>
                    <Typography variant="body2">{assignment?.oreWeightKg ?? 0} kg</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mill</Typography>
                    <Typography variant="body2">{assignment?.mill ?? "-"}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Payout Details */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payout Details
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Enter payout information
                </Typography>

                <TextField
                  fullWidth
                  margin="dense"
                  label="Receipt Number"
                  value={generatedReceipt}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Shaft Owner"
                  value={shaftOwner}
                  onChange={(e) => setShaftOwner(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Shaft Number"
                  value={shaftNumber}
                  onChange={(e) => setShaftNumber(e.target.value)}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Free Gold Weight (grams)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={goldWeightGrams}
                  onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Gold Selling Price (per gram)"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={pricePerGram}
                  onChange={(e) => setPricePerGram(Number(e.target.value))}
                />
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  label="Loan Type"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="short_term">Short Term</MenuItem>
                  <MenuItem value="long_term">Long Term</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Transport Cost"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Payout Summary */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payout Summary
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Calculated payout breakdown
                </Typography>

                <Box sx={{ display: "grid", rowGap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Gold Weight:</Typography>
                    <Typography variant="body2">{goldWeightGrams || 0} g</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Price per gram:</Typography>
                    <Typography variant="body2">${pricePerGram || 0}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Gross Amount:</Typography>
                    <Typography variant="body2">${grossAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Transport Cost:</Typography>
                    <Typography variant="body2">-${(transportCost || 0).toFixed(0)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>Net Payout:</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>${netPayout.toFixed(2)}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
                    * All calculations are in USD
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : "Save Payout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PayoutDialog;
