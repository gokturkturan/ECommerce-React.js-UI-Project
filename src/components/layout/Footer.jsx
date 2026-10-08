import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../store/api.js';

export default function Footer() {
  const { data: categories = [] } = useGetCategoriesQuery();
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link to="/" className="logo">
            <span className="logo__mark">V</span>
            <span className="logo__text">vitrin</span>
          </Link>
          <p className="muted site-footer__about">
            Carefully selected products that make everyday life easier.
          </p>
        </div>
        <div>
          <h4>Categories</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/categories/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/account">My account</Link></li>
            <li><Link to="/orders">My orders</Link></li>
            <li><Link to="/cart">My cart</Link></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><a href="#">Shipping & delivery</a></li>
            <li><a href="#">Returns & exchanges</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date().getFullYear()} Vitrin</span>
        <span>Privacy · Terms of use · Cookies</span>
      </div>
    </footer>
  );
}
