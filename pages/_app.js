import "@/styles/globals.css";
import ToastStack from "@/components/ToastStack";
import { ToastProvider } from "@/context/ToastContext";

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
      <ToastStack />
    </ToastProvider>
  );
}
