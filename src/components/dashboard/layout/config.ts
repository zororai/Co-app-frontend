import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const allNavItems = [
  //{key: 'admin', title: 'Admin', href: '/admin', icon: 'shield' },
  { key: 'user-admin-onboarding', 
    title: 'Onboarding Process',
    icon: 'users',
    items: [
      { key: 'useronboard', title: 'User', href:  paths.dashboard.useronboard, icon: 'user'},
      { key: 'securityonboard', title: 'Security', href:  paths.dashboard.securityonboarding, icon: 'shield'},
      { key: 'driveronboard', title: 'Driver ', href:  paths.dashboard.driveronboarding, icon: 'truck'},   
      { key: 'vehicleonboard', title: 'Vehicle', href:  paths.dashboard.vehicleonboarding, icon: 'truck'},   
    { key: 'Taxonboard', title: 'Operational Charges ', href:  paths.dashboard.taxonboarding, icon: 'hand-coins'},
    { key: 'mill', title: 'Mill ', href:  paths.dashboard.mill, icon: 'factory'},
    { key: 'Production_loan', title: 'Production Loan ', href:  paths.dashboard.Production_loan, icon: 'hand-coins'},
    { key: 'Transport_cost', title: 'Transport Cost ', href:  paths.dashboard.Transport_cost, icon: 'road-horizon'}
 
  ], 
    
   },

 
  {
    key: 'Miner-registration',
    title: 'Miner Registration',
    icon: 'id-card',
    items: [
  { key: 'miner-registration', title: 'Miner Registration', href: paths.dashboard.customers, icon: 'id-card' },
    { key: 'syndicate-teammembership', title: 'Syndicate Membership', href: paths.dashboard.syndicatemembership, icon: 'handshake' },
  { key: 'company-teammembership', title: 'Company Membership', href: paths.dashboard.companymembership, icon: 'briefcase' },

    ],
  },








  {
    key: 'site-management',
    title: 'Shaft Management',
    icon: 'buildings',
    items: [
      { key: 'site-list', title: 'Shaft Assignment', href:  paths.dashboard.shaftreg, icon: 'user-switch'},
     { key: 'shaftcreation', title: 'Shaft Creation', href:  paths.dashboard.shaftcreation, icon: 'plus-circle'},
     { key: 'Shafttransfare', title: 'Shaft Transfare', href:  paths.dashboard.shafttransfare, icon: 'arrows-left-right'},
     
    ],
  },

  {
    key: 'financial-management',
    title: 'Financial Management',
    icon: 'wallet',
    items: [
      { key: 'Borrowing', title: 'Resources Borrowing', href:  paths.dashboard.borrowing, icon: 'package'},
      { key: 'ore-tax', title: 'Charges Ore Dediction ', href: paths.dashboard.oreTax, icon: 'percent' },
      { key: 'ore-transport', title: 'Gold Selling', href: paths.dashboard.Refined_Ore_to_Gold, icon: 'currency-dollar' },
      { key: 'peniltypay', title: 'Penality Payment', href: paths.dashboard.Penality_Payment, icon: 'seal-warning' },
       { key: 'Registrationpay', title: 'Registration Payment', href: paths.dashboard.Registration_Payment, icon: 'id-card' },
      
    ],
  },

  {
    key: 'she-management',
    title: 'SHE Management',
    icon: 'shield',
    items: [
      { key: 'Incident Management', title: 'Incident reports', href: paths.dashboard.incidentmanagement, icon: 'seal-warning' },
      { key: 'incidentresolve', title: 'Incident Resolution', href: paths.dashboard.resolveissue, icon: 'handshake' },
      { key: 'guilty', title: 'Issue Admission of Guilty', href: paths.dashboard.guilty, icon: 'clipboard-text' },
      { key: 'listissuedpenality', title: 'List of Issued Penality', href: paths.dashboard.listissuedpenality, icon: 'seal-warning' },
      { key: 'training', title: 'Training', href: paths.dashboard.training, icon: 'graduation-cap' },
      { key: 'shaftinspection', title: 'Shaft Inspection', href: paths.dashboard.shaftinspection, icon: 'mountains' },
      { key: 'shaftinspectionResolution', title: 'Shaft Inspection Resolution', href: paths.dashboard.shaftinspectionresolution, icon: 'shield-check' },
    ],
  },

  {
    key: 'Report-management',
    title: 'Report Management',
    icon: 'chart-bar',
    items: [
      { key: 'she-summary-reports', title: 'SHE Summary Report', href: paths.dashboard.shesummaryreports, icon: 'chart-pie' },
      { key: 'shaft-history-reports', title: 'Shaft History Report', href: paths.dashboard.shafthistoryreports, icon: 'chart-line' },
      { key: 'Ore-reports', title: 'Ore Report', href: paths.dashboard.Ore_reports, icon: 'chart-bar' },
      { key: 'Section-reports', title: 'Section Report', href: paths.dashboard.Section_reports, icon: 'file-text' },
      { key: 'Mine-Level-reports', title: 'Mine Level Report', href: paths.dashboard.Mine_Levels, icon: 'mountains' },
      { key: 'sectionview', title: 'Section View', href: paths.dashboard.sectionview, icon: 'map-trifold' },
    ],
  },
  {
    key: 'ore-management',
    title: 'Ore Management',
    icon: 'mountain',
    items: [
      { key: 'ore-list', title: 'Ore Capturing', href: paths.dashboard.oremanagement, icon: 'clipboard-text' },
      { key: 'ore-mill', title: 'Ore To Mill Assignment', href: paths.dashboard.millasignment, icon: 'arrows-left-right' },
      { key: 'Sample Ore Approval', title: 'Sample Ore Approval', href: paths.dashboard.Sample_Ore_Approval, icon: 'seal-check' },
    ],
  },
  {
    key: 'Site-management',
    title: 'Site Management',
    icon: 'map-trifold',
    items: [
      { key: 'site-add', title: 'Create Mining Section', href: paths.dashboard.sectioncreation, icon: 'plus-circle' },
      { key: 'Sectionmapping', title: 'Section Mapping', href: paths.dashboard.sectionmapping, icon: 'map-trifold' },
      { key: 'sectionview', title: 'Section View', href: paths.dashboard.sectionview, icon: 'eye' },
    ],
  },
  {
    key: 'transport-management',
    title: 'Transport Management',
    icon: 'truck',
    items: [
      { key: 'transport', title: 'Vehicles Management', href: paths.dashboard.approvedvehic, icon: 'truck' },
      { key: 'drivermanagement', title: 'Driver Management', href: paths.dashboard.drivermanagement, icon: 'id-card' },
      { key: 'transport-add', title: 'Assign Ore To Transport', href: paths.dashboard.oreTransport, icon: 'arrows-left-right' },
    ],

  },
  {
    key: 'security',
    title: 'Security',
    icon: 'lock',
    items: [

      { key: 'Check Point Ore Dispatch ', title: 'Check Point Ore Dispatch ', href: paths.dashboard.Ore_Dispatch, icon: 'arrow-up-right' },
      { key: 'Check Point Ore Recieval ', title: 'Check Point Ore Recieval ', href: paths.dashboard.Ore_Recieval, icon: 'arrows-left-right' },
     // { key: 'Patrol Log', title: 'Patrol Log ', href: paths.dashboard.Patrol_Log, icon: 'mountain' },
      //{ key: 'Incident Report', title: 'Incident Report ', href: paths.dashboard.Incident_Report, icon: 'mountain' },
    ],
  },
  {
    key: 'permission',
    title: 'Record Approval Management',
    icon: 'key',
    items: [
      { key: 'permission-list', title: 'Miner Registration', href: paths.dashboard.Syndicate, icon: 'id-card' },
      { key: 'section-creation', title: 'Section Create', href: paths.dashboard.sectioncreationstatus, icon: 'plus-circle' },
      { key: 'shaft-assignment-status', title: 'Shaft Assignment', href: paths.dashboard.shaftassignmentstatus, icon: 'mountains' },
      { key: 'Useronboard-status', title: 'User', href: paths.dashboard.useronboardstatus, icon: 'user' },
      { key: 'driveronboard-status', title: 'Driver', href: paths.dashboard.driveronboardingstatus, icon: 'id-card' },
      { key: 'securityonboard-status', title: 'Security', href: paths.dashboard.securityonboardingstatus, icon: 'shield-check' },
      { key: 'vehicleonboard-status', title: 'Vehicle', href: paths.dashboard.vehicleonboardingstatus, icon: 'truck' },
      { key: 'taxonboard-status', title: 'Operational Tax', href: paths.dashboard.taxonboardingstatus, icon: 'currency-dollar' },
      { key: 'mill-status', title: 'Mill', href: paths.dashboard.millstatus, icon: 'factory' },
      { key:'Production_LoanStatus', title: 'Production Loan', href: paths.dashboard.Production_LoanStatus, icon: 'hand-coins' },
      { key:'ShaftLoanStatus', title: 'Shaft Loan Status', href: paths.dashboard.ShaftLoanStatus, icon: 'hand-coins' },
      { key:'Transport_costStatus', title: 'Transport Cost Status', href: paths.dashboard.Transport_costStatus, icon: 'currency-dollar' },
    ],
    
  },
] satisfies NavItemConfig[];

