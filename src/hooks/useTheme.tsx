import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_COOKIE = "wanderspace_theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readThemeCookie(): Theme {
    const value = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${THEME_COOKIE}=`))
        ?.split("=")[1];

    return value === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
    document.cookie = `${THEME_COOKIE}=${theme}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const initialTheme = readThemeCookie();
        applyTheme(initialTheme);
        return initialTheme;
    });

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
