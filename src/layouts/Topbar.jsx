import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronRight, Home, ExternalLink } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import clsx from 'clsx'

const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  products:  'Products',
  categories:'Categories',
  orders:    'Orders',
  customers: 'Customers',
  marketing: 'Marketing & CMS',
  settings:  'Settings',
  new:       'New',
}

const MOCK_NOTIFS = [
  { id: 1, text: 'Order #LG-2025-1284 delivered',  time: '2m ago', dot: 'bg-green-400' },
  { id: 2, text: 'Low stock: Kojic Facewash (8)',   time: '18m ago', dot: 'bg-red-400' },
  { id: 3, text: 'New customer: Vikram Pillai',     time: '1h ago', dot: 'bg-blue-400' },
  { id: 4, text: 'Coupon DIWALI25 expired',         time: '3h ago', dot: 'bg-yellow-400' },
]

export default function Topbar({ sidebarW }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [search,  setSearch]  = useState('')
  const [notifOpen, setNotif] = useState(false)
  const dSearch = useDebounce(search)

  // Build breadcrumbs from path
  const crumbs = location.pathname.replace(/^\//, '').split('/').filter(Boolean)

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center h-16 bg-white border-b border-slate-100 px-6 gap-4"
      style={{ left: sidebarW }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
        <Home size={13} className="text-slate-400 shrink-0" />
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
            <span
              className={clsx(
                'truncate',
                i === crumbs.length - 1
                  ? 'font-semibold text-slate-800'
                  : 'text-slate-400 hover:text-slate-600 cursor-pointer'
              )}
              onClick={() => i < crumbs.length - 1 && navigate(`/${crumbs.slice(0, i + 1).join('/')}`)}
            >
              {ROUTE_LABELS[c] || c}
            </span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-brand-primary focus-within:border-transparent transition-all">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders, products…"
          className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full"
        />
        {search && (
          <kbd className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        )}
      </div>

      {/* Store link */}
      <a
        href="https://luca-glow-project.lovable.app"
        target="_blank"
        rel="noreferrer"
        className="hidden md:flex items-center gap-1.5 text-xs font-medium text-glow-600 hover:text-glow-700 bg-glow-50 hover:bg-glow-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        <ExternalLink size={12} />
        View Store
      </a>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotif(!notifOpen)}
          className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-glow-50 hover:border-glow-200 transition-colors"
        >
          <Bell size={16} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-glow-400 border border-white" />
        </button>

        {notifOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setNotif(false)} />
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                <span className="badge bg-glow-100 text-glow-700">{MOCK_NOTIFS.length} new</span>
              </div>
              <ul className="divide-y divide-slate-50">
                {MOCK_NOTIFS.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.dot}`} />
                    <div>
                      <p className="text-xs text-slate-700 font-medium">{n.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 border-t border-slate-100">
                <button className="text-xs text-glow-600 hover:text-glow-700 font-medium w-full text-center py-1">
                  Mark all as read
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
