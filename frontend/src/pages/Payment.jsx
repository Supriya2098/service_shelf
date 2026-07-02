import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Payment() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getBooking(ref).then(setBooking).catch(console.error);
  }, [ref]);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      await api.demoPay({ bookingRef: ref, method });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return <div className="loading">Loading...</div>;

  if (success) {
    return (
      <div className="container" style={{ maxWidth: 500, padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
        <h1 style={{ marginBottom: 8 }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Your booking {ref} is confirmed. Redirecting to dashboard...
        </p>
        <div className="alert alert-info">Email & SMS notifications have been sent (demo mode).</div>
      </div>
    );
  }

  if (booking.payment_status === 'success') {
    return (
      <div className="container" style={{ maxWidth: 500, padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h1>Already Paid</h1>
        <p style={{ color: 'var(--text-muted)' }}>This booking has already been paid.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 20 }}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 560, padding: '40px 20px 60px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 8 }}>Complete Payment</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 32 }}>Booking: {ref}</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="payment-demo">
        <span className="demo-badge">DEMO MODE</span>
        <h2 style={{ marginBottom: 8 }}>₹{booking.total_amount?.toLocaleString('en-IN')}</h2>
        <p style={{ opacity: 0.8, marginBottom: 8 }}>{booking.service_name}</p>
        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>No real money will be charged</p>

        <div className="payment-methods">
          {[
            { id: 'upi', label: '📱 UPI' },
            { id: 'card', label: '💳 Card' },
            { id: 'netbanking', label: '🏦 Net Banking' },
            { id: 'wallet', label: '👛 Wallet' },
          ].map(m => (
            <button key={m.id} className={`payment-method ${method === m.id ? 'selected' : ''}`}
              onClick={() => setMethod(m.id)}>{m.label}</button>
          ))}
        </div>

        <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Processing...' : `Pay ₹${booking.total_amount?.toLocaleString('en-IN')} (Demo)`}
        </button>
      </div>

      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <h4 style={{ marginBottom: 12 }}>Booking Details</h4>
        <div style={{ display: 'grid', gap: 8, fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date</span>
            <span>{new Date(booking.booking_date).toLocaleDateString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Time</span><span>{booking.time_slot}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Address</span>
            <span>{booking.address}, {booking.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
