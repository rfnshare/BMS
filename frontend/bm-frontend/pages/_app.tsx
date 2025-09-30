// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../globals.css'; // optional for your custom CSS
import type { AppProps } from 'next/app';
import "bootstrap-icons/font/bootstrap-icons.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
