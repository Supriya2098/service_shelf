import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getServiceImage } from '../utils/serviceImages';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getService(slug).then(setService).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  const handleBook = () => {
    if (!user) { navigate('/login', { state: { from: `/booking/${slug}` } }); return; }
    navigate(`/booking/${slug}`);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!service) return <div className="empty-state"><p>Service not found</p></div>;

  const image = getServiceImage(service.slug);

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div style={{ padding: '32px 0' }}>
        <Link to="/services" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Back to Services</Link>
      </div>

      <div className="service-detail-grid">
        <div className="card service-detail-image">
          <img src={image} alt={service.name} />
          <span className="badge badge-primary" style={{ position: 'absolute', bottom: 16, left: 16 }}>{service.category_name}</span>
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>{service.name}</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="rating">★ {service.rating}</span>
            <span style={{ color: 'var(--text-muted)' }}>{service.review_count} reviews</span>
            <span style={{ color: 'var(--text-muted)' }}>⏱ {service.duration_minutes} mins</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>{service.description}</p>

          <div className="price" style={{ marginBottom: 24 }}>₹{service.price.toLocaleString('en-IN')} <small>onwards</small></div>

          {service.features?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ marginBottom: 12 }}>What's Included</h3>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
                {service.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="btn btn-primary btn-lg" onClick={handleBook} style={{ width: '100%' }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
