import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const allNavItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  //{key: 'admin', title: 'Admin', href: '/admin', icon: 'shield' },
  { key: 'user-admin-onboarding', 
    title: 'Onboarding Process',
    icon: 'users',
    items: [
      { key: 'useronboard', title: 'User', href:  paths.dashboard.useronboard, icon: 'user'},
      { key: 'securityonboard', title: 'Security', href:  paths.dashboard.securityonboarding, icon: 'shield'},
      { key: 'driveronboard', title: 'Driver ', href:  paths.dashboard.driveronboarding, icon: 'truck'},   
      { key: 'vehicleonboard', title: 'Vehicle', href:  paths.dashboard.vehicleonboarding, icon: 'truck'},   
    { key: 'Taxonboard', title: 'Operational Taxs ', href:  paths.dashboard.taxonboarding, icon: 'truck'},
    { key: 'mill', title: 'Mill ', href:  paths.dashboard.mill, icon: 'truck'},
    { key: 'Production_loan', title: 'Production Loan ', href:  paths.dashboard.Production_loan, icon: 'truck'},
    { key: 'Transport_cost', title: 'Transport Cost ', href:  paths.dashboard.Transport_cost, icon: 'truck'}
 
  ], 
    
   },
  { key: 'miner-registration', title: 'Miner Registration', href: paths.dashboard.customers, icon: 'id-card' },
  {
    key: 'site-management',
    title: 'Shaft Management',
    icon: 'buildings',
    items: [
      { key: 'site-list', title: 'Shaft Assignment', href:  paths.dashboard.shaftreg, icon: 'id-card'},
      { key: 'Borrowing', title: 'Resources Borrowing', href:  paths.dashboard.borrowing, icon: 'id-card'},
      { key: 'penality', title: 'Issue Penality', href:  paths.dashboard.penality, icon: 'id-card'},
      
    ],
  },
  {
    key: 'ore-management',
    title: 'Ore Management',
    icon: 'mountain',
    items: [
      { key: 'ore-list', title: 'Ore Capturing', href: paths.dashboard.oremanagement, icon: 'id-card' },
      { key: 'ore-tax', title: 'Tax Ore Dediction ', href: paths.dashboard.oreTax, icon: 'id-card' },
      { key: 'ore-mill', title: 'Ore To Mill Assignment ', href: paths.dashboard.millasignment, icon: 'id-card' },
      { key: 'ore-transport', title: 'Ore to Gold Selling', href: paths.dashboard.Refined_Ore_to_Gold, icon: 'id-card' },
      { key: 'Sample Ore Approval', title: 'Sample Ore Approval ', href: paths.dashboard.Sample_Ore_Approval, icon: 'id-card' },
     
   
   
    ],
  },
  {
    key: 'Site-management',
    title: 'Site Management',
    icon: 'tools',
    items: [

      { key: 'Incident Management', title: 'Incident Management', href: paths.dashboard.incidentmanagement, icon: 'id-card' },
      { key: 'issuepenalty', title: 'Issue Penality ', href:  paths.dashboard.penality, icon: 'id-card'},
      { key: 'site-add', title: ' Create Mining Section', href:  paths.dashboard.sectioncreation, icon: 'id-card'},
      { key: 'Sectionmapping', title: 'Section Mapping ', href:  paths.dashboard.sectionmapping, icon: 'id-card'},
      { key: 'incidentresolve', title: 'Incident Resolution ', href: paths.dashboard.resolveissue, icon: 'id-card' },
      
    ],
  },
  {
    key: 'transport-management',
    title: 'Transport Management',
    icon: 'truck',
    items: [
     { key: 'transport', title: 'Approved Vehicles', href: paths.dashboard.approvedvehic, icon: 'mountain' },
       { key: 'transport-add', title: 'Assign Ore To Transport', href: paths.dashboard.oreTransport, icon: 'mountain' },
    ],
  },
  {
    key: 'security',
    title: 'Security',
    icon: 'lock',
    items: [

      { key: 'Check Point Ore Dispatch ', title: 'Check Point Ore Dispatch ', href: paths.dashboard.Ore_Dispatch, icon: 'mountain' },
      { key: 'Check Point Ore Recieval ', title: 'Check Point Ore Recieval ', href: paths.dashboard.Ore_Recieval, icon: 'mountain' },
      { key: 'Patrol Log', title: 'Patrol Log ', href: paths.dashboard.Patrol_Log, icon: 'mountain' },
      { key: 'Incident Report', title: 'Incident Report ', href: paths.dashboard.Incident_Report, icon: 'mountain' },
    ],
  },
  {
    key: 'permission',
    title: 'Record Approval Management',
    icon: 'key',
    items: [
      { key: 'permission-list', title: 'Miner Registration Status', href: paths.dashboard.Syndicate, icon: 'id-card' },
      { key: 'section-creation', title: 'Section Create Status', href: paths.dashboard.sectioncreationstatus, icon: 'id-card' },
      { key: 'shaft-assignment-status', title: 'Shaft Assignment Status', href: paths.dashboard.shaftassignmentstatus, icon: 'id-card' },
      { key: 'Useronboard-status', title: 'User Status', href: paths.dashboard.useronboardstatus, icon: 'users' },
      { key: 'driveronboard-status', title: 'Driver Status', href: paths.dashboard.driveronboardingstatus, icon: 'user' },
      { key: 'securityonboard-status', title: 'Security Status', href: paths.dashboard.securityonboardingstatus, icon: 'shield' },
      { key: 'vehicleonboard-status', title: 'Vehicle Status', href: paths.dashboard.vehicleonboardingstatus, icon: 'truck' },
      { key: 'taxonboard-status', title: 'Operational Tax Status', href: paths.dashboard.taxonboardingstatus, icon: 'truck' },
      {key:'mill-status', title: 'Mill Status', href: paths.dashboard.millstatus, icon: 'truck' },
      {key:'Production_LoanStatus', title: 'Production Loan Status', href: paths.dashboard.Production_LoanStatus, icon: 'truck' },
      {key:'ShaftLoanStatus', title: 'Shaft Loan Status', href: paths.dashboard.ShaftLoanStatus, icon: 'truck' },
      {key:'Transport_costStatus', title: 'Transport Cost Status', href: paths.dashboard.Transport_costStatus, icon: 'truck' },

   
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
