import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import AdminLayout    from './layouts/AdminLayout'
import Login          from './pages/Login'
import Dashboard      from './pages/dashboard/Dashboard'
import Products       from './pages/products/Products'
import ProductForm    from './pages/products/ProductForm'
import Categories     from './pages/categories/Categories'
import Orders         from './pages/orders/Orders'
import Customers      from './pages/customers/Customers'
import Marketing      from './pages/marketing/Marketing'
import Settings       from './pages/settings/Settings'
import Reviews        from './pages/reviews/Reviews'

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.token)
  // For demo: auto-login if no token
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index                  element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="products"        element={<Products />} />
          <Route path="products/new"    element={<ProductForm />} />
          <Route path="products/:id"    element={<ProductForm />} />
          <Route path="categories"      element={<Categories />} />
          <Route path="orders"          element={<Orders />} />
          <Route path="customers"       element={<Customers />} />
          <Route path="reviews"         element={<Reviews />} />
          <Route path="marketing"       element={<Marketing />} />
          <Route path="settings"        element={<Settings />} />
          <Route path="*"               element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
