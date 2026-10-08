import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from '../store/api.js';
import ProductImage from '../components/ProductImage.jsx';
import { QuantityStepper, EmptyState } from '../components/ui.jsx';
import { formatPrice, FREE_SHIPPING_LIMIT, SHIPPING_FEE } from '../utils/format.js';
import { useAuth } from '../hooks/useAuth.js';

export function OrderSummary({ subtotal, shipping, total, children }) {
  return (
    <aside className="summary card">
      <h3>Order summary</h3>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</span>
      </div>
      {shipping > 0 && (
        <p className="summary__hint">
          Add {formatPrice(FREE_SHIPPING_LIMIT - subtotal)} more to get free shipping.
        </p>
      )}
      <div className="summary-row summary-row--total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      {children}
    </aside>
  );
}

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();
  const navigate = useNavigate();

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (isLoading) return null;

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          text="You haven't added any products yet."
          action={<Link to="/products" className="btn btn--primary">Start shopping</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Your cart</h1>
          <p>{items.length} items</p>
        </div>
        <button className="btn btn--ghost" onClick={() => clearCart()}>
          <Trash2 size={16} /> Empty cart
        </button>
      </div>

      <div className="two-col">
        <div className="card cart-list">
          {items.map((item) => (
            <div key={item.id} className="cart-row">
              <ProductImage product={item.product} size="sm" />
              <div className="cart-row__info">
                <span className="subtle cart-row__cat">{item.product.category?.name}</span>
                <Link to={`/products/${item.product.id}`} className="cart-row__name">
                  {item.product.name}
                </Link>
                <span className="subtle">Unit price: {formatPrice(item.product.price)}</span>
              </div>
              <QuantityStepper
                value={item.quantity}
                max={item.product.stock}
                onChange={(q) => updateCartItem({ id: item.id, quantity: q })}
              />
              <span className="price cart-row__total">
                {formatPrice(item.product.price * item.quantity)}
              </span>
              <button
                className="icon-btn icon-btn--ghost"
                onClick={() => removeCartItem(item.id)}
                aria-label={`Remove ${item.product.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <Link to="/products" className="link-arrow cart-list__back">
            <ArrowLeft size={16} /> Continue shopping
          </Link>
        </div>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          <button className="btn btn--primary btn--block btn--lg" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </OrderSummary>
      </div>
    </div>
  );
}
