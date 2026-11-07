import React, { createContext, useContext, useState } from "react";

export type Currency = "USD" | "EUR" | "INR";

const CURRENCY_COOKIE = "wanderspace_currency";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const currencyConfig: Record<
    Currency,
    { locale: string; symbol: string; rateFromUsd: number }
> = {
    USD: { locale: "en-US", symbol: "$", rateFromUsd: 1 },
    EUR: { locale: "de-DE", symbol: "€", rateFromUsd: 0.92 },
    INR: { locale: "en-IN", symbol: "₹", rateFromUsd: 83.5 },
};

interface CurrencyContextValue {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatPrice: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readCurrency(): Currency {
    const value = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${CURRENCY_COOKIE}=`))
        ?.split("=")[1];
    return value === "EUR" || value === "INR" ? value : "USD";
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [currency, setCurrencyState] = useState<Currency>(readCurrency);

    const setCurrency = (nextCurrency: Currency) => {
        setCurrencyState(nextCurrency);
        document.cookie = `${CURRENCY_COOKIE}=${nextCurrency}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
    };

    const formatPrice = (usdAmount: number) => {
        const config = currencyConfig[currency];
        return new Intl.NumberFormat(config.locale, {
            style: "currency",
            currency,
            maximumFractionDigits: currency === "INR" ? 0 : 2,
        }).format(usdAmount * config.rateFromUsd);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export function useCurrency(): CurrencyContextValue {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within CurrencyProvider");
    }
    return context;
}
