'use client';

import { lazy } from 'react';

// =============================================================================
// MAIN DASHBOARD PAGES
// =============================================================================

// Core dashboard pages
export const LazyUserOnboardPage = lazy(() => import('@/app/dashboard/useronboard/page'));
export const LazyCustomersPage = lazy(() => import('@/app/dashboard/customers/page'));
export const LazyIncidentManagementPage = lazy(() => import('@/app/dashboard/incidentmanagement/page'));
export const LazyIntegrationsPage = lazy(() => import('@/app/dashboard/integrations/page'));
export const LazyMapPage = lazy(() => import('@/app/dashboard/map/page'));
export const LazySettingsPage = lazy(() => import('@/app/dashboard/settings/page'));
export const LazyAccountPage = lazy(() => import('@/app/dashboard/account/page'));

// =============================================================================
// ONBOARDING PAGES
// =============================================================================

export const LazyDriverOnboardingPage = lazy(() => import('@/app/dashboard/driveronboarding/page'));
export const LazySecurityOnboardingPage = lazy(() => import('@/app/dashboard/securityonboarding/page'));
export const LazyVehicleOnboardingPage = lazy(() => import('@/app/dashboard/vehicleonboarding/page'));
export const LazyTaxOnboardingPage = lazy(() => import('@/app/dashboard/taxonboarding/page'));

// =============================================================================
// STATUS PAGES
// =============================================================================

export const LazyDriverOnboardingStatusPage = lazy(() => import('@/app/dashboard/driveronboardingstatus/page'));
export const LazySecurityOnboardingStatusPage = lazy(() => import('@/app/dashboard/securityonboardingstatus/page'));
export const LazyVehicleOnboardingStatusPage = lazy(() => import('@/app/dashboard/vehicleonboardingstatus/page'));
export const LazyUserOnboardStatusPage = lazy(() => import('@/app/dashboard/useronboardstatus/page'));
export const LazyTaxOnboardingStatusPage = lazy(() => import('@/app/dashboard/taxonboardingstatus/page'));

// =============================================================================
// SHAFT MANAGEMENT PAGES
// =============================================================================

export const LazyShaftCreationPage = lazy(() => import('@/app/dashboard/shaftcreation/page'));
export const LazyShaftAssignPage = lazy(() => import('@/app/dashboard/shaftassign/page'));
export const LazyShaftAssignmentStatusPage = lazy(() => import('@/app/dashboard/shaftassignmentstatus/page'));
export const LazyShaftLoanStatusPage = lazy(() => import('@/app/dashboard/ShaftLoanStatus/page'));
export const LazyBorrowingPage = lazy(() => import('@/app/dashboard/borrowing/page'));
export const LazyPenalityPage = lazy(() => import('@/app/dashboard/penality/page'));

// =============================================================================
// PRODUCTION AND TRANSPORT PAGES
// =============================================================================

export const LazyProductionLoanPage = lazy(() => import('@/app/dashboard/Production_Loan/page'));
export const LazyProductionLoanStatusPage = lazy(() => import('@/app/dashboard/Production_LoanStatus/page'));
export const LazyTransportCostPage = lazy(() => import('@/app/dashboard/Transport_cost/page'));
export const LazyTransportCostStatusPage = lazy(() => import('@/app/dashboard/Transport_costStatus/page'));

// =============================================================================
// ORE MANAGEMENT PAGES
// =============================================================================

export const LazyOreDispatchPage = lazy(() => import('@/app/dashboard/Ore_Dispatch/page'));
export const LazyOreRecievalPage = lazy(() => import('@/app/dashboard/Ore_Recieval/page'));
export const LazyOreTransportPage = lazy(() => import('@/app/dashboard/oreTransport/page'));
export const LazyOreManagementPage = lazy(() => import('@/app/dashboard/oremanagement/page'));
export const LazyRefinedOreToGoldPage = lazy(() => import('@/app/dashboard/Refined_Ore_to_Gold/page'));
export const LazySampleOreApprovalPage = lazy(() => import('@/app/dashboard/Sample_Ore_Approval/page'));
export const LazyOreTaxPage = lazy(() => import('@/app/dashboard/oretax/page'));

// =============================================================================
// MILL PAGES
// =============================================================================

export const LazyMillPage = lazy(() => import('@/app/dashboard/mill/page'));
export const LazyMillAssignmentPage = lazy(() => import('@/app/dashboard/millasignment/page'));
export const LazyMillStatusPage = lazy(() => import('@/app/dashboard/millstatus/page'));

// =============================================================================
// SECTION PAGES
// =============================================================================

export const LazySectionCreationPage = lazy(() => import('@/app/dashboard/sectioncreation/page'));
export const LazySectionCreationStatusPage = lazy(() => import('@/app/dashboard/sectioncreationstatus/page'));
export const LazySectionMappingPage = lazy(() => import('@/app/dashboard/sectionmapping/page'));

// =============================================================================
// COMPANY PAGES
// =============================================================================

export const LazyCompanyPage = lazy(() => import('@/app/dashboard/company/page'));
export const LazyCompanyHealthPage = lazy(() => import('@/app/dashboard/companyhealth/page'));
export const LazyCompanyShaftPage = lazy(() => import('@/app/dashboard/companyshaft/page'));

// =============================================================================
// OTHER PAGES
// =============================================================================

export const LazyApprovedVehiclesPage = lazy(() => import('@/app/dashboard/approvedvehicles/page'));
export const LazyResolveIssuePage = lazy(() => import('@/app/dashboard/resolveissue/page'));
export const LazySyndicatePage = lazy(() => import('@/app/dashboard/syndicate/page'));
