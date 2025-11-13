'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { 
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface DashboardData {
  istatistikler: {
    toplamSipariş: number
    toplamGelir: number
    toplamKullanıcı: number
    toplamÜrün: number
  }
  sonSiparişler: any[]
  kategoriSatış: any[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [veri, setVeri] = useState<DashboardData | null>(null)
  const [yükleniyor, setYükleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)

  useEffect(() => {
    if (!kullanıcı || kullanıcı.rol !== 'admin') {
      router.push('/')
      return
    }
    veriYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const veriYükle = async () => {
    setYükleniyor(true)
    setHata(null)
    try {
      const response = await api.get('/admin/dashboard')
      setVeri(response.data.veri)
    } catch (error: any) {
      // Sadece gerçek hataları göster, 401 gibi beklenen hataları değil
      if (error.response?.status !== 401) {
        const hataMesajı = error.response?.data?.mesaj || 'Dashboard verileri yüklenirken hata oluştu'
        setHata(hataMesajı)
        console.error('Dashboard verileri yüklenirken hata:', {
          status: error.response?.status,
          message: hataMesajı,
          error: error.message,
        })
      }
    } finally {
      setYükleniyor(false)
    }
  }

  if (!kullanıcı || kullanıcı.rol !== 'admin') {
    return null
  }

  if (yükleniyor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Dashboard yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="card-modern p-8 text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <ChartBarIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Hata Oluştu</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{hata}</p>
            <button
              onClick={veriYükle}
              className="btn-primary"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Genel bakış ve istatistikler
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="btn-secondary inline-flex items-center gap-2"
            >
              ← Admin Paneli
            </Link>
          </div>
        </div>

        {veri && (
          <>
            {/* İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card-modern card-hover p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-extrabold text-gradient">
                    {veri.istatistikler.toplamSipariş || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Toplam Sipariş</h3>
              </div>
              
              <div className="card-modern card-hover p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-extrabold text-gradient">
                    {veri.istatistikler.toplamGelir?.toFixed(2) || '0.00'} ₺
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Toplam Gelir</h3>
              </div>
              
              <div className="card-modern card-hover p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-extrabold text-gradient">
                    {veri.istatistikler.toplamKullanıcı || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Toplam Kullanıcı</h3>
              </div>
              
              <div className="card-modern card-hover p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
                    <ShoppingBagIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-extrabold text-gradient">
                    {veri.istatistikler.toplamÜrün || 0}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Toplam Ürün</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Son Siparişler */}
              <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                      <TruckIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gradient">Son Siparişler</h2>
                  </div>
                  <Link
                    href="/admin/siparişler"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Tümünü Gör
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {!veri.sonSiparişler || veri.sonSiparişler.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      Henüz sipariş yok
                    </p>
                  ) : (
                    veri.sonSiparişler.map((sipariş) => (
                      <div 
                        key={sipariş.id} 
                        className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              #{sipariş.sipariş_numarası || sipariş.id}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {sipariş.ad || ''} {sipariş.soyad || ''}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {sipariş.oluşturulma_tarihi ? new Date(sipariş.oluşturulma_tarihi).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-lg text-gradient">
                              {sipariş.toplam ? sipariş.toplam.toFixed(2) : '0.00'} ₺
                            </p>
                            <span className={`badge badge-primary text-xs mt-1`}>
                              {sipariş.durum || 'beklemede'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Kategori Satışları */}
              <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gradient">Kategori Satışları</h2>
                </div>
                <div className="space-y-4">
                  {!veri.kategoriSatış || veri.kategoriSatış.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      Henüz satış yok
                    </p>
                  ) : (
                    veri.kategoriSatış.map((kategori, index) => (
                      <div 
                        key={index} 
                        className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {kategori.kategori || kategori.ad || 'Bilinmeyen'}
                          </p>
                          <p className="font-extrabold text-lg text-gradient">
                            {kategori.toplam ? kategori.toplam.toFixed(2) : '0.00'} ₺
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
