import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { formatPrice } from '../utils/format.js';
import { useAddCartItemMutation } from '../store/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product }) {
  const [addCartItem] = useAddCartItemMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    try {
      await addCartItem({ productId: product.id, quantity: 1 }).unwrap();
      toast(`${product.name} added to cart`);
    } catch {
      toast('Could not add to cart', 'error');
    }
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__media">
        <ProductImage product={product} />
        {outOfStock && <span className="chip chip--dark product-card__flag">Sold out</span>}
        {lowStock && <span className="chip chip--warning product-card__flag">Only {product.stock} left</span>}
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category?.name}</span>
        <Link to={`/products/${product.id}`} className="product-card__name">
          {product.name}
        </Link>
        <div className="product-card__footer">
          <span className="price">{formatPrice(product.price)}</span>
          <button
            className="icon-btn icon-btn--accent"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
