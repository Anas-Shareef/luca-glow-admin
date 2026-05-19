import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Save, ArrowLeft, Upload, X, ImagePlus, Tag,
  DollarSign, Package, Search, Globe, ChevronDown
} from 'lucide-react'
import { PageHeader, Toggle, ConfirmDialog } from '../../components/ui'
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useCategories,
  useUploadProductMedia,
  useDeleteProductMedia
} from '../../api/hooks'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SKIN_TYPES    = ['All Skin Types', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Normal']
const PRODUCT_TYPES = ['Simple', 'Configurable']

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        {Icon && <Icon size={16} className="text-glow-500 shrink-0" />}
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function FormRow({ label, hint, children, charCount, maxCount }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="label">{label}</label>
        {charCount !== undefined && (
          <span className={clsx('text-xs font-medium',
            charCount > maxCount ? 'text-red-500' : 'text-slate-400'
          )}>
            {charCount}/{maxCount}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: product, isLoading: loadingProduct } = useProduct(id)
  const { data: categoriesData = [] } = useCategories()

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(id)
  const uploadMedia = useUploadProductMedia(id)
  const deleteMedia = useDeleteProductMedia(id)

  const [form, setForm] = useState({
    name: '',
    sku: '',
    slug: '',
    category_id: '',
    product_type: 'Simple',
    description: '',
    ingredients: '',
    how_to_use: '',
    price_inr: '',
    special_price: '',
    special_start: '',
    special_end: '',
    stock_qty: '',
    low_stock_threshold: 10,
    skin_type: 'All Skin Types',
    gender: 'unisex',
    volume: '',
    is_active: true,
    meta_title: '',
    meta_desc: '',
    shipping_returns: '',
  })

  // Populate form when product data is loaded
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        slug: product.slug || '',
        category_id: product.category?.id || '',
        product_type: product.type || 'Simple',
        description: product.description || '',
        ingredients: product.ingredients || '',
        how_to_use: product.how_to_use || '',
        price_inr: product.price_inr || '',
        special_price: product.special_price || '',
        special_start: product.special_price_starts_at || '',
        special_end: product.special_price_ends_at || '',
        stock_qty: product.stock_quantity || '',
        low_stock_threshold: product.low_stock_threshold || 10,
        skin_type: product.skin_type || 'All Skin Types',
        gender: product.gender || 'unisex',
        volume: product.volume || '',
        is_active: product.is_active ?? true,
        meta_title: product.meta_title || '',
        meta_desc: product.meta_description || '',
        shipping_returns: product.shipping_returns || '',
      })
      if (product.media) {
        setImages(product.media.map(m => ({
          id: m.id,
          url: m.thumb_url || m.url,
          is_cover: m.order === 1,
          is_existing: true
        })))
      }
    }
  }, [product])

  const [images, setImages] = useState([])
  const [deleteImgId, setDeleteImgId] = useState(null)
  const [dragging, setDrag] = useState(false)
  const saving = createProduct.isPending || updateProduct.isPending

  if (loadingProduct) return <div className="p-12 text-center text-slate-400">Loading product details...</div>

  // Auto-generate slug from name
  const handleName = (v) => {
    setForm((f) => ({
      ...f,
      name: v,
      slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }))
  }

  // Industry-standard SKU Generator
  const handleGenerateSKU = () => {
    if (!form.name) {
      toast.error('Please enter a product name first');
      return;
    }

    // 1. Brand Prefix
    const prefix = 'LG';

    // 2. Category Code (2 letters)
    let catCode = '';
    if (form.category_id && categoriesData) {
      const cat = categoriesData.find(c => c.id.toString() === form.category_id.toString());
      if (cat) {
        catCode = cat.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')
          .filter(w => w.length > 0).map(w => w[0].toUpperCase()).join('').substring(0, 2) + '-';
      }
    }

    // 3. Name Initials (up to 3 letters)
    const initials = form.name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ')
      .filter(w => w.length > 0).map(w => w[0].toUpperCase()).join('').substring(0, 3);

    // 4. Volume/Size or Random Suffix
    let suffix = '';
    if (form.volume) {
      suffix = '-' + form.volume.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    } else {
      // If no volume, append a random 3-digit number to ensure uniqueness
      suffix = '-' + Math.floor(100 + Math.random() * 900);
    }

    const generatedSku = `${prefix}-${catCode}${initials}${suffix}`;
    setForm(f => ({ ...f, sku: generatedSku }));
    toast.success('SKU dynamically generated!');
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    addImages(files)
  }

  const addImages = (files) => {
    const previews = files.map((f) => ({ file: f, url: URL.createObjectURL(f), is_cover: false }))
    setImages((prev) => {
      const next = [...prev, ...previews]
      if (next.length > 0 && !next.some((i) => i.is_cover)) next[0].is_cover = true
      return next
    })
  }

  const removeImage = (i) => {
    const img = images[i]
    if (img.is_existing && id) {
      setDeleteImgId(img.id)
    } else {
      setImages((prev) => {
        const next = prev.filter((_, idx) => idx !== i)
        if (next.length > 0 && !next.some((x) => x.is_cover)) next[0].is_cover = true
        return next
      })
    }
  }

  const setCover = (i) => {
    setImages((prev) => prev.map((img, idx) => ({ ...img, is_cover: idx === i })))
  }

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price_inr) {
      toast.error('Name, SKU and Price are required')
      return
    }

    const payload = {
      ...form,
      type: form.product_type.toLowerCase(), // Map 'Simple' -> 'simple'
      stock_quantity: parseInt(form.stock_qty) || 0,
      price_inr: parseInt(form.price_inr) || 0,
      special_price: form.special_price ? parseInt(form.special_price) : null,
      meta_description: form.meta_desc,
    }

    const newImagesData = images.filter(img => !img.is_existing && img.file)
    const newImagesFiles = newImagesData.map(img => img.file)
    const coverIdx = newImagesData.findIndex(img => img.is_cover)

    const handleSuccess = async (savedProduct) => {
      const productId = savedProduct.id || id
      if (newImagesFiles.length > 0) {
        const { default: api } = await import('../../api/axios')
        
        // Upload images one by one to avoid 413 (Content Too Large) errors
        let uploadErrors = 0
        
        // Sort to ensure the cover image (if any) is uploaded first
        const sortedImages = [...newImagesData].sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0))

        for (const imgData of sortedImages) {
          const fd = new FormData()
          fd.append('images[]', imgData.file)
          if (imgData.is_cover) fd.append('cover_idx', 0)

          try {
            await api.post(`/admin/products/${productId}/media`, fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
          } catch (err) {
            console.error('Image upload failed', err)
            uploadErrors++
          }
        }

        if (uploadErrors === 0) {
          toast.success('Product and all images saved!')
        } else {
          toast.error(`Product saved, but ${uploadErrors} images failed to upload (check file size).`)
        }
        navigate('/products')
      } else {
        navigate('/products')
      }
    }

    if (id) {
      updateProduct.mutate(payload, {
        onSuccess: (res) => handleSuccess(res.data || res)
      })
    } else {
      createProduct.mutate(payload, {
        onSuccess: (res) => handleSuccess(res.data || res)
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={id ? `Edit: ${product?.name || 'Product'}` : 'Add New Product'}
        subtitle={id ? `SKU: ${product?.sku}` : 'Create a new product in your catalog'}
      >
        <button onClick={() => navigate('/products')} className="btn-outline">
          <ArrowLeft size={15} /> Back
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-glow">
          <Save size={15} />
          {saving ? 'Saving…' : id ? 'Update Product' : 'Create Product'}
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <Section title="General Information" icon={Package}>
            <FormRow label="Product Name *">
              <input
                value={form.name}
                onChange={(e) => handleName(e.target.value)}
                className="input-field"
                placeholder="e.g. Luca Face Cream"
              />
            </FormRow>

            <div className="grid grid-cols-2 gap-4">
              <FormRow label="SKU *" hint="Unique identifier for this product">
                <div className="flex gap-2">
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))}
                    className="input-field font-mono w-full"
                    placeholder="LG-FC-001"
                  />
                  <button 
                    type="button" 
                    onClick={handleGenerateSKU}
                    className="btn-outline px-3 whitespace-nowrap text-xs font-medium"
                    title="Auto-generate professional SKU"
                  >
                    Generate
                  </button>
                </div>
              </FormRow>
              <FormRow label="URL Slug">
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="input-field font-mono text-slate-500"
                  placeholder="luca-face-cream"
                />
              </FormRow>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormRow label="Product Type">
                <select
                  value={form.product_type}
                  onChange={(e) => setForm((f) => ({ ...f, product_type: e.target.value }))}
                  className="select-field"
                >
                  {PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormRow>
              <FormRow label="Skin Type">
                <select
                  value={form.skin_type}
                  onChange={(e) => setForm((f) => ({ ...f, skin_type: e.target.value }))}
                  className="select-field"
                >
                  {SKIN_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormRow>

              <FormRow label="Target Gender">
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="select-field"
                >
                  <option value="unisex">Unisex / Everyone</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </FormRow>
            </div>

            <FormRow label="Description" hint="Highlight key benefits and brand story">
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input-field resize-none"
                rows={3}
                placeholder="Describe the product, its benefits and brand story…"
              />
            </FormRow>

            <div className="grid grid-cols-2 gap-4">
              <FormRow label="Key Ingredients" hint="Enter each ingredient on a new line for a clean list">
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Kojic Acid&#10;Vitamin C&#10;Niacinamide…"
                />
              </FormRow>
              <FormRow label="How to Use" hint="Enter each step on a new line for a numbered list">
                <textarea
                  value={form.how_to_use}
                  onChange={(e) => setForm((f) => ({ ...f, how_to_use: e.target.value }))}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="1. Cleanse your skin&#10;2. Apply evenly&#10;3. Massage gently…"
                />
              </FormRow>
            </div>

            <FormRow label="Shipping & Returns" hint="Add details about shipping time and return policy. Use lines for clarity.">
              <textarea
                value={form.shipping_returns}
                onChange={(e) => setForm((f) => ({ ...f, shipping_returns: e.target.value }))}
                className="input-field resize-none"
                rows={4}
                placeholder="India: Free shipping over ₹999&#10;UAE: Free shipping over AED 150&#10;Returns: Within 7 days of delivery"
              />
            </FormRow>
          </Section>

          {/* Media Gallery */}
          <Section title="Media Gallery" icon={ImagePlus}>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              className={clsx(
                'border-2 border-dashed rounded-2xl p-8 text-center transition-all',
                dragging
                  ? 'border-glow-400 bg-glow-50'
                  : 'border-slate-200 hover:border-glow-300 hover:bg-glow-50/30 cursor-pointer'
              )}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput" type="file" multiple accept="image/*" className="hidden"
                onChange={(e) => addImages(Array.from(e.target.files))}
              />
              <Upload size={28} className={clsx('mx-auto mb-3', dragging ? 'text-glow-500' : 'text-slate-300')} />
              <p className="text-sm font-medium text-slate-700">
                {dragging ? 'Drop to upload' : 'Drag & drop images here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, WebP up to 5MB each · Auto-converted to WebP
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group',
                      img.is_cover ? 'border-glow-400 shadow-glow' : 'border-slate-200 hover:border-glow-200'
                    )}
                    onClick={() => setCover(i)}
                  >
                    <img src={img.url} alt="" className="w-full aspect-square object-cover" />
                    {img.is_cover && (
                      <div className="absolute bottom-0 left-0 right-0 bg-glow-500/80 text-white text-[9px] font-bold text-center py-0.5">
                        COVER
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* SEO */}
          <Section title="SEO Optimization" icon={Globe}>
            <FormRow
              label="Meta Title"
              hint="Ideal: 50–60 characters"
              charCount={form.meta_title.length}
              maxCount={60}
            >
              <input
                value={form.meta_title}
                onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
                className="input-field"
                placeholder="Luca Face Cream — Deep Moisturizing Cream | Luca Glow"
                maxLength={70}
              />
            </FormRow>
            <FormRow
              label="Meta Description"
              hint="Ideal: 150–160 characters"
              charCount={form.meta_desc.length}
              maxCount={160}
            >
              <textarea
                value={form.meta_desc}
                onChange={(e) => setForm((f) => ({ ...f, meta_desc: e.target.value }))}
                className="input-field resize-none"
                rows={3}
                placeholder="Experience the glow with Luca Face Cream. Made with clean, non-toxic ingredients for all skin types…"
                maxLength={180}
              />
            </FormRow>

            {/* SERP preview */}
            {(form.meta_title || form.name) && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">SERP Preview</p>
                <p className="text-xs text-slate-500">lucaglow.com › products › {form.slug || 'product'}</p>
                <p className="text-blue-700 font-medium text-sm mt-1 hover:underline cursor-pointer">
                  {form.meta_title || form.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {form.meta_desc || form.description || 'No description set.'}
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Pricing */}
          <Section title="Pricing (INR)" icon={DollarSign}>
            <FormRow label="Base Price (₹) *">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  value={form.price_inr}
                  onChange={(e) => setForm((f) => ({ ...f, price_inr: e.target.value }))}
                  className="input-field pl-8"
                  placeholder="1899"
                />
              </div>
            </FormRow>
            <FormRow label="Special / Sale Price (₹)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  value={form.special_price}
                  onChange={(e) => setForm((f) => ({ ...f, special_price: e.target.value }))}
                  className="input-field pl-8"
                  placeholder="1599"
                />
              </div>
            </FormRow>
            {form.special_price && (
              <>
                <FormRow label="Sale From">
                  <input type="date" value={form.special_start}
                    onChange={(e) => setForm((f) => ({ ...f, special_start: e.target.value }))}
                    className="input-field" />
                </FormRow>
                <FormRow label="Sale Until">
                  <input type="date" value={form.special_end}
                    onChange={(e) => setForm((f) => ({ ...f, special_end: e.target.value }))}
                    className="input-field" />
                </FormRow>
              </>
            )}
            {form.price_inr && form.special_price && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                Discount: {Math.round(((form.price_inr - form.special_price) / form.price_inr) * 100)}% off
              </div>
            )}
          </Section>

          {/* Inventory */}
          <Section title="Inventory" icon={Package}>
            <FormRow label="Stock Quantity">
              <input
                type="number"
                value={form.stock_qty}
                onChange={(e) => setForm((f) => ({ ...f, stock_qty: e.target.value }))}
                className="input-field"
                placeholder="100"
              />
            </FormRow>
            <FormRow label="Low Stock Alert Threshold" hint="Send alert when stock drops below this">
              <input
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => setForm((f) => ({ ...f, low_stock_threshold: e.target.value }))}
                className="input-field"
                placeholder="10"
              />
            </FormRow>
            <FormRow label="Volume / Pack Size">
              <input
                value={form.volume}
                onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}
                className="input-field"
                placeholder="50ml"
              />
            </FormRow>
          </Section>

          {/* Category & Status */}
          <Section title="Organization" icon={Tag}>
            <FormRow label="Category">
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="select-field"
              >
                <option value="">— Select Category —</option>
                {categoriesData.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormRow>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">Active Status</p>
                <p className="text-xs text-slate-400">Visible on storefront</p>
              </div>
              <Toggle
                checked={form.is_active}
                onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </Section>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving} className="btn-glow w-full justify-center py-3">
            <Save size={15} />
            {saving ? 'Saving…' : id ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
      
      <ConfirmDialog
        open={!!deleteImgId}
        onClose={() => setDeleteImgId(null)}
        onConfirm={() => deleteMedia.mutate(deleteImgId)}
        title="Delete Image"
        message="Are you sure you want to delete this image from the server? This action is immediate."
        confirmText="Delete"
      />
    </div>
  )
}
