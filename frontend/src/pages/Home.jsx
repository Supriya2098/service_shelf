import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ServiceCard from '../components/ServiceCard';

export default function Home() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/services?search=${encodeURIComponent(search)}`;
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Book Trusted Home Services<br />Across India</h1>
          <p>AC repair, deep cleaning, plumbing, salon at home, pest control and more — verified professionals at your doorstep.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input placeholder="Search services... e.g. AC repair, cleaning" value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Popular Categories</h2>
          <div className="category-pills">
            {categories.map(c => (
              <Link key={c.slug} to={`/services?category=${c.slug}`} className="category-pill">
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Top Rated Services</h2>
            <Link to="/services" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="service-grid">
            {services.slice(0, 6).map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Why Choose SERVICE SHELF?</h2>
          <div className="stats-grid">
            {[
              { icon: '✅', title: 'Verified Pros', desc: 'Background-checked service professionals' },
              { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges, upfront quotes' },
              { icon: '📅', title: 'Easy Booking', desc: 'Pick date & time slot in seconds' },
              { icon: '🛡️', title: 'Service Warranty', desc: '30-day warranty on all services' },
            ].map(f => (
              <div key={f.title} className="stat-card">
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
