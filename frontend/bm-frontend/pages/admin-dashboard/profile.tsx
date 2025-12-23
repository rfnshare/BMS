import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth';
import ProfileManager from "../../components/features/Profile/ProfileManager";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";

export default function ProfilePage() {
  return (
    <Layout menuItems={ADMIN_MENU_ITEMS}>
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