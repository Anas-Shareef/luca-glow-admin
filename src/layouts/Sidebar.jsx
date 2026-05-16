import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, Megaphone, Settings, Sparkles,
  ChevronLeft, ChevronRight, LogOut,
  Image, BarChart3, Globe, Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const NAV_SECTIONS = [
  {
    title: 'Core',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    title: 'Catalog',
    items: [
      { to: '/products',   icon: Package, label: 'Products' },
      { to: '/categories', icon: Tag,     label: 'Categories' },
    ]
  },
  {
    title: 'Sales',
    items: [
      { to: '/orders',    icon: ShoppingCart, label: 'Orders' },
      { to: '/customers', icon: Users,        label: 'Customers' },
      { to: '/reviews',   icon: Star,         label: 'Reviews' },
    ]
  },
  {
    title: 'Growth',
    items: [
      { to: '/marketing', icon: Megaphone, label: 'Marketing & CMS' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate()
  const logout   = useAuthStore((s) => s.logout)
  const user     = useAuthStore((s) => s.user)

  const { data: settings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => {
      const { data } = await api.get('/settings/public')
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  })

  function handleLogout() {
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-30 bg-white border-r border-slate-100 flex flex-col',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center h-16 px-4 border-b border-slate-100 shrink-0',
        collapsed ? 'justify-center' : 'gap-3')}>
        <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Sparkles size={18} className="text-white" />
          )}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display font-bold text-slate-800 text-lg leading-tight truncate">
              {settings?.store_name || 'Luca Glow'}
            </div>
            <div className="text-[10px] font-semibold text-glow-500 uppercase tracking-widest">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                        collapsed ? 'justify-center' : 'gap-3',
                        isActive
                          ? 'bg-glow-100 text-glow-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={clsx('shrink-0', isActive ? 'text-glow-600' : 'text-slate-400')} />
                        {!collapsed && <span>{label}</span>}
                        {!collapsed && isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-glow-500" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + collapse */}
      <div className="shrink-0 border-t border-slate-100 p-3 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-glow-50 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-glow-300 to-glow-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0)}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors',
            collapsed ? 'justify-center' : 'gap-3'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} />
          {!collapsed && 'Logout'}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'w-full flex items-center rounded-xl px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors',
            collapsed ? 'justify-center' : 'gap-3'
          )}
          title={collapsed ? 'Expand sidebar' : undefined}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
