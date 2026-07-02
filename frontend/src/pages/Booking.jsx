import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getServiceImage } from '../utils/serviceImages';

export default function Booking() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [date, setDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getService(slug).then(setService).catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    api.getSlots(slug, dateStr).then(data => setSlots(data.available)).catch(console.error);
    setSelectedSlot('');
  }, [date, slug]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !selectedSlot) { setError('Please select a date and time slot'); return; }
    setLoading(true);
    setError('');

    try {
      const { booking } = await api.createBooking({
        serviceId: service.id,
        bookingDate: date.toISOString().split('T')[0],
        timeSlot: selectedSlot,
        address, city, phone, notes,
      });
      navigate(`/payment/${booking.booking_ref}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!service) return <div className="loading">Loading...</div>;

  return (
    <div className="container booking-layout">
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Book {service.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Select date, time and enter your details</p>

        {error && <div className="alert alert-error">{error}</div>}

        <h3 style={{ marginBottom: 12 }}>Select Date</h3>
        <Calendar
          onChange={setDate}
          value={date}
          minDate={tomorrow}
          maxDate={maxDate}
          tileDisabled={({ date: d }) => d.getDay() === 0}
        />

        {date && (
          <>
            <h3 style={{ margin: '24px 0 12px' }}>Select Time Slot</h3>
            {slots.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No slots available for this date. Try another date.</p>
            ) : (
              <div className="time-slots">
                {slots.map(slot => (
                  <button key={slot} type="button"
                    className={`time-slot ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Your Details</h3>
          <div className="form-group">
            <label>Service Address</label>
            <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} required placeholder="Flat/House no, Building, Street" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>City</label>
              <select value={city} onChange={e => setCity(e.target.value)}>
                {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !selectedSlot} style={{ width: '100%' }}>
            {loading ? 'Creating Booking...' : `Proceed to Pay ₹${service.price.toLocaleString('en-IN')}`}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, position: 'sticky', top: 80, height: 'fit-content' }}>
        <h3 style={{ marginBottom: 16 }}>Booking Summary</h3>
        <img src={getServiceImage(service.slug)} alt={service.name} className="booking-summary-img" />
        <h4>{service.name}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0 16px' }}>{service.short_description}</p>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Date</span><span>{date ? date.toLocaleDateString('en-IN') : '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Time</span><span>{selectedSlot || '—'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Duration</span><span>{service.duration_minutes} mins</span>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
          <span>Total</span><span className="price">₹{service.price.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
