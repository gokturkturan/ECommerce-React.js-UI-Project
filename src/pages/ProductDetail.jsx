import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Check, PackageX } from 'lucide-react';
import { useGetProductQuery, useGetProductsQuery, useAddCartItemMutation } from '../store/api.js';
import { openCartDrawer } from '../store/uiSlice.js';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { QuantityStepper, EmptyState } from '../components/ui.jsx';
import { formatPrice } from '../utils/format.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const { data: related = [] } = useGetProductsQuery(
    { categoryId: product?.category?.id },
    { skip: !product?.category?.id },
  );
  const [addCartItem] = useAddCartItemMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  if (isLoading) return null;

  if (error || !product) {
    return (
      <div className="container page">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          text="The product may have been removed or the link may be broken."
          action={<Link to="/products" className="btn btn--primary">Back to products</Link>}
        />
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  const add = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }
    try {
      await addCartItem({ productId: product.id, quantity: qty }).unwrap();
      toast(`${qty} × ${product.name} added to cart`);
    } catch {
      toast('Could not add to cart', 'error');
    }
  };

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span>
        <Link to={`/categories/${product.category?.slug}`}>{product.category?.name}</Link> <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="pdp">
        <div className="pdp__gallery">
          <ProductImage product={product} size="lg" />
        </div>

        <div className="pdp__info">
          <Link to={`/categories/${product.category?.slug}`} className="eyebrow">
            {product.category?.name}
          </Link>
          <h1 className="pdp__title">{product.name}</h1>
          <div className="pdp__price">{formatPrice(product.price)}</div>

          <div className="pdp__stock">
            {outOfStock ? (
              <span className="badge badge--danger">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge badge--warning">Only {product.stock} left</span>
            ) : (
              <span className="badge badge--success"><Check size={14} /> In stock</span>
            )}
          </div>

          <p className="pdp__desc">{product.description}</p>

          <div className="pdp__buy">
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
            <button className="btn btn--primary btn--lg pdp__add" onClick={add} disabled={outOfStock}>
              {outOfStock ? 'Sold out' : 'Add to cart'}
            </button>
          </div>
          {!outOfStock && (
            <button
              className="btn btn--ghost btn--block"
              onClick={async () => {
                await add();
                dispatch(openCartDrawer());
              }}
            >
              Add and view cart
            </button>
          )}

          <ul className="pdp__perks">
            <li><Truck size={18} /> Free shipping over $50, delivered in 1–3 business days</li>
            <li><RotateCcw size={18} /> Free returns within 14 days</li>
            <li><ShieldCheck size={18} /> Secure payment</li>
          </ul>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="section__head">
            <h2>You may also like</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
