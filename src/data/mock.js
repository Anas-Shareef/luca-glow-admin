// ─── Mock data simulating Laravel API responses ─────────────────────────────

export const mockStats = {
  total_sales:      8_74_250,
  total_orders:     1_284,
  total_customers:  642,
  avg_order_value:  681,
  sales_growth:     18.4,
  orders_growth:    12.1,
  customers_growth: 9.7,
  aov_growth:       5.8,
}

export const mockSalesChart = [
  { date: 'Jan', revenue: 42000, orders: 98  },
  { date: 'Feb', revenue: 38500, orders: 87  },
  { date: 'Mar', revenue: 61200, orders: 134 },
  { date: 'Apr', revenue: 55800, orders: 121 },
  { date: 'May', revenue: 72400, orders: 158 },
  { date: 'Jun', revenue: 68900, orders: 149 },
  { date: 'Jul', revenue: 89100, orders: 192 },
  { date: 'Aug', revenue: 94500, orders: 207 },
  { date: 'Sep', revenue: 78300, orders: 171 },
  { date: 'Oct', revenue: 1_12_400, orders: 243 },
  { date: 'Nov', revenue: 1_38_600, orders: 298 },
  { date: 'Dec', revenue: 1_22_550, orders: 267 },
]

export const mockCategoryChart = [
  { name: 'Skincare & Face', value: 34, color: '#FDBA74' },
  { name: 'Cleansing Soaps', value: 18, color: '#FB923C' },
  { name: 'Lykha Makeup',    value: 22, color: '#F472B6' },
  { name: 'Fragrances',      value: 14, color: '#A78BFA' },
  { name: 'Body & Hair Care', value: 12, color: '#34D399' },
]

