import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const statusBadge = {
  pending: 'badge-warning', confirmed: 'badge-success', in_progress: 'badge-info',
  completed: 'badge-primary', cancelled: 'badge-danger',
};

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bookings');

  const load = () => {
    setLoading(true);
    Promise.all([api.getMyBookings(), api.getNotifications()])
      .then(([b, n]) => { setBookings(b); setNotifications(n); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (ref) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.cancelBooking(ref);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Track your bookings and notifications</p>
      </div>

      <div className="category-pills" style={{ marginBottom: 24 }}>
        <button className={`category-pill ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
          Bookings ({bookings.length})
        </button>
        <button className={`category-pill ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
          Notifications ({notifications.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : tab === 'bookings' ? (
        bookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No bookings yet.</p>
            <Link to="/services" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Services</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th><th>Service</th><th>Date</th><th>Time</th>
                  <th>Amount</th><th>Status</th><th>Payment</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_ref}</strong></td>
                    <td>{b.service_name}</td>
                    <td>{new Date(b.booking_date).toLocaleDateString('en-IN')}</td>
                    <td>{b.time_slot}</td>
                    <td>₹{b.total_amount?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusBadge[b.status]}`}>{b.status}</span></td>
                    <td>
                      {b.payment_status === 'success' ? (
                        <span className="badge badge-success">Paid</span>
                      ) : b.status !== 'cancelled' ? (
                        <Link to={`/payment/${b.booking_ref}`} className="btn btn-primary btn-sm">Pay Now</Link>
                      ) : '—'}
                    </td>
                    <td>
                      {!['completed', 'cancelled'].includes(b.status) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(b.booking_ref)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        notifications.length === 0 ? (
          <div className="empty-state"><div className="icon">🔔</div><p>No notifications yet.</p></div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {notifications.map(n => (
              <div key={n.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong>{n.subject || n.type.toUpperCase()}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(n.created_at).toLocaleString('en-IN')}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{n.message}</p>
                <span className={`badge ${n.type === 'email' ? 'badge-info' : n.type === 'sms' ? 'badge-success' : 'badge-primary'}`}>
                  {n.type}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
