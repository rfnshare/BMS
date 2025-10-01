// pages/_app.tsx
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
