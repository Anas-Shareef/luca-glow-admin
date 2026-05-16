import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IndianRupee, ShoppingCart, Users, TrendingUp,
  ArrowRight, Package, AlertTriangle, Sparkles
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Sector
} from 'recharts'
import { KPICard, PageHeader, StatusBadge, StockBadge, Skeleton, TableSkeleton } from '../../components/ui'
import { useDashboardStats, useSalesChart, useCategoryChart, useLowStockProducts, useRecentOrders } from '../../api/hooks'
import { formatINR } from '../../data/mock'

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4 min-w-[160px]">
      <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-700 font-semibold">
            {p.dataKey === 'revenue' ? formatINR(p.value) : `${p.value} orders`}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActiveSector({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value }) {
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 7}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#1e293b" fontSize={22} fontWeight={700}>{value}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={11}>{payload.name.split(' ')[0]}</text>
    </g>
  )
}

function KPISkeleton() {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-36" /><Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate              = useNavigate()
  const [period, setPeriod]   = useState('monthly')
  const [activeIdx, setActive] = useState(0)

  const { data: stats,        isLoading: sl } = useDashboardStats()
  const { data: salesData,    isLoading: cl } = useSalesChart(period)
  const { data: catData,      isLoading: dl } = useCategoryChart()
  const { data: lowStock,     isLoading: ll } = useLowStockProducts()
  const { data: recentOrders, isLoading: rl } = useRecentOrders()

  return (
    <div className="space-y-8">
      <PageHeader
        title={<span className="flex items-center gap-2">Dashboard <Sparkles size={20} className="text-glow-400" /></span>}
        subtitle="Welcome back! Here's your Luca Glow store overview."
      >
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="select-field w-36">
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
        </select>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {sl ? Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />) : (
          <>
            <KPICard title="Total Revenue"   value={stats?.total_sales ?? 0}     growth={stats?.sales_growth}     icon={IndianRupee} format="currency" color="glow"   />
            <KPICard title="Total Orders"    value={stats?.total_orders ?? 0}    growth={stats?.orders_growth}    icon={ShoppingCart}                   color="blue"   />
            <KPICard title="Customers"       value={stats?.total_customers ?? 0} growth={stats?.customers_growth} icon={Users}                          color="green"  />
            <KPICard title="Avg Order Value" value={stats?.avg_order_value ?? 0} growth={stats?.aov_growth}       icon={TrendingUp}  format="currency" color="purple" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-800">Revenue Over Time</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue & order trends</p>
            </div>
            <span className="badge bg-glow-50 text-glow-700 border border-glow-200">2025</span>
          </div>
          {cl ? <Skeleton className="h-[280px] w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rev"
                  tickFormatter={(v) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                />
                <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<LineTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} formatter={(v) => v === 'revenue' ? 'Revenue (₹)' : 'Orders'} />
                <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="#FDBA74" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#FDBA74', stroke: '#fff', strokeWidth: 2 }} />
                <Line yAxisId="ord" type="monotone" dataKey="orders"  stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card flex flex-col">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800">Category Split</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sales share by product category</p>
          </div>
          {dl ? (
            <div className="flex-1 flex flex-col items-center gap-3 pt-4">
              <Skeleton className="w-36 h-36 rounded-full" />
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-3 w-full rounded" />)}
            </div>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={58} outerRadius={84}
                      dataKey="value" activeIndex={activeIdx} activeShape={ActiveSector}
                      onMouseEnter={(_, i) => setActive(i)}
                    >
                      {catData?.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 mt-2">
                {catData?.map((c, i) => (
                  <li key={i} className="flex items-center justify-between text-xs cursor-pointer" onMouseEnter={() => setActive(i)}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="text-slate-600">{c.name}</span>
                    </span>
                    <span className="font-bold text-slate-700">{c.value}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest transactions</p>
            </div>
            <button onClick={() => navigate('/orders')} className="flex items-center gap-1.5 text-xs font-semibold text-glow-600 hover:text-glow-700 bg-glow-50 hover:bg-glow-100 px-3 py-1.5 rounded-lg transition-colors">
              View All <ArrowRight size={12} />
            </button>
          </div>
          {rl ? <TableSkeleton rows={6} cols={5} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr>{['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => <th key={h} className="tbl-head text-left">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {recentOrders?.map((o) => (
                    <tr key={o.id} className="tbl-row cursor-pointer" onClick={() => navigate('/orders')}>
                      <td className="tbl-cell font-mono text-xs font-bold text-glow-700">{o.order_number}</td>
                      <td className="tbl-cell">
                        <div className="font-semibold text-sm text-slate-800">{o.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{o.city}</div>
                      </td>
                      <td className="tbl-cell font-bold text-slate-800">{formatINR(o.total_inr)}</td>
                      <td className="tbl-cell"><StatusBadge status={o.status} /></td>
                      <td className="tbl-cell text-slate-400 text-xs">{o.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={15} className="text-orange-400" />
            <div>
              <h3 className="font-semibold text-slate-800">Low Stock Alerts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {ll ? '…' : `${lowStock?.length ?? 0} products need restocking`}
              </p>
            </div>
          </div>
          {ll ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : lowStock?.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Package size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">All products well-stocked!</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2.5 flex-1">
              {lowStock?.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                  <img src={p.image || p.cover_image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                  </div>
                  <StockBadge qty={p.stock_quantity} />
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => navigate('/products')} className="mt-5 btn-outline w-full justify-center text-xs">
            Manage Inventory
          </button>
        </div>
      </div>
    </div>
  )
}
