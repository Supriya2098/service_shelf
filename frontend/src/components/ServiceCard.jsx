import { memo } from 'react';
import { Link } from 'react-router-dom';
import { getServiceImage } from '../utils/serviceImages';

function ServiceCard({ service }) {
  const image = getServiceImage(service.slug);

  return (
    <Link to={`/services/${service.slug}`} className="card">
      <div className="card-img">
        <img src={image} alt={service.name} loading="lazy" decoding="async" width="400" height="200" />
      </div>
      <div className="card-body">
        <span className="badge badge-primary">{service.category_name}</span>
        <h3 style={{ margin: '10px 0 6px', fontSize: '1.1rem' }}>{service.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
          {service.short_description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="price">₹{service.price.toLocaleString('en-IN')}</span>
          <span className="rating">★ {service.rating} ({service.review_count})</span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ServiceCard);