/**
 * Filter navigation items based on user permissions
 * @param permissions - Array of permission strings (e.g., ['user-admin-onboarding', 'useronboard'])
 * @returns Filtered navigation items that the user has access to
 */
export function getNavItemsForUser(permissions: string[]): NavItemConfig[] {
  // Always include dashboard
  const permissionSet = new Set(['dashboard', ...permissions]);
  
  const filtered: NavItemConfig[] = [];
  
  for (const item of allNavItems) {
    // Check if user has permission for this top-level item
    if (!permissionSet.has(item.key)) {
      continue;
    }

    // If item has sub-items, filter them based on permissions
    if (item.items) {
      const filteredSubItems = item.items.filter((subItem) => 
        permissionSet.has(subItem.key)
      );

      // Only include parent if it has accessible sub-items
      if (filteredSubItems.length === 0) {
        continue;
      }

      filtered.push({
        ...item,
        items: filteredSubItems,
      });
    } else {
      filtered.push(item);
    }
  }
  
  return filtered;
}

// Default export for backward compatibility (all items)
export const navItems = allNavItems;

/**
 * Get all available permissions from the navigation configuration
 * @returns Array of all permission keys
 */
export function getAllAvailablePermissions(): string[] {
  const permissions = new Set<string>();
  
  for (const item of allNavItems) {
    permissions.add(item.key);
    
    if (item.items) {
      for (const subItem of item.items) {
        permissions.add(subItem.key);
      }
    }
  }
  
  return Array.from(permissions);
}
