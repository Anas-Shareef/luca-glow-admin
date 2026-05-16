import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender
} from '@tanstack/react-table'
import {
  Plus, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Edit2, Trash2, Package, ArrowLeft, ArrowRight, Eye
} from 'lucide-react'
import { PageHeader, StatusBadge, StockBadge, EmptyState, Toggle, ConfirmDialog } from '../../components/ui'
import {
  useProducts,
  useToggleProductStatus,
  useDeleteProduct,
  useCategories
} from '../../api/hooks'
import { formatINR } from '../../data/mock'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function Products() {
  const navigate = useNavigate()
  const [globalFilter, setGF] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [sorting, setSorting] = useState([])
  const dSearch = useDebounce(globalFilter)

  const { data: productsData, isLoading } = useProducts({
    search: dSearch,
    category_id: catFilter === 'all' ? null : catFilter
  })

  const { data: categories = [] } = useCategories()
  const toggleStatus = useToggleProductStatus()
  const deleteMutation = useDeleteProduct()

  const products = productsData?.data || []

  const toggleActive = (id) => {
    toggleStatus.mutate(id)
  }

  const handleDelete = (id, name) => {
    setDeleteProduct({ id, name })
  }

  const columns = useMemo(() => [
    {
      id: 'product',
      header: 'Product',
      accessorFn: (row) => row.name,
      cell: ({ row: { original: p } }) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={p.cover_image || p.image}
            alt={p.name}
            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-100"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{p.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
              {p.is_new && (
                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-100">New Arrival</span>
              )}
              {p.is_bestseller && (
                <span className="bg-amber-50 text-amber-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-amber-100">Hot</span>
              )}
              {p.is_low_stock && (
                <span className="bg-red-50 text-red-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-red-100">Low Stock</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row: { original: p } }) => (
        <span className="badge bg-glow-50 text-glow-700 border border-glow-200 text-xs">
          {p.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      accessorFn: (row) => row.price_inr,
      cell: ({ row: { original: p } }) => (
        <div>
          {p.special_price ? (
            <div>
              <span className="text-sm font-bold text-slate-800">{formatINR(p.special_price)}</span>
              <span className="ml-1.5 text-xs text-slate-400 line-through">{formatINR(p.price_inr)}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-700">{formatINR(p.price_inr)}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      cell: ({ getValue }) => <StockBadge qty={getValue()} />,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row: { original: p } }) => (
        <Toggle
          checked={p.is_active}
          onChange={() => toggleActive(p.id)}
          label={p.is_active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original: p } }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/products/${p.id}`)}
            className="p-2 rounded-lg hover:bg-glow-50 text-slate-500 hover:text-glow-700 transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(p.id, p.name)}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ], [navigate])



  const table = useReactTable({
    data: products,
    columns,
    state:           { globalFilter: dSearch, sorting },
    onSortingChange: setSorting,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle={`${productsData?.meta?.total || 0} products in catalog`}
      >
        <button onClick={() => navigate('/products/new')} className="btn-glow">
          <Plus size={16} /> Add Product
        </button>
      </PageHeader>

      {/* Filters row */}
      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={globalFilter}
              onChange={(e) => setGF(e.target.value)}
              placeholder="Search by name or SKU…"
              className="input-field pl-9"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCF('all')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                catFilter === 'all'
                  ? 'bg-glow-100 text-glow-700 border border-glow-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-glow-200 hover:text-glow-600'
              )}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCF(c.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                  catFilter === c.id
                    ? 'bg-glow-100 text-glow-700 border border-glow-300'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-glow-200 hover:text-glow-600'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                {table.getHeaderGroups()[0].headers.map((h) => (
                  <th
                    key={h.id}
                    className="tbl-head text-left cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && (
                        <span className="text-slate-300">
                          {h.column.getIsSorted() === 'asc'  ? <ChevronUp size={13} className="text-glow-500" /> :
                           h.column.getIsSorted() === 'desc' ? <ChevronDown size={13} className="text-glow-500" /> :
                           <ChevronsUpDown size={13} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12">
                    <EmptyState
                      icon={Package}
                      title="No products found"
                      description="Try adjusting your filters or search term."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="tbl-row">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="tbl-cell">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <span className="text-xs text-slate-500">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            –{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}{' '}
            of {table.getFilteredRowModel().rows.length} products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-glow-50 hover:border-glow-200 transition-colors"
            >
              <ArrowLeft size={14} />
            </button>
            {Array.from({ length: table.getPageCount() }).map((_, i) => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                  table.getState().pagination.pageIndex === i
                    ? 'bg-glow-400 text-white'
                    : 'border border-slate-200 hover:bg-glow-50'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-glow-50 hover:border-glow-200 transition-colors"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={() => deleteMutation.mutate(deleteProduct.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
