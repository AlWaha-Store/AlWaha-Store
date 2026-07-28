'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { User } from '@/app/types'
import { formatPrice } from '@/app/lib/utils'

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUser = async (userId: string, block: boolean) => {
    if (!confirm(`هل أنت متأكد من ${block ? 'حظر' : 'إلغاء حظر'} هذا المستخدم؟`)) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: block })
        .eq('id', userId)

      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">إدارة العملاء</h1>
      
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
