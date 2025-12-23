import type { AppProps } from "next/app"; // ✅ Added type safety
import { AuthProvider } from "../logic/context/AuthContext";
import { NotificationProvider } from "../logic/context/NotificationContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </AuthProvider>
  );
}