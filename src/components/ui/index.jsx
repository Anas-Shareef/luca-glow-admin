// ─── Shared UI Components ────────────────────────────────────────────────────

import { X, TrendingUp, TrendingDown, Minus, AlertOctagon } from 'lucide-react'
import clsx from 'clsx'
import { formatINR } from '../../data/mock'

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, className }) {
  return <span className={clsx('badge', className)}>{children}</span>
}

// ── Status Badge (orders) ─────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const MAP = {
    pending:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
    processing: 'bg-orange-50 text-orange-700 border border-orange-200',
    shipped:    'bg-blue-50 text-blue-700 border border-blue-200',
    delivered:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled:  'bg-red-50 text-red-600 border border-red-200',
  }
  const LABELS = {
    pending:'Pending', processing:'Processing', shipped:'Shipped',
    delivered:'Delivered', cancelled:'Cancelled',
  }
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold', MAP[status])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full',
        status === 'delivered'  ? 'bg-emerald-500' :
        status === 'cancelled'  ? 'bg-red-500' :
        status === 'shipped'    ? 'bg-blue-500' :
        status === 'processing' ? 'bg-orange-500' :
        'bg-yellow-500'
      )} />
      {LABELS[status] || status}
    </span>
  )
}

// ── Group Badge (customers) ──────────────────────────────────────────────────
export function GroupBadge({ group }) {
  const MAP = {
    VIP:          'bg-amber-50 text-amber-700 border border-amber-200',
    Regular:      'bg-slate-100 text-slate-600 border border-slate-200',
    Wholesale:    'bg-purple-50 text-purple-700 border border-purple-200',
    'First-Time': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', MAP[group] || MAP.Regular)}>
      {group}
    </span>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
export function KPICard({ title, value, growth, icon: Icon, format = 'number', color = 'glow' }) {
  const isPositive = growth > 0
  const isNeutral  = growth === 0

  const colorMap = {
    glow:   'from-glow-400 to-glow-500',
    blue:   'from-blue-400 to-blue-500',
    green:  'from-emerald-400 to-emerald-500',
    purple: 'from-violet-400 to-violet-500',
  }

  const formatted =
    format === 'currency' ? formatINR(value) :
    format === 'decimal'  ? value.toFixed(2) :
    value.toLocaleString('en-IN')

  return (
    <div className="kpi-card group hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800 font-display tracking-tight">
            {format === 'currency' && <span className="text-xl mr-0.5 text-slate-500">₹</span>}
            {format === 'currency'
              ? value.toLocaleString('en-IN')
              : formatted}
          </p>
        </div>
        <div className={clsx('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0', colorMap[color])}>
          <Icon size={22} className="text-white" />
        </div>
      </div>

      {growth !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {isNeutral ? (
            <Minus size={14} className="text-slate-400" />
          ) : isPositive ? (
            <TrendingUp size={14} className="text-emerald-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span className={clsx('text-xs font-semibold',
            isNeutral ? 'text-slate-500' :
            isPositive ? 'text-emerald-600' : 'text-red-600'
          )}>
            {isPositive ? '+' : ''}{growth}%
          </span>
          <span className="text-xs text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  )
}

// ── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}

// ── Slide-over ───────────────────────────────────────────────────────────────
export function SlideOver({ open, onClose, title, subtitle, children, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={clsx('fixed inset-y-0 right-0 z-50 flex flex-col w-full bg-white shadow-2xl animate-slide-in', width)}>
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxW = 'max-w-md' }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className={clsx('bg-white rounded-2xl shadow-2xl w-full overflow-hidden', maxW)}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <X size={16} />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </>
  )
}

// ── Confirm Dialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'danger' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-scale-in border border-slate-100">
        <div className={clsx(
          'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6',
          type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-glow-50 text-glow-500'
        )}>
          <AlertOctagon size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">{message}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={clsx(
              'w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]',
              type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-glow-600 text-white hover:bg-glow-700'
            )}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return <div className={clsx('skeleton', className)} />
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={clsx('h-9 rounded-lg', j === 0 ? 'w-10' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-glow-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-glow-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}

// ── Toggle Switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-5.5 rounded-full transition-colors duration-200',
          checked ? 'bg-brand-primary' : 'bg-slate-200'
        )}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200',
            checked ? 'translate-x-[20px]' : 'translate-x-[2px]'
          )}
        />
      </div>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
  )
}

// ── Stock Badge ───────────────────────────────────────────────────────────────
export function StockBadge({ qty }) {
  if (qty === 0)   return <span className="badge bg-red-50 text-red-600 border border-red-200">Out of Stock</span>
  if (qty <= 10)   return <span className="badge bg-orange-50 text-orange-600 border border-orange-200">Low: {qty}</span>
  return <span className="text-sm font-medium text-slate-700">{qty}</span>
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 'md' }) {
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-xs'
  return (
    <div className={clsx('rounded-xl bg-gradient-to-br from-glow-200 to-glow-400 flex items-center justify-center font-bold text-white shrink-0', sz)}>
      {initials}
    </div>
  )
}
