/**
 * Luca Glow Admin — TanStack Query API Hooks
 *
 * Every hook:
 *  1. Calls the real Laravel API via axios
 *  2. Falls back gracefully to mock data if API is unavailable (dev mode)
 *  3. Provides loading / error states consumed by each page
 *
 * Usage in any page:
 *   const { data, isLoading, error } = useProducts({ search: 'kojic' })
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'
import {
  mockStats, mockSalesChart, mockCategoryChart,
  mockProducts, mockOrders, mockCustomers,
  mockCoupons, mockSliders, mockCategories,
} from '../data/mock'

// ─── helpers ──────────────────────────────────────────────────────────────────
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' // respect env variable

/** Wraps every API call so it falls back to mock data in dev / when backend is down */
async function safeGet(endpoint, mockValue, params = {}) {
  if (USE_MOCK) return { data: mockValue }
  try {
    const { data } = await api.get(endpoint, { params })
    return data
  } catch {
    return { data: mockValue }
  }
}

// ─── Query keys ───────────────────────────────────────────────────────────────
export const QK = {
  dashboard:  () => ['dashboard'],
  stats:      () => ['dashboard', 'stats'],
  chart:      (p) => ['dashboard', 'chart', p],
  catChart:   () => ['dashboard', 'category-chart'],
  lowStock:   () => ['dashboard', 'low-stock'],
  recentOrders: () => ['dashboard', 'recent-orders'],

  products:   (f) => ['products', f],
  product:    (id) => ['product', id],

  categories: () => ['categories'],
  category:   (id) => ['category', id],

  orders:     (f) => ['orders', f],
  order:      (id) => ['order', id],

  customers:  (f) => ['customers', f],
  customer:   (id) => ['customer', id],

  coupons:    () => ['coupons'],
  sliders:    () => ['sliders'],
  settings:   () => ['settings'],
  staff:      () => ['staff'],
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

export function useDashboardStats() {
  return useQuery({
    queryKey: QK.stats(),
    queryFn:  () => safeGet('/admin/dashboard/stats', mockStats),
    select:   (d) => d.data ?? d,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSalesChart(period = 'monthly') {
  return useQuery({
    queryKey: QK.chart(period),
    queryFn:  () => safeGet('/admin/dashboard/chart', mockSalesChart, { period }),
    select:   (d) => d.data ?? d,
  })
}

export function useCategoryChart() {
  return useQuery({
    queryKey: QK.catChart(),
    queryFn:  () => safeGet('/admin/dashboard/categories-chart', mockCategoryChart),
    select:   (d) => d.data ?? d,
    staleTime: 1000 * 60 * 10,
  })
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: QK.lowStock(),
    queryFn:  () => safeGet('/admin/dashboard/low-stock', mockProducts.filter(p => p.stock_quantity <= 10)),
    select:   (d) => d.data ?? d,
  })
}

export function useRecentOrders() {
  return useQuery({
    queryKey: QK.recentOrders(),
    queryFn:  () => safeGet('/admin/dashboard/recent-orders', mockOrders.slice(0, 6)),
    select:   (d) => d.data ?? d,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

export function useProducts(filters = {}) {
  return useQuery({
    queryKey: QK.products(filters),
    queryFn: async () => {
      if (USE_MOCK) {
        // Apply filters client-side on mock data
        let data = [...mockProducts]
        if (filters.search) {
          const s = filters.search.toLowerCase()
          data = data.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s))
        }
        if (filters.category_id && filters.category_id !== 'all') {
          data = data.filter(p => p.category === filters.category_id)
        }
        return {
          data,
          meta: { total: data.length, current_page: 1, last_page: 1, per_page: 15 }
        }
      }
      const { data } = await api.get('/admin/products', { params: filters })
      return data
    },
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: QK.product(id),
    queryFn: async () => {
      if (USE_MOCK) return mockProducts.find(p => p.id === Number(id)) || null
      const { data } = await api.get(`/admin/products/${id}`)
      return data
    },
    enabled: !!id && id !== 'new',
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/admin/products', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: QK.lowStock() })
      toast.success('Product created!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create product')
    },
  })
}

export function useUpdateProduct(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put(`/admin/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: QK.product(id) })
      toast.success('Product updated!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted')
    },
  })
}

export function useToggleProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/products/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Status updated')
    },
  })
}

export function useUploadProductMedia(productId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files) => {
      const form = new FormData()
      files.forEach(f => form.append('images[]', f))
      return api.post(`/admin/products/${productId}/media`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.product(productId) })
      toast.success('Images uploaded!')
    },
    onError: () => toast.error('Image upload failed'),
  })
}
export function useDeleteProductMedia(productId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mediaId) => api.delete(`/admin/products/${productId}/media/${mediaId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.product(productId) })
      toast.success('Image removed')
    },
    onError: () => toast.error('Failed to remove image'),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export function useCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: async () => {
      if (USE_MOCK) return mockCategories
      const { data } = await api.get('/admin/categories')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/admin/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      toast.success('Category created!')
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => {
      const id = data instanceof FormData ? data.get('id') : data.id
      // Laravel requires POST + _method=PUT for multipart updates
      if (data instanceof FormData) {
        data.append('_method', 'PUT')
        return api.post(`/admin/categories/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }
      return api.put(`/admin/categories/${id}`, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      toast.success('Category updated!')
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      toast.success('Category deleted')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete category with products'),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

export function useOrders(filters = {}) {
  return useQuery({
    queryKey: QK.orders(filters),
    queryFn: async () => {
      if (USE_MOCK) {
        let data = [...mockOrders]
        if (filters.status) data = data.filter(o => o.status === filters.status)
        if (filters.search) {
          const s = filters.search.toLowerCase()
          data = data.filter(o =>
            o.order_number.toLowerCase().includes(s) ||
            o.customer.name.toLowerCase().includes(s)
          )
        }
        // Build status counts
        const status_counts = mockOrders.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1
          return acc
        }, {})
        return {
          data,
          meta: {
            total: data.length,
            current_page: 1,
            last_page: 1,
            per_page: 15,
            status_counts,
          }
        }
      }
      const { data } = await api.get('/admin/orders', { params: filters })
      return data
    },
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: QK.order(id),
    queryFn: async () => {
      if (USE_MOCK) return mockOrders.find(o => o.id === Number(id)) || null
      const { data } = await api.get(`/admin/orders/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, comment, notify_customer }) =>
      api.patch(`/admin/orders/${id}/status`, { status, comment, notify_customer }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: QK.order(id) })
      qc.invalidateQueries({ queryKey: QK.recentOrders() })
    },
  })
}

