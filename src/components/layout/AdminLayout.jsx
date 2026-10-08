import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Receipt, Store, LogOut, Menu, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth.js';
import { useLogoutMutation } from '../../store/api.js';
import { clearCredentials } from '../../store/authSlice.js';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: Receipt },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await logoutMutation(refreshToken).unwrap();
      } catch {
        // token may already be invalid/expired — proceed with local logout regardless
      }
    }
    dispatch(clearCredentials());
    navigate('/');
  };

  return (
    <div className={`admin ${open ? 'admin--nav-open' : ''}`}>
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <Link to="/admin" className="logo">
            <span className="logo__mark">V</span>
            <span className="logo__text">vitrin</span>
          </Link>
          <span className="chip chip--accent">Admin</span>
        </div>

        <nav className="admin__nav" aria-label="Admin">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__sidebar-foot">
          <Link to="/" className="admin__nav-link">
            <Store size={18} /> Back to store
          </Link>
          <button className="admin__nav-link" onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
          <div className="admin__user">
            <span className="avatar">{user?.email?.[0]?.toUpperCase()}</span>
            <span className="admin__user-email">{user?.email}</span>
          </div>
        </div>
      </aside>

      <div className="admin__main">
        <header className="admin__topbar">
          <button
            className="icon-btn admin__menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="subtle">Admin panel</span>
        </header>
        <div className="admin__content">
          <Outlet />
        </div>
      </div>
      <div className="admin__scrim" onClick={() => setOpen(false)} />
    </div>
  );
}
