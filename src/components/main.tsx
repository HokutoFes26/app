import { createRoot } from "react-dom/client";
import App from "./App";
import "@/components/i18n/i18n";
import { ThemeProvider } from "./ThemeContext";

createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
        <App />
    </ThemeProvider>
);
