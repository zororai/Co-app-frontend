'use client';

import { lazy } from 'react';

// Lazy load table components
export const LazyCustomersTable = lazy(() => import('@/components/dashboard/useronboard/miner-status-table').then(module => ({ default: module.CustomersTable })));
export const LazyCompanyTable = lazy(() => import('@/components/dashboard/customer/company-table').then(module => ({ default: module.CompanyTable })));
export const LazyCustomersMainTable = lazy(() => import('@/components/dashboard/customer/customers-table').then(module => ({ default: module.CustomersTable })));
export const LazyIncidentManagementTable = lazy(() => import('@/components/dashboard/incidentmanagement/incidentmanagement-table').then(module => ({ default: module.CustomersTable })));
export const LazyProductionLoanTable = lazy(() => import('@/components/dashboard/Production_Loan/productionloan-table').then(module => ({ default: module.CustomersTable })));
export const LazyOreDispatchTable = lazy(() => import('@/components/dashboard/Ore_Dispatch/ore-table').then(module => ({ default: module.CustomersTable })));

// Lazy load dialog components
export const LazyUserDetailsDialog = lazy(() => import('@/components/dashboard/useronboard/user-details-dialog').then(module => ({ default: module.UserDetailsDialog })));
export const LazyEditUserDialog = lazy(() => import('@/components/dashboard/useronboard/edit-user-dialog').then(module => ({ default: module.EditUserDialog })));
export const LazyAddUserDialog = lazy(() => import('@/components/dashboard/useronboard/add-user-dialog').then(module => ({ default: module.AddUserDialog })));
export const LazyRegMinerDialog = lazy(() => import('@/components/dashboard/customer/reg_miner').then(module => ({ default: module.RegMinerDialog })));
export const LazyAddIncidentDialog = lazy(() => import('@/components/dashboard/incidentmanagement/add-incident-dialog').then(module => ({ default: module.AddOreDialog })));
export const LazyAddProductionLoanDialog = lazy(() => import('@/components/dashboard/Production_Loan/add-productionloan-dialog').then(module => ({ default: module.AddProductionLoanDialog })));
export const LazyAddOreDialog = lazy(() => import('@/components/dashboard/oreTransport/add-ore-dialog').then(module => ({ default: module.AddOreDialog })));

// Lazy load chart/visualization components
export const LazyIntegrationCard = lazy(() => import('@/components/dashboard/integrations/integrations-card').then(module => ({ default: module.IntegrationCard })));

// Lazy load filter components
export const LazyCompaniesFilters = lazy(() => import('@/components/dashboard/integrations/integrations-filters').then(module => ({ default: module.CompaniesFilters })));
