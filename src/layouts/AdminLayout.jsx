import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 72 : 260

  const { data: settings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => {
      const { data } = await api.get('/settings/public')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (settings) {
      document.title = `${settings.store_name} — Admin Panel`
      const favicon = document.getElementById('favicon')
      if (favicon && settings.favicon_url) {
        favicon.href = settings.favicon_url
      }
    }
  }, [settings])

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarW }}
      >
        <Topbar sidebarW={sidebarW} />

        <main className="min-h-screen pt-16">
          <div className="p-6 lg:p-8 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
