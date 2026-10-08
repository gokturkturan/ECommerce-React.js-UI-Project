import { Link } from 'react-router-dom';
import { Wallet, Receipt, Clock, PackageX, ArrowRight } from 'lucide-react';
import { useGetAdminOrdersQuery, useGetProductsQuery } from '../../store/api.js';
import { StatusBadge } from '../../components/ui.jsx';
import ProductImage from '../../components/ProductImage.jsx';
import { formatPrice, formatDate, shortId } from '../../utils/format.js';

export default function Dashboard() {
  const { data: orders = [] } = useGetAdminOrdersQuery();
  const { data: products = [] } = useGetProductsQuery({});

  const revenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .reduce((s, o) => s + o.total, 0);
  const toShip = orders.filter((o) => o.status === 'paid').length;
  const pending = orders.filter((o) => o.status === 'pending').length;
  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  const stats = [
    { label: 'Revenue (paid)', value: formatPrice(revenue), icon: Wallet },
    { label: 'Total orders', value: orders.length, icon: Receipt },
    { label: 'To ship', value: toShip, icon: Clock },
    { label: 'Low / out of stock', value: lowStock.length, icon: PackageX },
  ];

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Overview</h1>
          <p className="muted">The current state of your store.</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="stat card">
            <span className="stat__icon"><Icon size={18} /></span>
            <span className="stat__label">{label}</span>
            <span className="stat__value">{value}</span>
          </div>
        ))}
      </div>

      <div className="admin-two-col">
        <section className="card">
          <div className="section__head section__head--tight">
            <h3>Recent orders</h3>
            <Link to="/admin/orders" className="link-arrow">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...orders]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{shortId(o.id)}</strong></td>
                      <td>{o.user?.email}</td>
                      <td className="subtle">{formatDate(o.createdAt)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="num">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pending > 0 && <p className="subtle table-note">{pending} orders awaiting payment.</p>}
        </section>

        <section className="card">
          <div className="section__head section__head--tight">
            <h3>Stock alerts</h3>
            <Link to="/admin/products" className="link-arrow">Products <ArrowRight size={16} /></Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="muted">All products are well stocked.</p>
          ) : (
            <ul className="stock-list">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <ProductImage product={p} size="sm" />
                  <span className="stock-list__name">{p.name}</span>
                  <span className={`badge ${p.stock === 0 ? 'badge--danger' : 'badge--warning'}`}>
                    {p.stock === 0 ? 'Sold out' : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
