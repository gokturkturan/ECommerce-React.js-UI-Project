import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../store/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import ProductImage from '../../components/ProductImage.jsx';
import { Modal, Field } from '../../components/ui.jsx';
import { formatPrice } from '../../utils/format.js';

const EMPTY = { name: '', description: '', price: '', stock: '', categoryId: '' };

export default function AdminProducts() {
  const { data: products = [] } = useGetProductsQuery({});
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const openNew = () => {
    setForm({ ...EMPTY, categoryId: categories[0]?.id ?? '' });
    setEditing('new');
  };
  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      categoryId: p.category?.id ?? '',
    });
    setEditing(p);
  };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
    };
    try {
      if (editing === 'new') {
        await createProduct(payload).unwrap();
        toast('Product added');
      } else {
        await updateProduct({ id: editing.id, ...payload }).unwrap();
        toast('Product updated');
      }
      close();
    } catch {
      toast('Could not save the product', 'error');
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const needle = query.toLowerCase();
  const list = products
    .filter((p) => !catFilter || p.category?.id === catFilter)
    .filter((p) => !needle || p.name.toLowerCase().includes(needle));

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Products</h1>
          <p className="muted">{products.length} products</p>
        </div>
        <button className="btn btn--primary" onClick={openNew}>
          <Plus size={16} /> New product
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search search--inline">
            <Search size={16} className="search__icon" aria-hidden="true" />
            <label htmlFor="admin-product-search" className="visually-hidden">Search products</label>
            <input id="admin-product-search" type="search" placeholder="Search products"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <label htmlFor="cat-filter" className="visually-hidden">Category</label>
          <select id="cat-filter" className="select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th className="actions"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-product">
                      <ProductImage product={p} size="sm" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="muted">{p.category?.name ?? '—'}</td>
                  <td className="num">{formatPrice(p.price)}</td>
                  <td className="num">
                    <span className={p.stock === 0 ? 'text-danger' : p.stock <= 5 ? 'text-warning' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="icon-btn icon-btn--ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn icon-btn--ghost" onClick={() => setConfirmDelete(p)} aria-label={`Delete ${p.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="table-empty">No matching products.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New product' : 'Edit product'}
        onClose={close}
        footer={
          <>
            <button className="btn btn--ghost" onClick={close}>Cancel</button>
            <button className="btn btn--primary" type="submit" form="product-form">Save</button>
          </>
        }
      >
        <form id="product-form" className="form-grid" onSubmit={save}>
          <div className="form-grid__full">
            <Field label="Product name" id="p-name"><input id="p-name" className="input" required value={form.name} onChange={set('name')} /></Field>
          </div>
          <div className="form-grid__full">
            <Field label="Description" id="p-desc">
              <textarea id="p-desc" className="input" rows={4} required value={form.description} onChange={set('description')} />
            </Field>
          </div>
          <Field label="Price ($)" id="p-price">
            <input id="p-price" className="input" type="number" min="0" step="0.01" required value={form.price} onChange={set('price')} />
          </Field>
          <Field label="Stock" id="p-stock">
            <input id="p-stock" className="input" type="number" min="0" step="1" required value={form.stock} onChange={set('stock')} />
          </Field>
          <div className="form-grid__full">
            <Field label="Category" id="p-cat">
              <select id="p-cat" className="select select--block" required value={form.categoryId} onChange={set('categoryId')}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!confirmDelete}
        title="Delete product"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button
              className="btn btn--danger"
              onClick={async () => {
                try {
                  await deleteProduct(confirmDelete.id).unwrap();
                  toast('Product deleted', 'error');
                } catch {
                  toast('Could not delete the product', 'error');
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </button>
          </>
        }
      >
        <p><strong>{confirmDelete?.name}</strong> will be permanently deleted. This cannot be undone.</p>
      </Modal>
    </>
  );
}
