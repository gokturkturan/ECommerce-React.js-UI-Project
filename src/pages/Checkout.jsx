import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Lock, CreditCard } from 'lucide-react';
import { useGetCartQuery, useCreateOrderMutation, usePayOrderMutation } from '../store/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { Field } from '../components/ui.jsx';
import { formatPrice, FREE_SHIPPING_LIMIT, SHIPPING_FEE } from '../utils/format.js';
import { OrderSummary } from './Cart.jsx';

export default function Checkout() {
  const { data: cart, isLoading } = useGetCartQuery();
  const { user } = useAuth();
  const [createOrder] = useCreateOrderMutation();
  const [payOrder] = usePayOrderMutation();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [payNow, setPayNow] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: user?.email ?? '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  const setField = (key) => (e) =>
    setShippingAddress((a) => ({ ...a, [key]: e.target.value }));

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (isLoading) return null;
  if (items.length === 0 && !submitting) return <Navigate to="/cart" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const order = await createOrder({ shippingAddress }).unwrap();
      if (payNow) await payOrder(order.id).unwrap();
      toast('Your order has been placed');
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch {
      toast('Could not place your order', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/cart">Cart</Link> <span>/</span> <span>Checkout</span>
      </nav>
      <div className="page-head">
        <h1>Checkout</h1>
      </div>

      <form className="two-col" onSubmit={onSubmit}>
        <div className="checkout-steps">
          <section className="card checkout-step">
            <div className="checkout-step__head">
              <span className="step-num">1</span>
              <h3>Shipping address</h3>
            </div>
            <div className="form-grid">
              <Field label="First name" id="firstName">
                <input id="firstName" className="input" required autoComplete="given-name"
                  value={shippingAddress.firstName} onChange={setField('firstName')} />
              </Field>
              <Field label="Last name" id="lastName">
                <input id="lastName" className="input" required autoComplete="family-name"
                  value={shippingAddress.lastName} onChange={setField('lastName')} />
              </Field>
              <Field label="Email" id="email">
                <input id="email" className="input" type="email" required autoComplete="email"
                  value={shippingAddress.email} onChange={setField('email')} />
              </Field>
              <Field label="Phone" id="phone">
                <input id="phone" className="input" type="tel" placeholder="(555) 123-4567" required autoComplete="tel"
                  value={shippingAddress.phone} onChange={setField('phone')} />
              </Field>
              <div className="form-grid__full">
                <Field label="Address" id="address">
                  <textarea id="address" className="input" rows={3} required autoComplete="street-address"
                    value={shippingAddress.address} onChange={setField('address')} />
                </Field>
              </div>
              <Field label="City" id="city">
                <input id="city" className="input" required autoComplete="address-level1"
                  value={shippingAddress.city} onChange={setField('city')} />
              </Field>
              <Field label="State / ZIP" id="district">
                <input id="district" className="input" required autoComplete="address-level2"
                  value={shippingAddress.district} onChange={setField('district')} />
              </Field>
            </div>
          </section>

          <section className="card checkout-step">
            <div className="checkout-step__head">
              <span className="step-num">2</span>
              <h3>Payment</h3>
            </div>
            <div className="pay-options">
              <label className={`pay-option ${payNow ? 'is-active' : ''}`}>
                <input type="radio" name="pay" checked={payNow} onChange={() => setPayNow(true)} />
                <CreditCard size={20} />
                <span>
                  <strong>Credit / debit card</strong>
                  <span className="subtle">Pay for the order now</span>
                </span>
              </label>
              <label className={`pay-option ${!payNow ? 'is-active' : ''}`}>
                <input type="radio" name="pay" checked={!payNow} onChange={() => setPayNow(false)} />
                <Lock size={20} />
                <span>
                  <strong>Pay later</strong>
                  <span className="subtle">The order is created as "awaiting payment"</span>
                </span>
              </label>
            </div>

            {payNow && (
              <div className="form-grid">
                <div className="form-grid__full">
                  <Field label="Name on card" id="cardName"><input id="cardName" className="input" required autoComplete="cc-name" /></Field>
                </div>
                <div className="form-grid__full">
                  <Field label="Card number" id="cardNumber">
                    <input id="cardNumber" className="input" inputMode="numeric" placeholder="0000 0000 0000 0000" required autoComplete="cc-number" />
                  </Field>
                </div>
                <Field label="Expiry" id="exp"><input id="exp" className="input" placeholder="MM/YY" required autoComplete="cc-exp" /></Field>
                <Field label="CVC" id="cvc"><input id="cvc" className="input" inputMode="numeric" placeholder="123" required autoComplete="cc-csc" /></Field>
              </div>
            )}
          </section>
        </div>

        <OrderSummary subtotal={subtotal} shipping={shipping} total={total}>
          <ul className="summary__items">
            {items.map((i) => (
              <li key={i.id}>
                <ProductImage product={i.product} size="sm" />
                <span className="summary__item-name">
                  {i.product.name}
                  <span className="subtle"> × {i.quantity}</span>
                </span>
                <span>{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : payNow ? `Pay ${formatPrice(total)}` : 'Place order'}
          </button>
          <p className="summary__secure subtle"><Lock size={14} /> Your payment details are encrypted</p>
        </OrderSummary>
      </form>
    </div>
  );
}
