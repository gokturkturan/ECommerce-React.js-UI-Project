import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCartDrawer } from '../../store/uiSlice.js';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation } from '../../store/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import ProductImage from '../ProductImage.jsx';
import { QuantityStepper, EmptyState } from '../ui.jsx';
import { formatPrice, FREE_SHIPPING_LIMIT } from '../../utils/format.js';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const drawerOpen = useSelector((state) => state.ui.cartDrawerOpen);
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const items = cart?.items ?? [];
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const remaining = Math.max(0, FREE_SHIPPING_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_LIMIT) * 100);

  const close = () => dispatch(closeCartDrawer());

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <>
      <div className={`drawer-backdrop ${drawerOpen ? 'is-open' : ''}`} onClick={close} />
      <aside
        className={`drawer ${drawerOpen ? 'is-open' : ''}`}
        aria-hidden={!drawerOpen}
        aria-label="Cart"
      >
        <div className="drawer__head">
          <h3>Your cart {count > 0 && <span className="subtle">({count})</span>}</h3>
          <button className="icon-btn" onClick={close} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              text="Add products you like to your cart to get started."
              action={
                <button className="btn btn--primary" onClick={() => go('/products')}>
                  Browse products
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="shipping-progress">
              <p>
                {remaining > 0 ? (
                  <>Add <strong>{formatPrice(remaining)}</strong> more for free shipping</>
                ) : (
                  <strong>You get free shipping</strong>
                )}
              </p>
              <div className="progress"><span style={{ width: `${progress}%` }} /></div>
            </div>

            <ul className="drawer__items">
              {items.map((item) => (
                <li key={item.id} className="mini-item">
                  <ProductImage product={item.product} size="sm" />
                  <div className="mini-item__info">
                    <Link to={`/products/${item.product.id}`} onClick={close} className="mini-item__name">
                      {item.product.name}
                    </Link>
                    <span className="price price--sm">{formatPrice(item.product.price)}</span>
                    <div className="mini-item__row">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={item.product.stock}
                        onChange={(q) => updateCartItem({ id: item.id, quantity: q })}
                      />
                      <button
                        className="icon-btn icon-btn--ghost"
                        onClick={() => removeCartItem(item.id)}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="drawer__foot">
              <div className="summary-row summary-row--total">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="subtle drawer__note">Shipping is calculated at checkout.</p>
              <button className="btn btn--primary btn--block btn--lg" onClick={() => go('/checkout')}>
                Proceed to checkout
              </button>
              <button className="btn btn--ghost btn--block" onClick={() => go('/cart')}>
                View cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
