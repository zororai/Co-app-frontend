export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    Syndicate: '/dashboard/syndicate',
    shaftreg: '/dashboard/shaftassign',
    sectioncreation: '/dashboard/sectioncreation',
    minerDetails: '/dashboard/miner-details',
    oreManagement: '/dashboard/ore-management',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
