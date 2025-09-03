 

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

export type LoanDetails = {
  loanName?: string;
  paymentMethod?: string;
  amountOrGrams?: number;
  purpose?: string;
  paymentStatus?: string;
  amountPaid?: number;
  balance?: number;
};

export interface PayoutDialogProps {
  open: boolean;
  onClose: () => void;
  assignment?: PayoutAssignment;
  loanDetails?: LoanDetails;
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

export function PayoutDialog({ open, onClose, assignment, loanDetails, onSubmit }: PayoutDialogProps) {
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
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Payout</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'error.main', color: 'common.white', border: 1, borderColor: 'error.dark', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Details
                </Typography>

                <Typography variant="body2" sx={{ color: "common.white", mb: 2 }}>
                  Details of the Current Loan
                </Typography>
                
                <Box sx={{ display: "grid", rowGap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Loan Name:</Typography>
                    <Typography variant="body2">{loanDetails?.loanName ?? '-'}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Payment Method:</Typography>
                    <Typography variant="body2">{loanDetails?.paymentMethod ?? '-'}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Amount/Grams:</Typography>
                    <Typography variant="body2">{loanDetails?.amountOrGrams ?? 0}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Purpose:</Typography>
                    <Typography variant="body2">{loanDetails?.purpose ?? '-'}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Payment Status:</Typography>
                    <Typography variant="body2">{loanDetails?.paymentStatus ?? '-'}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Amount Paid:</Typography>
                    <Typography variant="body2">{loanDetails?.amountPaid ?? 0}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Balance:</Typography>
                    <Typography variant="body2">{loanDetails?.balance ?? 0}</Typography>
                  </Box>
                </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'error.main', color: 'common.white', border: 1, borderColor: 'error.dark', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                Transport Cost
                </Typography>

                <Typography variant="body2" sx={{ color: "common.white", mb: 2 }}>
                  Details of the Current Loan
                </Typography>
                
                <Box sx={{ display: "grid", rowGap: 1 }}>
          
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Payment Method:</Typography>
                    <Typography variant="body2">{loanDetails?.paymentMethod ?? '-'}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Amount/Grams:</Typography>
                    <Typography variant="body2">{loanDetails?.amountOrGrams ?? 0}</Typography>
                  </Box>
        
                  
                </Box>
            </Box>
          </Grid>
          {/* Assignment Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'success.light', border: 1, borderColor: 'success.main', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Assignment Information
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  Details of the current assignment
                </Typography>
                <Box sx={{ display: "grid", rowGap: 1}}>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Shaft Number</Typography>
                    <Typography variant="body2">{assignment?.shaftNumber ?? "-"}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ore Weight</Typography>
                    <Typography variant="body2">{assignment?.oreWeightKg ?? 0} kg</Typography>
                  </Box>
                 
                </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ bgcolor: 'success.dark', color: 'common.white', border: 1, borderColor: 'success.dark', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Payout Summary
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}>
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>Net Payout:</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>${netPayout.toFixed(2)}</Typography>
                  </Box>
                  
                </Box>
            </Box>
          </Grid>

        

          {/* Payout Details */}
          
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payout Details
                </Typography>
                <Typography variant="body2" sx={{ color: "common.white", mb: 2 }}>
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
                  fullWidth
                  margin="dense"
                  label="Buyer"
                  type="Text"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                />
              </CardContent>
            </Card>
        

          {/* Payout Summary */}
         
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
