import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>SERVICE SHELF</h3>
            <p>India's trusted platform for home services. Book AC repair, cleaning, plumbing, salon at home and more — at your doorstep.</p>
          </div>
          <div>
            <h3>Services</h3>
            <Link to="/services?category=home-services">Home Services</Link>
            <Link to="/services?category=appliance-repair">Appliance Repair</Link>
            <Link to="/services?category=beauty-wellness">Beauty & Wellness</Link>
            <Link to="/services?category=electrical-plumbing">Electrical & Plumbing</Link>
          </div>
          <div>
            <h3>Support</h3>
            <a href="mailto:support@serviceshelf.in">support@serviceshelf.in</a>
            <a href="tel:+919876543210">+91 98765 43210</a>
            <p style={{ marginTop: 8 }}>Mon–Sat, 8 AM – 8 PM IST</p>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 SERVICE SHELF. Built for Full Stack Development Week 7–8.
        </div>
      </div>
    </footer>
  );
}
