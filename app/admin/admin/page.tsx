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
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      setProducts(productsData || [])

      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      setUsers(usersData || [])

      const { data: couponsData } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })
      
      setCoupons(couponsData || [])

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
              <div>
                <h2 className="text-2xl font-bold mb-6">{t('dashboard', language)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">المنتجات</p>
                        <p className="text-2xl font-bold mt-2">{stats.totalProducts}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">العملاء</p>
                        <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">الطلبات</p>
                        <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">الإيرادات</p>
                        <p className="text-2xl font-bold mt-2">{formatPrice(stats.totalRevenue)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-gold" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('productsManagement', language)}</h2>
                  <button
                    onClick={() => {/* فتح نموذج الإضافة */}}
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
                  >
                    <Plus className="w-5 h-5" />
                    {t('addProduct', language)}
                  </button>
                </div>
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
                        {products.map((product) => (
                          <tr key={product.id} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                                <span>{product.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{product.category === 'fruits' ? '🍎 فاكهة' : '🥬 خضروات'}</td>
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
                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
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
            )}

            {activeTab === 'customers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">{t('customersManagement', language)}</h2>
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
                        {users.map((user) => (
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
                              <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                                حظر
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t('offersManagement', language)}</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition">
                    <Plus className="w-5 h-5" />
                    {t('addCoupon', language)}
                  </button>
                </div>
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
                        {coupons.map((coupon) => (
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
                                <button className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition">
                                  تعطيل
                                </button>
                                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
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
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">{t('settings', language)}</h2>
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">{t('changePassword', language)}</h3>
                    <div className="flex gap-4">
                      <input
                        type="password"
                        placeholder="كلمة السر الجديدة"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <button className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition">
                        {t('save', language)}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">{t('allowedIPs', language)}</h3>
                    <div className="flex gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="مثال: 192.168.1.1"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <button className="px-6 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition">
                        {t('addIP', language)}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">* إذا تركت القائمة فارغة، سيسمح لجميع عناوين IP مع كلمة السر</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
    } 
