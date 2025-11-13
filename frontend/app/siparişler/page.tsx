'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { siparişAPI } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface Sipariş {
  id: number
  sipariş_numarası: string
  toplam: number
  durum: string
  oluşturulma_tarihi: string
  adres_başlığı?: string
}

export default function SiparişlerPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [siparişler, setSiparişler] = useState<Sipariş[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)

  useEffect(() => {
    if (!kullanıcı) {
      router.push('/giris')
      return
    }
    if (kullanıcı.rol === 'admin') {
      toast.error('Admin kullanıcıları için siparişler admin panelinden yönetilir.')
      router.push('/admin/siparisler')
      return
    }
    siparişleriYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const siparişleriYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await siparişAPI.listele()
      if (response.data?.başarılı) {
        setSiparişler(response.data.veri || [])
      } else {
        setSiparişler([])
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [SİPARİŞLER] Hata:', error.message)
      }
      toast.error(`Siparişler yüklenirken hata oluştu: ${error.response?.data?.mesaj || error.message}`)
      setSiparişler([])
    } finally {
      setYükleniyor(false)
    }
  }

  const durumBilgisi = (durum: string) => {
    const bilgiler: { [key: string]: { renk: string, ikon: any, metin: string } } = {
      beklemede: {
        renk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        ikon: ClockIcon,
        metin: 'Beklemede'
      },
      onaylandı: {
        renk: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        ikon: CheckCircleIcon,
        metin: 'Onaylandı'
      },
      hazırlanıyor: {
        renk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        ikon: ShoppingBagIcon,
        metin: 'Hazırlanıyor'
      },
      kargoda: {
        renk: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        ikon: TruckIcon,
        metin: 'Kargoda'
      },
      teslim_edildi: {
        renk: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        ikon: CheckCircleIcon,
        metin: 'Teslim Edildi'
      },
      iptal: {
        renk: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        ikon: XCircleIcon,
        metin: 'İptal'
      }
    }
    return bilgiler[durum] || {
      renk: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      ikon: ClockIcon,
      metin: durum
    }
  }

  if (yükleniyor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Siparişler yükleniyor...</p>
            </div>
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
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBagIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
              Siparişlerim
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tüm siparişlerinizi buradan takip edebilirsiniz
          </p>
        </div>

        {siparişler.length === 0 ? (
          <div className="card-modern p-12 text-center animate-slide-up">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz siparişiniz yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              İlk siparişinizi vermek için alışverişe başlayın!
            </p>
            <Link href="/ürünler" className="btn-primary inline-flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {siparişler.map((sipariş, index) => {
              const durum = durumBilgisi(sipariş.durum)
              const Durumİkon = durum.ikon
              
              return (
                <div
                  key={sipariş.id}
                  className="card-modern card-hover p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Sol Taraf */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                          <ShoppingBagIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Sipariş #{sipariş.sipariş_numarası}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(sipariş.oluşturulma_tarihi).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {sipariş.adres_başlığı && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span>📍</span>
                          {sipariş.adres_başlığı}
                        </p>
                      )}
                    </div>

                    {/* Sağ Taraf */}
                    <div className="flex flex-col md:items-end gap-4">
                      {/* Durum Badge */}
                      <div className="flex items-center gap-2">
                        <Durumİkon className="h-5 w-5" />
                        <span className={`badge ${durum.renk}`}>
                          {durum.metin}
                        </span>
                      </div>
                      
                      {/* Toplam */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam</p>
                        <p className="text-3xl font-extrabold text-gradient">
                          {sipariş.toplam.toFixed(2)} ₺
                        </p>
                      </div>
                      
                      {/* Detay Link */}
                      <Link
                        href={`/siparişler/${sipariş.id}`}
                        className="btn-secondary inline-flex items-center gap-2 w-full md:w-auto justify-center"
                      >
                        Detayları Görüntüle
                        <ArrowRightIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
