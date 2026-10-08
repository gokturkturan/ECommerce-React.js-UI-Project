import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, SearchX, X } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { EmptyState } from '../components/ui.jsx';

const SORTS = {
  newest: { label: 'Newest' },
  'price-asc': { label: 'Price: low to high' },
  'price-desc': { label: 'Price: high to low' },
  name: { label: 'Name (A-Z)' },
};

export default function Products() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: allProducts = [] } = useGetProductsQuery({});
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const inStock = params.get('stock') === '1';
  const minPrice = params.get('min') ?? '';
  const maxPrice = params.get('max') ?? '';

  const category = categories.find((c) => c.slug === slug);

  const queryArgs = useMemo(
    () => ({
      ...(q && { search: q }),
      ...(category && { categoryId: category.id }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(inStock && { inStock: true }),
      sort,
    }),
    [q, category, minPrice, maxPrice, inStock, sort],
  );

  const { data: results = [], isLoading } = useGetProductsQuery(queryArgs);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null || value === false) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const title = category ? category.name : q ? `Results for "${q}"` : 'All products';
  const hasFilters = inStock || minPrice || maxPrice || q;

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span>/</span>
        {category ? (
          <>
            <Link to="/products">Products</Link> <span>/</span> <span>{category.name}</span>
          </>
        ) : (
          <span>Products</span>
        )}
      </nav>

      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{results.length} products</p>
        </div>
        <div className="toolbar">
          <button className="btn btn--outline filters-toggle" onClick={() => setFiltersOpen((o) => !o)}>
            <SlidersHorizontal size={16} /> Filters
          </button>
          <label htmlFor="sort" className="visually-hidden">Sort</label>
          <select id="sort" className="select" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalog">
        <aside className={`filters ${filtersOpen ? 'is-open' : ''}`} aria-label="Filters">
          <div className="filters__group">
            <h4>Category</h4>
            <ul className="filters__list">
              <li>
                <button
                  className={!category ? 'is-active' : ''}
                  onClick={() => navigate(`/products${params.toString() ? `?${params}` : ''}`)}
                >
                  All <span className="subtle">{allProducts.length}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    className={category?.id === c.id ? 'is-active' : ''}
                    onClick={() => navigate(`/categories/${c.slug}${params.toString() ? `?${params}` : ''}`)}
                  >
                    {c.name}{' '}
                    <span className="subtle">{allProducts.filter((p) => p.category?.id === c.id).length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="filters__group">
            <h4>Price range ($)</h4>
            <div className="price-range">
              <label className="visually-hidden" htmlFor="min">Minimum</label>
              <input id="min" className="input" type="number" min="0" placeholder="Min"
                value={minPrice} onChange={(e) => setParam('min', e.target.value)} />
              <span className="subtle">–</span>
              <label className="visually-hidden" htmlFor="max">Maximum</label>
              <input id="max" className="input" type="number" min="0" placeholder="Max"
                value={maxPrice} onChange={(e) => setParam('max', e.target.value)} />
            </div>
          </div>

          <div className="filters__group">
            <label className="checkbox">
              <input type="checkbox" checked={inStock} onChange={(e) => setParam('stock', e.target.checked ? '1' : '')} />
              <span>In stock only</span>
            </label>
          </div>

          {hasFilters && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setParams(new URLSearchParams(sort !== 'newest' ? { sort } : {}))}
            >
              <X size={14} /> Clear filters
            </button>
          )}
        </aside>

        <section className="catalog__results">
          {!isLoading && results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No results found"
              text="Try changing the filters or searching for something else."
              action={<Link to="/products" className="btn btn--outline">Back to all products</Link>}
            />
          ) : (
            <div className="product-grid product-grid--3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
