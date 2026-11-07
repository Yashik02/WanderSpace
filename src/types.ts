/**
 * WanderSpace Data Types
 * ------------------------------------------------------------
 * Clean TypeScript interfaces matching our SQL database tables.
 * Shared TypeScript interfaces keep the React frontend aligned with the API data.
 */

export interface Listing {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    location: string;
    country: string;
    category: string;
    created_at: string;
    avg_rating: number | null; // Real average calculated by SQL: AVG(rating)
    review_count: number; // Count calculated by SQL: COUNT(id)
    user_id?: string | null;
    host_username?: string | null;
}

export interface Review {
    id: string;
    listing_id: string;
    author: string;
    rating: number; // 1 to 5 stars
    comment: string;
    created_at: string;
    user_id?: string | null;
}
export interface User { id: string; username: string; }

export interface ListingFormData {
    title: string;
    description: string;
    image: string;
    price: number | string;
    location: string;
    country: string;
    category: string;
}
