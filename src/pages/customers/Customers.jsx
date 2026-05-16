import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender
} from '@tanstack/react-table'
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  ArrowLeft, ArrowRight, ShoppingBag, TrendingUp,
  Mail, Phone, Calendar, Shield, AlertOctagon,
  RefreshCw, Activity, Droplets, Eye, Trash2, Download
} from 'lucide-react'
import {
  PageHeader, GroupBadge, StatusBadge, SlideOver, Avatar, ConfirmDialog
} from '../../components/ui'
import { 
  useCustomers, 
  useCustomer, 
  useUpdateCustomerGroup, 
  useSuspendCustomer, 
  useSendPasswordReset,
  useDeleteCustomer 
} from '../../api/hooks'
import { formatINR } from '../../data/mock'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ── Customer 360° Profile ─────────────────────────────────────────────────────
function CustomerProfile({ customer: initialCustomer, open, onClose }) {
  const { data: customer = initialCustomer } = useCustomer(initialCustomer?.id)
  const updateGroup = useUpdateCustomerGroup()
  const suspendAccount = useSuspendCustomer()
  const resetPassword = useSendPasswordReset()
  const deleteCustomer = useDeleteCustomer()

  if (!customer) return null

  const orders = customer.orders || []
  const groups = ['Regular', 'VIP', 'Wholesale', 'First-Time']
  const group = customer.group

  const metrics = [
    { label: 'Total Orders',  value: customer.total_orders,    icon: ShoppingBag,  color: 'text-blue-500',    bg: 'bg-blue-50' },
    { label: 'Total Spend',   value: formatINR(customer.total_spend), icon: TrendingUp, color: 'text-glow-600', bg: 'bg-glow-50' },
    { label: 'Avg. Order',    value: formatINR(Math.round(customer.total_spend / customer.total_orders)), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={customer.name}
      subtitle={`${customer.email} · Member since ${customer.joined}`}
      width="max-w-xl"
    >
      <div className="space-y-6">
        {/* Header card */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-glow-50 to-glow-100 rounded-2xl border border-glow-200">
          <Avatar initials={customer.avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800">{customer.name}</h3>
              <GroupBadge group={group} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Last active: {customer.last_login}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card text-center py-4">
              <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2', bg)}>
                <Icon size={15} className={color} />
              </div>
              <div className="font-bold text-slate-800 text-sm">{value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="card space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Details</p>
          {[
            { icon: Mail,     value: customer.email },
            { icon: Phone,    value: customer.phone || 'Not provided' },
            { icon: Calendar, value: `Joined ${customer.joined}` },
          ].map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-3 text-sm text-slate-700">
              <Icon size={14} className="text-slate-400 shrink-0" />
              <span className="flex-1 truncate">{value}</span>
              {(value.includes('@') || value.includes('+')) && (
                <button
                  onClick={() => { navigator.clipboard.writeText(value); toast.success('Copied!') }}
                  className="text-xs text-glow-600 hover:text-glow-700 font-medium"
                >
                  Copy
                </button>
              )}
            </div>
          ))}
        </div>


        {/* Group management */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Customer Group</p>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => updateGroup.mutate({ id: customer.id, group: g })}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  group === g
                    ? 'bg-glow-400 text-white border-glow-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-glow-300'
                )}
              >
                {g}
              </button>
            ))}
          </div>
          {customer.total_spend >= 10000 && group !== 'VIP' && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              ⭐ Eligible for VIP upgrade — spend exceeds ₹10,000
            </div>
          )}
        </div>

        {/* Order timeline */}
        {orders.length > 0 && (
          <div className="card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Order Timeline</p>
            <div className="relative space-y-3 pl-5">
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-200" />
              {orders.map((o) => (
                <div key={o.id} className="flex items-start gap-3 relative">
                  <div className="absolute -left-4 mt-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm bg-glow-400" />
                  <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-glow-700">{o.order_number}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{o.created_at}</span>
                      <span className="text-xs font-semibold text-slate-700">{formatINR(o.total_inr)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account actions */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Account Actions</p>
          <div className="flex gap-2">
            <button
              onClick={() => resetPassword.mutate(customer.id)}
              className="btn-outline flex-1 justify-center text-xs py-2"
            >
              <RefreshCw size={13} /> Reset Password
            </button>
            <button
              onClick={() => suspendAccount.mutate(customer.id)}
              className="btn-danger flex-1 justify-center text-xs py-2"
            >
              <AlertOctagon size={13} /> {customer.is_active ? 'Suspend Account' : 'Activate Account'}
            </button>
          </div>
        </div>
      </div>
    </SlideOver>
  )
}

// ── Main Customers Page ───────────────────────────────────────────────────────
export default function Customers() {
  const deleteCustomer = useDeleteCustomer()
  const [globalFilter, setGF] = useState('')
  const [groupFilter,  setGF2] = useState('all')
  const [activeCustomer, setActive] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [sorting, setSorting] = useState([])
  const dSearch = useDebounce(globalFilter)

  const { data: response, isLoading } = useCustomers({
    search: dSearch,
    group: groupFilter === 'all' ? '' : groupFilter
  })

  const handleExport = () => {
    const params = new URLSearchParams()
    if (groupFilter !== 'all') params.set('group', groupFilter)
    if (globalFilter) params.set('search', globalFilter)
    const url = `${import.meta.env.VITE_API_URL}/admin/customers/export/csv?${params}`
    window.open(url, '_blank')
    toast.success('CSV Export started')
  }

  const handleExportPdf = () => {
    const params = new URLSearchParams()
    if (groupFilter !== 'all') params.set('group', groupFilter)
    if (globalFilter) params.set('search', globalFilter)
    const url = `${import.meta.env.VITE_API_URL}/admin/customers/export/pdf?${params}`
    window.open(url, '_blank')
    toast.success('PDF Export started')
  }

  const data = response?.data || []
  const meta = response?.meta || { total: 0 }

  const filtered = useMemo(() =>
    groupFilter === 'all' ? data : data.filter((c) => c.group === groupFilter),
    [data, groupFilter]
  )

  const columns = useMemo(() => [
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (r) => r.name,
      cell: ({ row: { original: c } }) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar initials={c.avatar} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
            <p className="text-xs text-slate-400 truncate">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'group',
      header: 'Group',
      cell: ({ getValue }) => <GroupBadge group={getValue()} />,
    },
    {
      accessorKey: 'total_spend',
      header: 'Total Spend',
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800">{formatINR(getValue())}</span>
      ),
    },
    {
      accessorKey: 'total_orders',
      header: 'Orders',
      cell: ({ getValue }) => (
        <span className="badge bg-slate-100 text-slate-600">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'last_login',
      header: 'Last Active',
      cell: ({ getValue }) => <span className="text-xs text-slate-500">{getValue()}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row: { original: c } }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive(c)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glow-50 text-glow-700 text-xs font-medium hover:bg-glow-100 transition-colors"
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={() => setDeleteId(c)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose hover:bg-rose/5 transition-colors"
            title="Delete Customer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ], [deleteCustomer])

  const table = useReactTable({
    data: filtered,
    columns,
    state:           { globalFilter: dSearch, sorting },
    onSortingChange: setSorting,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  const groupCounts = useMemo(() => {
    const c = { all: data.length }
    data.forEach((u) => { c[u.group] = (c[u.group] || 0) + 1 })
    return c
  }, [data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${meta.total} registered customers`}
      >
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-outline">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handleExportPdf} className="btn-outline border-purple-200 text-purple-600 hover:bg-purple-50">
            <Download size={15} /> Export PDF
          </button>
        </div>
      </PageHeader>

      {/* Group filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'All Customers'], ['VIP', 'VIP'], ['Regular', 'Regular'], ['Wholesale', 'Wholesale'], ['First-Time', 'First-Time']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setGF2(key)}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all',
              groupFilter === key
                ? 'bg-glow-100 text-glow-700 border-glow-300'
                : 'bg-white text-slate-600 border-slate-200 hover:border-glow-200'
            )}
          >
            {label}
            <span className={clsx('px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              groupFilter === key ? 'bg-glow-200 text-glow-800' : 'bg-slate-100 text-slate-500'
            )}>
              {groupCounts[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card py-3">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGF(e.target.value)}
            placeholder="Search by name or email…"
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
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
                        h.column.getIsSorted() === 'asc'  ? <ChevronUp size={12} className="text-glow-500" /> :
                        h.column.getIsSorted() === 'desc' ? <ChevronDown size={12} className="text-glow-500" /> :
                        <ChevronsUpDown size={12} className="text-slate-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="tbl-row">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="tbl-cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <span className="text-xs text-slate-500">
            {table.getFilteredRowModel().rows.length} customers
          </span>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-glow-50">
              <ArrowLeft size={14} />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-glow-50">
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <CustomerProfile customer={activeCustomer} open={!!activeCustomer} onClose={() => setActive(null)} />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteCustomer.mutate(deleteId.id)}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleteId?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}
