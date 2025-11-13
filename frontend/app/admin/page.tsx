'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { 
  ChartBarIcon,
  ShoppingBagIcon,
  TruckIcon,
  UsersIcon,
  FolderIcon,
  TicketIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
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

export default function AdminPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [veri, setVeri] = useState<DashboardData | null>(null)
  const [yükleniyor, setYükleniyor] = useState(true)
  const [hata, setHata] = useState<string | null>(null)

  useEffect(() => {
    if (!kullanıcı) {
      router.push('/giris')
      return
    }
    if (kullanıcı.rol !== 'admin') {
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
      if (error.response?.status !== 401) {
        const hataMesajı = error.response?.data?.mesaj || 'Dashboard verileri yüklenirken hata oluştu'
        setHata(hataMesajı)
        console.error('Dashboard verileri yüklenirken hata:', {
          status: error.response?.status,
          message: hataMesajı,
        })
      }
    } finally {
      setYükleniyor(false)
    }
  }

  const durumBilgisi = (durum: string) => {
    const bilgiler: { [key: string]: { renk: string, ikon: any } } = {
      beklemede: {
        renk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        ikon: ClockIcon,
      },
      onaylandı: {
        renk: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        ikon: CheckCircleIcon,
      },
      hazırlanıyor: {
        renk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        ikon: ShoppingBagIcon,
      },
      kargoda: {
        renk: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        ikon: TruckIcon,
      },
      teslim_edildi: {
        renk: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        ikon: CheckCircleIcon,
      },
      iptal: {
        renk: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        ikon: XCircleIcon,
      }
    }
    return bilgiler[durum] || {
      renk: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      ikon: ClockIcon,
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
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const adminMenüler = [
    {
      href: '/admin/ürünler',
      icon: ShoppingBagIcon,
      title: 'Ürünler',
      açıklama: 'Ürün ekle, düzenle, sil',
      renk: 'from-purple-500 to-pink-500',
      hoverRenk: 'hover:from-purple-600 hover:to-pink-600',
      sayı: veri?.istatistikler.toplamÜrün || 0
    },
    {
      href: '/admin/siparişler',
      icon: TruckIcon,
      title: 'Siparişler',
      açıklama: 'Sipariş yönetimi ve takibi',
      renk: 'from-green-500 to-emerald-500',
      hoverRenk: 'hover:from-green-600 hover:to-emerald-600',
      sayı: veri?.istatistikler.toplamSipariş || 0
    },
    {
      href: '/admin/kullanıcılar',
      icon: UsersIcon,
      title: 'Kullanıcılar',
      açıklama: 'Kullanıcı yönetimi ve rolleri',
      renk: 'from-orange-500 to-red-500',
      hoverRenk: 'hover:from-orange-600 hover:to-red-600',
      sayı: veri?.istatistikler.toplamKullanıcı || 0
    },
    {
      href: '/admin/kategoriler',
      icon: FolderIcon,
      title: 'Kategoriler',
      açıklama: 'Kategori yönetimi',
      renk: 'from-indigo-500 to-purple-500',
      hoverRenk: 'hover:from-indigo-600 hover:to-purple-600'
    },
    {
      href: '/admin/kuponlar',
      icon: TicketIcon,
      title: 'Kuponlar',
      açıklama: 'İndirim kuponları oluştur',
      renk: 'from-yellow-500 to-orange-500',
      hoverRenk: 'hover:from-yellow-600 hover:to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Admin Yönetim Paneli
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Hoş geldiniz, <span className="font-semibold">{kullanıcı.ad} {kullanıcı.soyad}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Son Güncelleme</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {veri && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-modern card-hover p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                  <TruckIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-extrabold text-gradient">
                  {veri.istatistikler.toplamSipariş || 0}
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">Toplam Sipariş</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">Tüm zamanlar</p>
            </div>
            
            <div className="card-modern card-hover p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-gradient">
                  {veri.istatistikler.toplamGelir?.toFixed(0) || '0'} ₺
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">Toplam Gelir</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">İptal edilmeyen siparişler</p>
            </div>
            
            <div className="card-modern card-hover p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-extrabold text-gradient">
                  {veri.istatistikler.toplamKullanıcı || 0}
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">Toplam Kullanıcı</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">Kayıtlı kullanıcılar</p>
            </div>
            
            <div className="card-modern card-hover p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-extrabold text-gradient">
                  {veri.istatistikler.toplamÜrün || 0}
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">Aktif Ürün</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">Stokta olan ürünler</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hızlı Erişim Menüleri */}
          <div className="lg:col-span-2">
            <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-3">
                <SparklesIcon className="h-6 w-6" />
                Hızlı Erişim
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminMenüler.map((menü, index) => (
                  <Link
                    key={menü.href}
                    href={menü.href}
                    className="group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${menü.renk} ${menü.hoverRenk} transform group-hover:scale-110 transition-all duration-300`}>
                        <menü.icon className="h-5 w-5 text-white" />
                      </div>
                      {menü.sayı !== undefined && (
                        <span className="text-lg font-bold text-gradient">
                          {menü.sayı}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {menü.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {menü.açıklama}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Son Siparişler */}
          <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
                <TruckIcon className="h-5 w-5" />
                Son Siparişler
              </h2>
              <Link
                href="/admin/siparişler"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Tümü
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {!veri?.sonSiparişler || veri.sonSiparişler.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8 text-sm">
                  Henüz sipariş yok
                </p>
              ) : (
                veri.sonSiparişler.slice(0, 5).map((sipariş) => {
                  const durum = durumBilgisi(sipariş.durum || 'beklemede')
                  const Durumİkon = durum.ikon
                  return (
                    <Link
                      key={sipariş.id}
                      href={`/admin/siparişler`}
                      className="block border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-gray-900 dark:text-white">
                            #{sipariş.sipariş_numarası || sipariş.id}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {sipariş.ad || ''} {sipariş.soyad || ''}
                          </p>
                        </div>
                        <span className={`badge ${durum.renk} text-xs flex items-center gap-1`}>
                          <Durumİkon className="h-3 w-3" />
                          {sipariş.durum || 'beklemede'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {sipariş.oluşturulma_tarihi ? new Date(sipariş.oluşturulma_tarihi).toLocaleDateString('tr-TR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </p>
                        <p className="font-extrabold text-sm text-gradient">
                          {sipariş.toplam ? sipariş.toplam.toFixed(2) : '0.00'} ₺
                        </p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Kategori Satışları */}
        {veri && veri.kategoriSatış && veri.kategoriSatış.length > 0 && (
          <div className="card-modern p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gradient">Kategori Bazlı Satışlar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {veri.kategoriSatış.map((kategori, index) => (
                <div 
                  key={index} 
                  className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:shadow-lg"
                >
                  <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    {kategori.kategori || kategori.ad || 'Bilinmeyen'}
                  </p>
                  <p className="font-extrabold text-lg text-gradient">
                    {kategori.toplam ? kategori.toplam.toFixed(2) : '0.00'} ₺
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hata && (
          <div className="card-modern p-6 text-center animate-slide-up">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <XCircleIcon className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Hata Oluştu</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{hata}</p>
            <button
              onClick={veriYükle}
              className="btn-primary"
            >
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
