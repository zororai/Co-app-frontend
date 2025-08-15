import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  //{key: 'admin', title: 'Admin', href: '/admin', icon: 'shield' },
  { key: 'user-admin-onboarding', 
    title: 'Onboarding Process',
    icon: 'users',
    items: [
      { key: 'useronboard', title: 'User Onboarding', href:  paths.dashboard.useronboard, icon: 'user'},
      { key: 'securityonboard', title: 'Security Onboarding', href:  paths.dashboard.securityonboarding, icon: 'shield'},
      { key: 'driveronboard', title: 'Driver Onboarding', href:  paths.dashboard.driveronboarding, icon: 'truck'},   
      { key: 'vehicleonboard', title: 'Vehicle Onboarding', href:  paths.dashboard.vehicleonboarding, icon: 'truck'},   
    { key: 'Taxonboard', title: 'Tax Onboarding', href:  paths.dashboard.taxonboarding, icon: 'truck'}
    ], 
    
   },
  { key: 'miner-registration', title: 'Miner Registration', href: paths.dashboard.customers, icon: 'id-card' },
  {
    key: 'site-management',
    title: 'Shaft Management',
    icon: 'buildings',
    items: [
      { key: 'site-list', title: 'Shaft Assignment', href:  paths.dashboard.shaftreg, icon: 'id-card'},
      { key: 'site-add', title: 'Section Creation', href:  paths.dashboard.sectioncreation, icon: 'id-card'},
    ],
  },
  {
    key: 'ore-management',
    title: 'Ore Management',
    icon: 'mountain',
    items: [
      { key: 'ore-list', title: 'Ore tracking', href: paths.dashboard.oremanagement, icon: 'id-card' },
      { key: 'ore-add', title: 'Add Ore', href: '/ore-management/add' },
    ],
  },
  {
    key: 'shaft-management',
    title: 'Shaft Management',
    icon: 'tools',
    items: [
      { key: 'shaft-list', title: 'Shaft List', href: '/shaft-management/list' },
      { key: 'shaft-add', title: 'Add Shaft', href: '/shaft-management/add' },
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
      { key: 'security-users', title: 'Users', href: '/security/users' },
      { key: 'security-roles', title: 'Roles', href: '/security/roles' },
    ],
  },
  {
    key: 'permission',
    title: 'Permission Management',
    icon: 'key',
    items: [
      { key: 'permission-list', title: 'Miner Registration Status', href: paths.dashboard.Syndicate, icon: 'id-card' },
      { key: 'section-creation', title: 'Section Create Status', href: paths.dashboard.sectioncreationstatus, icon: 'id-card' },
      { key: 'shaft-assignment-status', title: 'Shaft Assignment Status', href: paths.dashboard.shaftassignmentstatus, icon: 'id-card' },
      { key: 'Useronboard-status', title: 'User Status', href: paths.dashboard.useronboardstatus, icon: 'users' },
      { key: 'driveronboard-status', title: 'Driver Status', href: paths.dashboard.driveronboardingstatus, icon: 'user' },
      { key: 'securityonboard-status', title: 'Security Status', href: paths.dashboard.securityonboardingstatus, icon: 'shield' },
      { key: 'vehicleonboard-status', title: 'Vehicle Status', href: paths.dashboard.vehicleonboardingstatus, icon: 'truck' },
    ],
  },
] satisfies NavItemConfig[];
