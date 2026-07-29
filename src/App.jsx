import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/index.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import { Analytics } from "@vercel/analytics/react";
import ReloadPrompt from "./components/ReloadPrompt.jsx";
import CustomInstallPrompt from "./components/pwa/CustomInstallPrompt.jsx";
import NetworkStatus from "./components/pwa/NetworkStatus.jsx";
function App() {
  return (
    <>
      {/* Fires exactly ONE /auth/me request on app boot — all children read store */}
      <AuthInitializer />
      <AppRoutes />
      <ReloadPrompt />
      <CustomInstallPrompt />
      <NetworkStatus />
      <Toaster position="top-right" />
      <Analytics />
    </>
  );
}

export default App;
