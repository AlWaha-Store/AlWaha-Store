'use client'

import { useState } from 'react'
import { useUIStore } from '@/app/store/ui'
import { useAuthStore } from '@/app/store/auth'
import { t } from '@/app/lib/translations'
import { 
  Menu, Search, Sun, Moon, Globe, Share2, User, LogOut,
  Award, Users, Package, Phone, Mail, X
} from 'lucide-react'
import { WHATSAPP_NUMBER, EMAIL } from '@/app/lib/constants'
import { generateReferralCode } from '@/app/lib/utils'

export function Header() {
  const { language, theme, toggleTheme, toggleLanguage, toggleSearch, setMenuOpen, isMenuOpen } = useUIStore()
  const { user, isLoggedIn, logout } = useAuthStore()
  const [showUserModal, setShowUserModal] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)

  const handleTitleClick = () => {
    const now = Date.now()
    if (now - lastClickTime > 2000) {
      setClickCount(1)
    } else {
      setClickCount(prev => prev + 1)
    }
    setLastClickTime(now)

    if (clickCount + 1 >= 5) {
      window.location.href = '/admin/login'
      setClickCount(0)
    }
  }

  const handleShare = async () => {
    const referralCode = user ? generateReferralCode(user.id) : ''
    const url = `${window.location.origin}?ref=${referralCode}`
    const message = `${t('shareMessage', language)}\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'الواحة 🌱',
          text: message,
          url: url,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      await navigator.clipboard.writeText(message)
      alert('تم نسخ الرابط!')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Auth Button */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserModal(!showUserModal)}
                  className="w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center font-bold hover:scale-110 transition"
                >
                  {user?.name?.charAt(0) || 'U'}
                </button>
                {showUserModal && (
                  <div className="absolute left-0 top-12 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center text-xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-gold" />
                        <span>{t('points', language)}: {user?.points || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gold" />
                        <span>{t('referrals', language)}: {user?.referrals || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gold" />
                        <span>{t('orders', language)}: {user?.ordersCount || 0}</span>
                      </div>
                      <button
                        onClick={() => {
                          logout()
                          setShowUserModal(false)
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout', language)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-gold text-white rounded-full font-bold hover:bg-gold-dark transition"
              >
                {t('signIn', language)}
              </a>
            )}
          </div>

          {/* Center - Store Name */}
          <button
            onClick={handleTitleClick}
            className="font-aref text-xl md:text-2xl text-gold dark:text-gold-light hover:scale-105 transition"
          >
            {t('storeName', language)}
          </button>

          {/* Right side - Menu */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                title={t('share', language)}
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              title={t('search', language)}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              title={t('theme', language)}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition font-bold"
              title={t('language', language)}
            >
              {language === 'ar' ? '🇪🇬' : '🇬🇧'}
            </button>
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 p-6 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="space-y-6 mt-12">
              <h2 className="text-2xl font-aref text-gold">{t('menu', language)}</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    toggleSearch()
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <Search className="w-5 h-5" />
                  <span>{t('search', language)}</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme()
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <span>{t('theme', language)} ({theme === 'light' ? t('light', language) : t('dark', language)})</span>
                </button>

                <button
                  onClick={() => {
                    toggleLanguage()
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <Globe className="w-5 h-5" />
                  <span>{t('language', language)} ({language === 'ar' ? t('arabic', language) : t('english', language)})</span>
                </button>

                <button
                  onClick={() => {
                    handleShare()
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{t('share', language)}</span>
                </button>

                {!isLoggedIn && (
                  <a
                    href="/login"
                    className="flex items-center gap-3 w-full p-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition"
                  >
                    <User className="w-5 h-5" />
                    <span>{t('signIn', language)}</span>
                  </a>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500">تواصل معنا</p>
                <div className="flex gap-4 mt-2">
                  <a href={`https://wa.me/20${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-5 h-5 text-green-500" />
                  </a>
                  <a href={`mailto:${EMAIL}`}>
                    <Mail className="w-5 h-5 text-red-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
          } 
