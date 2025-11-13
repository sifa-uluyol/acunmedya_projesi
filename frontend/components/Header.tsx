'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useSepetStore } from '@/store/sepetStore'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { 
  MoonIcon, 
  SunIcon, 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const { kullanıcı, çıkışYap, profilYükle } = useAuthStore()
  const { sepet, sepetYükle } = useSepetStore()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!kullanıcı) {
      profilYükle()
    }
    sepetYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sepetAdedi = sepet.reduce((toplam, öğe) => toplam + öğe.adet, 0)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
              <ShoppingCartIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Acunmedya
            </span>
          </Link>

          {/* Desktop Arama */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-12 pr-4"
            />
          </div>

          {/* Desktop Menü */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
              aria-label="Tema değiştir"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {/* Sepet - Sadece normal kullanıcılar için */}
            {kullanıcı?.rol !== 'admin' && (
              <Link
                href="/sepet"
                className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 group"
              >
                <ShoppingCartIcon className="h-6 w-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                {sepetAdedi > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-bounce">
                    {sepetAdedi}
                  </span>
                )}
              </Link>
            )}

            {/* Kullanıcı Menüsü */}
            {kullanıcı ? (
              <div className="flex items-center gap-3">
                {kullanıcı.rol === 'admin' ? (
                  // Admin için sadece Admin Paneli ve Çıkış
                  <>
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                      Admin Paneli
                    </Link>
                    <button
                      onClick={çıkışYap}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Çıkış
                    </button>
                  </>
                ) : (
                  // Normal kullanıcılar için
                  <>
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
                    >
                      <UserCircleIcon className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                        {kullanıcı.ad} {kullanıcı.soyad}
                      </span>
                    </Link>
                    <Link
                      href="/siparişler"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Siparişlerim
                    </Link>
                    <button
                      onClick={çıkışYap}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Çıkış
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/giris"
                  className="px-5 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  className="btn-primary"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            aria-label="Menü"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-slide-up">
            {/* Mobile Arama */}
            <div className="mb-4 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-12 pr-4"
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-3">
              {kullanıcı ? (
                <>
                  {kullanıcı.rol === 'admin' ? (
                    // Admin için sadece Admin Paneli ve Çıkış
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl text-center flex items-center justify-center gap-2"
                      >
                        <ShieldCheckIcon className="h-5 w-5" />
                        Admin Paneli
                      </Link>
                      <button
                        onClick={() => {
                          çıkışYap()
                          setMobileMenuOpen(false)
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl"
                      >
                        Çıkış Yap
                      </button>
                    </>
                  ) : (
                    // Normal kullanıcılar için
                    <>
                      <Link
                        href="/profil"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        <span>{kullanıcı.ad} {kullanıcı.soyad}</span>
                      </Link>
                      <Link
                        href="/siparişler"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      >
                        Siparişlerim
                      </Link>
                      <button
                        onClick={() => {
                          çıkışYap()
                          setMobileMenuOpen(false)
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl"
                      >
                        Çıkış Yap
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/giris"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-center"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-center"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                <span>Tema</span>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
