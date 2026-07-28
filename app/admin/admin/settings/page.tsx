'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { ADMIN_PASSWORD } from '@/app/lib/constants'

export default function SettingsPage() {
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [allowedIPs, setAllowedIPs] = useState<string[]>([])
  const [newIP, setNewIP] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setPassword(data.password)
        setAllowedIPs(data.allowed_ips || [])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setMessage('الرجاء إدخال كلمة سر جديدة')
      return
    }

    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ password: newPassword })
        .eq('id', (await supabase.from('admin_settings').select('id').single()).data?.id)

      if (error) throw error
      setPassword(newPassword)
      setNewPassword('')
      setMessage('✅ تم تغيير كلمة السر بنجاح')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage('❌ حدث خطأ أثناء تغيير كلمة السر')
    }
  }

  const handleAddIP = async () => {
    if (!newIP.trim()) {
      setMessage('الرجاء إدخال عنوان IP')
      return
    }

    const updatedIPs = [...allowedIPs, newIP.trim()]
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ allowed_ips: updatedIPs })
        .eq('id', (await supabase.from('admin_settings').select('id').single()).data?.id)

      if (error) throw error
      setAllowedIPs(updatedIPs)
      setNewIP('')
      setMessage('✅ تم إضافة IP بنجاح')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error adding IP:', error)
      setMessage('❌ حدث خطأ أثناء إضافة IP')
    }
  }

  const handleRemoveIP = async (ip: string) => {
    const updatedIPs = allowedIPs.filter(i => i !== ip)
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ allowed_ips: updatedIPs })
        .eq('id', (await supabase.from('admin_settings').select('id').single()).data?.id)

      if (error) throw error
      setAllowedIPs(updatedIPs)
      setMessage('✅ تم حذف IP بنجاح')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error removing IP:', error)
      setMessage('❌ حدث خطأ أثناء حذف IP')
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
      <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>

      {message && (
        <div className={`p-3 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">تغيير كلمة السر</h2>
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
            حفظ
          </button>
        </div>
      </div>

      {/* Allowed IPs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">عناوين IP المسموح بها</h2>
        
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
            إضافة IP
          </button>
        </div>

        <div className="space-y-2">
          {allowedIPs.map((ip) => (
            <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-mono">{ip}</span>
              <button
                onClick={() => handleRemoveIP(ip)}
                className="text-red-500 hover:text-red-600 transition"
              >
                🗑️
              </button>
            </div>
          ))}
          {allowedIPs.length === 0 && (
            <p className="text-gray-500 text-sm">لا توجد عناوين IP مسموحة</p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          * إذا تركت القائمة فارغة، سيسمح لجميع عناوين IP مع كلمة السر
        </p>
      </div>
    </div>
  )
    } 
