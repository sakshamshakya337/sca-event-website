import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/index.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      {/* Fires exactly ONE /auth/me request on app boot — all children read store */}
      <AuthInitializer />
      <AppRoutes />
      <Toaster position="top-right" />
      <Analytics />
    </>
  );
}

export default App;
