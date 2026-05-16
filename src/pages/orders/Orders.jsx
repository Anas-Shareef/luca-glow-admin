import { useState, useMemo, useEffect } from 'react'
import { Search, Download, Eye, Package, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PageHeader, StatusBadge, SlideOver, Avatar } from '../../components/ui'
import { formatINR, ORDER_STATUSES } from '../../data/mock'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import api from '../../api/axios'


// ── Order Detail Panel ────────────────────────────────────────────────────────
function OrderDetail({ order, open, onClose, onStatusChange }) {
  if (!order) return null
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  const handleStatusSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status, notify_customer: true })
      onStatusChange(order.id, status)
      toast.success(`Order ${order.order_number} → ${ORDER_STATUSES[status]?.label}`)
      onClose()
    } catch {
      toast.error('Failed to update status')
    } finally { setSaving(false) }
  }

  const items = order.items_detail || []
  const subtotal = order.subtotal_inr || 0
  const shipping = order.shipping_amount_inr || 0
  const tax      = order.tax_amount_inr || 0

  return (
    <SlideOver open={open} onClose={onClose} title={order.order_number}
      subtitle={`Placed on ${order.created_at} · ${order.city}`} width="max-w-2xl">
      <div className="space-y-6">
        {/* Status */}
        <div className="p-4 bg-glow-50 border border-glow-200 rounded-2xl space-y-3">
          <p className="text-xs font-semibold text-glow-700 uppercase tracking-wider">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ORDER_STATUSES).map(([key, val]) => (
              <button key={key} onClick={() => setStatus(key)}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  status === key ? 'bg-glow-400 text-white border-glow-500' : 'bg-white text-slate-600 border-slate-200 hover:border-glow-300'
                )}>{val.label}</button>
            ))}
          </div>
          <button onClick={handleStatusSave} disabled={saving} className="btn-glow w-full justify-center">
            {saving ? 'Saving…' : 'Save Status Update'}
          </button>
        </div>

        {/* Customer */}
        <div className="card space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</p>
          <div className="flex items-center gap-3">
            <Avatar initials={order.customer?.name?.split(' ').map(n => n[0]).join('') || '?'} size="lg" />
            <div>
              <p className="font-semibold text-slate-800">{order.customer?.name}</p>
              <p className="text-xs text-slate-400">{order.city}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {[order.customer?.email, order.customer?.phone].filter(Boolean).map(v => (
              <div key={v} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5">
                <span className="truncate">{v}</span>
                <button onClick={() => { navigator.clipboard.writeText(v); toast.success('Copied!') }}
                  className="ml-auto text-slate-400 hover:text-glow-500 text-[10px]">Copy</button>
              </div>
            ))}
          </div>
          {order.shipping_address && (
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {order.shipping_address.full_name}<br />
                {order.shipping_address.address_line_1}{order.shipping_address.address_line_2 ? `, ${order.shipping_address.address_line_2}` : ''}<br />
                {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}<br />
                {order.shipping_address.country}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Order Items</p>
          {items.length === 0
            ? <p className="text-xs text-slate-400">No item details available.</p>
            : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-slate-400">{formatINR(item.unit_price)} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-slate-800 text-sm shrink-0">{formatINR(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            )
          }
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
            {[['Subtotal', subtotal], ['Shipping', shipping], ['Tax', tax]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm text-slate-600">
                <span>{l}</span><span>{formatINR(v)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200">
              <span>Total</span><span>{formatINR(order.total_inr)}</span>
            </div>
          </div>
        </div>
      </div>
    </SlideOver>
  )
}


// ── Main Orders Page ──────────────────────────────────────────────────────────
export default function Orders() {
  const [data,         setData]      = useState([])
  const [loading,      setLoading]   = useState(true)
  const [statusFilter, setSF]        = useState('all')
  const [search,       setSearch]    = useState('')
  const [activeOrder,  setActive]    = useState(null)
  const [meta,         setMeta]      = useState({ total: 0, status_counts: {} })

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)
      const { data: res } = await api.get(`/admin/orders?${params}`)
      setData(res.data || [])
      setMeta(res.meta || {})
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const url = `${import.meta.env.VITE_API_URL}/admin/orders/export/csv?${params}`
    window.open(url, '_blank')
    toast.success('CSV Export started')
  }

  const handleExportPdf = () => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const url = `${import.meta.env.VITE_API_URL}/admin/orders/export/pdf?${params}`
    window.open(url, '_blank')
    toast.success('PDF Export started')
  }

  useEffect(() => { load() }, [statusFilter, search])

  const handleStatusChange = (id, status) => {
    setData(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const openDetail = async (order) => {
    try {
      const { data: detail } = await api.get(`/admin/orders/${order.id}`)
      setActive({ ...order, ...detail, items_detail: detail.items, shipping_address: detail.shipping_address })
    } catch {
      setActive(order)
    }
  }

  const counts = useMemo(() => {
    const c = { all: meta.total || data.length, ...meta.status_counts }
    return c
  }, [meta, data])

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle={`${counts.all || 0} total · ${counts.pending || 0} pending`}>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-outline">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={handleExportPdf} className="btn-outline border-purple-200 text-purple-600 hover:bg-purple-50">
            <Download size={15} /> Export PDF
          </button>
        </div>
      </PageHeader>


      <>
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {[['all', 'All'], ...Object.entries(ORDER_STATUSES).map(([k, v]) => [k, v.label])].map(([key, label]) => (
              <button key={key} onClick={() => setSF(key)}
                className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all',
                  statusFilter === key ? 'bg-glow-100 text-glow-700 border-glow-300' : 'bg-white text-slate-600 border-slate-200'
                )}>
                {label}
                <span className={clsx('px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                  statusFilter === key ? 'bg-glow-200 text-glow-800' : 'bg-slate-100 text-slate-500'
                )}>{counts[key] || 0}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="card py-3">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by order ID or customer…" className="input-field pl-9" />
            </div>
          </div>

          {/* Table */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <RefreshCw size={20} className="animate-spin mr-2" /> Loading orders…
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Package size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No orders found.</p>
                </div>
              ) : (
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Order ID', 'Customer', 'Total', 'Items', 'Status', 'Date', ''].map(h => (
                        <th key={h} className="tbl-head text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(o => (
                      <tr key={o.id} className="tbl-row">
                        <td className="tbl-cell">
                          <span className="font-mono text-xs font-bold text-glow-700">{o.order_number}</span>
                        </td>
                        <td className="tbl-cell">
                          <p className="text-sm font-semibold text-slate-800">{o.customer?.name}</p>
                          <p className="text-xs text-slate-400">{o.city}</p>
                        </td>
                        <td className="tbl-cell font-semibold text-slate-800">{formatINR(o.total_inr)}</td>
                        <td className="tbl-cell">
                          <span className="badge bg-slate-100 text-slate-600">{o.items} item{o.items !== 1 ? 's' : ''}</span>
                        </td>
                        <td className="tbl-cell">
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={o.status} />
                          </div>
                        </td>
                        <td className="tbl-cell text-xs text-slate-500">{o.created_at}</td>
                        <td className="tbl-cell">
                          <button onClick={() => openDetail(o)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glow-50 text-glow-700 text-xs font-medium hover:bg-glow-100">
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
      </>

      <OrderDetail
        order={activeOrder}
        open={!!activeOrder}
        onClose={() => setActive(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
