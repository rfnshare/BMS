// logic/utils/menuConfig.ts

export const ADMIN_MENU_ITEMS = [
  {
    group: "Operations",
    items: [
      { name: 'Dashboard', path: '/admin-dashboard/home', icon: 'bi-speedometer2' },
      { name: 'Units', path: '/admin-dashboard/units', icon: 'bi-building' },
      { name: 'Leases', path: '/admin-dashboard/leases', icon: 'bi-file-earmark-text' },
      { name: 'Renters', path: '/admin-dashboard/renters', icon: 'bi-people' },
    ]
  },
  {
    group: "Financials",
    items: [
      { name: 'Invoices', path: '/admin-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Payments', path: '/admin-dashboard/payments', icon: 'bi-wallet2' },
      { name: 'Expenses', path: '/admin-dashboard/expenses', icon: 'bi-cart-dash' },
    ]
  },
  {
    group: "Support & Intelligence",
    items: [
      { name: 'Complaints', path: '/admin-dashboard/complaints', icon: 'bi-exclamation-triangle' },
      { name: 'Notifications', path: '/admin-dashboard/notifications', icon: 'bi-bell' },
      { name: 'Reports', path: '/admin-dashboard/reports', icon: 'bi-bar-chart-line' },
    ]
  },
  {
    group: "System",
    items: [
      { name: 'Permissions', path: '/admin-dashboard/permissions', icon: 'bi-shield-lock' },
      { name: 'Profile', path: '/admin-dashboard/profile', icon: 'bi-person-gear' },
    ]
  },
];

export const RENTER_MENU_ITEMS = [
  {
    group: "Home",
    items: [
      { name: 'Home', path: '/renter-dashboard', icon: 'bi-house-heart' },
      { name: 'My Unit', path: '/renter-dashboard/unit', icon: 'bi-building' },
    ]
  },
  {
    group: "Finance",
    items: [
      { name: 'Invoices', path: '/renter-dashboard/invoices', icon: 'bi-receipt' },
      { name: 'Other Expenses', path: '/renter-dashboard/expenses', icon: 'bi-cart-check' },
      { name: 'Payments', path: '/renter-dashboard/payments', icon: 'bi-wallet2' },
    ]
  },
  {
    group: "Support",
    items: [
      { name: 'Complaints', path: '/renter-dashboard/complaints', icon: 'bi-exclamation-triangle' },
      { name: 'Notifications', path: '/renter-dashboard/notifications', icon: 'bi-bell' },
    ]
  },
  {
    group: "Settings",
    items: [
      { name: 'My Profile', path: '/renter-dashboard/profile', icon: 'bi-person-gear' },
    ]
  }
];