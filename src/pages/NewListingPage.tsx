/**
 * NewListingPage Component
 * ------------------------------------------------------------
 * Controlled form allowing hosts to add a new property listing to the SQL database.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, PlusCircle, Image as ImageIcon } from "lucide-react";
import { ListingFormData } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { apiFetch } from "../lib/api";
import { useLanguage } from "../hooks/useLanguage";

const SAMPLE_IMAGES = [
    {
        label: "Beachfront Villa",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    },
    {
        label: "Alpine Cabin",
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    },
    {
        label: "Modern Loft",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    },
    {
        label: "Tuscan Farmhouse",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    },
];

export const NewListingPage: React.FC = () => {
    const navigate = useNavigate();
    const { notify } = useNotifications();
    const { t } = useLanguage();

    // useRef hook: auto-focus first input field on component mount
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        titleInputRef.current?.focus();
    }, []);

    // Controlled form state
    const [formData, setFormData] = useState<ListingFormData>({
        title: "",
        description: "",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        price: "",
        location: "",
        country: "",
        category: "Trending",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (
            !formData.title ||
            !formData.price ||
            !formData.location ||
            !formData.country
        ) {
            setError(
                "Please fill in all required fields (Title, Price, Location, Country).",
            );
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save listing");
            }

            const data = await res.json();
            notify(t("listingCreated"), "success");
            navigate(`/listings/${data.listing.id}`);
        } catch (err: any) {
            console.error(err);
            setError(
                err.message || "An error occurred while creating listing.",
            );
            notify(
                err instanceof Error
                    ? err.message
                    : "Could not create the listing.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {/* Back button */}
            <Link
                to="/"
                className="btn btn-outline"
                style={{ border: "none", paddingLeft: 0, marginBottom: "1rem" }}
            >
                <ArrowLeft size={18} />
                <span>{t("backToStays")}</span>
            </Link>

            <div className="form-shell">
                <h1
                    style={{
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        marginBottom: "0.35rem",
                    }}
                >
                    {t("publishStay")}
                </h1>
                <p
                    style={{
                        color: "#666",
                        fontSize: "0.9rem",
                        marginBottom: "1.75rem",
                    }}
                >
                    {t("description")}
                </p>

                {error && (
                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            padding: "0.85rem 1rem",
                            borderRadius: "0.65rem",
                            marginBottom: "1.25rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">{t("stayTitle")} *</label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            name="title"
                            className="form-control"
                            placeholder="e.g. Seaside Cliffhouse Villa"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Category & Price */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">{t("category")} *</label>
                            <select
                                name="category"
                                className="form-select"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Trending">{t("trending")}</option>
                                <option value="Beachfront">{t("beachfront")}</option>
                                <option value="Cabins">{t("cabins")}</option>
                                <option value="Mansions">{t("mansions")}</option>
                                <option value="Countryside">{t("countryside")}</option>
                                <option value="Lofts">{t("urbanLofts")}</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                {t("pricePerNight")} *
                            </label>
                            <input
                                type="number"
                                name="price"
                                min="1"
                                className="form-control"
                                placeholder="e.g. 2500"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Location & Country */}
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">
                            {t("city")} *
                            </label>
                            <input
                                type="text"
                                name="location"
                                className="form-control"
                                placeholder="e.g. Oia, Santorini"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("country")} *</label>
                            <input
                                type="text"
                                name="country"
                                className="form-control"
                                placeholder="e.g. Greece"
                                value={formData.country}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Image URL with Presets and Live Preview */}
                    <div className="form-group">
                        <label className="form-label">{t("imageUrl")} *</label>
                        <input
                            type="url"
                            name="image"
                            className="form-control"
                            placeholder="https://images.unsplash.com/..."
                            value={formData.image}
                            onChange={handleChange}
                            required
                        />

                        {/* Quick Sample Presets */}
                        <div
                            style={{
                                marginTop: "0.5rem",
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                            }}
                        >
                            <span
                                className="quick-sample-label"
                                style={{
                                    fontSize: "0.8rem",
                                    color: "#777",
                                    alignSelf: "center",
                                }}
                            >
                                Quick Samples:
                            </span>
                            {SAMPLE_IMAGES.map((sample) => (
                                <button
                                    className="quick-sample-button"
                                    key={sample.label}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            image: sample.url,
                                        }))
                                    }
                                    style={{
                                        background: "#f3f4f6",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "9999px",
                                        padding: "0.2rem 0.6rem",
                                        fontSize: "0.78rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    {sample.label}
                                </button>
                            ))}
                        </div>

                        {/* Live Image Preview Card */}
                        {formData.image && (
                            <div
                                className="image-preview"
                                style={{
                                    marginTop: "0.85rem",
                                    borderRadius: "0.75rem",
                                    overflow: "hidden",
                                    maxHeight: "200px",
                                    border: "1px solid #ddd",
                                }}
                            >
                                <img
                                    src={formData.image}
                                    alt="Live Preview"
                                    style={{
                                        width: "100%",
                                        height: "200px",
                                        objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                        (
                                            e.target as HTMLImageElement
                                        ).style.display = "none";
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">{t("description")}</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows={4}
                            placeholder="Describe what makes this property special..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Actions */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "1rem",
                            marginTop: "1.5rem",
                        }}
                    >
                        <Link to="/" className="btn btn-outline">
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-brand"
                        >
                            <PlusCircle size={18} />
                            <span>
                                {loading
                                    ? "Publishing to SQL..."
                                    : "Create Listing"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
