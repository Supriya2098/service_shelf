import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">SERVICE <span>SHELF</span></Link>
        <div className="nav-links">
          <Link to="/services" className={isActive('/services')}>Services</Link>
          {user ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>My Bookings</Link>
              {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
              <Link to="/profile" className={isActive('/profile')}>{user.name.split(' ')[0]}</Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
