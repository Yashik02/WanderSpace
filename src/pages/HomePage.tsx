/**
 * HomePage Component
 * ------------------------------------------------------------
 * Fetches and renders listings using the shared search context.
 */

import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowUpDown, Sparkles } from "lucide-react";
import { ListingCard } from "../components/ListingCard";
import { CategoryFilter } from "../components/CategoryFilter";
import { useLanguage } from "../hooks/useLanguage";
import { useSearch } from "../hooks/useSearch";
import { useWishlist } from "../hooks/useWishlist";
import { apiUrl } from "../lib/api";
import { Listing } from "../types";

export const HomePage: React.FC = () => {
    const { searchQuery, clearSearch } = useSearch();
    const { reconcileWishlist } = useWishlist();
    const { t } = useLanguage();

    const [listings, setListings] = useState<Listing[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();

        if (selectedCategory && selectedCategory !== "All") {
            queryParams.append("category", selectedCategory);
        }

        if (searchQuery.trim()) {
            queryParams.append("search", searchQuery.trim());
        }

        if (sortBy) {
            queryParams.append("sort", sortBy);
        }

        fetch(apiUrl(`/api/listings?${queryParams.toString()}`))
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (!isMounted) {
                    return;
                }

                const fetchedListings: Listing[] = data.listings || [];
                setListings(fetchedListings);
                reconcileWishlist(fetchedListings.map((listing) => listing.id));
                setLoading(false);
            })
            .catch((err) => {
                if (!isMounted) {
                    return;
                }

                console.error("Failed to load listings:", err);
                setError("Could not connect to database or fetch listings.");
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [reconcileWishlist, searchQuery, selectedCategory, sortBy]);

    return (
        <div>
            <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={(category) => setSelectedCategory(category)}
            />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "1.45rem",
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {selectedCategory === "All"
                            ? t("exploreStays")
                            : `${selectedCategory} ${t("stays")}`}
                    </h1>
                    <p style={{ color: "#666", fontSize: "0.9rem" }}>
                        {loading
                            ? t("findingStays")
                            : `${t("foundProperties")}: ${listings.length}`}
                        {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <ArrowUpDown size={16} color="#666" />
                    <span
                        style={{
                            fontSize: "0.85rem",
                            color: "#555",
                            fontWeight: 600,
                        }}
                    >
                        {t("sortBy")}
                    </span>
                    <select
                        className="form-select"
                        style={{
                            width: "auto",
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.88rem",
                        }}
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <option value="newest">{t("newest")}</option>
                        <option value="rating">{t("highestRated")}</option>
                        <option value="price_asc">{t("lowToHigh")}</option>
                        <option value="price_desc">{t("highToLow")}</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "4rem 1rem",
                        color: "#777",
                    }}
                >
                    <Sparkles
                        className="animate-spin"
                        size={32}
                        style={{ margin: "0 auto 1rem", color: "#fe424d" }}
                    />
                    <p>{t("queryingDatabase")}</p>
                </div>
            )}

            {error && !loading && (
                <div
                    style={{
                        background: "#fee2e2",
                        border: "1px solid #fca5a5",
                        padding: "1.25rem",
                        borderRadius: "0.85rem",
                        color: "#991b1b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    }}
                >
                    <AlertCircle size={24} />
                    <div>
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            )}

            {!loading && !error && listings.length === 0 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "4rem 1rem",
                        background: "#fff",
                        borderRadius: "1.25rem",
                        border: "1px solid #eee",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                        }}
                    >
                        No stays match your criteria
                    </h3>
                    <p style={{ color: "#666", marginBottom: "1.25rem" }}>
                        Try clearing your search or switching to "All Stays".
                    </p>
                    <button
                        className="btn btn-brand"
                        onClick={clearSearch}
                    >
                        {t("clearFilters")}
                    </button>
                </div>
            )}

            {!loading && !error && listings.length > 0 && (
                <div className="listings-grid">
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
};
