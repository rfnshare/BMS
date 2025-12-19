import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth';
import ProfileManager from "../../components/features/Profile/ProfileManager";

// 🔥 STEP 1: Apply the Grouped Menu Structure (Crucial for Sidebar Consistency)
const adminMenuItems = [
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

export default function ProfilePage() {
  return (
    <Layout menuItems={adminMenuItems}>
      <div className="py-4">
        <div className="mb-4 ps-2">
          <h2 className="fw-bold mb-1">My Settings</h2>
          <p className="text-muted small">Manage your personal account details and preferences.</p>
        </div>
        <ProfileManager />
      </div>
    </Layout>
  );
}