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
    { key: 'Taxonboard', title: 'Tax Onboarding', href:  paths.dashboard.taxonboarding, icon: 'truck'},
    { key: 'mill', title: 'Mill Onboarding', href:  paths.dashboard.mill, icon: 'truck'}
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
      { key: 'ore-list', title: 'Ore Capturing', href: paths.dashboard.oremanagement, icon: 'id-card' },
      { key: 'ore-tax', title: 'Tax Ore Dediction ', href: paths.dashboard.oreTax, icon: 'id-card' },
      
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

      { key: 'Check Point Ore Dispatch ', title: 'Check Point Ore Dispatch ', href: paths.dashboard.Ore_Dispatch, icon: 'mountain' },
      { key: 'Check Point Ore Recieval ', title: 'Check Point Ore Recieval ', href: paths.dashboard.Ore_Recieval, icon: 'mountain' },
      { key: 'Patrol Log', title: 'Patrol Log ', href: paths.dashboard.Patrol_Log, icon: 'mountain' },
      { key: 'Incident Report', title: 'Incident Report ', href: paths.dashboard.Incident_Report, icon: 'mountain' },
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
      { key: 'taxonboard-status', title: 'Tax Status', href: paths.dashboard.taxonboardingstatus, icon: 'truck' },
      {key:'mill-status', title: 'Mill Status', href: paths.dashboard.millstatus, icon: 'truck' },
    ],
  },
] satisfies NavItemConfig[];
