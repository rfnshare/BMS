import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { useState } from 'react';
// Assuming you have an InvoiceManager feature or want to build one here
import RenterInvoiceManager from '../../components/features/Renter/RenterInvoiceManager';
import InvoiceManager from "../../components/features/Invoices/InvoiceManager";

// 🔥 STEP 1: Apply the Grouped Menu Structure (Consistency is Key!)
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

export default function InvoicesPage() {
  return (
    <Layout menuItems={adminMenuItems}>
      <div className="container-fluid py-2 animate__animated animate__fadeIn">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1 text-dark">Invoice Management</h2>
            <p className="text-muted small mb-0">Track payments, rent cycles, and generated receipts.</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <InvoiceManager />
        </div>

      </div>
    </Layout>
  );
}