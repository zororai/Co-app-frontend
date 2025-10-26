# Table Pagination Update Tracking

## Overview
This document tracks the progress of updating all table components in the `/src/components` folder to support adjustable pagination from 5 to 100 items per page.

## Target Changes
- Update `rowsPerPageOptions` from `[5, 10, 25]` to `[5, 10, 25, 50, 100]`
- Ensure all tables support the new pagination options

## Progress Tracking

### Batch 1 (5 components) - ✅ COMPLETED
- [x] `dashboard/Ore_Dispatch/ore-table.tsx`
- [x] `dashboard/Ore_Recieval/orerec-table.tsx`
- [x] `dashboard/Production_Loan/productionloan-table.tsx`
- [x] `dashboard/Production_LoanStatus/productionloanstatus-table.tsx`
- [x] `dashboard/Refined_Ore_to_Gold/orepayout-table.tsx`

### Batch 2 (5 components) - ❌ NOT STARTED
- [ ] `dashboard/Sample_Ore_Approval/sampleapprove_to_ore-table.tsx`
- [ ] `dashboard/ShaftLoanStatus/shaftloan-table.tsx`
- [ ] `dashboard/Transport_cost/transportcost-table.tsx`
- [ ] `dashboard/Transport_costStatus/transportcost-table.tsx`
- [ ] `dashboard/approvedvehicles/vehicle-operation-table.tsx`

### Batch 3 (5 components) - ❌ NOT STARTED
- [ ] `dashboard/borrowing/shaftloan-table.tsx`
- [ ] `dashboard/companyhealth/companyreg-status-table.tsx`
- [ ] `dashboard/companyshaft/company-table.tsx`
- [ ] `dashboard/customer/company-table.tsx`
- [ ] `dashboard/customer/customers-table.tsx`

### Batch 4 (5 components) - ❌ NOT STARTED
- [ ] `dashboard/customer/customersCompany-table.tsx`
- [ ] `dashboard/driveronboarding/driver-onboading-table.tsx`
- [ ] `dashboard/driveronboardingstatus/driver-onboadingstatu-table.tsx`
- [ ] `dashboard/incidentmanagement/incidentmanagement-table.tsx`
- [ ] `dashboard/mill/mill-onboading-table.tsx`

### Batch 5 (5 components) - ❌ NOT STARTED
- [ ] `dashboard/millasignment/mill_to_ore-table.tsx`
- [ ] `dashboard/millstatus/millstatus-onboading-table.tsx`
- [ ] `dashboard/oreTransport/oreTransport-table.tsx`
- [ ] `dashboard/oremanagement/oremanage-table.tsx`
- [ ] `dashboard/oretax/oretax-table.tsx`

### Batch 6 (5 components) - ❌ NOT STARTED
- [ ] `dashboard/penality/penality-table.tsx`
- [ ] `dashboard/resolveissue/resolve-table.tsx`
- [ ] `dashboard/sectioncreation/section-table.tsx`
- [ ] `dashboard/sectioncreationstatus/section-status-table.tsx`
- [ ] `dashboard/sectionmapping/selectsection-table.tsx`

### Batch 7 (8 components) - ❌ NOT STARTED
- [ ] `dashboard/securityonboarding/security-status-table.tsx`
- [ ] `dashboard/securityonboardingstatus/securityonboardtatus-table.tsx`
- [ ] `dashboard/shaftassing/shaftassigncompany-table.tsx`
- [ ] `dashboard/shaftassing/Shaftassigncustomers-table.tsx`
- [ ] `dashboard/shaftassignmentstatus/shaftassignment-status-table.tsx`
- [ ] `dashboard/shaftcreation/Shaftcreation-table.tsx`
- [ ] `dashboard/shaftreg/shaftregcompany-table.tsx`
- [ ] `dashboard/shaftreg/shaftregcustomers-table.tsx`

### Additional Tables Found
- [ ] `dashboard/syndicate/miner-status-table.tsx`
- [ ] `dashboard/taxonboarding/tax-table.tsx`
- [ ] `dashboard/taxonboardingstatus/taxstatus-table.tsx`
- [ ] `dashboard/useronboard/miner-status-table.tsx`
- [ ] `dashboard/useronboardstatus/user-status-table.tsx`
- [ ] `dashboard/vehicleonboarding/vehicle-onboarding-table.tsx`
- [ ] `dashboard/vehicleonboardingstatus/vehicle-onboarding-table.tsx`

## Instructions
1. **Before each batch**: Push current changes to git
2. **Update each file**: Change `rowsPerPageOptions={[5, 10, 25]}` to `rowsPerPageOptions={[5, 10, 25, 50, 100]}`
3. **After each batch**: Test the changes and push to git
4. **Mark completed**: Update this file with ✅ for completed batches

## Notes
- Total table components found: 41
- All tables use Material-UI TablePagination component
- Standard change: Update rowsPerPageOptions array to include 50 and 100 options
- Each batch should be committed separately for easier tracking and rollback if needed

---
Last Updated: $(date)
Status: In Progress
