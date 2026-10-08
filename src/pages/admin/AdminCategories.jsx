import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../store/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, Field } from '../../components/ui.jsx';
import { formatDate, slugify } from '../../utils/format.js';

export default function AdminCategories() {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: products = [] } = useGetProductsQuery({});
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [slugTouched, setSlugTouched] = useState(false);

  const open = (c) => {
    setForm(c === 'new' ? { name: '', slug: '' } : { name: c.name, slug: c.slug });
    setSlugTouched(c !== 'new');
    setEditing(c);
  };
  const close = () => setEditing(null);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await createCategory(form).unwrap();
        toast('Category added');
      } else {
        await updateCategory({ id: editing.id, ...form }).unwrap();
        toast('Category updated');
      }
      close();
    } catch {
      toast('Could not save the category', 'error');
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Categories</h1>
          <p className="muted">{categories.length} categories</p>
        </div>
        <button className="btn btn--primary" onClick={() => open('new')}>
          <Plus size={16} /> New category
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th className="num">Products</th>
                <th>Created</th>
                <th className="actions"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const count = products.filter((p) => p.category?.id === c.id).length;
                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td><code className="code">{c.slug}</code></td>
                    <td className="num">{count}</td>
                    <td className="subtle">{formatDate(c.createdAt)}</td>
                    <td className="actions">
                      <button className="icon-btn icon-btn--ghost" onClick={() => open(c)} aria-label={`Edit ${c.name}`}>
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn icon-btn--ghost"
                        disabled={count > 0}
                        title={count > 0 ? 'Categories that contain products cannot be deleted' : undefined}
                        onClick={async () => {
                          try {
                            await deleteCategory(c.id).unwrap();
                            toast('Category deleted', 'error');
                          } catch {
                            toast('Could not delete the category', 'error');
                          }
                        }}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New category' : 'Edit category'}
        onClose={close}
        footer={
          <>
            <button className="btn btn--ghost" onClick={close}>Cancel</button>
            <button className="btn btn--primary" type="submit" form="category-form">Save</button>
          </>
        }
      >
        <form id="category-form" className="form-stack" onSubmit={save}>
          <Field label="Category name" id="c-name">
            <input
              id="c-name"
              className="input"
              required
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  name: e.target.value,
                  slug: slugTouched ? f.slug : slugify(e.target.value),
                }))
              }
            />
          </Field>
          <Field label="Slug" id="c-slug" hint="Used in the URL; must be unique.">
            <input
              id="c-slug"
              className="input"
              required
              pattern="[a-z0-9-]+"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
