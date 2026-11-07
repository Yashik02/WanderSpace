import React, { createContext, useContext, useState } from "react";

interface SearchContextValue {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    clearSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <SearchContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                clearSearch: () => setSearchQuery(""),
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export function useSearch(): SearchContextValue {
    const value = useContext(SearchContext);
    if (!value) {
        throw new Error("useSearch must be used within SearchProvider");
    }
    return value;
}
