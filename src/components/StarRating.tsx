/**
 * StarRating Component
 * ------------------------------------------------------------
 * Handles both:
 * 1. Read-only rating display (e.g. ★ 4.7 with review count)
 * 2. Interactive 5-star picker for submitting new reviews
 */

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface StarRatingDisplayProps {
  rating: number | null;
  reviewCount?: number;
  size?: number;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 15,
}) => {
  const { t } = useLanguage();
  if (rating === null || rating === undefined || reviewCount === 0) {
    return (
      <span className="rating-badge" style={{ color: '#666', fontWeight: 500 }}>
        <Star size={size} className="star-icon-gold" />
        <span>{t("ratingNew")}</span>
      </span>
    );
  }

  return (
    <span className="rating-badge">
      <Star size={size} className="star-icon-gold" />
      <span>{Number(rating).toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span style={{ color: '#888', fontWeight: 400, marginLeft: '2px' }}>
          ({reviewCount})
        </span>
      )}
    </span>
  );
};

interface StarRatingPickerProps {
  value: number;
  onChange: (rating: number) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent!',
};

export const StarRatingPicker: React.FC<StarRatingPickerProps> = ({
  value,
  onChange,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeRating = hovered !== null ? hovered : value;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="star-rating-picker" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;

          return (
            <button
              key={star}
              type="button"
              className="star-rating-btn"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={24}
                className={isFilled ? 'star-icon-gold' : 'text-gray-300'}
                style={{
                  fill: isFilled ? '#f59e0b' : 'none',
                  color: isFilled ? '#f59e0b' : '#d1d5db',
                }}
              />
            </button>
          );
        })}
      </div>

      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fe424d' }}>
        {RATING_LABELS[activeRating] || `${activeRating} Stars`}
      </span>
    </div>
  );
};
