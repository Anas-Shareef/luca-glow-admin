import { useState, useMemo, useEffect } from 'react'
import { 
  useQuery, useMutation, useQueryClient 
} from '@tanstack/react-query'
import api from '../../api/axios'
import {
  Star, MessageSquare, Trash2, Eye,
  CheckCircle, XCircle, Search,
  ChevronUp, ChevronDown, ChevronsUpDown,
  ArrowLeft, ArrowRight, Plus, Filter,
  User, Mail, Camera, ShieldCheck, X, Loader2
} from 'lucide-react'
import {
  PageHeader, StatusBadge, ConfirmDialog, SlideOver, Modal
} from '../../components/ui'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender
} from '@tanstack/react-table'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Reviews() {
  const qc = useQueryClient()
  const [globalFilter, setGF] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [manualFilter, setManualFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Fetch Reviews
  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-reviews', globalFilter, publishedFilter, manualFilter],
    queryFn: async () => {
      const { data } = await api.get('/admin/reviews', {
        params: { 
          search: globalFilter,
          published: publishedFilter === '' ? undefined : publishedFilter === 'true',
          manual: manualFilter === '' ? undefined : manualFilter === 'true'
        }
      })
      return data
    }
  })

  const togglePublished = useMutation({
    mutationFn: ({ id, is_published }) => api.put(`/admin/reviews/${id}`, { is_published }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-reviews'])
      toast.success('Review status updated')
    }
  })

  const deleteReview = useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['admin-reviews'])
      toast.success('Review deleted')
      setDeleteId(null)
    }
  })

  const bulkDelete = useMutation({
    mutationFn: (ids) => api.post('/admin/reviews/bulk-delete', { ids }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-reviews'])
      toast.success('Selected reviews deleted')
      setRowSelection({})
      setIsBulkDeleting(false)
    }
  })

  const data = response?.data || []

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-slate-300 text-glow-600 focus:ring-glow-500"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-slate-300 text-glow-600 focus:ring-glow-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      accessorKey: 'product.name',
      header: 'Product',
      cell: ({ row: { original: r } }) => (
        <div className="min-w-[150px]">
          <p className="text-sm font-semibold text-slate-800 truncate">{r.product?.name}</p>
          <p className="text-[10px] text-slate-400 uppercase">PID: {r.product_id}</p>
        </div>
      )
    },
    {
      accessorKey: 'user.name',
      header: 'Reviewer',
      cell: ({ row: { original: r } }) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-800">{r.user?.name || r.reviewer_name}</p>
            <span className={clsx(
              'text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider',
              r.is_verified_purchase ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
            )}>
              {r.is_verified_purchase ? 'Verified' : 'Guest'}
            </span>
            {r.is_manual && <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Manual</span>}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">{r.user?.email || r.reviewer_email || 'No Email'}</p>
        </div>
      )
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              className={clsx(i < getValue() ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} 
            />
          ))}
        </div>
      )
    },
    {
      accessorKey: 'comment',
      header: 'Content',
      cell: ({ row: { original: r } }) => (
        <div className="max-w-xs">
          {r.title && <p className="text-[11px] font-bold text-slate-800 truncate mb-0.5">{r.title}</p>}
          <p className="text-[11px] text-slate-500 line-clamp-2" title={r.comment}>
            {r.comment}
          </p>
        </div>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ getValue }) => (
        <p className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
          {new Date(getValue()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      )
    },
    {
      accessorKey: 'is_published',
      header: 'Status',
      cell: ({ row: { original: r } }) => (
        <button 
          onClick={() => togglePublished.mutate({ id: r.id, is_published: !r.is_published })}
          className={clsx(
            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border',
            r.is_published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
          )}
        >
          {r.is_published ? 'Published' : 'Pending'}
        </button>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: { original: r } }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeleteId(r)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Product Reviews" 
        subtitle="Manage customer feedback and ratings" 
      >
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Create Review
        </button>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-1 items-center gap-4 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={globalFilter}
              onChange={(e) => setGF(e.target.value)}
              placeholder="Search reviews..."
              className="input-field pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="input-field py-2 text-xs w-32"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Pending</option>
            </select>
            <select
              value={manualFilter}
              onChange={(e) => setManualFilter(e.target.value)}
              className="input-field py-2 text-xs w-32"
            >
              <option value="">All Types</option>
              <option value="false">Organic</option>
              <option value="true">Manual</option>
            </select>
          </div>
        </div>

        {selectedCount > 0 && (
          <button
            onClick={() => setIsBulkDeleting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors whitespace-nowrap"
          >
            <Trash2 size={14} />
            Delete Selected ({selectedCount})
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden shadow-sm border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {table.getHeaderGroups()[0].headers.map((h) => (
                  <th
                    key={h.id}
                    className="tbl-head py-4 text-left cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5 px-4">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && (
                        h.column.getIsSorted() === 'asc' ? <ChevronUp size={12} /> :
                        h.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                        <ChevronsUpDown size={12} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-glow-200 border-t-glow-600 rounded-full animate-spin" />
                      <p className="text-xs text-slate-400 font-medium">Loading reviews...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-20 text-slate-400 italic text-sm">
                    No reviews found matching your criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={clsx('tbl-row group', row.getIsSelected() && 'bg-glow-50/30')}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="tbl-cell px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {data.length} total reviews
          </span>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all">
              <ArrowLeft size={16} />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteReview.mutate(deleteId.id)}
        title="Delete Review"
        message={`Are you sure you want to delete this review? This action cannot be undone.`}
        confirmText="Delete"
      />

      <ConfirmDialog
        open={isBulkDeleting}
        onClose={() => setIsBulkDeleting(false)}
        onConfirm={() => bulkDelete.mutate(Object.keys(rowSelection).map(idx => data[idx].id))}
        title="Bulk Delete"
        message={`Are you sure you want to delete ${selectedCount} selected reviews?`}
        confirmText="Delete All"
      />

      <SlideOver
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Manually Create Review"
        subtitle="Add a review for any product"
      >
        <CreateReviewForm onSuccess={() => { setIsCreateOpen(false); qc.invalidateQueries(['admin-reviews']) }} />
      </SlideOver>
    </div>
  )
}

function CreateReviewForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    reviewer_name: '',
    reviewer_email: '',
    is_verified_purchase: true,
    is_published: true,
    tag: 'verified customer'
  })
  
  const [images, setImages] = useState([])

  // Product Search
  useEffect(() => {
    if (search.length < 2) {
      setProducts([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/admin/products', { params: { search } })
        setProducts(data.data || [])
        setShowDropdown(true)
      } catch (err) {
        console.error(err)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return toast.error('Please select a product')
    if (!formData.comment) return toast.error('Review comment is required')

    setLoading(true)
    const fd = new FormData()
    fd.append('product_id', selectedProduct.id)
    fd.append('rating', formData.rating)
    fd.append('title', formData.title)
    fd.append('comment', formData.comment)
    fd.append('reviewer_name', formData.reviewer_name)
    fd.append('reviewer_email', formData.reviewer_email)
    fd.append('is_verified_purchase', formData.is_verified_purchase ? 1 : 0)
    fd.append('is_published', formData.is_published ? 1 : 0)
    
    images.forEach(img => fd.append('images[]', img))

    try {
      await api.post('/admin/reviews', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Review created successfully')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Search */}
      <div className="relative">
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Search Product *</label>
        {selectedProduct ? (
          <div className="flex items-center justify-between p-3 bg-glow-50 border border-glow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
                <img src={selectedProduct.image} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{selectedProduct.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">SKU: {selectedProduct.sku}</p>
              </div>
            </div>
            <button type="button" onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-rose-500">
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type product name or SKU..."
                className="input-field pl-9"
              />
            </div>
            {showDropdown && products.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-auto scrollbar-thin">
                {products.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedProduct(p); setShowDropdown(false); setSearch('') }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-md border flex items-center justify-center overflow-hidden">
                      <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{p.name}</p>
                      <p className="text-[10px] text-slate-400">SKU: {p.sku}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({ ...formData, rating: s })}
                className="p-1"
              >
                <Star size={20} className={clsx(s <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Verified Tag</label>
          <select
            value={formData.is_verified_purchase ? 'customer' : 'guest'}
            onChange={(e) => setFormData({ ...formData, is_verified_purchase: e.target.value === 'customer' })}
            className="input-field py-2 text-sm"
          >
            <option value="customer">Verified Customer</option>
            <option value="guest">Verified Guest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Reviewer Name *</label>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              required
              value={formData.reviewer_name}
              onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
              className="input-field pl-9"
              placeholder="e.g. John Doe"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Reviewer Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={formData.reviewer_email}
              onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
              className="input-field pl-9"
              placeholder="e.g. john@example.com"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Headline (Optional)</label>
        <input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field"
          placeholder="Sum it up..."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Review Comment *</label>
        <textarea
          required
          rows={4}
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="input-field resize-none"
          placeholder="Write the review content here..."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Photos (Max 5)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 group">
              <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => document.getElementById('manual-review-images').click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-glow-400 hover:text-glow-500 transition-all"
            >
              <Camera size={20} />
              <span className="text-[10px] font-bold">Add</span>
            </button>
          )}
        </div>
        <input
          id="manual-review-images"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => setImages(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))}
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
          Create Review
        </button>
      </div>
    </form>
  )
}
