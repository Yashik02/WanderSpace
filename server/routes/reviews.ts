import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { queryOne, run } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router({ mergeParams: true });

/**
 * POST /api/listings/:id/reviews
 * Creates a review for a specific listing and saves to SQL database
 */
router.post("/listings/:id/reviews", requireAuth, async (req: Request, res: Response) => {
    try {
        const listingId = req.params.id;
        const { rating, comment } = req.body;

        if (!rating || !comment || comment.trim() === "") {
            return res
                .status(400)
                .json({ error: "Rating and comment are required." });
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res
                .status(400)
                .json({ error: "Rating must be an integer between 1 and 5." });
        }

        // Check if listing exists
        const listing = await queryOne("SELECT id FROM listings WHERE id = $1", [
            listingId,
        ]);
        if (!listing) {
            return res.status(404).json({ error: "Listing does not exist." });
        }

        const reviewId = randomUUID();
        const insertSql = `
      INSERT INTO reviews (id, listing_id, author, user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

        await run(insertSql, [
            reviewId,
            listingId,
            req.user!.username, req.user!.id,
            numericRating,
            comment.trim(),
        ]);
        const newReview = await queryOne("SELECT * FROM reviews WHERE id = $1", [
            reviewId,
        ]);

        res.status(201).json({
            review: newReview,
            message: "Review added successfully!",
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Failed to add review." });
    }
});

/**
 * DELETE /api/reviews/:id
 * Deletes a single review by ID
 */
router.delete("/reviews/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const result = await run("DELETE FROM reviews WHERE id = $1 AND user_id = $2", [id, req.user!.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Review not found." });
        }

        res.json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Failed to delete review." });
    }
});

export default router;
