import { useState, useEffect } from 'react'
import {
  Tag, Plus, Trash2, Edit2, Zap, Calendar, Image,
  Percent, IndianRupee, Copy, ExternalLink, Move
} from 'lucide-react'
import { PageHeader, Toggle, Modal } from '../../components/ui'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'

// ── Coupon Card ───────────────────────────────────────────────────────────────
function CouponCard({ coupon: c, onToggle, onDelete }) {
  const pct = c.usage_limit ? Math.round((c.used_count / c.usage_limit) * 100) : null
  const expired = c.is_expired

  return (
    <div className={clsx('card relative overflow-hidden transition-all', !c.is_active && 'opacity-60')}>
      {/* Top accent */}
      <div className={clsx('absolute top-0 left-0 right-0 h-1 rounded-t-2xl',
        c.is_active && !expired ? 'bg-gradient-to-r from-glow-300 to-glow-500' : 'bg-slate-200'
      )} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            c.type === 'percentage' ? 'bg-glow-100' : 'bg-blue-100'
          )}>
            {c.type === 'percentage'
              ? <Percent size={18} className="text-glow-600" />
              : <IndianRupee size={18} className="text-blue-600" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <code className="font-mono font-bold text-slate-800 text-base">{c.code}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Code copied!') }}
                className="text-slate-400 hover:text-glow-500"
              >
                <Copy size={12} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
              {c.min_cart_value && ` · Min cart ₹${c.min_cart_value}`}
            </p>
          </div>
        </div>
        <Toggle checked={c.is_active} onChange={() => onToggle(c.id)} />
      </div>

      {/* Usage bar */}
      {c.usage_limit && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Usage: {c.used_count} / {c.usage_limit}</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-400' : 'bg-glow-400')}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Expiry */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={11} />
          {c.expires_at
            ? <span className={expired ? 'text-red-500 font-medium' : ''}>
                {expired ? 'Expired' : `Expires`} {c.expires_at}
              </span>
            : 'No expiry date'
          }
        </div>
        <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Slider Card ───────────────────────────────────────────────────────────────
function SliderCard({ slide: s, onToggle, onDelete, onEdit }) {
  return (
    <div className={clsx('card overflow-hidden transition-all', !s.is_active && 'opacity-60')}>
      <div className="relative rounded-xl overflow-hidden mb-4 aspect-video bg-slate-100">
        {s.image_url ? (
          <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Image size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-bold text-sm">{s.title}</p>
          <p className="text-white/80 text-xs">{s.subtitle}</p>
        </div>
        <div className="absolute top-2 right-2 bg-white/90 rounded-lg px-2 py-1 text-xs font-bold text-slate-600">
          #{s.sort_order}
        </div>
        {s.is_live ? (
          <div className="absolute top-2 left-2 bg-emerald-500 rounded-lg px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
            Live
          </div>
        ) : s.is_active ? (
          <div className="absolute top-2 left-2 bg-amber-500 rounded-lg px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
            Scheduled
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {s.link_url && (
            <a
              href={s.link_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-glow-600 hover:text-glow-700 font-medium truncate max-w-[120px]"
            >
              <ExternalLink size={10} /> {s.link_url}
            </a>
          )}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Calendar size={10} />
            {s.starts_at || 'Always'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onEdit(s)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(s.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
          <Toggle checked={s.is_active} onChange={() => onToggle(s.id)} />
        </div>
      </div>
    </div>
  )
}

// ── Main Marketing Page ───────────────────────────────────────────────────────
export default function Marketing() {
  const qc = useQueryClient()
  const [tab,      setTab]      = useState('coupons')
  const [showModal, setModal]   = useState(false)
  const [showSliderModal, setSliderModal] = useState(false)
  const [selectedSlider, setSelectedSlider] = useState(null)
  
  const [newCoupon, setNew]     = useState({
    code: '', type: 'percentage', value: '', min_cart_value: '',
    usage_limit: '', expires_at: ''
  })

  const genCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const code = 'LUCA' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setNew((n) => ({ ...n, code }))
  }

  // Coupons Data
  const { data: coupons = [], isLoading: couponsLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await api.get('/admin/coupons')
      return data
    }
  })

  const toggleCoupon = useMutation({
    mutationFn: (id) => api.patch(`/admin/coupons/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries(['coupons'])
      toast.success('Coupon status updated')
    }
  })

  const deleteCoupon = useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['coupons'])
      toast.success('Coupon deleted')
    }
  })

  const createCouponMutation = useMutation({
    mutationFn: (data) => api.post('/admin/coupons', data),
    onSuccess: () => {
      qc.invalidateQueries(['coupons'])
      toast.success('Coupon created!')
      setModal(false)
      setNew({ code: '', type: 'percentage', value: '', min_cart_value: '', usage_limit: '', expires_at: '' })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create coupon')
    }
  })

  const createCoupon = () => {
    if (!newCoupon.code || !newCoupon.value) { toast.error('Code and value are required'); return }
    createCouponMutation.mutate({
      ...newCoupon,
      value: Number(newCoupon.value),
      min_cart_value: newCoupon.min_cart_value ? Number(newCoupon.min_cart_value) : null,
      usage_limit: newCoupon.usage_limit ? Number(newCoupon.usage_limit) : null,
    })
  }

  // Sliders Data
  const { data: sliders = [], isLoading: slidersLoading } = useQuery({
    queryKey: ['sliders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sliders')
      return data
    }
  })

  const toggleSlider = useMutation({
    mutationFn: (id) => api.patch(`/admin/sliders/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries(['sliders'])
      toast.success('Banner status updated')
    }
  })

  const deleteSlider = useMutation({
    mutationFn: (id) => api.delete(`/admin/sliders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['sliders'])
      toast.success('Banner deleted')
    }
  })

  const TABS = [
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
    { id: 'sliders', label: 'Banner Sliders', icon: Image },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing & CMS" subtitle="Drive conversions and manage your brand content" />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Coupons Tab ─────────────────────────────────────────── */}
      {tab === 'coupons' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Coupons', value: coupons.length },
              { label: 'Active',        value: coupons.filter((c) => c.is_active).length },
              { label: 'Total Used',    value: coupons.reduce((s, c) => s + (c.used_count || 0), 0) },
              { label: 'Expired',       value: coupons.filter((c) => c.is_expired).length },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center py-4">
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Active Promotions</h3>
            <button onClick={() => setModal(true)} className="btn-glow">
              <Plus size={15} /> New Coupon
            </button>
          </div>

          {couponsLoading ? (
            <div className="py-20 text-center text-slate-400">Loading coupons...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {coupons.map((c) => (
                <CouponCard 
                  key={c.id} 
                  coupon={c} 
                  onToggle={(id) => toggleCoupon.mutate(id)} 
                  onDelete={(id) => {
                    if (window.confirm('Delete this coupon?')) deleteCoupon.mutate(id)
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sliders Tab ─────────────────────────────────────────── */}
      {tab === 'sliders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">Hero Banners</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage storefront hero slider content and scheduling</p>
            </div>
            <button onClick={() => setSliderModal(true)} className="btn-glow">
              <Plus size={15} /> Add Banner
            </button>
          </div>

          <div className="card bg-glow-50 border-glow-200">
            <div className="flex items-center gap-2 text-sm text-glow-700">
              <Zap size={15} />
              <span className="font-medium">Images are automatically resized and converted to WebP via Spatie Media Library for optimal performance.</span>
            </div>
          </div>

          {slidersLoading ? (
            <div className="py-20 text-center text-slate-400">Loading banners...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sliders.map((s) => (
                <SliderCard 
                  key={s.id} 
                  slide={s} 
                  onToggle={(id) => toggleSlider.mutate(id)} 
                  onDelete={(id) => {
                    if (window.confirm('Delete this banner?')) deleteSlider.mutate(id)
                  }}
                  onEdit={(slide) => {
                    setSelectedSlider(slide)
                    setSliderModal(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create slider modal */}
      <SliderModal 
        open={showSliderModal} 
        onClose={() => {
          setSliderModal(false)
          setSelectedSlider(null)
        }} 
        editing={selectedSlider}
      />

      {/* Create coupon modal */}
      <Modal open={showModal} onClose={() => setModal(false)} title="Create Promo Coupon" maxW="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="label">Promo Code *</label>
            <div className="flex gap-2">
              <input
                value={newCoupon.code}
                onChange={(e) => setNew((n) => ({ ...n, code: e.target.value.toUpperCase() }))}
                className="input-field flex-1 font-mono"
                placeholder="GLOW2026"
              />
              <button onClick={genCode} className="btn-outline whitespace-nowrap">
                <Zap size={14} /> Auto-generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Discount Type</label>
              <select value={newCoupon.type} onChange={(e) => setNew((n) => ({ ...n, type: e.target.value }))} className="select-field">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Discount Value *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {newCoupon.type === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNew((n) => ({ ...n, value: e.target.value }))}
                  className="input-field pl-8"
                  placeholder={newCoupon.type === 'percentage' ? '15' : '100'}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Minimum Cart (₹)</label>
              <input type="number" value={newCoupon.min_cart_value}
                onChange={(e) => setNew((n) => ({ ...n, min_cart_value: e.target.value }))}
                className="input-field" placeholder="999" />
            </div>
            <div>
              <label className="label">Usage Limit</label>
              <input type="number" value={newCoupon.usage_limit}
                onChange={(e) => setNew((n) => ({ ...n, usage_limit: e.target.value }))}
                className="input-field" placeholder="500" />
            </div>
          </div>

          <div>
            <label className="label">Expires At</label>
            <input type="date" value={newCoupon.expires_at}
              onChange={(e) => setNew((n) => ({ ...n, expires_at: e.target.value }))}
              className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button onClick={createCoupon} className="btn-glow flex-1 justify-center">Create Coupon</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Slider Modal ─────────────────────────────────────────────────────────────
function SliderModal({ open, onClose, editing = null }) {
  const qc = useQueryClient()
  const [file, setFile] = useState(null)
  const [data, setData] = useState({
    title: '', subtitle: '', button_text: 'Shop Now', link_url: '',
    sort_order: 0, starts_at: '', ends_at: ''
  })

  useEffect(() => {
    if (editing) {
      setData({
        title: editing.title || '',
        subtitle: editing.subtitle || '',
        button_text: editing.button_text || 'Shop Now',
        link_url: editing.link_url || '',
        sort_order: editing.sort_order || 0,
        starts_at: editing.starts_at || '',
        ends_at: editing.ends_at || ''
      })
    } else {
      setData({ title: '', subtitle: '', button_text: 'Shop Now', link_url: '', sort_order: 0, starts_at: '', ends_at: '' })
    }
    setFile(null)
  }, [editing, open])

  const create = useMutation({
    mutationFn: async (fd) => api.post('/admin/sliders', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries(['sliders'])
      toast.success('Banner created!')
      onClose()
      setData({ title: '', subtitle: '', button_text: 'Shop Now', link_url: '', sort_order: 0, starts_at: '', ends_at: '' })
      setFile(null)
    }
  })

  const update = useMutation({
    mutationFn: async (fd) => api.post(`/admin/sliders/${editing.id}?_method=PUT`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries(['sliders'])
      toast.success('Banner updated!')
      onClose()
    }
  })

  const handleSubmit = () => {
    if (!editing && !file) { toast.error('Image is required'); return }
    if (!data.title) { toast.error('Title is required'); return }

    const fd = new FormData()
    if (file) fd.append('banner', file)
    
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== '') fd.append(k, v)
    })

    if (editing) {
      update.mutate(fd)
    } else {
      create.mutate(fd)
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Hero Banner" : "Add Hero Banner"} maxW="max-w-xl">
      <div className="space-y-4">
        {/* Image upload */}
        <div 
          onClick={() => document.getElementById('slider-upload').click()}
          className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 hover:border-glow-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group"
        >
          {file ? (
            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
          ) : editing?.image_url ? (
            <img src={editing.image_url} className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-glow-500 mb-2">
                <Plus size={20} />
              </div>
              <p className="text-sm font-medium text-slate-600">Click to upload banner image</p>
              <p className="text-xs text-slate-400 mt-1">Recommended: 1920x800px (Max 8MB)</p>
            </>
          )}
          <input 
            id="slider-upload" type="file" hidden accept="image/*" 
            onChange={e => setFile(e.target.files[0])} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Banner Title *</label>
            <input value={data.title} onChange={e => setData({...data, title: e.target.value})} className="input-field" placeholder="Season Sale" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input value={data.subtitle} onChange={e => setData({...data, subtitle: e.target.value})} className="input-field" placeholder="Up to 50% off" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Button Text</label>
            <input value={data.button_text} onChange={e => setData({...data, button_text: e.target.value})} className="input-field" placeholder="Shop Now" />
          </div>
          <div>
            <label className="label">Link URL</label>
            <input value={data.link_url} onChange={e => setData({...data, link_url: e.target.value})} className="input-field" placeholder="https://..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Starts At (Optional)</label>
            <input type="date" value={data.starts_at} onChange={e => setData({...data, starts_at: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="label">Ends At (Optional)</label>
            <input type="date" value={data.ends_at} onChange={e => setData({...data, ends_at: e.target.value})} className="input-field" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isPending}
            className="btn-glow flex-1 justify-center"
          >
            {isPending ? 'Saving...' : editing ? 'Update Banner' : 'Create Banner'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
