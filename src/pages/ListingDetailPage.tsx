/**
 * ListingDetailPage Component
 * ------------------------------------------------------------
 * Displays complete details for a single stay, including image,
 * pricing, location, full review history, and an interactive review form.
 *
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    MapPin,
    Heart,
    Share2,
    Edit,
    Trash2,
    ArrowLeft,
    Calendar,
    ShieldCheck,
    Send,
    User,
    Trash,
} from "lucide-react";
import { Listing, Review } from "../types";
import { useWishlist } from "../hooks/useWishlist";
import { StarRatingDisplay, StarRatingPicker } from "../components/StarRating";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { ListingMap } from "../components/ListingMap";
import { useCurrency } from "../hooks/useCurrency";
import { useLanguage } from "../hooks/useLanguage";
import { apiFetch, apiUrl } from "../lib/api";

export const ListingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const { user } = useAuth();
    const { notify } = useNotifications();
    const { formatPrice } = useCurrency();
    const { t } = useLanguage();

    const [listing, setListing] = useState<Listing | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Controlled form state for adding a new review
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewComment, setReviewComment] = useState<string>("");
    const [submittingReview, setSubmittingReview] = useState<boolean>(false);

    // useRef hook: smooth scroll to reviews section
    const reviewsSectionRef = useRef<HTMLDivElement>(null);
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    // Fetch listing and reviews
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        fetch(apiUrl(`/api/listings/${id}`))
            .then((res) => {
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("This listing was not found.");
                    }
                    throw new Error("Could not load this listing.");
                }
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    setListing(data.listing);
                    setReviews(data.reviews || []);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error(err);
                    setError("Could not find or load this stay listing.");
                    notify(
                        err instanceof Error
                            ? err.message
                            : "Could not find or load this stay listing.",
                        "error",
                    );
                    navigate("/");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    // Handle Review Submission
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            navigate("/auth?mode=login");
            return;
        }
        if (!reviewComment.trim()) {
            notify(t("reviewRequired"), "info");
            commentInputRef.current?.focus();
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await apiFetch(`/api/listings/${id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating: reviewRating,
                    comment: reviewComment,
                }),
            });

            if (!res.ok) {
                const response = await res.json().catch(() => ({}));
                throw new Error(
                    response.error ||
                        (res.status === 404
                            ? "This listing was not found."
                            : "Failed to submit review."),
                );
            }
            const data = await res.json();

            // Update state dynamically with the new review returned from SQL
            setReviews((prev) => [data.review, ...prev]);

            // Recalculate listing average rating locally for immediate visual update
            if (listing) {
                const newReviews = [data.review, ...reviews];
                const sum = newReviews.reduce(
                    (acc, r) => acc + Number(r.rating),
                    0,
                );
                const newAvg = Number((sum / newReviews.length).toFixed(1));
                setListing({
                    ...listing,
                    avg_rating: newAvg,
                    review_count: newReviews.length,
                });
            }

            // Reset form
            setReviewComment("");
            setReviewRating(5);
            notify(t("reviewAdded"), "success");

            // Smoothly scroll down to review
            reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            console.error(err);
            notify(
                err instanceof Error
                    ? err.message
                    : "Error saving review to database.",
                "error",
            );
        } finally {
            setSubmittingReview(false);
        }
    };

    // Handle Deleting a Review
    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm(t("confirmDeleteReview"))) return;

        try {
            const res = await apiFetch(`/api/reviews/${reviewId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const response = await res.json().catch(() => ({}));
                throw new Error(response.error || t("reviewDeleteFailed"));
            }

            const updated = reviews.filter((r) => r.id !== reviewId);
            setReviews(updated);

            if (listing) {
                const sum = updated.reduce(
                    (acc, r) => acc + Number(r.rating),
                    0,
                );
                const newAvg =
                    updated.length > 0
                        ? Number((sum / updated.length).toFixed(1))
                        : null;
                setListing({
                    ...listing,
                    avg_rating: newAvg,
                    review_count: updated.length,
                });
            }
            notify(t("reviewDeleted"), "success");
        } catch (err) {
            console.error(err);
            notify(t("reviewDeleteFailed"), "error");
        }
    };

    // Handle Deleting the Entire Listing
    const handleDeleteListing = async () => {
        if (!window.confirm(t("confirmDeleteListing"))) {
            return;
        }

        try {
            const res = await apiFetch(`/api/listings/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const response = await res.json().catch(() => ({}));
                throw new Error(
                    response.error || "Could not delete this listing.",
                );
            }
            notify(t("listingDeleted"), "success");
            navigate("/");
        } catch (err) {
            console.error(err);
            notify(t("listingDeleteFailed"), "error");
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    textAlign: "center",
                    padding: "5rem 1rem",
                    color: "#666",
                }}
            >
                <p>{t("loading")}</p>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        marginBottom: "1rem",
                        color: "#991b1b",
                    }}
                >
                    {error || "Listing not found"}
                </h2>
                <Link to="/" className="btn btn-brand">
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>
            </div>
        );
    }

    const wishlisted = isWishlisted(listing.id);

    return (
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
            {/* Top Breadcrumb & Action Bar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                }}
            >
                <Link
                    to="/"
                    className="btn btn-outline"
                    style={{ border: "none", paddingLeft: 0 }}
                >
                    <ArrowLeft size={18} />
                    <span>{t("allStays")}</span>
                </Link>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => {
                            if (!user) {
                                navigate("/auth?mode=login");
                                return;
                            }
                            toggleWishlist(listing.id);
                        }}
                        className="btn btn-outline"
                        title={wishlisted ? t("saved") : t("save")}
                    >
                        <Heart
                            size={18}
                            className={
                                wishlisted ? "fill-red-500 text-red-500" : ""
                            }
                        />
                        <span>{wishlisted ? t("saved") : t("save")}</span>
                    </button>

                    {user?.id === listing.user_id && (
                        <Link
                            to={`/listings/${listing.id}/edit`}
                            className="btn btn-outline"
                        >
                            <Edit size={16} />
                            <span>{t("edit")}</span>
                        </Link>
                    )}

                    {user?.id === listing.user_id && (
                        <button
                            onClick={handleDeleteListing}
                            className="btn btn-danger"
                        >
                            <Trash2 size={16} />
                            <span>{t("delete")}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stay Title & Header Information */}
            <h1
                style={{
                    fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    marginBottom: "0.5rem",
                }}
            >
                {listing.title}
            </h1>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                    flexWrap: "wrap",
                    color: "#555",
                    fontSize: "0.95rem",
                }}
            >
                {listing.host_username && (
                    <span>
                        {t("hostedBy")} <strong>{listing.host_username}</strong>
                    </span>
                )}
                <StarRatingDisplay
                    rating={listing.avg_rating}
                    reviewCount={listing.review_count}
                    size={16}
                />
                <span>·</span>
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                    }}
                >
                    <MapPin size={16} color="#fe424d" />
                    <strong>
                        {listing.location}, {listing.country}
                    </strong>
                </span>
                {listing.category && (
                    <>
                        <span>·</span>
                        <span
                            style={{
                                background: "#f3f4f6",
                                padding: "0.2rem 0.6rem",
                                borderRadius: "9999px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                            }}
                        >
                            {listing.category}
                        </span>
                    </>
                )}
            </div>

            {/* Main Image Showcase */}
            <div
                style={{
                    width: "100%",
                    maxHeight: "480px",
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    marginBottom: "2rem",
                    boxShadow: "var(--card-shadow)",
                    background: "#eaeaea",
                }}
            >
                <img
                    src={listing.image}
                    alt={listing.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";
                    }}
                />
            </div>

            {/* Property Details Layout (Description + Booking Card) */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "2.5rem",
                    marginBottom: "3rem",
                }}
            >
                {/* Left Column: Description & Highlights */}
                <div>
                    <div
                        style={{
                            paddingBottom: "1.5rem",
                            marginBottom: "1.5rem",
                            borderBottom: "1px solid #eaeaea",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.35rem",
                                fontWeight: 700,
                                marginBottom: "0.35rem",
                            }}
                        >
                            Entire stay hosted by WanderSpace Verified Host
                        </h2>
                        <p style={{ color: "#777", fontSize: "0.9rem" }}>
                            Self check-in · Dedicated workspace · High-speed
                            Wi-Fi
                        </p>
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                        <h3
                            style={{
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                marginBottom: "0.75rem",
                            }}
                        >
                            About this space
                        </h3>
                        <p
                            className="listing-description"
                            style={{
                                color: "#333",
                                fontSize: "1rem",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                            }}
                        >
                            {listing.description ||
                                "No detailed description provided for this stay."}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div
                        className="persistence-panel"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            background: "#fffaf9",
                            border: "1px solid #ffe4e6",
                            padding: "1.25rem",
                            borderRadius: "1rem",
                        }}
                    >
                        <div
                            className="booking-card"
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                alignItems: "flex-start",
                            }}
                        >
                            <ShieldCheck size={22} color="#fe424d" />
                            <div>
                                <strong style={{ fontSize: "0.95rem" }}>
                                    SQL Database Persistence
                                </strong>
                                <p
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "#666",
                                    }}
                                >
                                    All updates, deletions, and ratings are
                                    stored in relational SQL tables with cascade
                                    rules.
                                </p>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "0.75rem",
                                alignItems: "flex-start",
                            }}
                        >
                            <Calendar size={22} color="#fe424d" />
                            <div>
                                <strong style={{ fontSize: "0.95rem" }}>
                                    Instant Confirmation
                                </strong>
                                <p
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "#666",
                                    }}
                                >
                                    Flexible cancellation up to 48 hours prior
                                    to check-in.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Booking Simulation */}
                <div>
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #eaeaea",
                            borderRadius: "1.25rem",
                            padding: "1.75rem",
                            boxShadow: "var(--card-shadow)",
                            position: "sticky",
                            top: "5.5rem",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                marginBottom: "1rem",
                            }}
                        >
                            <div>
                                <span
                                    className="listing-price"
                                    style={{
                                        fontSize: "1.75rem",
                                        fontWeight: 800,
                                        color: "#222",
                                    }}
                                >
                                    {formatPrice(Number(listing.price))}
                                </span>
                                <span
                                    style={{
                                        color: "#777",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    {" "}
                                    / {t("perNight")}
                                </span>
                            </div>
                            <StarRatingDisplay
                                rating={listing.avg_rating}
                                reviewCount={listing.review_count}
                            />
                        </div>

                        <div
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "0.75rem",
                                overflow: "hidden",
                                marginBottom: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    borderBottom: "1px solid #ddd",
                                }}
                            >
                                <div style={{ padding: "0.65rem 0.85rem" }}>
                                    <label
                                        style={{
                                            fontSize: "0.7rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            color: "#555",
                                        }}
                                    >
                                        Check-in
                                    </label>
                                    <div
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Select date
                                    </div>
                                </div>
                                <div
                                    style={{
                                        padding: "0.65rem 0.85rem",
                                        borderLeft: "1px solid #ddd",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: "0.7rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            color: "#555",
                                        }}
                                    >
                                        Checkout
                                    </label>
                                    <div
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Select date
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: "0.65rem 0.85rem" }}>
                                <label
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        color: "#555",
                                    }}
                                >
                                    Guests
                                </label>
                                <div
                                    style={{
                                        fontSize: "0.85rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    2 guests, 1 room
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-brand"
                            style={{
                                width: "100%",
                                padding: "0.85rem",
                                fontSize: "1rem",
                            }}
                            onClick={() =>
                                notify(
                                    "Booking flow is planned for a future release.",
                                    "info",
                                )
                            }
                        >
                            Reserve Stay
                        </button>

                        <p
                            style={{
                                textAlign: "center",
                                fontSize: "0.8rem",
                                color: "#888",
                                marginTop: "0.75rem",
                            }}
                        >
                            You won't be charged yet
                        </p>
                    </div>
                </div>
            </div>

            {/* ====================================================================
          Reviews & Rating Section (SQL Calculated + Controlled Form)
         ==================================================================== */}
            <section
                className="listing-map-section"
                aria-labelledby="location-heading"
            >
                <div className="listing-section-heading">
                    <div>
                        <h2 id="location-heading">{t("whereYouStay")}</h2>
                        <p>
                            Explore the area around {listing.location},{" "}
                            {listing.country}.
                        </p>
                    </div>
                    <MapPin size={24} color="#fe424d" aria-hidden="true" />
                </div>
                <ListingMap
                    location={listing.location}
                    country={listing.country}
                />
            </section>

            <section ref={reviewsSectionRef} className="reviews-container">
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
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
                            {t("guestReviews")}
                        </h2>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginTop: "0.25rem",
                            }}
                        >
                            <StarRatingDisplay
                                rating={listing.avg_rating}
                                reviewCount={listing.review_count}
                                size={18}
                            />
                        </div>
                    </div>
                </div>
                {/* Add Review Controlled Form */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #eaeaea",
                        borderRadius: "1rem",
                        padding: "1.5rem",
                        marginBottom: "2rem",
                        boxShadow: "var(--card-shadow)",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                        }}
                    >
                        {t("leaveReview")}
                    </h3>
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            marginBottom: "1.25rem",
                        }}
                    >
                        Share your experience to help fellow travelers find
                        their perfect stay.
                    </p>

                    {user ? (
                        <form onSubmit={handleReviewSubmit}>
                            {/* Interactive 5-Star Rating Picker */}
                            <div className="form-group">
                                <label className="form-label">
                                    {t("yourRating")}
                                </label>
                                <StarRatingPicker
                                    value={reviewRating}
                                    onChange={setReviewRating}
                                />
                            </div>

                            {/* Comment Textarea */}
                            <div className="form-group">
                                <label className="form-label">
                                    {t("yourExperience")}
                                </label>
                                <textarea
                                    ref={commentInputRef}
                                    className="form-control"
                                    rows={3}
                                    placeholder="How was the view, comfort, and cleanliness?"
                                    value={reviewComment}
                                    onChange={(e) =>
                                        setReviewComment(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="btn btn-brand"
                            >
                                <Send size={16} />
                                <span>
                                    {submittingReview
                                        ? t("saving")
                                        : t("submitReview")}
                                </span>
                            </button>
                        </form>
                    ) : (
                        <div className="form-hint">{t("loginToReview")}</div>
                    )}
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <div
                        className="no-reviews-state"
                        style={{
                            textAlign: "center",
                            padding: "2.5rem",
                            background: "#f9fafb",
                            borderRadius: "1rem",
                            color: "#666",
                        }}
                    >
                        <p
                            className="no-reviews-title"
                            style={{ fontWeight: 600 }}
                        >
                            {t("noReviews")}
                        </p>
                        <p
                            className="no-reviews-message"
                            style={{ fontSize: "0.88rem" }}
                        >
                            {t("firstReview")}
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        {reviews.map((r) => (
                            <div key={r.id} className="review-item">
                                <div className="review-header">
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.65rem",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: "#fe424d",
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {r.author
                                                ? r.author
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : "G"}
                                        </div>
                                        <div>
                                            <div className="review-author">
                                                {r.author || "Anonymous Guest"}
                                            </div>
                                            <div className="review-date">
                                                {r.created_at
                                                    ? new Date(
                                                          r.created_at,
                                                      ).toLocaleDateString()
                                                    : "Recent guest"}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.75rem",
                                        }}
                                    >
                                        <StarRatingDisplay
                                            rating={r.rating}
                                            size={15}
                                        />
                                        {user?.id === r.user_id && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteReview(r.id)
                                                }
                                                title="Delete review"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#aaa",
                                                    cursor: "pointer",
                                                    padding: "4px",
                                                }}
                                                onMouseEnter={(e) =>
                                                    ((
                                                        e.target as HTMLElement
                                                    ).style.color = "#ef4444")
                                                }
                                                onMouseLeave={(e) =>
                                                    ((
                                                        e.target as HTMLElement
                                                    ).style.color = "#aaa")
                                                }
                                            >
                                                <Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="review-comment">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
