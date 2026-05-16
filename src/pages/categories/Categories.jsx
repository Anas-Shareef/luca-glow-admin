import { useState } from 'react'
import { PageHeader, Toggle, Modal, EmptyState, ConfirmDialog } from '../../components/ui'
import { Plus, Edit2, Trash2, FolderOpen, Folder, ChevronRight, Tag, Upload, X } from 'lucide-react'
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from '../../api/hooks'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function CategoryRow({ cat, children, level = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const [active, setActive] = useState(cat.is_active)
  const hasChildren = children && children.length > 0

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-3 p-3 rounded-xl hover:bg-glow-50/50 group transition-colors',
          level > 0 && 'ml-8'
        )}
      >
        {/* Expand button or spacer */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            'w-6 h-6 flex items-center justify-center text-slate-400 transition-transform shrink-0',
            !hasChildren && 'invisible',
            hasChildren && expanded && 'rotate-90'
          )}
        >
          <ChevronRight size={14} />
        </button>

        {/* Icon */}
        {hasChildren
          ? <FolderOpen size={16} className="text-glow-500 shrink-0" />
          : <Folder    size={16} className="text-slate-400 shrink-0" />
        }

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{cat.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">{cat.slug}</p>
        </div>

        {/* Products count */}
        <span className="badge bg-slate-100 text-slate-500 text-xs shrink-0">
          {cat.products} products
        </span>

        {/* Toggle */}
        <Toggle
          checked={active}
          onChange={(v) => { 
            setActive(v); 
            // In a real app, we'd call a toggleStatus mutation here
            toast.success(`${cat.name} ${v ? 'activated' : 'deactivated'}`) 
          }}
        />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => cat.onEdit(cat)}
            className="p-1.5 rounded-lg hover:bg-glow-100 text-slate-500 hover:text-glow-700 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button 
            onClick={() => cat.onDelete(cat.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="relative">
          <div className="absolute left-[31px] top-0 bottom-3 w-px bg-slate-200 ml-8" />
          {children}
        </div>
      )}
    </div>
  )
}

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [showModal, setShowModal]   = useState(false)
  const [deleteCatId, setDeleteCatId] = useState(null)
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState({ name: '', slug: '', parent_id: '', description: '', banner: null, banner_url: '' })

  const parents  = categories.filter((c) => !c.parent_id)
  const getChildren = (pid) => categories.filter((c) => c.parent_id === pid)

  const handleEdit = (cat) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id || '',
      description: cat.description || '',
      banner: null,
      banner_url: cat.banner_url || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    setDeleteCatId(id)
  }

  const handleSave = () => {
    if (!form.name) { toast.error('Category name required'); return }
    
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('slug', form.slug || form.name.toLowerCase().replace(/\s+/g, '-'))
    if (form.parent_id) formData.append('parent_id', form.parent_id)
    if (form.description) formData.append('description', form.description)
    if (form.banner) formData.append('banner', form.banner)

    const onError = (err) => {
      const errors = err.response?.data?.errors
      if (errors) {
        const msg = Object.values(errors).flat().join(', ')
        toast.error(msg)
      } else {
        toast.error(err.response?.data?.message || 'Action failed')
      }
    }

    if (editingId) {
      formData.append('id', editingId)
      updateCategory.mutate(formData, {
        onSuccess: () => {
          setShowModal(false)
          setEditingId(null)
        },
        onError
      })
    } else {
      createCategory.mutate(formData, {
        onSuccess: () => {
          setShowModal(false)
        },
        onError
      })
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-2 border-glow-200 border-t-glow-600 rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Refreshing Catalog...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Categories" subtitle={`${categories.length} categories managing your catalog`}>
        <button 
          onClick={() => {
            setEditingId(null)
            setForm({ name: '', slug: '', parent_id: '', description: '', banner: null, banner_url: '' })
            setShowModal(true)
          }} 
          className="btn-glow"
        >
          <Plus size={15} /> Add Category
        </button>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Categories', value: categories.length },
          { label: 'Top-Level',        value: parents.length },
          { label: 'Active',           value: categories.filter((c) => c.is_active).length },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-4">
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Category tree */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
          <Tag size={16} className="text-glow-500" />
          <h3 className="font-semibold text-slate-800">Category Hierarchy</h3>
          <span className="text-xs text-slate-400 ml-auto">Click to expand/collapse</span>
        </div>

        {parents.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No categories yet"
            description="Create your first category to organise your products."
            action={
              <button onClick={() => setShowModal(true)} className="btn-glow">
                <Plus size={14} /> Add Category
              </button>
            }
          />
        ) : (
          <div className="space-y-1">
            {parents.map((cat) => (
              <CategoryRow key={cat.id} cat={{ ...cat, onEdit: handleEdit, onDelete: handleDelete }}>
                {getChildren(cat.id).map((child) => (
                  <CategoryRow key={child.id} cat={{ ...child, onEdit: handleEdit, onDelete: handleDelete }} level={1} />
                ))}
              </CategoryRow>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? 'Edit Category' : 'New Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((n) => ({
                ...n,
                name: e.target.value,
                slug: editingId ? n.slug : e.target.value.toLowerCase().replace(/\s+/g, '-')
              }))}
              className="input-field"
              placeholder="e.g. Serums"
            />
          </div>
          <div>
            <label className="label">URL Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((n) => ({ ...n, slug: e.target.value }))}
              className="input-field font-mono"
              placeholder="serums"
            />
          </div>
          <div>
            <label className="label">Parent Category (optional)</label>
            <select
              value={form.parent_id}
              onChange={(e) => setForm((n) => ({ ...n, parent_id: e.target.value }))}
              className="select-field"
            >
              <option value="">— None (Top Level) —</option>
              {parents.filter(p => p.id !== editingId).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Category Banner Image</label>
            <div className="mt-2">
              {form.banner_url || form.banner ? (
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src={form.banner ? URL.createObjectURL(form.banner) : form.banner_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setForm(f => ({ ...f, banner: null, banner_url: '' }))}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 shadow-sm hover:bg-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => document.getElementById('banner-upload').click()}
                  className="w-full aspect-[21/9] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-glow-300 hover:bg-glow-50/30 cursor-pointer transition-all group"
                >
                  <Upload size={24} className="text-slate-300 group-hover:text-glow-500 transition-colors" />
                  <span className="text-xs font-medium text-slate-500">Upload Banner Image</span>
                  <input 
                    id="banner-upload"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) setForm(f => ({ ...f, banner: file }))
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Recommended size: 1200x500px</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button 
              onClick={handleSave} 
              className="btn-glow flex-1 justify-center"
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {editingId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCatId}
        onClose={() => setDeleteCatId(null)}
        onConfirm={() => deleteCategory.mutate(deleteCatId)}
        title="Delete Category"
        message="Are you sure you want to delete this category? All products in this category will become uncategorized."
        confirmText="Delete"
      />
    </div>
  )
}
