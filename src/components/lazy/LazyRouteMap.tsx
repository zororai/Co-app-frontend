'use client';

import React, { lazy, ComponentType } from 'react';
import * as LazyPages from './LazyPages';

// =============================================================================
// ROUTE TO LAZY COMPONENT MAPPING
// =============================================================================

/**
 * Maps dashboard routes to their corresponding lazy-loaded page components
 * This enables route-based code splitting for optimal performance
 */
export const lazyRouteMap: Record<string, ComponentType> = {
  // =============================================================================
  // MAIN DASHBOARD PAGES
  // =============================================================================
  '/dashboard/useronboard': LazyPages.LazyUserOnboardPage,
  '/dashboard/customers': LazyPages.LazyCustomersPage,
  '/dashboard/incidentmanagement': LazyPages.LazyIncidentManagementPage,
  '/dashboard/integrations': LazyPages.LazyIntegrationsPage,
  '/dashboard/map': LazyPages.LazyMapPage,
  '/dashboard/settings': LazyPages.LazySettingsPage,
  '/dashboard/account': LazyPages.LazyAccountPage,

  // =============================================================================
  // ONBOARDING PAGES
  // =============================================================================
  '/dashboard/driveronboarding': LazyPages.LazyDriverOnboardingPage,
  '/dashboard/securityonboarding': LazyPages.LazySecurityOnboardingPage,
  '/dashboard/vehicleonboarding': LazyPages.LazyVehicleOnboardingPage,
  '/dashboard/taxonboarding': LazyPages.LazyTaxOnboardingPage,

  // =============================================================================
  // STATUS PAGES
  // =============================================================================
  '/dashboard/driveronboardingstatus': LazyPages.LazyDriverOnboardingStatusPage,
  '/dashboard/securityonboardingstatus': LazyPages.LazySecurityOnboardingStatusPage,
  '/dashboard/vehicleonboardingstatus': LazyPages.LazyVehicleOnboardingStatusPage,
  '/dashboard/useronboardstatus': LazyPages.LazyUserOnboardStatusPage,
  '/dashboard/taxonboardingstatus': LazyPages.LazyTaxOnboardingStatusPage,

  // =============================================================================
  // SHAFT MANAGEMENT PAGES
  // =============================================================================
  '/dashboard/shaftcreation': LazyPages.LazyShaftCreationPage,
  '/dashboard/shaftassign': LazyPages.LazyShaftAssignPage,
  '/dashboard/shaftassignmentstatus': LazyPages.LazyShaftAssignmentStatusPage,
  '/dashboard/ShaftLoanStatus': LazyPages.LazyShaftLoanStatusPage,
  '/dashboard/borrowing': LazyPages.LazyBorrowingPage,
  '/dashboard/penality': LazyPages.LazyPenalityPage,

  // =============================================================================
  // PRODUCTION AND TRANSPORT PAGES
  // =============================================================================
  '/dashboard/Production_Loan': LazyPages.LazyProductionLoanPage,
  '/dashboard/Production_LoanStatus': LazyPages.LazyProductionLoanStatusPage,
  '/dashboard/Transport_cost': LazyPages.LazyTransportCostPage,
  '/dashboard/Transport_costStatus': LazyPages.LazyTransportCostStatusPage,

  // =============================================================================
  // ORE MANAGEMENT PAGES
  // =============================================================================
  '/dashboard/Ore_Dispatch': LazyPages.LazyOreDispatchPage,
  '/dashboard/Ore_Recieval': LazyPages.LazyOreRecievalPage,
  '/dashboard/oreTransport': LazyPages.LazyOreTransportPage,
  '/dashboard/oremanagement': LazyPages.LazyOreManagementPage,
  '/dashboard/Refined_Ore_to_Gold': LazyPages.LazyRefinedOreToGoldPage,
  '/dashboard/Sample_Ore_Approval': LazyPages.LazySampleOreApprovalPage,
  '/dashboard/oretax': LazyPages.LazyOreTaxPage,

  // =============================================================================
  // MILL PAGES
  // =============================================================================
  '/dashboard/mill': LazyPages.LazyMillPage,
  '/dashboard/millasignment': LazyPages.LazyMillAssignmentPage,
  '/dashboard/millstatus': LazyPages.LazyMillStatusPage,

  // =============================================================================
  // SECTION PAGES
  // =============================================================================
  '/dashboard/sectioncreation': LazyPages.LazySectionCreationPage,
  '/dashboard/sectioncreationstatus': LazyPages.LazySectionCreationStatusPage,
  '/dashboard/sectionmapping': LazyPages.LazySectionMappingPage,

  // =============================================================================
  // COMPANY PAGES
  // =============================================================================
  '/dashboard/company': LazyPages.LazyCompanyPage,
  '/dashboard/companyhealth': LazyPages.LazyCompanyHealthPage,
  '/dashboard/companyshaft': LazyPages.LazyCompanyShaftPage,

  // =============================================================================
  // OTHER PAGES
  // =============================================================================
  '/dashboard/approvedvehicles': LazyPages.LazyApprovedVehiclesPage,
  '/dashboard/resolveissue': LazyPages.LazyResolveIssuePage,
  '/dashboard/syndicate': LazyPages.LazySyndicatePage,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get lazy component for a given route
 * @param route - The dashboard route path
 * @returns The lazy-loaded component or null if not found
 */
export function getLazyComponent(route: string): ComponentType | null {
  return lazyRouteMap[route] || null;
}

/**
 * Check if a route has lazy loading enabled
 * @param route - The dashboard route path
 * @returns True if the route has lazy loading
 */
export function isLazyRoute(route: string): boolean {
  return route in lazyRouteMap;
}

/**
 * Get all lazy-loaded routes
 * @returns Array of all routes that have lazy loading
 */
export function getAllLazyRoutes(): string[] {
  return Object.keys(lazyRouteMap);
}

/**
 * Get lazy loading statistics
 * @returns Object with lazy loading metrics
 */
export function getLazyLoadingStats() {
  const totalRoutes = Object.keys(lazyRouteMap).length;
  const routesByCategory = {
    main: Object.keys(lazyRouteMap).filter(route => 
      ['/dashboard/useronboard', '/dashboard/customers', '/dashboard/incidentmanagement', 
       '/dashboard/integrations', '/dashboard/map', '/dashboard/settings', '/dashboard/account'].includes(route)
    ).length,
    onboarding: Object.keys(lazyRouteMap).filter(route => 
      route.includes('onboarding') && !route.includes('status')
    ).length,
    status: Object.keys(lazyRouteMap).filter(route => 
      route.includes('status') || route.includes('Status')
    ).length,
    shaft: Object.keys(lazyRouteMap).filter(route => 
      route.includes('shaft') || route.includes('borrowing') || route.includes('penality')
    ).length,
    ore: Object.keys(lazyRouteMap).filter(route => 
      route.includes('ore') || route.includes('Ore') || route.includes('Sample')
    ).length,
    mill: Object.keys(lazyRouteMap).filter(route => 
      route.includes('mill')
    ).length,
    other: Object.keys(lazyRouteMap).filter(route => 
      route.includes('section') || route.includes('company') || route.includes('approved') || 
      route.includes('resolve') || route.includes('syndicate')
    ).length,
  };

  return {
    totalRoutes,
    routesByCategory,
    coveragePercentage: Math.round((totalRoutes / 43) * 100), // Based on 43 total dashboard pages
  };
}

// =============================================================================
// ROUTE COMPONENT WRAPPER
// =============================================================================

/**
 * Higher-order component that wraps lazy routes with Suspense
 * @param route - The route path
 * @param fallback - Optional custom loading component
 * @returns Wrapped component with Suspense boundary
 */
export function withLazyRoute(route: string, fallback?: React.ComponentType) {
  const LazyComponent = getLazyComponent(route);
  
  if (!LazyComponent) {
    console.warn(`No lazy component found for route: ${route}`);
    return null;
  }

  return function LazyRouteWrapper(props: any) {
    const { Suspense } = require('react');
    const { LazyWrapper } = require('@/components/common/LazyWrapper');
    
    return (
      <Suspense fallback={fallback ? React.createElement(fallback) : <LazyWrapper />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export default lazyRouteMap;
