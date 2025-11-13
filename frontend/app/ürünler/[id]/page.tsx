'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { ürünAPI } from '@/lib/api'
import { useSepetStore } from '@/store/sepetStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface Ürün {
  id: number
  ad: string
  açıklama: string
  fiyat: number
  indirimli_fiyat?: number
  stok: number
  görseller: string[]
  kategori_ad?: string
  varyantlar?: any[]
  benzerÜrünler?: any[]
}

export default function ÜrünDetayPage() {
  const params = useParams()
  const id = params.id as string
  const [ürün, setÜrün] = useState<Ürün | null>(null)
  const [yükleniyor, setYükleniyor] = useState(true)
  const [seçiliGörsel, setSeçiliGörsel] = useState(0)
  const [adet, setAdet] = useState(1)
  const { sepeteEkle } = useSepetStore()
  const { kullanıcı } = useAuthStore()

  useEffect(() => {
    ürünYükle()
  }, [id])

  const ürünYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await ürünAPI.detay(id)
      setÜrün(response.data.veri)
    } catch (error) {
      toast.error('Ürün yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  const sepeteEkleHandler = async () => {
    if (!ürün) return
    // Admin kullanıcıları sepete ekleme yapamaz
    if (kullanıcı?.rol === 'admin') {
      toast.error('Admin kullanıcıları sepete ürün ekleyemez. Lütfen normal kullanıcı hesabı ile giriş yapın.')
      return
    }
    try {
      await sepeteEkle(ürün.id, adet)
      toast.success('Ürün sepete eklendi')
    } catch (error) {
      toast.error('Ürün sepete eklenirken hata oluştu')
    }
  }

  if (yükleniyor) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Yükleniyor...</div>
      </div>
    )
  }

  if (!ürün) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ürün bulunamadı</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Görseller */}
        <div>
          <div className="relative h-96 mb-4 bg-gray-200 rounded-lg overflow-hidden">
            {ürün.görseller && ürün.görseller[seçiliGörsel] ? (
              <Image
                src={ürün.görseller[seçiliGörsel]}
                alt={ürün.ad}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Görsel Yok
              </div>
            )}
          </div>
          {ürün.görseller && ürün.görseller.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {ürün.görseller.map((görsel, index) => (
                <button
                  key={index}
                  onClick={() => setSeçiliGörsel(index)}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 ${
                    seçiliGörsel === index ? 'border-blue-600' : 'border-gray-300'
                  }`}
                >
                  <Image
                    src={görsel}
                    alt={`${ürün.ad} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{ürün.ad}</h1>
          {ürün.kategori_ad && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Kategori: {ürün.kategori_ad}
            </p>
          )}
          
          <div className="mb-6">
            {ürün.indirimli_fiyat ? (
              <div>
                <span className="text-3xl font-bold text-red-600">
                  {ürün.indirimli_fiyat.toFixed(2)} ₺
                </span>
                <span className="text-xl text-gray-500 line-through ml-2">
                  {ürün.fiyat.toFixed(2)} ₺
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                {ürün.fiyat.toFixed(2)} ₺
              </span>
            )}
          </div>

          {ürün.açıklama && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Açıklama</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {ürün.açıklama}
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Stok Durumu: {ürün.stok > 0 ? `${ürün.stok} adet` : 'Stokta yok'}
            </p>
          </div>

          {/* Adet Seçimi */}
          <div className="flex items-center gap-4 mb-6">
            <label className="font-medium">Adet:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdet(Math.max(1, adet - 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={adet}
                onChange={(e) => setAdet(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={ürün.stok}
                className="w-20 px-3 py-1 border rounded-lg text-center"
              />
              <button
                onClick={() => setAdet(Math.min(ürün.stok, adet + 1))}
                className="px-3 py-1 border rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Sepete Ekle Butonu - Admin için gizli */}
          {kullanıcı?.rol !== 'admin' && (
            <button
              onClick={sepeteEkleHandler}
              disabled={ürün.stok === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {ürün.stok > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
            </button>
          )}
          {kullanıcı?.rol === 'admin' && (
            <div className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-center font-semibold text-lg cursor-not-allowed">
              Admin kullanıcıları sepete ürün ekleyemez
            </div>
          )}
        </div>
      </div>

      {/* Benzer Ürünler */}
      {ürün.benzerÜrünler && ürün.benzerÜrünler.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ürün.benzerÜrünler.map((benzer) => (
              <div key={benzer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {benzer.görseller && benzer.görseller[0] ? (
                    <Image
                      src={benzer.görseller[0]}
                      alt={benzer.ad}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Görsel Yok
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{benzer.ad}</h3>
                  <p className="font-bold">{benzer.fiyat.toFixed(2)} ₺</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

