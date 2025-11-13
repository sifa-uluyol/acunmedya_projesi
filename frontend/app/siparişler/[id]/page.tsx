'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { siparişAPI } from '@/lib/api'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface SiparişDetay {
  id: number
  sipariş_numarası: string
  toplam: number
  ara_toplam: number
  indirim: number
  durum: string
  oluşturulma_tarihi: string
  adres: string
  şehir: string
  ilçe: string
  posta_kodu: string
  telefon: string
  detaylar: Array<{
    id: number
    ürün_ad: string
    adet: number
    birim_fiyat: number
    toplam_fiyat: number
    görseller: string[]
  }>
}

export default function SiparişDetayPage() {
  const params = useParams()
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [sipariş, setSipariş] = useState<SiparişDetay | null>(null)
  const [yükleniyor, setYükleniyor] = useState(true)

  useEffect(() => {
    if (!kullanıcı) {
      router.push('/giris')
      return
    }
    siparişYükle()
  }, [kullanıcı, router])

  const siparişYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await siparişAPI.detay(params.id as string)
      setSipariş(response.data.veri)
    } catch (error) {
      toast.error('Sipariş yüklenirken hata oluştu')
      router.push('/siparişler')
    } finally {
      setYükleniyor(false)
    }
  }

  const durumRenk = (durum: string) => {
    const renkler: { [key: string]: string } = {
      beklemede: 'bg-yellow-100 text-yellow-800',
      onaylandı: 'bg-blue-100 text-blue-800',
      hazırlanıyor: 'bg-purple-100 text-purple-800',
      kargoda: 'bg-indigo-100 text-indigo-800',
      teslim_edildi: 'bg-green-100 text-green-800',
      iptal: 'bg-red-100 text-red-800'
    }
    return renkler[durum] || 'bg-gray-100 text-gray-800'
  }

  const durumTürkçe = (durum: string) => {
    const çeviriler: { [key: string]: string } = {
      beklemede: 'Beklemede',
      onaylandı: 'Onaylandı',
      hazırlanıyor: 'Hazırlanıyor',
      kargoda: 'Kargoda',
      teslim_edildi: 'Teslim Edildi',
      iptal: 'İptal'
    }
    return çeviriler[durum] || durum
  }

  if (yükleniyor) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!sipariş) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sipariş bulunamadı</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        ← Geri
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            Sipariş #{sipariş.sipariş_numarası}
          </h1>
          <span className={`px-4 py-2 rounded-full font-medium ${durumRenk(sipariş.durum)}`}>
            {durumTürkçe(sipariş.durum)}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Sipariş Tarihi: {new Date(sipariş.oluşturulma_tarihi).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sipariş Detayları */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Sipariş Detayları</h2>
            <div className="space-y-4">
              {sipariş.detaylar.map((detay) => (
                <div key={detay.id} className="flex gap-4 pb-4 border-b last:border-0">
                  {detay.görseller && detay.görseller[0] && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={detay.görseller[0]}
                        alt={detay.ürün_ad}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{detay.ürün_ad}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adet: {detay.adet} × {detay.birim_fiyat.toFixed(2)} ₺
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{detay.toplam_fiyat.toFixed(2)} ₺</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Özet ve Adres */}
        <div className="space-y-6">
          {/* Fiyat Özeti */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Fiyat Özeti</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>{sipariş.ara_toplam.toFixed(2)} ₺</span>
              </div>
              {sipariş.indirim > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{sipariş.indirim.toFixed(2)} ₺</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Kargo</span>
                <span>Ücretsiz</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span>{sipariş.toplam.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Teslimat Adresi</h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p>{sipariş.adres}</p>
              <p>
                {sipariş.ilçe}, {sipariş.şehir} {sipariş.posta_kodu}
              </p>
              <p className="mt-2">{sipariş.telefon}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

