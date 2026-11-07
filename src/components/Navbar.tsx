/**
 * Navbar Component
 * ------------------------------------------------------------
 * Contains site navigation, global search, and compact account controls.
 * The component intentionally keeps only UI-level state local.
 */

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ChevronDown,
    Compass,
    Heart,
    Moon,
    PlusCircle,
    Search,
    Sun,
    UserCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../hooks/useCurrency";
import { useLanguage } from "../hooks/useLanguage";
import { useSearch } from "../hooks/useSearch";
import { useTheme } from "../hooks/useTheme";
import { useWishlist } from "../hooks/useWishlist";
import { Language } from "../hooks/useLanguage";
import { Currency } from "../hooks/useCurrency";

export const Navbar: React.FC = () => {
    const navigate = useNavigate();

    const { user, logout } = useAuth();
    const { searchQuery, setSearchQuery } = useSearch();
    const { wishlistCount } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { currency, setCurrency } = useCurrency();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeMenu = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        const closeMenuOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", closeMenu);
        document.addEventListener("keydown", closeMenuOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeMenu);
            document.removeEventListener("keydown", closeMenuOnEscape);
        };
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);

        if (window.location.pathname !== "/") {
            navigate("/");
        }
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand-logo" title="WanderSpace Home">
                    <Compass className="brand-icon" />
                    <span>WanderSpace</span>
                </Link>

                <div className="navbar-search">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t("searchPlaceholder")}
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="navbar-account-controls">
                    <button
                        type="button"
                        className="theme-toggle-button"
                        title={
                            theme === "dark"
                                ? t("useLightMode")
                                : t("useDarkMode")
                        }
                        aria-label={
                            theme === "dark"
                                ? t("useLightMode")
                                : t("useDarkMode")
                        }
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
                    </button>

                    <div className="account-menu" ref={menuRef}>
                        <button
                            type="button"
                            className="account-menu-trigger"
                            title="Open account menu"
                            aria-label="Open account menu"
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen((open) => !open)}
                        >
                            <UserCircle size={24} />
                            <ChevronDown
                                size={15}
                                className={isMenuOpen ? "rotate-180" : ""}
                            />
                        </button>

                        {isMenuOpen && (
                            <div className="account-menu-dropdown" role="menu">
                                {user ? (
                                    <>
                                        <div
                                            className="account-menu-item"
                                            style={{ fontWeight: 700 }}
                                        >
                                            Hi, {user.username}
                                        </div>
                                        <button
                                            type="button"
                                            className="account-menu-item"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                logout();
                                            }}
                                        >
                                            {t("logout")}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/auth?mode=login"
                                            className="account-menu-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t("login")}
                                        </Link>
                                        <Link
                                            to="/auth?mode=register"
                                            className="account-menu-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {t("register")}
                                        </Link>
                                    </>
                                )}

                                <Link
                                    to="/wishlist"
                                    className="account-menu-item"
                                    role="menuitem"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Heart
                                        size={18}
                                        className={
                                            wishlistCount > 0
                                                ? "text-red-500 fill-red-500"
                                                : ""
                                        }
                                    />
                                    <span>{t("wishlist")}</span>
                                    {wishlistCount > 0 && (
                                        <span className="badge-count">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                {user && (
                                    <Link
                                        to="/listings/new"
                                        className="account-menu-item"
                                        role="menuitem"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <PlusCircle size={18} />
                                        <span>{t("hostStay")}</span>
                                    </Link>
                                )}

                                <div className="account-menu-divider" />

                                <button
                                    type="button"
                                    className="account-menu-item"
                                    onClick={toggleTheme}
                                >
                                    {theme === "dark" ? (
                                        <Sun size={18} />
                                    ) : (
                                        <Moon size={18} />
                                    )}
                                    <span>
                                        {theme === "dark"
                                            ? t("useLightMode")
                                            : t("useDarkMode")}
                                    </span>
                                </button>

                                <label className="account-menu-setting">
                                    <span>{t("language")}</span>
                                    <select
                                        value={language}
                                        onChange={(event) =>
                                            setLanguage(
                                                event.target.value as Language,
                                            )
                                        }
                                        aria-label="Select language"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">हिन्दी</option>
                                        <option value="es">Español</option>
                                        <option value="pa">ਪੰਜਾਬੀ</option>
                                        <option value="fr">Français</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </label>

                                <label className="account-menu-setting">
                                    <span>{t("currency")}</span>
                                    <select
                                        value={currency}
                                        onChange={(event) =>
                                            setCurrency(
                                                event.target.value as Currency,
                                            )
                                        }
                                        aria-label="Select currency"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                </label>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
