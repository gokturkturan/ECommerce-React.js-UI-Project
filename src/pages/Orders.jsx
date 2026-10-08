import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, ChevronRight } from 'lucide-react';
import { useGetMyOrdersQuery } from '../store/api.js';
import ProductImage from '../components/ProductImage.jsx';
import { StatusBadge, EmptyState } from '../components/ui.jsx';
import { formatPrice, formatDate, shortId, ORDER_STATUS } from '../utils/format.js';

export default function Orders() {
  const { data: orders = [], isLoading } = useGetMyOrdersQuery();
  const [filter, setFilter] = useState('all');

  const list = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (isLoading) return null;

  return (
    <div className="container page page--narrow">
      <div className="page-head">
        <div>
          <h1>My orders</h1>
          <p>{orders.length} orders</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
          All
        </button>
        {Object.entries(ORDER_STATUS).map(([key, s]) => (
          <button key={key} role="tab" aria-selected={filter === key} className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)}>
            {s.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No orders found"
          text="You have no orders matching this filter."
          action={<Link to="/products" className="btn btn--primary">Start shopping</Link>}
        />
      ) : (
        <ul className="order-list">
          {list.map((o) => (
            <li key={o.id}>
              <Link to={`/orders/${o.id}`} className="order-card card">
                <div className="order-card__head">
                  <div>
                    <strong>#{shortId(o.id)}</strong>
                    <span className="subtle"> · {formatDate(o.createdAt)}</span>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="order-card__body">
                  <div className="thumb-stack">
                    {o.items.slice(0, 3).map((i) => (
                      <ProductImage key={i.id} product={i.product} size="sm" />
                    ))}
                  </div>
                  <span className="muted order-card__names">
                    {o.items.map((i) => i.productName).join(', ')}
                  </span>
                  <span className="price">{formatPrice(o.total)}</span>
                  <ChevronRight size={18} className="subtle" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