export function useBulkOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ order_ids, status }) =>
      api.post('/admin/orders/bulk-status', { order_ids, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Orders updated')
    },
  })
}

export function useExportOrdersCsv() {
  return useMutation({
    mutationFn: async (params = {}) => {
      const response = await api.get('/admin/orders/export/csv', {
        params,
        responseType: 'blob',
      })
      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `orders-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    onSuccess: () => toast.success('CSV export downloaded'),
    onError:   () => toast.error('Export failed'),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════

export function useCustomers(filters = {}) {
  return useQuery({
    queryKey: QK.customers(filters),
    queryFn: async () => {
      if (USE_MOCK) {
        let data = [...mockCustomers]
        if (filters.group) data = data.filter(c => c.group === filters.group)
        if (filters.search) {
          const s = filters.search.toLowerCase()
          data = data.filter(c =>
            c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s)
          )
        }
        return { data, meta: { total: data.length, current_page: 1, last_page: 1 } }
      }
      const { data } = await api.get('/admin/customers', { params: filters })
      return data
    },
    placeholderData: (prev) => prev,
  })
}

export function useCustomer(id) {
  return useQuery({
    queryKey: QK.customer(id),
    queryFn: async () => {
      if (USE_MOCK) return mockCustomers.find(c => c.id === Number(id)) || null
      const { data } = await api.get(`/admin/customers/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useUpdateCustomerGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, group }) => api.patch(`/admin/customers/${id}/group`, { group }),
    onSuccess: (_, { id, group }) => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: QK.customer(id) })
      toast.success(`Customer moved to ${group}`)
    },
    onError: () => toast.error('Failed to update group'),
  })
}

export function useSuspendCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/customers/${id}/suspend`),
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      qc.invalidateQueries({ queryKey: QK.customer(id) })
      const status = data.is_active ? 'activated' : 'suspended'
      toast.success(`Account ${status} successfully`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  })
}

export function useSendPasswordReset() {
  return useMutation({
    mutationFn: (id) => api.post(`/admin/customers/${id}/reset-password`),
    onSuccess: () => toast.success('Password reset email sent'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reset email'),
  })
}

export function useDeleteCustomer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/customers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted successfully')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete customer'),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MARKETING — COUPONS
// ═══════════════════════════════════════════════════════════════════════════════

export function useCoupons() {
  return useQuery({
    queryKey: QK.coupons(),
    queryFn: async () => {
      if (USE_MOCK) return mockCoupons
      const { data } = await api.get('/admin/coupons')
      return data
    },
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/admin/coupons', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.coupons() })
      toast.success('Coupon created!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create coupon'),
  })
}

export function useUpdateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/admin/coupons/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.coupons() })
      toast.success('Coupon updated!')
    },
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.coupons() })
      toast.success('Coupon deleted')
    },
  })
}

export function useToggleCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/coupons/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.coupons() }),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MARKETING — SLIDERS
// ═══════════════════════════════════════════════════════════════════════════════

export function useSliders() {
  return useQuery({
    queryKey: QK.sliders(),
    queryFn: async () => {
      if (USE_MOCK) return mockSliders
      const { data } = await api.get('/admin/sliders')
      return data
    },
  })
}

export function useCreateSlider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) =>
      api.post('/admin/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.sliders() })
      toast.success('Banner added!')
    },
  })
}

export function useToggleSlider() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/admin/sliders/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.sliders() }),
  })
}

export function useReorderSliders() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (order) => api.post('/admin/sliders/reorder', { order }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.sliders() }),
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

export function useSettings() {
  return useQuery({
    queryKey: QK.settings(),
    queryFn: async () => {
      if (USE_MOCK) return {
        general:  { store_name: 'Luca Glow', tagline: 'Feel The Change', support_email: 'hello@lucaglow.com', support_phone: '+91 95670 46209', maintenance: false },
        regional: { gst_rate: 18, gst_number: '32AABCU9603R1ZX', currency: 'INR' },
      }
      const { data } = await api.get('/admin/settings')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.put('/admin/settings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.settings() })
      toast.success('Settings saved!')
    },
    onError: () => toast.error('Failed to save settings'),
  })
}

export function useStaff() {
  return useQuery({
    queryKey: QK.staff(),
    queryFn: async () => {
      if (USE_MOCK) return []
      const { data } = await api.get('/admin/staff')
      return data
    },
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/admin/staff', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.staff() })
      toast.success('Staff account created!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Creation failed'),
  })
}

export function useUpdateStaffRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/staff/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.staff() }),
  })
}

export function useClearCache() {
  return useMutation({
    mutationFn: (type = 'all') => api.post('/admin/settings/cache/clear', { type }),
    onSuccess: (_, type) => toast.success(`${type} cache cleared`),
    onError:   () => toast.error('Cache clear failed'),
  })
}
