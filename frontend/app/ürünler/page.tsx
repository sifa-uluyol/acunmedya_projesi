'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ürünAPI } from '@/lib/api'
import { useSepetStore } from '@/store/sepetStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  ShoppingCartIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'

interface Ürün {
  id: number
  ad: string
  slug: string
  fiyat: number
  indirimli_fiyat?: number
  görseller: string[]
  kısa_açıklama?: string
  stok: number
}

export default function ÜrünlerPage() {
  const [ürünler, setÜrünler] = useState<Ürün[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)
  const [filtrelerAçık, setFiltrelerAçık] = useState(false)
  const [filtreler, setFiltreler] = useState({
    kategori: '',
    minFiyat: '',
    maxFiyat: '',
    stokta: false,
    sıralama: 'yeni'
  })
  const { sepeteEkle } = useSepetStore()
  const { kullanıcı } = useAuthStore()

  useEffect(() => {
    ürünleriYükle()
  }, [filtreler])

  const ürünleriYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await ürünAPI.listele(filtreler)
      setÜrünler(response.data.veri.ürünler)
    } catch (error) {
      toast.error('Ürünler yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  const sepeteEkleHandler = async (ürün_id: number) => {
    // Admin kullanıcıları sepete ekleme yapamaz
    if (kullanıcı?.rol === 'admin') {
      toast.error('Admin kullanıcıları sepete ürün ekleyemez. Lütfen normal kullanıcı hesabı ile giriş yapın.')
      return
    }
    try {
      await sepeteEkle(ürün_id, 1)
      toast.success('Ürün sepete eklendi! 🎉')
    } catch (error) {
      toast.error('Ürün sepete eklenirken hata oluştu')
    }
  }

  const indirimYüzdesi = (fiyat: number, indirimli: number) => {
    return Math.round(((fiyat - indirimli) / fiyat) * 100)
  }

  if (yükleniyor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Ürünler yükleniyor...</p>
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
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
              Ürünler
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {ürünler.length} ürün bulundu
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtreler Sidebar */}
          <aside className={`lg:w-80 ${filtrelerAçık ? 'block' : 'hidden lg:block'}`}>
            <div className="card-modern p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5 text-purple-600" />
                  Filtreler
                </h2>
                <button
                  onClick={() => setFiltrelerAçık(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Fiyat Aralığı */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Fiyat Aralığı
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filtreler.minFiyat}
                      onChange={(e) => setFiltreler({ ...filtreler, minFiyat: e.target.value })}
                      className="input-modern"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filtreler.maxFiyat}
                      onChange={(e) => setFiltreler({ ...filtreler, maxFiyat: e.target.value })}
                      className="input-modern"
                    />
                  </div>
                </div>

                {/* Stokta Olanlar */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <input
                    type="checkbox"
                    id="stokta"
                    checked={filtreler.stokta}
                    onChange={(e) => setFiltreler({ ...filtreler, stokta: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="stokta" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Sadece stokta olanlar
                  </label>
                </div>

                {/* Sıralama */}
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Sıralama
                  </label>
                  <select
                    value={filtreler.sıralama}
                    onChange={(e) => setFiltreler({ ...filtreler, sıralama: e.target.value })}
                    className="input-modern"
                  >
                    <option value="yeni">Yeni Ürünler</option>
                    <option value="fiyat-artan">Fiyat: Düşükten Yükseğe</option>
                    <option value="fiyat-azalan">Fiyat: Yüksekten Düşüğe</option>
                    <option value="ad">İsme Göre (A-Z)</option>
                  </select>
                </div>

                {/* Filtreleri Temizle */}
                <button
                  onClick={() => setFiltreler({
                    kategori: '',
                    minFiyat: '',
                    maxFiyat: '',
                    stokta: false,
                    sıralama: 'yeni'
                  })}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          </aside>

          {/* Ürün Listesi */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setFiltrelerAçık(true)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                Filtreleri Göster
              </button>
            </div>

            {ürünler.length === 0 ? (
              <div className="card-modern p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                  <FunnelIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  Ürün bulunamadı
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Aradığınız kriterlere uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
                </p>
                <button
                  onClick={() => setFiltreler({
                    kategori: '',
                    minFiyat: '',
                    maxFiyat: '',
                    stokta: false,
                    sıralama: 'yeni'
                  })}
                  className="btn-primary"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ürünler.map((ürün, index) => (
                  <div
                    key={ürün.id}
                    className="card-modern card-hover group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Ürün Görseli */}
                    <Link href={`/ürünler/${ürün.id}`} className="relative block h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {ürün.görseller && ürün.görseller[0] ? (
                        <Image
                          src={ürün.görseller[0]}
                          alt={ürün.ad}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCartIcon className="h-16 w-16" />
                        </div>
                      )}
                      
                      {/* İndirim Badge */}
                      {ürün.indirimli_fiyat && (
                        <div className="absolute top-4 left-4">
                          <span className="badge badge-danger flex items-center gap-1">
                            <FireIcon className="h-4 w-4" />
                            %{indirimYüzdesi(ürün.fiyat, ürün.indirimli_fiyat)}
                          </span>
                        </div>
                      )}
                      
                      {/* Stok Durumu */}
                      {ürün.stok === 0 && (
                        <div className="absolute top-4 right-4">
                          <span className="badge badge-warning">Stokta Yok</span>
                        </div>
                      )}
                    </Link>

                    {/* Ürün Bilgileri */}
                    <div className="p-6">
                      <Link href={`/ürünler/${ürün.id}`}>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {ürün.ad}
                        </h3>
                      </Link>
                      
                      {ürün.kısa_açıklama && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {ürün.kısa_açıklama}
                        </p>
                      )}
                      
                      {/* Fiyat ve Sepete Ekle */}
                      <div className="flex items-center justify-between">
                        <div>
                          {ürün.indirimli_fiyat ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {ürün.indirimli_fiyat.toFixed(2)} ₺
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {ürün.fiyat.toFixed(2)} ₺
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {ürün.fiyat.toFixed(2)} ₺
                            </span>
                          )}
                        </div>
                        {kullanıcı?.rol !== 'admin' && (
                          <button
                            onClick={() => sepeteEkleHandler(ürün.id)}
                            disabled={ürün.stok === 0}
                            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <ShoppingCartIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
