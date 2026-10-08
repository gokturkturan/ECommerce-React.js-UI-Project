import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth.js';
import { useGetCategoriesQuery, useGetCartQuery } from '../../store/api.js';
import { openCartDrawer } from '../../store/uiSlice.js';

export default function Header() {
  const dispatch = useDispatch();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const count = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const onSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products');
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="announcement">
        Free shipping on orders over $50 · Easy returns within 14 days
      </div>
      <div className="container site-header__row">
        <button
          className="icon-btn site-header__menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="logo" aria-label="Vitrin home">
          <span className="logo__mark">V</span>
          <span className="logo__text">vitrin</span>
        </Link>

        <form className="search" role="search" onSubmit={onSearch}>
          <Search size={18} className="search__icon" aria-hidden="true" />
          <label htmlFor="site-search" className="visually-hidden">
            Search products
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="Search products or categories"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav className="site-header__actions" aria-label="Account">
          {isAdmin && (
            <Link to="/admin" className="header-link">
              <LayoutDashboard size={20} />
              <span>Admin</span>
            </Link>
          )}
          <Link to={user ? '/account' : '/login'} className="header-link">
            <User size={20} />
            <span>{user ? 'Account' : 'Sign in'}</span>
          </Link>
          <button
            className="header-link cart-btn"
            onClick={() => dispatch(openCartDrawer())}
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={20} />
            <span>Cart</span>
            {count > 0 && <span className="cart-btn__count">{count}</span>}
          </button>
        </nav>
      </div>

      <nav className={`category-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Categories">
        <div className="container category-nav__inner">
          <NavLink to="/products" end onClick={() => setMenuOpen(false)}>
            All products
          </NavLink>
          {categories.map((c) => (
            <NavLink key={c.id} to={`/categories/${c.slug}`} onClick={() => setMenuOpen(false)}>
              {c.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