export const mockProducts = [
  { id: 1, sku: 'LG-FC-001', name: 'Luca Face Cream', category: 'Skincare & Face', price_inr: 1899, special_price: 1599, stock_quantity: 234, is_active: true, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&h=80&fit=crop', created_at: '2025-01-10' },
  { id: 2, sku: 'LG-SP-002', name: 'Sun Protection SPF 50', category: 'Skincare & Face', price_inr: 999, special_price: null, stock_quantity: 112, is_active: true, image: 'https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=80&h=80&fit=crop', created_at: '2025-02-14' },
  { id: 3, sku: 'LG-KF-003', name: 'Kojic Facewash', category: 'Skincare & Face', price_inr: 349, special_price: null, stock_quantity: 8, is_active: true, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=80&h=80&fit=crop', created_at: '2024-11-05' },
  { id: 4, sku: 'LG-GS-004', name: 'Gluta Soap', category: 'Cleansing Soaps', price_inr: 350, special_price: 299, stock_quantity: 545, is_active: true, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=80&h=80&fit=crop', created_at: '2024-10-22' },
  { id: 5, sku: 'LY-FR-005', name: 'Lykha Foundation — Rosy Brown', category: 'Lykha Makeup', price_inr: 2499, special_price: null, stock_quantity: 67, is_active: true, image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=80&h=80&fit=crop', created_at: '2025-03-01' },
  { id: 6, sku: 'LY-FD-006', name: 'Lykha Foundation — Dust', category: 'Lykha Makeup', price_inr: 2499, special_price: null, stock_quantity: 42, is_active: true, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop', created_at: '2025-03-01' },
  { id: 7, sku: 'LY-LS-007', name: '4-in-1 Lipstick', category: 'Lykha Makeup', price_inr: 999, special_price: null, stock_quantity: 189, is_active: true, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=80&h=80&fit=crop', created_at: '2024-12-18' },
  { id: 8, sku: 'LG-PF-008', name: 'Luca Perfume — Full Size', category: 'Fragrances', price_inr: 999, special_price: null, stock_quantity: 0, is_active: true, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=80&h=80&fit=crop', created_at: '2024-09-30' },
  { id: 9, sku: 'LG-PP-009', name: 'Pocket Perfume', category: 'Fragrances', price_inr: 399, special_price: null, stock_quantity: 301, is_active: true, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=80&h=80&fit=crop', created_at: '2025-01-25' },
  { id: 10, sku: 'LG-BO-010', name: 'Luca Beard Oil', category: 'Body & Hair Care', price_inr: 1299, special_price: null, stock_quantity: 156, is_active: false, image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=80&h=80&fit=crop', created_at: '2024-08-14' },
  { id: 11, sku: 'LG-HO-011', name: 'Luca Nourishing Hair Oil', category: 'Body & Hair Care', price_inr: 799, special_price: null, stock_quantity: 278, is_active: true, image: 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=80&h=80&fit=crop', created_at: '2024-07-09' },
]

export const mockOrders = [
  { id: 1, order_number: 'LG-2025-1284', customer: { name: 'Aisha Nair', email: 'aisha@example.com', phone: '+91 98464 11111' }, total_inr: 2898, status: 'delivered',   items: 3, created_at: '2025-12-10', city: 'Kozhikode' },
  { id: 2, order_number: 'LG-2025-1283', customer: { name: 'Rohan Sharma', email: 'rohan@example.com', phone: '+91 98464 22222' }, total_inr: 1599, status: 'shipped',    items: 1, created_at: '2025-12-10', city: 'Mumbai' },
  { id: 3, order_number: 'LG-2025-1282', customer: { name: 'Priya Menon', email: 'priya@example.com', phone: '+91 98464 33333' }, total_inr: 4998, status: 'processing', items: 2, created_at: '2025-12-09', city: 'Thrissur' },
  { id: 4, order_number: 'LG-2025-1281', customer: { name: 'Vikram Pillai', email: 'vikram@example.com', phone: '+91 98464 44444' }, total_inr: 699, status: 'pending',    items: 2, created_at: '2025-12-09', city: 'Kochi' },
  { id: 5, order_number: 'LG-2025-1280', customer: { name: 'Divya Raj', email: 'divya@example.com', phone: '+91 98464 55555' }, total_inr: 1298, status: 'cancelled',  items: 1, created_at: '2025-12-08', city: 'Bangalore' },
  { id: 6, order_number: 'LG-2025-1279', customer: { name: 'Meera Iyer', email: 'meera@example.com', phone: '+91 98464 66666' }, total_inr: 5497, status: 'delivered',   items: 5, created_at: '2025-12-08', city: 'Chennai' },
  { id: 7, order_number: 'LG-2025-1278', customer: { name: 'Arjun Kumar', email: 'arjun@example.com', phone: '+91 98464 77777' }, total_inr: 999, status: 'shipped',    items: 1, created_at: '2025-12-07', city: 'Delhi' },
  { id: 8, order_number: 'LG-2025-1277', customer: { name: 'Sanjana Patel', email: 'sanjana@example.com', phone: '+91 98464 88888' }, total_inr: 2997, status: 'processing', items: 3, created_at: '2025-12-07', city: 'Ahmedabad' },
  { id: 9, order_number: 'LG-2025-1276', customer: { name: 'Rahul Thomas', email: 'rahul@example.com', phone: '+91 98464 99999' }, total_inr: 798, status: 'delivered',   items: 2, created_at: '2025-12-06', city: 'Thiruvananthapuram' },
  { id: 10, order_number: 'LG-2025-1275', customer: { name: 'Kavya Suresh', email: 'kavya@example.com', phone: '+91 98464 10101' }, total_inr: 1899, status: 'pending',    items: 1, created_at: '2025-12-06', city: 'Kozhikode' },
]

export const mockCustomers = [
  { id: 1, name: 'Aisha Nair',    email: 'aisha@example.com',   group: 'VIP',         total_spend: 28450, orders: 18, last_login: '2 hours ago',   avatar: 'AN', skin_type: 'Dry',         concern: 'Aging',    joined: '2024-01-15' },
  { id: 2, name: 'Priya Menon',   email: 'priya@example.com',   group: 'VIP',         total_spend: 21600, orders: 14, last_login: '1 day ago',     avatar: 'PM', skin_type: 'Combination', concern: 'Pigmentation', joined: '2024-02-20' },
  { id: 3, name: 'Meera Iyer',    email: 'meera@example.com',   group: 'Regular',     total_spend: 12400, orders: 9,  last_login: '3 days ago',    avatar: 'MI', skin_type: 'Oily',        concern: 'Acne',     joined: '2024-04-10' },
  { id: 4, name: 'Sanjana Patel', email: 'sanjana@example.com', group: 'Regular',     total_spend: 8750,  orders: 6,  last_login: '5 hours ago',   avatar: 'SP', skin_type: 'Normal',      concern: 'Hydration', joined: '2024-06-18' },
  { id: 5, name: 'Divya Raj',     email: 'divya@example.com',   group: 'First-Time',  total_spend: 1298,  orders: 1,  last_login: '12 hours ago',  avatar: 'DR', skin_type: 'Sensitive',   concern: 'Redness',  joined: '2025-12-08' },
  { id: 6, name: 'Kavya Suresh',  email: 'kavya@example.com',   group: 'Regular',     total_spend: 6400,  orders: 4,  last_login: '2 days ago',    avatar: 'KS', skin_type: 'Dry',         concern: 'Brightness', joined: '2024-09-25' },
  { id: 7, name: 'Rohan Sharma',  email: 'rohan@example.com',   group: 'Regular',     total_spend: 4200,  orders: 3,  last_login: '6 hours ago',   avatar: 'RS', skin_type: 'Oily',        concern: 'Acne',     joined: '2024-11-12' },
  { id: 8, name: 'Arjun Kumar',   email: 'arjun@example.com',   group: 'Wholesale',   total_spend: 54800, orders: 42, last_login: '30 mins ago',   avatar: 'AK', skin_type: 'Normal',      concern: 'Grooming', joined: '2023-08-05' },
  { id: 9, name: 'Vikram Pillai', email: 'vikram@example.com',  group: 'First-Time',  total_spend: 699,   orders: 1,  last_login: '2 days ago',    avatar: 'VP', skin_type: 'Combination', concern: 'Oiliness', joined: '2025-12-09' },
  { id: 10, name: 'Rahul Thomas', email: 'rahul@example.com',   group: 'Regular',     total_spend: 7200,  orders: 5,  last_login: '1 week ago',    avatar: 'RT', skin_type: 'Dry',         concern: 'Aging',    joined: '2024-05-30' },
]

export const mockCoupons = [
  { id: 1, code: 'GLOW2026',     type: 'percentage', value: 15, min_cart: 999,   usage_limit: 500, used: 234, is_active: true,  expires_at: '2026-01-31' },
  { id: 2, code: 'WELCOME100',   type: 'fixed',      value: 100, min_cart: 599,  usage_limit: 1000, used: 892, is_active: true, expires_at: '2026-12-31' },
  { id: 3, code: 'DIWALI25',     type: 'percentage', value: 25, min_cart: 1499,  usage_limit: 200, used: 200, is_active: false, expires_at: '2025-11-15' },
  { id: 4, code: 'LYKHA10',      type: 'percentage', value: 10, min_cart: 2000,  usage_limit: 300, used: 67,  is_active: true,  expires_at: '2026-03-31' },
  { id: 5, code: 'FREESHIP',     type: 'fixed',      value: 79, min_cart: 499,   usage_limit: null, used: 1240, is_active: true, expires_at: null },
]

export const mockSliders = [
  { id: 1, title: 'Feel The Change', subtitle: 'Clean Beauty for Everyone', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=200&fit=crop', link: '/catalog', is_active: true, sort_order: 1 },
  { id: 2, title: 'Glow Beyond Limits', subtitle: 'Lykha Makeup Collection', image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400&h=200&fit=crop', link: '/collections/lykha-makeup', is_active: true, sort_order: 2 },
  { id: 3, title: 'Refined Grooming', subtitle: 'For the Modern Man', image: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?w=400&h=200&fit=crop', link: '/collections/men', is_active: true, sort_order: 3 },
]

export const mockCategories = [
  { id: 1, name: 'Skincare & Face',  slug: 'skincare-face',    parent_id: null, is_active: true,  products: 4 },
  { id: 2, name: 'Cleansing Soaps', slug: 'cleansing-soaps',  parent_id: null, is_active: true,  products: 2 },
  { id: 3, name: 'Lykha Makeup',    slug: 'lykha-makeup',     parent_id: null, is_active: true,  products: 3 },
  { id: 4, name: 'Fragrances',      slug: 'fragrances',       parent_id: null, is_active: true,  products: 2 },
  { id: 5, name: 'Body & Hair Care', slug: 'body-hair-care',  parent_id: null, is_active: true,  products: 2 },
  { id: 6, name: 'For Men',         slug: 'men',              parent_id: 5,    is_active: true,  products: 3 },
  { id: 7, name: 'For Women',       slug: 'women',            parent_id: 1,    is_active: true,  products: 5 },
]

export const ORDER_STATUSES = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-orange-100 text-orange-700' },
  shipped:    { label: 'Shipped',    color: 'bg-blue-100 text-blue-700' },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700' },
}

export const CUSTOMER_GROUPS = {
  VIP:         { color: 'bg-amber-100 text-amber-700' },
  Regular:     { color: 'bg-slate-100 text-slate-600' },
  Wholesale:   { color: 'bg-purple-100 text-purple-700' },
  'First-Time':{ color: 'bg-emerald-100 text-emerald-700' },
}

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)
