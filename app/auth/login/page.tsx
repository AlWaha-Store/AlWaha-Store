'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/store/auth'
import { useUIStore } from '@/app/store/ui'
import { t } from '@/app/lib/translations'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const router = useRouter()
  const { language } = useUIStore()
  const { login, loginWithGoogle, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = await login(email, password)
    if (success) {
      router.push('/')
    } else {
      setError('البريد الإلكتروني أو كلمة السر غير صحيحة')
    }
  }

  const handleGoogleLogin = async () => {
    await loginWithGoogle()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-aref text-gold dark:text-gold-light">
          {t('login', language)}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {t('welcomeBack', language)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('email', language)}
          </label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              placeholder={t('email', language)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('password', language)}
          </label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold focus:border-transparent transition"
              placeholder={t('password', language)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <>
              {t('login', language)}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
              {t('orContinueWith', language)}
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="mt-4 w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          <FcGoogle className="w-5 h-5" />
          {t('google', language)}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('dontHaveAccount', language)}
        <button
          onClick={() => router.push('/register')}
          className="text-gold hover:text-gold-dark font-bold mr-1"
        >
          {t('createAccount', language)}
        </button>
      </p>
    </div>
  )
    } 
