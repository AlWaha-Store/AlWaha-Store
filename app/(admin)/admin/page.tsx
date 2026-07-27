'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/app/store/ui'
import { supabase } from '@/app/lib/supabase'
import { t } from '@/app/lib/translations'
import { 
  LayoutDashboard, Package, Users, Tag, Settings, 
  ShoppingCart, TrendingUp, UserPlus, DollarSign,
  Plus, Edit, Trash2, Eye, Search, Filter
} from 'lucide-react'
import { ADMIN_PASSWORD } from '@/app/lib/constants'
import { Product, User, Coupon } from '@/app/types'
import { formatPrice, formatWeight } from '@/app/lib/utils'

export default function AdminPage() {
  const router = useRouter()
  const { language } = useUIStore()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })

  // التحقق من الجلسة
  useEffect(() => {
    const session = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_session='))
    
    if (!session) {
      router.push('/admin/login')
      return
    }

    try {
      const data = JSON.parse(decodeURIComponent(session.split('=')[1]))
      if (data.password !== ADMIN_PASSWORD) {
        router.push('/admin/login')
        return
      }
    } catch (e) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // جلب المنتجات
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      setProducts(productsData || [])

      // جلب المستخدمين
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      setUsers(usersData || [])

      // جلب الكوبونات
      const { data: couponsData } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })
      
      setCoupons(couponsData || [])

      // جلب الإحصائيات
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')

      const totalOrders = ordersData?.length || 0
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0

      setStats({
        totalProducts: productsData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalOrders,
        totalRevenue,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-aref text-gold">
                {t('adminPanel', language)}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'dashboard'
                  ? 'bg-gold text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('dashboard', language)}</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'products'
                  ? 'bg-gold text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>{t('productsManagement', language)}</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'customers'
                  ? 'bg-gold text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>{t('customersManagement', language)}</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'coupons'
                  ? 'bg-gold text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Tag className="w-5 h-5" />
              <span>{t('offersManagement', language)}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'settings'
                  ? 'bg-gold text-white'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>{t('settings', language)}</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardContent stats={stats} />
            )}

            {activeTab === 'products' && (
              <ProductsContent 
                products={products} 
                onRefresh={fetchData}
                language={language}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersContent 
                users={users} 
                onRefresh={fetchData}
                language={language}
              />
            )}

            {activeTab === 'coupons' && (
              <CouponsContent 
                coupons={coupons} 
                onRefresh={fetchData}
                language={language}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsContent 
                language={language}
                onRefresh={fetchData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Dashboard Content =====
function DashboardContent({ stats }: { stats: any }) {
  const { language } = useUIStore()
  
  const cards = [
    { title: 'المنتجات', value: stats.totalProducts, icon: Package, color: 'text-blue-500' },
    { title: 'العملاء', value: stats.totalUsers, icon: Users, color: 'text-green-500' },
    { title: 'الطلبات', value: stats.totalOrders, icon: ShoppingCart, color: 'text-orange-500' },
    { title: 'الإيرادات', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'text-gold' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('dashboard', language)}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== Products Content =====
function ProductsContent({ products, onRefresh, language }: any) {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'fruits',
    price: '',
    image: '',
    weight: '500',
    isOnSale: false,
    salePrice: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      image: formData.image,
      weight: parseInt(formData.weight),
      isOnSale: formData.isOnSale,
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
    }

    let endpoint = '/api/products'
    let method = 'POST'

    if (editingProduct) {
      endpoint = `/api/products?id=${editingProduct.id}`
      method = 'PUT'
    }

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })

    if (response.ok) {
      setShowForm(false)
      setEditingProduct(null)
      setFormData({
        name: '',
        category: 'fruits',
        price: '',
        image: '',
        weight: '500',
        isOnSale: false,
        salePrice: '',
      })
      onRefresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    const response = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      onRefresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('productsManagement', language)}</h2>
        <button
          onClick={() => {
            setEditingProduct(null)
            setFormData({
              name: '',
              category: 'fruits',
              price: '',
              image: '',
              weight: '500',
              isOnSale: false,
              salePrice: '',
            })
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          {t('addProduct', language)}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editingProduct ? t('editProduct', language) : t('addProduct', language)}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="اسم المنتج"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="fruits">فاكهة</option>
              <option value="vegetables">خضروات</option>
            </select>
            <input
              type="number"
              placeholder="السعر"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="text"
              placeholder="رابط الصورة"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="number"
              placeholder="الوزن (جم)"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOnSale}
                onChange={(e) => setFormData({...formData, isOnSale: e.target.checked})}
                className="w-5 h-5"
              />
              <label>عرض</label>
            </div>
            {formData.isOnSale && (
              <input
                type="number"
                placeholder="سعر العرض"
                value={formData.salePrice}
                onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            )}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gold text-white py-2 rounded-lg hover:bg-gold-dark transition"
              >
                {editingProduct ? t('save', language) : t('add', language)}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                {t('cancel', language)}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right">المنتج</th>
                <th className="px-4 py-3 text-right">الفئة</th>
                <th className="px-4 py-3 text-right">السعر</th>
                <th className="px-4 py-3 text-right">الوزن</th>
                <th className="px-4 py-3 text-right">عرض</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: Product) => (
                <tr key={product.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {product.category === 'fruits' ? '🍎 فاكهة' : '🥬 خضروات'}
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">{formatWeight(product.weight)}</td>
                  <td className="px-4 py-3">
                    {product.isOnSale ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">نشط</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">غير نشط</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setFormData({
                            name: product.name,
                            category: product.category,
                            price: String(product.price),
                            image: product.image,
                            weight: String(product.weight),
                            isOnSale: product.isOnSale,
                            salePrice: product.salePrice ? String(product.salePrice) : '',
                          })
                          setShowForm(true)
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== Customers Content =====
function CustomersContent({ users, onRefresh, language }: any) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBlockUser = async (userId: string, block: boolean) => {
    if (!confirm(`هل أنت متأكد من ${block ? 'حظر' : 'إلغاء حظر'} هذا المستخدم؟`)) return

    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        isBlocked: block,
      }),
    })

    if (response.ok) {
      onRefresh()
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('customersManagement', language)}</h2>
      
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="بحث عن عميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gold focus:border-transparent transition"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right">الاسم</th>
                <th className="px-4 py-3 text-right">البريد</th>
                <th className="px-4 py-3 text-right">الهاتف</th>
                <th className="px-4 py-3 text-right">النقاط</th>
                <th className="px-4 py-3 text-right">الإحالات</th>
                <th className="px-4 py-3 text-right">الطلبات</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: User) => (
                <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">{user.points}</td>
                  <td className="px-4 py-3">{user.referrals}</td>
                  <td className="px-4 py-3">{user.ordersCount}</td>
                  <td className="px-4 py-3">
                    {user.isBlocked ? (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">محظور</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">نشط</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBlockUser(user.id, !user.isBlocked)}
                      className={`px-3 py-1 rounded-lg text-white text-sm transition ${
                        user.isBlocked
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {user.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== Coupons Content =====
function CouponsContent({ coupons, onRefresh, language }: any) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: '',
    expiresAt: '',
    userId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: formData.code,
        discountPercent: parseFloat(formData.discountPercent),
        expiresAt: formData.expiresAt,
        userId: formData.userId || undefined,
      }),
    })

    if (response.ok) {
      setShowForm(false)
      setFormData({ code: '', discountPercent: '', expiresAt: '', userId: '' })
      onRefresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return

    const response = await fetch(`/api/coupons?id=${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      onRefresh()
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const response = await fetch('/api/coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        isActive: !currentStatus,
      }),
    })

    if (response.ok) {
      onRefresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('offersManagement', language)}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          {t('addCoupon', language)}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{t('addCoupon', language)}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="كود الكوبون"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="number"
              placeholder="نسبة الخصم"
              value={formData.discountPercent}
              onChange={(e) => setFormData({...formData, discountPercent: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="datetime-local"
              placeholder="تاريخ الانتهاء"
              value={formData.expiresAt}
              onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              required
            />
            <input
              type="text"
              placeholder="معرف المستخدم (اختياري)"
              value={formData.userId}
              onChange={(e) => setFormData({...formData, userId: e.target.value})}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gold text-white py-2 rounded-lg hover:bg-gold-dark transition"
              >
                {t('add', language)}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                {t('cancel', language)}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right">الكود</th>
                <th className="px-4 py-3 text-right">الخصم</th>
                <th className="px-4 py-3 text-right">تاريخ الانتهاء</th>
                <th className="px-4 py-3 text-right">المستخدم</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon: Coupon) => (
                <tr key={coupon.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 font-bold text-gold">{coupon.code}</td>
                  <td className="px-4 py-3">{coupon.discountPercent}%</td>
                  <td className="px-4 py-3">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{coupon.userId || 'عام'}</td>
                  <td className="px-4 py-3">
                    {coupon.isActive ? (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">نشط</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">غير نشط</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        className={`px-3 py-1 rounded-lg text-white text-sm transition ${
                          coupon.isActive
                            ? 'bg-gray-500 hover:bg-gray-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {coupon.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ===== Settings Content =====
function SettingsContent({ language, onRefresh }: any) {
  const [settings, setSettings] = useState({ password: '', allowedIPs: [] as string[] })
  const [newIP, setNewIP] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getSettings' }),
    })
    const result = await response.json()
    if (result.success) {
      setSettings(result.data)
    }
  }

  const handleAddIP = async () => {
    if (!newIP.trim()) return

    const updatedIPs = [...settings.allowedIPs, newIP.trim()]
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'settings',
        password: settings.password,
        allowedIPs: updatedIPs,
      }),
    })

    if (response.ok) {
      setSettings({ ...settings, allowedIPs: updatedIPs })
      setNewIP('')
      setMessage('تم إضافة IP بنجاح')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleRemoveIP = async (ip: string) => {
    const updatedIPs = settings.allowedIPs.filter(i => i !== ip)
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'settings',
        password: settings.password,
        allowedIPs: updatedIPs,
      }),
    })

    if (response.ok) {
      setSettings({ ...settings, allowedIPs: updatedIPs })
      setMessage('تم حذف IP بنجاح')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword.trim()) return

    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'settings',
        password: newPassword,
        allowedIPs: settings.allowedIPs,
      }),
    })

    if (response.ok) {
      setSettings({ ...settings, password: newPassword })
      setNewPassword('')
      setMessage('تم تغيير كلمة السر بنجاح')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('settings', language)}</h2>

      {message && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">{t('changePassword', language)}</h3>
          <div className="flex gap-4">
            <input
              type="password"
              placeholder="كلمة السر الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <button
              onClick={handleChangePassword}
              className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
            >
              {t('save', language)}
            </button>
          </div>
        </div>

        {/* Allowed IPs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">{t('allowedIPs', language)}</h3>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="مثال: 192.168.1.1"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <button
              onClick={handleAddIP}
              className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
            >
              {t('addIP', language)}
            </button>
          </div>

          <div className="space-y-2">
            {settings.allowedIPs.map((ip) => (
              <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-mono">{ip}</span>
                <button
                  onClick={() => handleRemoveIP(ip)}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {settings.allowedIPs.length === 0 && (
              <p className="text-gray-500 text-sm">لا توجد عناوين IP مسموحة</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * إذا تركت القائمة فارغة، سيسمح لجميع عناوين IP مع كلمة السر
          </p>
        </div>
      </div>
    </div>
  )
    } 
