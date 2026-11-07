/**
 * EditListingPage Component
 * ------------------------------------------------------------
 * Controlled form allowing hosts to edit an existing property listing in SQL.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { ListingFormData } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { useLanguage } from '../hooks/useLanguage';
import { apiFetch, apiUrl } from '../lib/api';

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const { t } = useLanguage();

  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    image: '',
    price: '',
    location: '',
    country: '',
    category: 'Trending',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl(`/api/listings/${id}`))
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('This listing no longer exists.');
          }
          throw new Error('Failed to load listing');
        }
        return res.json();
      })
      .then((data) => {
        if (data.listing) {
          setFormData({
            title: data.listing.title || '',
            description: data.listing.description || '',
            image: data.listing.image || '',
            price: data.listing.price || '',
            location: data.listing.location || '',
            country: data.listing.country || '',
            category: data.listing.category || 'Trending',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        const message = err instanceof Error ? err.message : 'Could not fetch listing to edit.';
        notify(message, 'error');
        navigate('/');
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update listing in database');
      notify(t('listingUpdated'), 'success');
      navigate(`/listings/${id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error updating listing.');
      notify(err instanceof Error ? err.message : 'Could not update the listing.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666' }}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link
        to={`/listings/${id}`}
        className="btn btn-outline"
        style={{ border: 'none', paddingLeft: 0, marginBottom: '1rem' }}
      >
        <ArrowLeft size={18} />
        <span>{t('viewDetails')}</span>
      </Link>

      <div className="form-shell">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          {t('updateStay')}
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Update fields below and save changes to update the SQL database record.
        </p>

        {error && (
          <div
            className="image-preview"
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.85rem 1rem',
              borderRadius: '0.65rem',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('stayTitle')} *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">{t('category')} *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Trending">{t('trending')}</option>
                <option value="Beachfront">{t('beachfront')}</option>
                <option value="Cabins">{t('cabins')}</option>
                <option value="Mansions">{t('mansions')}</option>
                <option value="Countryside">{t('countryside')}</option>
                <option value="Lofts">{t('urbanLofts')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('pricePerNight')} *</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">{t('city')} *</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('country')} *</label>
              <input
                type="text"
                name="country"
                className="form-control"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('imageUrl')} *</label>
            <input
              type="url"
              name="image"
              className="form-control"
              value={formData.image}
              onChange={handleChange}
              required
            />

            {formData.image && (
              <div
                style={{
                  marginTop: '0.85rem',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  maxHeight: '200px',
                  border: '1px solid #ddd',
                }}
              >
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t('description')}</label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to={`/listings/${id}`} className="btn btn-outline">
              {t('cancel')}
            </Link>

            <button type="submit" disabled={saving} className="btn btn-brand">
              <Save size={18} />
              <span>{saving ? t('updating') : t('saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
