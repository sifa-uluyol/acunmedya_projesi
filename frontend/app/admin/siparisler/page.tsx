'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { siparişAPI } from '@/lib/api'
import api from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface Sipariş {
  id: number
  sipariş_numarası: string
  ad: string
  soyad: string
  email: string
  toplam: number
  durum: string
  oluşturulma_tarihi: string
}

export default function AdminSiparişlerPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [siparişler, setSiparişler] = useState<Sipariş[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)

  const siparişleriYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await api.get('/siparişler/admin/tümü')
      setSiparişler(response.data.veri || [])
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Siparişler yüklenirken hata:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Siparişler yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  useEffect(() => {
    if (!kullanıcı || kullanıcı.rol !== 'admin') {
      router.push('/')
      return
    }
    siparişleriYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const durumGüncelle = async (id: number, yeniDurum: string) => {
    try {
      await siparişAPI.durumGüncelle(id, yeniDurum)
      await siparişleriYükle()
      toast.success('Sipariş durumu başarıyla güncellendi!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Durum güncelleme hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Durum güncellenirken hata oluştu')
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

  if (!kullanıcı || kullanıcı.rol !== 'admin') {
    return null
  }

  if (yükleniyor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mb-4"></div>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Sipariş Yönetimi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Tüm siparişleri görüntüle ve yönet
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="btn-secondary inline-flex items-center gap-2"
            >
              ← Geri
            </Link>
          </div>
        </div>

        {siparişler.length === 0 ? (
          <div className="card-modern p-12 text-center animate-slide-up">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <TruckIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz sipariş yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Müşteriler sipariş verdiğinde burada görünecek
            </p>
          </div>
        ) : (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Sipariş No</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Müşteri</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Toplam</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Tarih</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {siparişler.map((sipariş, index) => {
                    const durum = durumBilgisi(sipariş.durum)
                    const Durumİkon = durum.ikon
                    
                    return (
                      <tr 
                        key={sipariş.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900 dark:text-white">
                            #{sipariş.sipariş_numarası}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {sipariş.ad} {sipariş.soyad}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {sipariş.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xl font-extrabold text-gradient">
                            {sipariş.toplam.toFixed(2)} ₺
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={sipariş.durum}
                            onChange={(e) => durumGüncelle(sipariş.id, e.target.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${durum.renk} border-transparent hover:border-current`}
                          >
                            <option value="beklemede">Beklemede</option>
                            <option value="onaylandı">Onaylandı</option>
                            <option value="hazırlanıyor">Hazırlanıyor</option>
                            <option value="kargoda">Kargoda</option>
                            <option value="teslim_edildi">Teslim Edildi</option>
                            <option value="iptal">İptal</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(sipariş.oluşturulma_tarihi).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/siparişler/${sipariş.id}`}
                            className="btn-secondary inline-flex items-center gap-2 text-sm"
                          >
                            Detay
                            <ArrowRightIcon className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

