import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';

export default function StoreLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="store">
      <Header />
      <main className="store__main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
