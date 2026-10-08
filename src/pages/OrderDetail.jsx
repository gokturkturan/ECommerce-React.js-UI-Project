import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, CreditCard, Truck, XCircle, PackageX } from 'lucide-react';
import { useGetOrderQuery, usePayOrderMutation, useCancelOrderMutation } from '../store/api.js';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { StatusBadge, EmptyState } from '../components/ui.jsx';
import { formatPrice, formatDateTime, shortId } from '../utils/format.js';

const STEPS = [
  { key: 'pending', label: 'Order placed', icon: Clock },
  { key: 'paid', label: 'Payment confirmed', icon: CreditCard },
  { key: 'shipped', label: 'Shipped', icon: Truck },
];

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { data: order, isLoading, error } = useGetOrderQuery(id);
  const [payOrder] = usePayOrderMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const toast = useToast();

  if (isLoading) return null;

  if (error || !order) {
    return (
      <div className="container page">
        <EmptyState
          icon={PackageX}
          title="No orders found"
          action={<Link to="/orders" className="btn btn--primary">Back to my orders</Link>}
        />
      </div>
    );
  }

  const cancelled = order.status === 'cancelled';
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="container page page--narrow">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/orders">My orders</Link> <span>/</span> <span>#{shortId(order.id)}</span>
      </nav>

      {state?.justPlaced && (
        <div className="alert alert--success">
          <CheckCircle2 size={20} />
          <div>
            <strong>Thank you! Your order has been placed.</strong>
            <p>You can track your order status on this page.</p>
          </div>
        </div>
      )}

      <div className="page-head">
        <div>
          <h1>Order #{shortId(order.id)}</h1>
          <p>{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="card">
        {cancelled ? (
          <div className="timeline-cancelled">
            <XCircle size={22} />
            <span>This order was cancelled.</span>
          </div>
        ) : (
          <ol className="timeline">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const state_ = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : 'todo';
              return (
                <li key={s.key} className={`timeline__step is-${state_}`}>
                  <span className="timeline__dot"><Icon size={16} /></span>
                  <span>{s.label}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {order.shippingAddress && (
        <section className="card">
          <h3>Shipping address</h3>
          <p>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.district}
            <br />
            {order.shippingAddress.phone} · {order.shippingAddress.email}
          </p>
        </section>
      )}

      <section className="card order-items">
        <h3>Items</h3>
        <ul>
          {order.items.map((i) => (
            <li key={i.id} className="order-line">
              <ProductImage product={i.product} size="sm" />
              <div className="order-line__info">
                <Link to={`/products/${i.product?.id}`}>{i.productName}</Link>
                <span className="subtle">{i.quantity} × {formatPrice(i.unitPrice)}</span>
              </div>
              <span className="price">{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="summary-row summary-row--total">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </section>

      {order.status === 'pending' && (
        <div className="order-actions">
          <button
            className="btn btn--primary"
            onClick={async () => {
              try {
                await payOrder(order.id).unwrap();
                toast('Payment received');
              } catch {
                toast('Payment failed', 'error');
              }
            }}
          >
            <CreditCard size={16} /> Pay now
          </button>
          <button
            className="btn btn--danger-outline"
            onClick={async () => {
              try {
                await cancelOrder(order.id).unwrap();
                toast('Order cancelled', 'error');
              } catch {
                toast('Could not cancel the order', 'error');
              }
            }}
          >
            Cancel order
          </button>
        </div>
      )}
    </div>
  );
}
