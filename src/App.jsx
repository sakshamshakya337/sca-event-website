import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/index.jsx";
import useUiStore from "./store/uiStore";
import { useEffect } from "react";

function App() {
  const { theme, toggleTheme } = useUiStore();

  useEffect(() => {
    console.log("Current theme:", theme);
    const root = window.document.documentElement;
    // NEW — CORRECT ✅
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark"); // light mode = no class at all
    }
  }, [theme]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
