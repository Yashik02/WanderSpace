import React from "react";
import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { NewListingPage } from "./pages/NewListingPage";
import { EditListingPage } from "./pages/EditListingPage";
import { WishlistPage } from "./pages/WishlistPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthPage } from "./pages/AuthPage";
import { RequireAuth } from "./hooks/useAuth";

export default function App() {
    return (
        <div className="app-container">
            <Navbar />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route
                        path="/listings/new"
                        element={
                            <RequireAuth>
                                <NewListingPage />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/listings/:id"
                        element={<ListingDetailPage />}
                    />
                    <Route
                        path="/listings/:id/edit"
                        element={
                            <RequireAuth>
                                <EditListingPage />
                            </RequireAuth>
                        }
                    />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}
