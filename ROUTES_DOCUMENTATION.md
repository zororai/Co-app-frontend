# 📋 Application Routes Documentation

**Last Updated**: November 14, 2025  
**Application**: Co-app-frontend (Next.js 15.3.3 Dashboard)  
**Framework**: React 19.1.0 with Material-UI 7.2.0

---

## 📑 Table of Contents

1. [Authentication Routes](#-authentication-routes)
2. [Onboarding Process](#-onboarding-process)
3. [Miner Registration](#-miner-registration)
4. [Shaft Management](#-shaft-management)
5. [Financial Management](#-financial-management)
6. [SHE Management](#-she-management)
7. [Report Management](#-report-management)
8. [Ore Management](#-ore-management)
9. [Site Management](#-site-management)
10. [Transport Management](#-transport-management)
11. [Security](#-security)
12. [Record Approval Management](#-record-approval-management)

---

## 🔐 Authentication Routes

### Sign In
- **Route**: `/auth/sign-in`
- **Key**: `signIn`
- **Description**: User authentication page where users log in with their credentials
- **Access**: Public (unauthenticated users)
- **Features**: 
  - Email/password login
  - Session management
  - OAuth integration

### Sign Up
- **Route**: `/auth/sign-up`
- **Key**: `signUp`
- **Description**: User registration page for creating new accounts
- **Access**: Public (unauthenticated users)
- **Features**:
  - Account creation
  - Email verification
  - Initial profile setup

### Reset Password
- **Route**: `/auth/reset-password`
- **Key**: `resetPassword`
- **Description**: Password recovery and reset functionality
- **Access**: Public (unauthenticated users)
- **Features**:
  - Password reset request
  - Email verification
  - New password setup

---

## 🏠 Main Dashboard
- **Route**: `/dashboard`
- **Key**: `overview`
- **Description**: Main dashboard landing page with overview metrics and quick stats
- **Access**: Authenticated users
- **Features**:
  - Dashboard summary
  - Key metrics and KPIs
  - Quick action cards
  - Recent activities

---

## 👥 Onboarding Process

**Menu Group**: Onboarding Process  
**Icon**: 👥 users  
**Permission Key**: `user-admin-onboarding`

**Description**: Centralized onboarding system for different user types and roles in the mining operation.

### User Onboarding
- **Route**: `/dashboard/useronboard`
- **Key**: `useronboard`
- **Description**: Onboard new system users with roles and permissions assignment
- **User Type**: Administrators, HR Personnel
- **Features**:
  - User account creation
  - Role assignment
  - Department allocation
  - Permission configuration
  - Account activation

### Security Onboarding
- **Route**: `/dashboard/securityonboarding`
- **Key**: `securityonboard`
- **Description**: Recruit and onboard security personnel with clearance verification
- **User Type**: Security Managers, HR
- **Features**:
  - Security personnel registration
  - Clearance verification
  - Training assignment
  - Credential management
  - Site access configuration

### Driver Onboarding
- **Route**: `/dashboard/driveronboarding`
- **Key**: `driveronboard`
- **Description**: Register and onboard drivers for transport operations
- **User Type**: Transport Managers, HR
- **Features**:
  - Driver registration
  - License verification
  - Insurance documents upload
  - Training certification
  - Vehicle assignment eligibility
  - Background check

### Vehicle Onboarding
- **Route**: `/dashboard/vehicleonboarding`
- **Key**: `vehicleonboard`
- **Description**: Register new vehicles and equipment for mining operations
- **User Type**: Fleet Managers, Transport Managers
- **Features**:
  - Vehicle registration
  - Technical specifications
  - Insurance and licensing
  - Maintenance records
  - Driver assignment

### Operational Charges Setup
- **Route**: `/dashboard/taxonboarding`
- **Key**: `Taxonboard`
- **Description**: Configure operational charges and taxation structures
- **User Type**: Finance Managers, Administrators
- **Features**:
  - Charge/tax rate configuration
  - Operational cost setup
  - Fee structure management
  - Regulatory compliance

### Mill Registration
- **Route**: `/dashboard/mill`
- **Key**: `mill`
- **Description**: Register and configure mill operations for ore processing
- **User Type**: Operations Managers, Mill Supervisors
- **Features**:
  - Mill facility setup
  - Capacity configuration
  - Equipment inventory
  - Processing capabilities
  - Staff assignment

### Production Loan Registration
- **Route**: `/dashboard/Production_Loan`
- **Key**: `Production_loan`
- **Description**: Set up production loans for mining operations
- **User Type**: Finance Managers, Operations
- **Features**:
  - Loan application
  - Loan terms configuration
  - Collateral setup
  - Disbursement tracking

### Transport Cost Registration
- **Route**: `/dashboard/Transport_cost`
- **Key**: `Transport_cost`
- **Description**: Configure transport cost structures and rates
- **User Type**: Finance Managers, Transport Managers
- **Features**:
  - Cost structure setup
  - Rate configuration
  - Route pricing
  - Premium charges

---

## 🪪 Miner Registration

**Menu Group**: Miner Registration  
**Icon**: 🪪 id-card  
**Permission Key**: `Miner-registration`

**Description**: Management of miner and membership registration for syndicate and company entities.

### Miner Registration
- **Route**: `/dashboard/customers`
- **Key**: `miner-registration`
- **Description**: Register individual miners and create miner profiles
- **User Type**: Miner Managers, Administrators
- **Features**:
  - Individual miner registration
  - Contact information
  - Identification documents
  - Banking details
  - Equipment inventory
  - Performance history

### Syndicate Membership
- **Route**: `/dashboard/syndicatemembership`
- **Key**: `syndicate-teammembership`
- **Description**: Manage syndicate membership and member records
- **User Type**: Syndicate Managers, HR
- **Features**:
  - Syndicate creation and management
  - Member enrollment
  - Membership status tracking
  - Contribution records
  - Member permissions

### Company Membership
- **Route**: `/dashboard/companymembership`
- **Key**: `company-teammembership`
- **Description**: Manage company-based membership and employee records
- **User Type**: Company Managers, HR
- **Features**:
  - Company member registration
  - Employment records
  - Department assignment
  - Benefits enrollment
  - Employment status tracking

---

## ⛏️ Shaft Management

**Menu Group**: Shaft Management  
**Icon**: 🏢 buildings  
**Permission Key**: `site-management`

**Description**: Comprehensive shaft/site operations management including creation, assignment, and transfers.

### Shaft Assignment
- **Route**: `/dashboard/shaftassign`
- **Key**: `site-list`
- **Description**: Assign miners and resources to specific shafts
- **User Type**: Operations Managers, Shaft Supervisors
- **Features**:
  - Shaft resource allocation
  - Personnel assignment
  - Capacity management
  - Shift scheduling
  - Assignment tracking

### Shaft Creation
- **Route**: `/dashboard/shaftcreation`
- **Key**: `shaftcreation`
- **Description**: Create and configure new mining shafts
- **User Type**: Operations Managers, Technical Leads
- **Features**:
  - New shaft setup
  - Technical specifications
  - Depth and dimensions
  - Equipment configuration
  - Safety features
  - Resource requirements

### Shaft Transfer
- **Route**: `/dashboard/shafttransfare`
- **Key**: `Shafttransfare`
- **Description**: Manage transfers of materials and resources between shafts
- **User Type**: Operations Managers, Logistics
- **Features**:
  - Inter-shaft transfers
  - Material tracking
  - Transport coordination
  - Documentation
  - Chain of custody

---

## 💰 Financial Management

**Menu Group**: Financial Management  
**Icon**: 🏢 buildings  
**Permission Key**: `financial-management`

**Description**: Financial operations including borrowing, taxation, selling, and payment management.

### Resources Borrowing
- **Route**: `/dashboard/borrowing`
- **Key**: `Borrowing`
- **Description**: Manage resource and capital borrowing for operations
- **User Type**: Finance Managers, Operations
- **Features**:
  - Loan applications
  - Borrowing approval
  - Interest calculations
  - Repayment tracking
  - Collateral management

### Charges Ore Deduction
- **Route**: `/dashboard/oretax`
- **Key**: `ore-tax`
- **Description**: Calculate and manage ore-based charges and tax deductions
- **User Type**: Finance Managers, Accountants
- **Features**:
  - Ore valuation
  - Charge calculation
  - Tax deduction tracking
  - Audit reports
  - Compliance documentation

### Gold Selling (Refined Ore to Gold)
- **Route**: `/dashboard/Refined_Ore_to_Gold`
- **Key**: `ore-transport`
- **Description**: Manage the sale of refined ore/gold products
- **User Type**: Sales Managers, Finance
- **Features**:
  - Product inventory
  - Sale transactions
  - Pricing management
  - Customer management
  - Revenue tracking

### Penalty Payment
- **Route**: `/dashboard/penalitypayment`
- **Key**: `peniltypay`
- **Description**: Process and track penalty payments from violations
- **User Type**: Finance Managers, Compliance Officers
- **Features**:
  - Payment recording
  - Fine calculation
  - Payment status tracking
  - Receipt generation
  - Payment history

---

## 🛡️ SHE Management

**Menu Group**: SHE Management (Safety, Health & Environment)  
**Icon**: 🏢 buildings  
**Permission Key**: `she-management`

**Description**: Safety, Health & Environment compliance and incident management.

### Incident Reports
- **Route**: `/dashboard/incidentmanagement`
- **Key**: `Incident Management`
- **Description**: Create and track safety/health incidents and near-misses
- **User Type**: Safety Officers, Incident Managers
- **Features**:
  - Incident logging
  - Severity classification
  - Witness documentation
  - Photography/evidence upload
  - Initial assessment
  - Investigation assignment

### Incident Resolution
- **Route**: `/dashboard/resolveissue`
- **Key**: `incidentresolve`
- **Description**: Manage resolution and closure of reported incidents
- **User Type**: Safety Managers, Investigation Teams
- **Features**:
  - Investigation tracking
  - Root cause analysis
  - Corrective actions
  - Follow-up tasks
  - Closure documentation
  - Lessons learned

### Issue Admission of Guilty
- **Route**: `/dashboard/guilty`
- **Key**: `guilty`
- **Description**: Record admission of liability in incidents
- **User Type**: HR, Legal, Compliance
- **Features**:
  - Admission records
  - Liability acknowledgment
  - Digital signatures
  - Document storage
  - Legal compliance

### List of Issued Penalties
- **Route**: `/dashboard/listissuedpenality`
- **Key**: `listissuedpenality`
- **Description**: View and manage all penalties issued
- **User Type**: HR, Compliance Officers
- **Features**:
  - Penalty records
  - Issue dates and reasons
  - Status tracking
  - Appeal management
  - Fine amounts
  - Payment status

### Training
- **Route**: `/dashboard/training`
- **Key**: `training`
- **Description**: Manage safety and operational training programs
- **User Type**: Training Coordinators, HR
- **Features**:
  - Training course management
  - Enrollment tracking
  - Certification records
  - Attendance tracking
  - Assessment results
  - Renewal reminders

### Shaft Inspection
- **Route**: `/dashboard/shaftinspection`
- **Key**: `shaftinspection`
- **Description**: Conduct and record regular shaft safety inspections
- **User Type**: Safety Inspectors, Technical Officers
- **Features**:
  - Inspection scheduling
  - Checklist management
  - Finding documentation
  - Photo/evidence capture
  - Non-conformance recording
  - Risk assessment

### Shaft Inspection Resolution
- **Route**: `/dashboard/shaftinspectionresolution`
- **Key**: `shaftinspectionResolution`
- **Description**: Track and manage resolution of inspection findings
- **User Type**: Operations, Safety Managers
- **Features**:
  - Finding tracking
  - Corrective action planning
  - Implementation tracking
  - Verification steps
  - Timeline management
  - Closure documentation

---

## 📊 Report Management

**Menu Group**: Report Management  
**Icon**: 📊 chart-pie  
**Permission Key**: `Report-management`

**Description**: Centralized reporting system for operational and compliance metrics.

### SHE Summary Report
- **Route**: `/dashboard/shesummaryreports`
- **Key**: `she-summary-reports`
- **Description**: Aggregate Safety, Health & Environment performance metrics and trends
- **User Type**: Managers, Safety Directors, Executives
- **Features**:
  - Incident summaries
  - Trend analysis
  - KPI metrics
  - Compliance status
  - Executive dashboard
  - Customizable date ranges

### Shaft History Report
- **Route**: `/dashboard/shafthistoryreports`
- **Key**: `shaft-history-reports`
- **Description**: Historical data and performance records of shafts
- **User Type**: Operations, Managers
- **Features**:
  - Shaft performance history
  - Production records
  - Maintenance records
  - Incident history
  - Operational downtime
  - Efficiency trends

### Ore Report
- **Route**: `/dashboard/ore_reports`
- **Key**: `Ore-reports`
- **Description**: Comprehensive ore production and quality reports
- **User Type**: Operations, Finance
- **Features**:
  - Production volumes
  - Quality metrics
  - Grade analysis
  - Processing status
  - Inventory levels
  - Sales tracking

### Section Report
- **Route**: `/dashboard/section_reports`
- **Key**: `Section-reports`
- **Description**: Mining section performance and operational reports
- **User Type**: Operations, Managers
- **Features**:
  - Section metrics
  - Production targets vs actual
  - Resource utilization
  - Personnel performance
  - Cost analysis

### Mine Level Report
- **Route**: `/dashboard/mine_levels`
- **Key**: `Mine-Level-reports`
- **Description**: Mine-level operational and strategic reports
- **User Type**: Directors, Senior Managers
- **Features**:
  - Overall mine KPIs
  - Strategic metrics
  - Budget vs actual
  - Comparative analysis
  - Future projections
  - Executive summaries

---

## ⛏️ Ore Management

**Menu Group**: Ore Management  
**Icon**: ⛰️ mountain  
**Permission Key**: `ore-management`

**Description**: Complete ore lifecycle management from capture to approval.

### Ore Capturing
- **Route**: `/dashboard/oremanagement`
- **Key**: `ore-list`
- **Description**: Record and capture ore extraction data and quantities
- **User Type**: Operations, Ore Handlers
- **Features**:
  - Ore quantity logging
  - Source/shaft tracking
  - Grade recording
  - Weight measurements
  - Storage location
  - Batch management
  - Quality notes

### Ore To Mill Assignment
- **Route**: `/dashboard/millasignment`
- **Key**: `ore-mill`
- **Description**: Assign extracted ore to mills for processing
- **User Type**: Operations, Mill Coordinators
- **Features**:
  - Ore allocation
  - Mill selection
  - Processing schedule
  - Quantity allocation
  - Transportation assignment
  - Tracking numbers
  - Status monitoring

### Sample Ore Approval
- **Route**: `/dashboard/Sample_Ore_Approval`
- **Key**: `Sample Ore Approval`
- **Description**: Quality assessment and approval of ore samples
- **User Type**: Quality Inspectors, Technical Officers
- **Features**:
  - Sample testing
  - Quality grading
  - Approval/rejection
  - Test reports
  - Compliance verification
  - Batch sign-off
  - Historical records

---

## 🛠️ Site Management

**Menu Group**: Site Management  
**Icon**: 🛠️ tools  
**Permission Key**: `Site-management`

**Description**: Mining section/area creation and management.

### Create Mining Section
- **Route**: `/dashboard/sectioncreation`
- **Key**: `site-add`
- **Description**: Create new mining sections or work areas
- **User Type**: Site Managers, Operations Planning
- **Features**:
  - Section definition
  - Boundary mapping
  - Resource allocation
  - Equipment assignment
  - Personnel assignment
  - Safety perimeter setup

### Section Mapping
- **Route**: `/dashboard/sectionmapping`
- **Key**: `Sectionmapping`
- **Description**: Map and visualize mining sections and resource locations
- **User Type**: Operations, Surveyors, Technical Teams
- **Features**:
  - Geographic mapping
  - Resource location visualization
  - Equipment positioning
  - Personnel placement
  - Infrastructure mapping
  - Access routes
  - Safety zones

---

## 🚚 Transport Management

**Menu Group**: Transport Management  
**Icon**: 🚛 truck  
**Permission Key**: `transport-management`

**Description**: Vehicle and transport operations management.

### Vehicles Management
- **Route**: `/dashboard/approvedvehicles`
- **Key**: `transport`
- **Description**: Manage vehicle inventory and approvals
- **User Type**: Fleet Managers, Transport Coordinators
- **Features**:
  - Vehicle registration
  - Status tracking
  - Maintenance schedules
  - Insurance tracking
  - Inspection records
  - Approval/rejection
  - License verification

### Driver Management
- **Route**: `/dashboard/drivermanagement`
- **Key**: `drivermanagement`
- **Description**: Manage driver records, licenses, and assignments
- **User Type**: Transport Managers, HR
- **Features**:
  - Driver records
  - License verification
  - Accident history
  - Training certifications
  - Vehicle assignments
  - Performance tracking
  - Compliance documentation

### Assign Ore To Transport
- **Route**: `/dashboard/oreTransport`
- **Key**: `transport-add`
- **Description**: Assign ore/cargo to transport vehicles
- **User Type**: Logistics, Transport Coordinators
- **Features**:
  - Cargo allocation
  - Vehicle assignment
  - Route planning
  - Tracking setup
  - Delivery scheduling
  - Weight confirmation
  - Transport documentation

---

## 🔒 Security

**Menu Group**: Security  
**Icon**: 🔐 lock  
**Permission Key**: `security`

**Description**: Security checkpoints and material verification.

### Check Point Ore Dispatch
- **Route**: `/dashboard/Ore_Dispatch`
- **Key**: `Check Point Ore Dispatch`
- **Description**: Security checkpoint for ore leaving the facility
- **User Type**: Security Officers, Checkpoint Staff
- **Features**:
  - Dispatch verification
  - Documentation check
  - Weight confirmation
  - Quantity verification
  - Seal placement
  - Digital signing
  - Exit log

### Check Point Ore Receipt
- **Route**: `/dashboard/Ore_Recieval`
- **Key**: `Check Point Ore Recieval`
- **Description**: Security checkpoint for receiving ore at destination
- **User Type**: Security Officers, Receiving Staff
- **Features**:
  - Receipt verification
  - Condition inspection
  - Seal verification
  - Weight confirmation
  - Documentation review
  - Quality assessment
  - Acceptance/rejection

---

## ✅ Record Approval Management

**Menu Group**: Record Approval Management  
**Icon**: 🔑 key  
**Permission Key**: `permission`

**Description**: Approval workflows for all onboarding and operational records.

### Miner Registration Approval
- **Route**: `/dashboard/syndicate`
- **Key**: `permission-list`
- **Description**: Review and approve miner registration applications
- **User Type**: Approvers, Managers
- **Features**:
  - Application review
  - Document verification
  - Approval/rejection
  - Comment addition
  - Status tracking
  - Notification system

### Section Creation Approval
- **Route**: `/dashboard/sectioncreationstatus`
- **Key**: `section-creation`
- **Description**: Approve new mining section creations
- **User Type**: Operations Managers, Directors
- **Features**:
  - Proposal review
  - Safety verification
  - Resource approval
  - Status tracking
  - Revision requests

### Shaft Assignment Approval
- **Route**: `/dashboard/shaftassignmentstatus`
- **Key**: `shaft-assignment-status`
- **Description**: Approve resource and personnel assignments to shafts
- **User Type**: Managers, Supervisors
- **Features**:
  - Assignment review
  - Resource verification
  - Approval workflow
  - Capacity checking

### User Onboarding Approval
- **Route**: `/dashboard/useronboardstatus`
- **Key**: `Useronboard-status`
- **Description**: Approve new user account onboarding
- **User Type**: Admin Approvers, HR Managers
- **Features**:
  - Account review
  - Role verification
  - Permission approval
  - Status dashboard

### Driver Onboarding Approval
- **Route**: `/dashboard/driveronboardingstatus`
- **Key**: `driveronboard-status`
- **Description**: Approve driver registrations and qualifications
- **User Type**: Transport Managers, HR
- **Features**:
  - Documentation review
  - License verification
  - Approval workflow
  - Training status check

### Security Onboarding Approval
- **Route**: `/dashboard/securityonboardingstatus`
- **Key**: `securityonboard-status`
- **Description**: Approve security personnel onboarding
- **User Type**: Security Managers, HR
- **Features**:
  - Clearance verification
  - Documentation review
  - Approval process
  - Status tracking

### Vehicle Onboarding Approval
- **Route**: `/dashboard/vehicleonboardingstatus`
- **Key**: `vehicleonboard-status`
- **Description**: Approve vehicle registrations
- **User Type**: Fleet Managers, Transport
- **Features**:
  - Vehicle documentation
  - Insurance verification
  - Approval workflow

### Operational Charges Approval
- **Route**: `/dashboard/taxonboardingstatus`
- **Key**: `taxonboard-status`
- **Description**: Approve operational charge configurations
- **User Type**: Finance Managers, Directors
- **Features**:
  - Rate approval
  - Compliance check
  - Effective dating

### Mill Status Approval
- **Route**: `/dashboard/millstatus`
- **Key**: `mill-status`
- **Description**: Approve mill operational status and changes
- **User Type**: Operations Managers
- **Features**:
  - Status tracking
  - Change approval
  - Capacity updates

### Production Loan Status Approval
- **Route**: `/dashboard/Production_LoanStatus`
- **Key**: `Production_LoanStatus`
- **Description**: Approve and track production loan status
- **User Type**: Finance Managers, Directors
- **Features**:
  - Loan approval
  - Status monitoring
  - Disbursement tracking

### Shaft Loan Status Approval
- **Route**: `/dashboard/ShaftLoanStatus`
- **Key**: `ShaftLoanStatus`
- **Description**: Approve and track shaft-related loan statuses
- **User Type**: Finance Managers
- **Features**:
  - Loan review
  - Terms approval
  - Payment tracking

### Transport Cost Status Approval
- **Route**: `/dashboard/Transport_costStatus`
- **Key**: `Transport_costStatus`
- **Description**: Approve transport cost structures and rates
- **User Type**: Finance Managers, Transport Managers
- **Features**:
  - Cost approval
  - Rate verification
  - Effective dating

---

## 🎯 Additional Dashboard Pages

### Account Settings
- **Route**: `/dashboard/account`
- **Key**: `account`
- **Description**: User profile and account preferences
- **Access**: Authenticated users
- **Features**:
  - Profile editing
  - Password management
  - Notification preferences
  - Privacy settings

### Company Management
- **Route**: `/dashboard/company`
- **Key**: (varies)
- **Description**: Company operations and administration
- **Access**: Company Managers, Administrators

### Company Health
- **Route**: `/dashboard/companyhealth`
- **Key**: (varies)
- **Description**: Company operational health metrics and status
- **Access**: Managers, Directors

### Company Shaft Management
- **Route**: `/dashboard/companyshaft`
- **Key**: (varies)
- **Description**: Company-specific shaft management
- **Access**: Company Managers, Operations

### Map Visualization
- **Route**: `/dashboard/map`
- **Key**: `map`
- **Description**: Geographic map view of mining operations
- **Access**: All users
- **Features**:
  - Real-time location tracking
  - Resource visualization
  - Incident mapping
  - Interactive controls

### Settings
- **Route**: `/dashboard/settings`
- **Key**: `settings`
- **Description**: Application settings and configurations
- **Access**: Administrators
- **Features**:
  - System configuration
  - User management
  - Permission settings
  - Audit logging

### Integrations
- **Route**: `/dashboard/integrations`
- **Key**: `integrations`
- **Description**: Third-party integrations and connections
- **Access**: Administrators, Tech Team
- **Features**:
  - API configuration
  - External service connections
  - Webhooks setup
  - Data synchronization

---

## 🔗 Route Structure Reference

### Navigation Configuration
**File**: `src/components/dashboard/layout/config.ts`

All routes are defined in the navigation configuration with:
- `key`: Unique permission identifier
- `title`: Display name in menu
- `href`: Actual route path
- `icon`: Icon type for menu display
- `items`: Sub-menu items (for grouped routes)

### Path Constants
**File**: `src/paths.ts`

All route paths are centralized as constants for type-safe navigation:
```typescript
paths.dashboard.useronboard
paths.dashboard.incidentmanagement
// etc...
```

---

## 📋 Permission System

### How Routes Work with Permissions

1. **Route Access**: Each route is controlled by permission keys defined in `config.ts`
2. **User Filtering**: `getNavItemsForUser()` function filters available routes based on user permissions
3. **Dynamic Navigation**: Menu items displayed based on assigned permissions
4. **Approval Workflows**: Status pages require approval permissions

### Route Groups by Permission

| Permission Key | Routes | Purpose |
|---|---|---|
| `user-admin-onboarding` | User, Security, Driver, Vehicle, Tax, Mill, Production Loan, Transport Cost | System setup and enrollment |
| `Miner-registration` | Miner, Syndicate, Company Membership | Miner management |
| `site-management` | Shaft Assignment, Creation, Transfer | Site operations |
| `financial-management` | Borrowing, Tax, Gold Sale, Penalties | Financial operations |
| `she-management` | Incidents, Resolution, Training, Inspection | Safety & compliance |
| `Report-management` | All report pages | Reporting & analytics |
| `ore-management` | Ore Capture, Mill Assignment, Sample Approval | Ore operations |
| `Site-management` | Section Creation, Mapping | Area management |
| `transport-management` | Vehicles, Drivers, Ore Assignment | Transport ops |
| `security` | Dispatch, Receipt Checkpoints | Security ops |
| `permission` | All approval/status pages | Approval workflows |

---

## 🔄 Route Hierarchy

```
/dashboard (Overview)
├── Onboarding Process (Group)
│   ├── /dashboard/useronboard
│   ├── /dashboard/securityonboarding
│   ├── /dashboard/driveronboarding
│   ├── /dashboard/vehicleonboarding
│   ├── /dashboard/taxonboarding
│   ├── /dashboard/mill
│   ├── /dashboard/Production_Loan
│   └── /dashboard/Transport_cost
├── Miner Registration (Group)
│   ├── /dashboard/customers
│   ├── /dashboard/syndicatemembership
│   └── /dashboard/companymembership
├── Shaft Management (Group)
│   ├── /dashboard/shaftassign
│   ├── /dashboard/shaftcreation
│   └── /dashboard/shafttransfare
├── Financial Management (Group)
│   ├── /dashboard/borrowing
│   ├── /dashboard/oretax
│   ├── /dashboard/Refined_Ore_to_Gold
│   └── /dashboard/penalitypayment
├── SHE Management (Group)
│   ├── /dashboard/incidentmanagement
│   ├── /dashboard/resolveissue
│   ├── /dashboard/guilty
│   ├── /dashboard/listissuedpenality
│   ├── /dashboard/training
│   ├── /dashboard/shaftinspection
│   └── /dashboard/shaftinspectionresolution
├── Report Management (Group)
│   ├── /dashboard/shesummaryreports
│   ├── /dashboard/shafthistoryreports
│   ├── /dashboard/ore_reports
│   ├── /dashboard/section_reports
│   └── /dashboard/mine_levels
├── Ore Management (Group)
│   ├── /dashboard/oremanagement
│   ├── /dashboard/millasignment
│   └── /dashboard/Sample_Ore_Approval
├── Site Management (Group)
│   ├── /dashboard/sectioncreation
│   └── /dashboard/sectionmapping
├── Transport Management (Group)
│   ├── /dashboard/approvedvehicles
│   ├── /dashboard/drivermanagement
│   └── /dashboard/oreTransport
├── Security (Group)
│   ├── /dashboard/Ore_Dispatch
│   └── /dashboard/Ore_Recieval
└── Record Approval Management (Group)
    ├── /dashboard/syndicate
    ├── /dashboard/sectioncreationstatus
    ├── /dashboard/shaftassignmentstatus
    ├── /dashboard/useronboardstatus
    ├── /dashboard/driveronboardingstatus
    ├── /dashboard/securityonboardingstatus
    ├── /dashboard/vehicleonboardingstatus
    ├── /dashboard/taxonboardingstatus
    ├── /dashboard/millstatus
    ├── /dashboard/Production_LoanStatus
    ├── /dashboard/ShaftLoanStatus
    └── /dashboard/Transport_costStatus
```

---

## 📱 Mobile Support

All routes are responsive and support:
- Desktop viewport (1920px+)
- Tablet viewport (768px - 1024px)
- Mobile viewport (< 768px)

Mobile-specific features:
- Drawer navigation instead of sidebar
- Touch-optimized buttons and controls
- Responsive tables with horizontal scroll
- Collapsible sections and accordions

---

## 🔐 Authentication Routes Details

```
/auth
├── /auth/sign-in (Public)
├── /auth/sign-up (Public)
└── /auth/reset-password (Public)
```

---

## ⚠️ Error Routes

- **Route**: `/errors/not-found`
- **Purpose**: 404 page for invalid routes
- **Access**: All users

---

## 📝 Notes

- All dashboard routes require authentication
- Routes are permission-based and dynamically shown/hidden
- Menu groups help organize 50+ individual routes
- Each route has associated components in `src/app/dashboard/[route]/page.tsx`
- Approval routes show status of records under review
- Onboarding routes handle initial setup of system entities
- All routes use Next.js 15 App Router with TypeScript

---

## 🎨 Styling Reference

All routes follow the styling standards documented in:
- **Guide**: `docs/markdown/PAGE_STYLING_GUIDE.md`
- **Color System**: Professional theme colors (primary: #323E3E, secondary: #000814)
- **Component Library**: Material-UI v7.2.0 with custom Material-UI components
- **Icons**: Phosphor Icons for navigation and actions

---

**Document Version**: 1.0  
**Last Updated**: November 14, 2025  
**Application**: Co-app-frontend Dashboard  
**Maintained By**: Development Team
