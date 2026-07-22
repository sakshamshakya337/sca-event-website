import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/index.jsx";
import AuthInitializer from "./components/AuthInitializer.jsx";

function App() {
  return (
    <>
      {/* Fires exactly ONE /auth/me request on app boot — all children read store */}
      <AuthInitializer />
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
