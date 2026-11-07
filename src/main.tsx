import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth";
import { NotificationProvider } from "./hooks/useNotifications";
import { ThemeProvider } from "./hooks/useTheme";
import { LanguageProvider } from "./hooks/useLanguage";
import { CurrencyProvider } from "./hooks/useCurrency";
import { SearchProvider } from "./hooks/useSearch";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <LanguageProvider>
                    <CurrencyProvider>
                        <SearchProvider>
                            <NotificationProvider>
                                <AuthProvider>
                                    <App />
                                </AuthProvider>
                            </NotificationProvider>
                        </SearchProvider>
                    </CurrencyProvider>
                </LanguageProvider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
);
