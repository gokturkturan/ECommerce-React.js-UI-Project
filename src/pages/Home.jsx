import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Headphones, Shirt, Lamp, Tent, BookOpen } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/api.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { formatPrice } from '../utils/format.js';

const CATEGORY_ICONS = {
  electronics: Headphones,
  clothing: Shirt,
  'home-living': Lamp,
  'sports-outdoors': Tent,
  'books-hobbies': BookOpen,
};

export default function Home() {
  const { data: products = [] } = useGetProductsQuery({ sort: 'newest' });
  const { data: categories = [] } = useGetCategoriesQuery();

  const newest = products.slice(0, 8);
  const featured = products[0];

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow">Fall collection</span>
            <h1>Everyday essentials, all in one place.</h1>
            <p className="hero__lead">
              Discover carefully selected products, from electronics to home decor. Fast delivery,
              easy returns.
            </p>
            <div className="hero__ctas">
              <Link to="/products" className="btn btn--primary btn--lg">
                Start shopping <ArrowRight size={18} />
              </Link>
              <Link to="/categories/electronics" className="btn btn--outline btn--lg">
                Electronics
              </Link>
            </div>
          </div>

          {featured && (
            <Link to={`/products/${featured.id}`} className="hero__feature">
              <ProductImage product={featured} size="lg" />
              <div className="hero__feature-info">
                <span className="subtle">Featured</span>
                <strong>{featured.name}</strong>
                <span className="price">{formatPrice(featured.price)}</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Categories</h2>
          <Link to="/products" className="link-arrow">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? BookOpen;
            const count = products.filter((p) => p.category?.id === c.id).length;
            return (
              <Link key={c.id} to={`/categories/${c.slug}`} className="category-tile">
                <span className="category-tile__icon"><Icon size={22} strokeWidth={1.6} /></span>
                <span className="category-tile__name">{c.name}</span>
                <span className="subtle">{count} products</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>New arrivals</h2>
          <Link to="/products?sort=newest" className="link-arrow">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {newest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="perks">
          <div className="perk">
            <Truck size={22} />
            <div>
              <strong>Free shipping</strong>
              <p className="muted">On orders over $50</p>
            </div>
          </div>
          <div className="perk">
            <RotateCcw size={22} />
            <div>
              <strong>14-day returns</strong>
              <p className="muted">Free, no-questions-asked returns</p>
            </div>
          </div>
          <div className="perk">
            <ShieldCheck size={22} />
            <div>
              <strong>Secure payment</strong>
              <p className="muted">Protected with 256-bit SSL</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
