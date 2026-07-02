import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ServiceCard from '../components/ServiceCard';

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    api.getServices(params).then(setServices).catch(console.error).finally(() => setLoading(false));
  }, [category, search]);

  const setCategory = (slug) => {
    const p = new URLSearchParams(searchParams);
    if (slug) p.set('category', slug); else p.delete('category');
    setSearchParams(p);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>All Services</h1>
        <p>{services.length} services available across India</p>
      </div>

      <div className="category-pills">
        <button className={`category-pill ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
        {categories.map(c => (
          <button key={c.slug} className={`category-pill ${category === c.slug ? 'active' : ''}`} onClick={() => setCategory(c.slug)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {search && <p style={{ marginBottom: 20, color: 'var(--text-muted)' }}>Results for "<strong>{search}</strong>"</p>}

      {loading ? (
        <div className="loading">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="empty-state"><div className="icon">🔍</div><p>No services found. Try a different search.</p></div>
      ) : (
        <div className="service-grid" style={{ paddingBottom: 60 }}>
          {services.map(s => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
