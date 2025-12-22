import { AuthProvider } from "../logic/context/AuthContext";
import { NotificationProvider } from "../logic/context/NotificationContext"; // ✅ Added

export default function MyApp({ Component, pageProps }: any) {
  return (
    <AuthProvider>
      <NotificationProvider> {/* ✅ Wrap here */}
        <Component {...pageProps} />
      </NotificationProvider>
    </AuthProvider>
  );
}