import { Link, useNavigate } from 'react-router-dom';
import { Receipt, ShoppingBag, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth.js';
import { useGetMyOrdersQuery, useLogoutMutation } from '../store/api.js';
import { clearCredentials } from '../store/authSlice.js';
import { StatusBadge } from '../components/ui.jsx';
import { formatDate, formatPrice, shortId } from '../utils/format.js';

export default function Account() {
  const { user, isAdmin } = useAuth();
  const { data: orders = [] } = useGetMyOrdersQuery();
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const last = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  const handleLogout = async () => {
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
    <div className="container page page--narrow">
      <div className="page-head">
        <div className="account-head">
          <span className="avatar avatar--lg">{user.email[0].toUpperCase()}</span>
          <div>
            <h1>My account</h1>
            <p>{user.email} · Member since {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <button className="btn btn--outline" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <div className="account-grid">
        <Link to="/orders" className="card account-link">
          <Receipt size={22} />
          <div>
            <strong>My orders</strong>
            <span className="subtle">{orders.length} orders</span>
          </div>
          <ChevronRight size={18} className="subtle" />
        </Link>
        <Link to="/cart" className="card account-link">
          <ShoppingBag size={22} />
          <div>
            <strong>My cart</strong>
            <span className="subtle">View your cart</span>
          </div>
          <ChevronRight size={18} className="subtle" />
        </Link>
        {isAdmin && (
          <Link to="/admin" className="card account-link">
            <LayoutDashboard size={22} />
            <div>
              <strong>Admin panel</strong>
              <span className="subtle">Products, categories and orders</span>
            </div>
            <ChevronRight size={18} className="subtle" />
          </Link>
        )}
      </div>

      {last && (
        <section className="card">
          <div className="section__head section__head--tight">
            <h3>Your latest order</h3>
            <Link to={`/orders/${last.id}`} className="link-arrow">Details <ChevronRight size={16} /></Link>
          </div>
          <div className="last-order">
            <span>#{shortId(last.id)}</span>
            <span className="subtle">{formatDate(last.createdAt)}</span>
            <StatusBadge status={last.status} />
            <span className="price">{formatPrice(last.total)}</span>
          </div>
        </section>
      )}
    </div>
  );
}
