import Layout from '../../components/layouts/Layout';
import { useRouter } from 'next/router';
import { useState } from 'react';
import NotificationManager from "../../components/features/Notifications/NotificationManager";
import {ADMIN_MENU_ITEMS} from "../../utils/menuConstants";

export default function NotificationsPage() {
  return (
    <Layout>
      <div className="container-fluid p-0 animate__animated animate__fadeIn">
        <NotificationManager />
      </div>
    </Layout>
  );
}