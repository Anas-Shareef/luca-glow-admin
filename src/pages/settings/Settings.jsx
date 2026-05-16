import React, { useState, useRef, useEffect } from 'react'
import {
  Store, Globe, Shield, Wrench, Upload, Save,
  Moon, Sun, Sparkles, Percent, User, Plus,
  Trash2, Lock, Check, AlertTriangle, RefreshCw
} from 'lucide-react'
import { PageHeader, Toggle, Modal, Avatar } from '../../components/ui'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─── Sub-section wrapper ──────────────────────────────────────────────────────
function SettingSection({ id, icon: Icon, title, description, children }) {
  return (
    <div id={id} className="card space-y-5 scroll-mt-20">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-glow-100 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-glow-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function FormRow({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

// ─── Logo uploader ────────────────────────────────────────────────────────────
function LogoUploader({ label, hint, value, onUpload, loading }) {
  const [preview, setPreview] = useState(value)
  const ref = useRef()

  useEffect(() => { 
    setPreview(value) 
  }, [value])

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onClick={() => !loading && ref.current.click()}
        className={clsx(
          "flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-glow-300 hover:bg-glow-50/30 cursor-pointer transition-all relative overflow-hidden",
          loading && "opacity-50 cursor-wait"
        )}
      >
        <input
          ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => {
            const f = e.target.files[0]
            if (f) onUpload(f)
          }}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <RefreshCw size={16} className="animate-spin text-glow-500" />
          </div>
        )}
        {preview ? (
          <img src={preview} alt="Logo" className="h-12 object-contain rounded-lg" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Upload size={18} className="text-slate-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-700">
            {preview ? 'Click to replace' : 'Click to upload'}
          </p>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Staff Role Row ───────────────────────────────────────────────────────────
const MOCK_STAFF = [
  { id: 1, name: 'Luca Admin',    email: 'admin@lucaglow.com',   role: 'Super Admin', active: true  },
  { id: 2, name: 'Arun Admin',     email: 'arun@lucaglow.com',    role: 'Admin',       active: true  },
  { id: 3, name: 'Nisha Viewer',  email: 'nisha@lucaglow.com',   role: 'Viewer',      active: false },
]

const ROLES = ['Super Admin', 'Admin', 'Viewer']

function RoleRow({ staff }) {
  const qc = useQueryClient()
  const [role,   setRole]   = useState(staff.role)
  const [active, setActive] = useState(staff.active)

  const updateRole = useMutation({
    mutationFn: (r) => api.patch(`/admin/staff/${staff.id}/role`, { role: r }),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries(['staff']) }
  })

  const toggleStatus = useMutation({
    mutationFn: () => api.patch(`/admin/staff/${staff.id}/toggle`),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['staff']) }
  })

  const deleteStaff = useMutation({
    mutationFn: () => api.delete(`/admin/staff/${staff.id}`),
    onSuccess: () => { toast.success('Staff member deleted'); qc.invalidateQueries(['staff']) },
    onError: (err) => { toast.error(err.response?.data?.message || 'Delete failed') }
  })

  return (
    <div className={clsx(
      'flex items-center gap-3 p-3 rounded-xl border transition-colors',
      active ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
    )}>
      <Avatar initials={staff.name.split(' ').map(n => n[0]).join('')} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{staff.name}</p>
        <p className="text-xs text-slate-400 truncate">{staff.email}</p>
      </div>
      <div className="flex items-center gap-4">
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); updateRole.mutate(e.target.value) }}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-glow-300 focus:outline-none w-32 shrink-0"
        >
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="flex items-center gap-3">
          <Toggle checked={active} onChange={() => { setActive(!active); toggleStatus.mutate() }} />
          <button 
            onClick={() => { if(window.confirm(`Delete ${staff.name}?`)) deleteStaff.mutate() }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
            title="Delete Staff"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  const qc = useQueryClient()
  const [store, setStore] = useState({
    store_name:     'LUCA × LYKHA',
    tagline:        'Feel The Change · Since 2016',
    support_email:  'Support@lucasworld.in',
    support_phone:  '+91 98464 51868',
    address:        'Luca World, Near Uppala Bus stand, Kasaragod District, Kerala State.',
    gst_rate:       18,
    gst_number:     '32AABCU9603R1ZX',
    maintenance:    false,
    maintenance_msg:'We\'re upgrading our store experience. Back soon! ✨',
  })

  const [invModal, setInvModal] = useState(false)
  const [invEmail, setInvEmail] = useState('')
  const [invName,  setInvName]  = useState('')
  const [invPassword, setInvPassword] = useState('')
  const [invRole,  setInvRole]  = useState('Viewer')

  const { isLoading, data: rawSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings')
      const merged = { ...data.general, ...data.regional, ...data.seo }
      setStore(prev => ({ ...prev, ...merged }))
      return data
    }
  })

  const { data: publicSettings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => {
      const { data } = await api.get('/settings/public')
      return data
    }
  })

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/admin/staff')
      return data
    }
  })

  const saveSettings = useMutation({
    mutationFn: (data) => api.put('/admin/settings', data),
    onSuccess: () => { 
      toast.success('Settings saved successfully!'); 
      qc.invalidateQueries(['settings']);
      qc.invalidateQueries(['settings-public']);
    }
  })

  const uploadMedia = useMutation({
    mutationFn: async ({ key, file }) => {
      const fd = new FormData()
      fd.append('key', key)
      fd.append('file', file)
      const { data } = await api.post('/admin/settings/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    },
    onSuccess: () => {
      toast.success('Media updated successfully')
      qc.invalidateQueries(['settings'])
      qc.invalidateQueries(['settings-public'])
    }
  })

  const createStaff = useMutation({
    mutationFn: (data) => api.post('/admin/staff', data),
    onSuccess: () => { 
      toast.success('Staff member created!'); 
      setInvModal(false); 
      setInvEmail(''); 
      setInvName('');
      setInvPassword('');
      qc.invalidateQueries(['staff']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not create staff member');
    }
  })

  const clearCache = useMutation({
    mutationFn: (type) => api.post('/admin/settings/cache/clear', { type }),
    onSuccess: (res) => toast.success(res.data.message)
  })

  const navItems = [
    { id: 'store',       label: 'Store Identity' },
    { id: 'maintenance', label: 'Maintenance'     },
    { id: 'rbac',        label: 'Team & Access'   },
  ]

  const handleSave = () => {
    saveSettings.mutate(store)
  }

  const handleInvite = () => {
    if (!invEmail || !invName || !invPassword) { toast.error('Name, Email, and Password are required'); return }
    createStaff.mutate({ name: invName, email: invEmail, password: invPassword, role: invRole })
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <RefreshCw size={24} className="animate-spin mr-3" />
      Loading system settings...
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="System Settings"
        subtitle="Configure your store, tax rules, and team access"
      >
        <button onClick={handleSave} disabled={saveSettings.isPending} className="btn-glow">
          <Save size={15} />
          {saveSettings.isPending ? 'Saving…' : 'Save All Changes'}
        </button>
      </PageHeader>

      {/* Sticky side nav + content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Side nav */}
        <div className="lg:col-span-1">
          <div className="card p-3 sticky top-20 space-y-1">
            {navItems.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-glow-50 hover:text-glow-700 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">

          {/* ── Store Identity ─────────────────────────────────── */}
          <SettingSection
            id="store"
            icon={Store}
            title="Store Identity"
            description="Brand name, contact info, and logo assets displayed across the admin and storefront."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormRow label="Store Name">
                <input
                  value={store.store_name}
                  onChange={e => setStore(s => ({ ...s, store_name: e.target.value }))}
                  className="input-field"
                  placeholder="Luca Glow"
                />
              </FormRow>
              <FormRow label="Tagline">
                <input
                  value={store.tagline}
                  onChange={e => setStore(s => ({ ...s, tagline: e.target.value }))}
                  className="input-field"
                  placeholder="Feel The Change"
                />
              </FormRow>
              <FormRow label="Support Email">
                <input
                  type="email"
                  value={store.support_email}
                  onChange={e => setStore(s => ({ ...s, support_email: e.target.value }))}
                  className="input-field"
                />
              </FormRow>
              <FormRow label="Phone">
                <input
                  value={store.support_phone}
                  onChange={e => setStore(s => ({ ...s, support_phone: e.target.value }))}
                  className="input-field"
                />
              </FormRow>
            </div>

            <FormRow label="Address" hint="Displayed on invoices">
              <textarea
                value={store.address}
                onChange={e => setStore(s => ({ ...s, address: e.target.value }))}
                className="input-field resize-none"
                rows={2}
              />
            </FormRow>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LogoUploader 
                label="Primary Logo" 
                hint="SVG or PNG, 300×100px" 
                value={publicSettings?.logo_url}
                loading={uploadMedia.isPending && uploadMedia.variables?.key === 'store_logo'}
                onUpload={(f) => uploadMedia.mutate({ key: 'store_logo', file: f })}
              />
              <LogoUploader 
                label="Secondary Logo" 
                hint="Dark variant" 
                value={publicSettings?.logo_dark_url}
                loading={uploadMedia.isPending && uploadMedia.variables?.key === 'store_logo_dark'}
                onUpload={(f) => uploadMedia.mutate({ key: 'store_logo_dark', file: f })}
              />
              <LogoUploader 
                label="Favicon" 
                hint="32×32px ICO or PNG" 
                value={publicSettings?.favicon_url}
                loading={uploadMedia.isPending && uploadMedia.variables?.key === 'store_favicon'}
                onUpload={(f) => uploadMedia.mutate({ key: 'store_favicon', file: f })}
              />
            </div>

            {/* Brand palette preview */}
            <div>
              <label className="label">Brand Colour Palette</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { name: 'Primary',   hex: '#FDBA74' },
                  { name: 'Secondary', hex: '#FB923C' },
                  { name: 'Dark',      hex: '#7C2D12' },
                  { name: 'Soft',      hex: '#FFF7ED' },
                  { name: 'Success',   hex: '#34D399' },
                  { name: 'Danger',    hex: '#EF4444' },
                ].map(({ name, hex }) => (
                  <div key={name} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-white shadow-md"
                      style={{ background: hex }}
                    />
                    <p className="text-[10px] text-slate-500 font-medium">{name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
          </SettingSection>


          {/* ── Maintenance ────────────────────────────────────── */}
          <SettingSection
            id="maintenance"
            icon={Wrench}
            title="Maintenance Mode"
            description="Instantly toggle a beautiful 'Coming Soon' screen on the storefront without touching code."
          >
            <div className={clsx(
              'flex items-center justify-between p-4 rounded-2xl border-2 transition-all',
              store.maintenance
                ? 'bg-orange-50 border-orange-300'
                : 'bg-slate-50 border-slate-200'
            )}>
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  store.maintenance ? 'bg-orange-100' : 'bg-white border border-slate-200'
                )}>
                  {store.maintenance
                    ? <Moon size={18} className="text-orange-500" />
                    : <Sun size={18} className="text-slate-400" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Storefront: {store.maintenance ? 'In Maintenance' : 'Live & Active'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {store.maintenance
                      ? 'Customers see your maintenance page'
                      : 'Store is visible to all customers'
                    }
                  </p>
                </div>
              </div>
              <Toggle
                checked={store.maintenance}
                onChange={v => {
                  setStore(s => ({ ...s, maintenance: v }))
                  toast[v ? 'error' : 'success'](v ? '⚠️ Store is now in Maintenance Mode' : '✅ Store is back Live!')
                }}
              />
            </div>

            {store.maintenance && (
              <div className="animate-fade-in">
                <FormRow label="Maintenance Message" hint="Shown to customers visiting your store">
                  <textarea
                    value={store.maintenance_msg}
                    onChange={e => setStore(s => ({ ...s, maintenance_msg: e.target.value }))}
                    className="input-field resize-none"
                    rows={2}
                  />
                </FormRow>
                {/* Preview */}
                <div className="mt-3 p-6 bg-gradient-to-br from-glow-50 to-glow-100 border border-glow-200 rounded-2xl text-center">
                  <Sparkles size={28} className="text-glow-400 mx-auto mb-3" />
                  <p className="font-display font-bold text-glow-800 text-lg">Luca Glow</p>
                  <p className="text-sm text-glow-700 mt-2 max-w-xs mx-auto">{store.maintenance_msg}</p>
                </div>
              </div>
            )}

            {/* Cache management */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Cache & Performance</p>
              <div className="flex gap-3 flex-wrap">
                {['config', 'route', 'view', 'all'].map(type => (
                  <button
                    key={type}
                    onClick={() => clearCache.mutate(type)}
                    disabled={clearCache.isPending}
                    className="btn-outline text-xs py-2 capitalize"
                  >
                    <RefreshCw size={12} className={clearCache.isPending ? 'animate-spin' : ''} /> 
                    Clear {type} Cache
                  </button>
                ))}
              </div>
            </div>
          </SettingSection>

          {/* ── RBAC / Team ─────────────────────────────────────── */}
          <SettingSection
            id="rbac"
            icon={Shield}
            title="Team & Access Control"
            description="Manage staff roles and permissions. Sanctum-protected — each role restricts API endpoint access."
          >
            {/* Role permission matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500">Permission</th>
                    {ROLES.map(r => (
                      <th key={r} className="text-center py-2 px-3 font-semibold text-slate-500">{r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { perm: 'View Dashboard',    access: [true,  true,  true ] },
                    { perm: 'Manage Products',   access: [true,  true,  false] },
                    { perm: 'Process Orders',    access: [true,  true,  false] },
                    { perm: 'View Customers',    access: [true,  true,  true ] },
                    { perm: 'Marketing / CMS',   access: [true,  true,  false] },
                    { perm: 'System Settings',   access: [true,  false, false] },
                    { perm: 'Manage Staff',      access: [true,  false, false] },
                  ].map(({ perm, access }) => (
                    <tr key={perm} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-700">{perm}</td>
                      {access.map((has, i) => (
                        <td key={i} className="py-2.5 px-3 text-center">
                          {has
                            ? <Check size={14} className="text-emerald-500 mx-auto" />
                            : <span className="text-slate-200 text-lg leading-none mx-auto block text-center">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Staff list */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Staff Members ({staff.length})
                </p>
                <button onClick={() => setInvModal(true)} className="btn-glow text-xs py-2">
                  <Plus size={13} /> Create Staff
                </button>
              </div>
              <div className="space-y-2">
                {staff.map(s => <RoleRow key={s.id} staff={s} />)}
              </div>
            </div>
          </SettingSection>

          {/* Save button */}
          <div className="flex justify-end pb-4">
            <button onClick={handleSave} disabled={saveSettings.isPending} className="btn-glow px-8 py-3">
              <Save size={15} />
              {saveSettings.isPending ? 'Saving…' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Invite modal */}
      <Modal open={invModal} onClose={() => setInvModal(false)} title="Create Staff Account">
        <div className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              value={invName}
              onChange={e => setInvName(e.target.value)}
              className="input-field"
              placeholder="John Doe"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={invEmail}
              onChange={e => setInvEmail(e.target.value)}
              className="input-field"
              placeholder="staff@lucaglow.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={invPassword}
                onChange={e => setInvPassword(e.target.value)}
                className="input-field pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label className="label">Assign Role</label>
            <select value={invRole} onChange={e => setInvRole(e.target.value)} className="select-field">
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setInvModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
            <button onClick={handleInvite} className="btn-glow flex-1 justify-center">Create Account</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
