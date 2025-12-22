import type { AppProps } from "next/app"; // ✅ Added type safety
import { AuthProvider } from "../logic/context/AuthContext";
import { NotificationProvider } from "../logic/context/NotificationContext";

// 🔥 IMPORTANT: Restore these global CSS imports
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../src/app/globals.css"; // Your custom global styles

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </AuthProvider>
  );
}