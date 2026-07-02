import { useState, useEffect } from 'react';
import { api } from '../api/client';

const statusBadge = {
  pending: 'badge-warning', confirmed: 'badge-success', in_progress: 'badge-info',
  completed: 'badge-primary', cancelled: 'badge-danger',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.adminStats(),
      api.adminBookings(filter || undefined),
      api.adminServices(),
    ]).then(([s, b, sv]) => {
      setStats(s); setBookings(b); setServices(sv);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (ref, status) => {
    try {
      await api.adminUpdateStatus(ref, status);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleService = async (id) => {
    try {
      await api.adminToggleService(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && !stats) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage bookings, services and view platform stats</p>
      </div>

      <div className="category-pills" style={{ marginBottom: 24 }}>
        {['overview', 'bookings', 'services'].map(t => (
          <button key={t} className={`category-pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="value">{stats.totalBookings}</div><div className="label">Total Bookings</div></div>
          <div className="stat-card"><div className="value">{stats.pendingBookings}</div><div className="label">Pending</div></div>
          <div className="stat-card"><div className="value">{stats.confirmedBookings}</div><div className="label">Confirmed</div></div>
          <div className="stat-card"><div className="value">{stats.completedBookings}</div><div className="label">Completed</div></div>
          <div className="stat-card"><div className="value">₹{stats.totalRevenue?.toLocaleString('en-IN')}</div><div className="label">Revenue</div></div>
          <div className="stat-card"><div className="value">{stats.totalCustomers}</div><div className="label">Customers</div></div>
        </div>
      )}

      {tab === 'bookings' && (
        <>
          <div className="category-pills" style={{ marginBottom: 16 }}>
            {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`category-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th><th>Customer</th><th>Service</th><th>Date</th><th>Amount</th>
                  <th>Status</th><th>Payment</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_ref}</strong></td>
                    <td>{b.customer_name}<br /><small style={{ color: 'var(--text-muted)' }}>{b.customer_phone}</small></td>
                    <td>{b.service_name}</td>
                    <td>{new Date(b.booking_date).toLocaleDateString('en-IN')}<br /><small>{b.time_slot}</small></td>
                    <td>₹{b.total_amount?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusBadge[b.status]}`}>{b.status}</span></td>
                    <td><span className={`badge ${b.payment_status === 'success' ? 'badge-success' : 'badge-warning'}`}>{b.payment_status || 'pending'}</span></td>
                    <td>
                      <select value={b.status} onChange={e => updateStatus(b.booking_ref, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'services' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Service</th><th>Category</th><th>Price</th><th>Rating</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.category_name}</td>
                  <td>₹{s.price?.toLocaleString('en-IN')}</td>
                  <td>★ {s.rating}</td>
                  <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleService(s.id)}>
                      {s.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
