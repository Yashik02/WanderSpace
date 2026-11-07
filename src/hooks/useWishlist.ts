/**
 * Custom Hook: useWishlist
 * ------------------------------------------------------------
 * Encapsulates reading and writing saved listing IDs in browser sessionStorage.
 *
 * A custom browser event keeps every useWishlist instance in the current tab
 * synchronized immediately. The native storage event is also handled for
 * changes made by another same-origin browsing context.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useNotifications } from "./useNotifications";
import { useLanguage } from "./useLanguage";

const STORAGE_KEY = "wanderspace_wishlist";
const WISHLIST_CHANGE_EVENT = "wanderspace-wishlist-change";

function readStoredWishlist(storageKey: string): string[] {
    try {
        const saved = sessionStorage.getItem(storageKey);
        if (!saved) {
            return [];
        }

        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) {
            return [];
        }

        // Only string IDs are valid, and Set removes accidental duplicates.
        return Array.from(
            new Set(parsed.filter((id): id is string => typeof id === "string")),
        );
    } catch (error) {
        console.error("Failed to read wishlist from sessionStorage:", error);
        return [];
    }
}

function writeStoredWishlist(storageKey: string, ids: string[]): void {
    try {
        sessionStorage.setItem(storageKey, JSON.stringify(ids));
        window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (error) {
        console.error("Failed to save wishlist to sessionStorage:", error);
    }
}

export function useWishlist() {
    const { user } = useAuth();
    const { notify } = useNotifications();
    const { t } = useLanguage();
    const storageKey = user ? `${STORAGE_KEY}:${user.id}` : `${STORAGE_KEY}:guest`;
    const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
        readStoredWishlist(storageKey),
    );

    useEffect(() => {
        const syncWishlist = () => {
            setWishlistIds(readStoredWishlist(storageKey));
        };

        window.addEventListener(WISHLIST_CHANGE_EVENT, syncWishlist);
        window.addEventListener("storage", syncWishlist);
        syncWishlist();

        return () => {
            window.removeEventListener(WISHLIST_CHANGE_EVENT, syncWishlist);
            window.removeEventListener("storage", syncWishlist);
        };
    }, [storageKey]);

    // Toggle whether an item is in the wishlist
    const toggleWishlist = useCallback((id: string) => {
        const currentIds = readStoredWishlist(storageKey);
        const nextIds = currentIds.includes(id)
            ? currentIds.filter((item) => item !== id)
            : [...currentIds, id];

        setWishlistIds(nextIds);
        writeStoredWishlist(storageKey, nextIds);
        notify(
            nextIds.includes(id)
                ? t("wishlistAdded")
                : t("wishlistRemoved"),
            "success",
        );
    }, [notify, storageKey]);

    /**
     * Remove IDs that are no longer present in the SQL listings response.
     * This handles deleted listings and database resets without user action.
     */
    const reconcileWishlist = useCallback((validListingIds: string[]) => {
        const currentIds = readStoredWishlist(storageKey);
        const validIds = new Set(validListingIds);
        const reconciledIds = currentIds.filter((id) => validIds.has(id));

        if (reconciledIds.length !== currentIds.length) {
            setWishlistIds(reconciledIds);
            writeStoredWishlist(storageKey, reconciledIds);
        }
    }, [storageKey]);

    // Helper check: is this specific ID wishlisted?
    const isWishlisted = (id: string): boolean => {
        return wishlistIds.includes(id);
    };

    return {
        wishlistIds,
        toggleWishlist,
        reconcileWishlist,
        isWishlisted,
        wishlistCount: wishlistIds.length,
    };
}
