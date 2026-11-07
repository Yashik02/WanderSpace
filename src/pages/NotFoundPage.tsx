/**
 * NotFoundPage Component
 * ------------------------------------------------------------
 * Clean 404 fallback page for unmatched client-side routes.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '5rem 1rem',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <Compass
        size={64}
        color="#fe424d"
        style={{ margin: '0 auto 1.5rem', opacity: 0.8 }}
      />
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>
        We couldn't find the stay or page you're looking for. It may have been moved or removed.
      </p>
      <Link to="/" className="btn btn-brand">
        <ArrowLeft size={16} />
        <span>Return to WanderSpace Home</span>
      </Link>
    </div>
  );
};
