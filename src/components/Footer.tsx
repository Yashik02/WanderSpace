/**
 * Footer Component
 * ------------------------------------------------------------
 * Handcrafted footer preserving WanderSpace branding and student project links.
 */

import React from "react";
import { Compass, Heart } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export const Footer: React.FC = () => {
    const { t } = useLanguage();
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "#fe424d",
                        fontWeight: 700,
                    }}
                >
                    <Compass size={20} />
                    <span>WanderSpace</span>
                </div>

                <p
                    style={{
                        color: "#666",
                        fontSize: "0.9rem",
                        maxWidth: "500px",
                    }}
                >
                    {t("footerDescription")}
                </p>

                <div className="footer-links">
                    <a href="#privacy" className="footer-link">
                        {t("privacy")}
                    </a>
                    <a href="#terms" className="footer-link">
                        {t("terms")}
                    </a>
                    <a href="#destinations" className="footer-link">
                        {t("destinations")}
                    </a>
                </div>

                <div className="footer-copy">
                    © {new Date().getFullYear()} WanderSpace, Inc. {t("allRightsReserved")}
                </div>
            </div>
        </footer>
    );
};
