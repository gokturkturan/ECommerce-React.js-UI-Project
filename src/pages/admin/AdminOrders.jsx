import { Fragment, useState } from 'react';
import { Truck, ChevronDown, ChevronUp } from 'lucide-react';
import { useGetAdminOrdersQuery, useShipOrderMutation } from '../../store/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge } from '../../components/ui.jsx';
import { formatPrice, formatDateTime, shortId, ORDER_STATUS } from '../../utils/format.js';

export default function AdminOrders() {
  const { data: orders = [] } = useGetAdminOrdersQuery();
  const [shipOrder] = useShipOrderMutation();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const list = [...orders]
    .filter((o) => filter === 'all' || o.status === filter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const countOf = (s) => orders.filter((o) => o.status === s).length;

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Orders</h1>
          <p className="muted">You can ship orders that have been paid.</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
          All <span className="tabs__count">{orders.length}</span>
        </button>
        {Object.entries(ORDER_STATUS).map(([key, s]) => (
          <button key={key} role="tab" aria-selected={filter === key} className={filter === key ? 'is-active' : ''} onClick={() => setFilter(key)}>
            {s.label} <span className="tabs__count">{countOf(key)}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th className="num">Items</th>
                <th className="num">Amount</th>
                <th>Status</th>
                <th className="actions"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const isOpen = expanded === o.id;
                return (
                  <Fragment key={o.id}>
                    <tr>
                      <td>
                        <button
                          className="row-toggle"
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          <strong>#{shortId(o.id)}</strong>
                        </button>
                      </td>
                      <td>{o.user?.email}</td>
                      <td className="subtle">{formatDateTime(o.createdAt)}</td>
                      <td className="num">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                      <td className="num">{formatPrice(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="actions">
                        {o.status === 'paid' && (
                          <button
                            className="btn btn--sm btn--outline"
                            onClick={async () => {
                              try {
                                await shipOrder(o.id).unwrap();
                                toast(`#${shortId(o.id)} marked as shipped`);
                              } catch {
                                toast('Could not ship the order', 'error');
                              }
                            }}
                          >
                            <Truck size={14} /> Ship
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="row-detail">
                        <td colSpan={7}>
                          <ul className="row-detail__items">
                            {o.items.map((i) => (
                              <li key={i.id}>
                                <span>{i.productName}</span>
                                <span className="subtle">{i.quantity} × {formatPrice(i.unitPrice)}</span>
                                <span>{formatPrice(i.quantity * i.unitPrice)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={7} className="table-empty">No orders with this status.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
