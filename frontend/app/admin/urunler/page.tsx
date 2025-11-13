'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ürünAPI } from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingBagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface Ürün {
  id: number
  ad: string
  açıklama?: string
  fiyat: number
  stok: number
  durum: string
  görseller: string[] | string
  kategori_id?: number
}

export default function AdminÜrünlerPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [ürünler, setÜrünler] = useState<Ürün[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)
  const [düzenlemeModu, setDüzenlemeModu] = useState<number | null>(null)
  const [yeniÜrünFormu, setYeniÜrünFormu] = useState(false)
  const { register, handleSubmit, reset, watch } = useForm()

  const ürünleriYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await ürünAPI.listele({ limit: 100 })
      const ürünlerListesi = response.data.veri.ürünler || []
      // Görselleri parse et
      const parsedÜrünler = ürünlerListesi.map((ürün: any) => ({
        ...ürün,
        görseller: typeof ürün.görseller === 'string' 
          ? (() => {
              try {
                return JSON.parse(ürün.görseller)
              } catch {
                return []
              }
            })()
          : ürün.görseller || []
      }))
      setÜrünler(parsedÜrünler)
    } catch (error: any) {
      // Sadece gerçek hataları logla
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Ürünler yüklenirken hata:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Ürünler yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  useEffect(() => {
    if (!kullanıcı || kullanıcı.rol !== 'admin') {
      router.push('/')
      return
    }
    ürünleriYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const yeniÜrünEkle = async (data: any) => {
    try {
      await ürünAPI.ekle({
        ...data,
        görseller: data.görseller ? [data.görseller] : []
      })
      await ürünleriYükle()
      setYeniÜrünFormu(false)
      reset()
      toast.success('Ürün başarıyla eklendi!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Ürün ekleme hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Ürün eklenirken hata oluştu')
    }
  }

  const ürünGüncelle = async (id: number, data: any) => {
    try {
      await ürünAPI.güncelle(id, {
        ...data,
        görseller: data.görseller ? [data.görseller] : []
      })
      await ürünleriYükle()
      setDüzenlemeModu(null)
      reset()
      toast.success('Ürün başarıyla güncellendi!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Ürün güncelleme hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Ürün güncellenirken hata oluştu')
    }
  }

  const ürünSil = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return

    try {
      await ürünAPI.sil(id)
      await ürünleriYükle()
      toast.success('Ürün başarıyla silindi!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Ürün silme hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Ürün silinirken hata oluştu')
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <ShoppingBagIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Ürün Yönetimi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Ürün ekle, düzenle ve yönet
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin"
                className="btn-secondary inline-flex items-center gap-2"
              >
                ← Geri
              </Link>
              {!yeniÜrünFormu && !düzenlemeModu && (
                <button
                  onClick={() => setYeniÜrünFormu(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Yeni Ürün
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Yeni Ürün Formu */}
        {yeniÜrünFormu && (
          <div className="card-modern p-8 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Yeni Ürün Ekle</h2>
              <button
                onClick={() => {
                  setYeniÜrünFormu(false)
                  reset()
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(yeniÜrünEkle)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Ürün Adı *</label>
                  <input
                    {...register('ad', { required: true })}
                    type="text"
                    className="input-modern"
                    placeholder="Örn: iPhone 15 Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Fiyat (₺) *</label>
                  <input
                    {...register('fiyat', { required: true, valueAsNumber: true, min: 0 })}
                    type="number"
                    step="0.01"
                    className="input-modern"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Stok *</label>
                  <input
                    {...register('stok', { required: true, valueAsNumber: true, min: 0 })}
                    type="number"
                    className="input-modern"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Kategori ID</label>
                  <input
                    {...register('kategori_id', { valueAsNumber: true })}
                    type="number"
                    className="input-modern"
                    placeholder="Opsiyonel"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Açıklama</label>
                <textarea
                  {...register('açıklama')}
                  className="input-modern"
                  rows={4}
                  placeholder="Ürün açıklaması..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Görsel URL</label>
                <input
                  {...register('görseller')}
                  type="url"
                  className="input-modern"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYeniÜrünFormu(false)
                    reset()
                  }}
                  className="btn-secondary"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ürün Listesi */}
        {ürünler.length === 0 ? (
          <div className="card-modern p-12 text-center animate-slide-up">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz ürün yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              İlk ürününüzü ekleyerek başlayın!
            </p>
            <button
              onClick={() => setYeniÜrünFormu(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              İlk Ürünü Ekle
            </button>
          </div>
        ) : (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Görsel</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Ürün</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Fiyat</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Stok</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {ürünler.map((ürün, index) => {
                    const görseller = Array.isArray(ürün.görseller) 
                      ? ürün.görseller 
                      : typeof ürün.görseller === 'string' 
                        ? (() => {
                            try {
                              return JSON.parse(ürün.görseller)
                            } catch {
                              return []
                            }
                          })()
                        : []
                    
                    return (
                      <tr 
                        key={ürün.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {görseller && görseller[0] ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                              <Image
                                src={görseller[0]}
                                alt={ürün.ad}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <PhotoIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">{ürün.ad}</div>
                          {ürün.açıklama && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {ürün.açıklama.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gradient">
                            {ürün.fiyat.toFixed(2)} ₺
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            ürün.stok > 10 
                              ? 'badge-success' 
                              : ürün.stok > 0 
                                ? 'badge-warning' 
                                : 'badge-danger'
                          }`}>
                            {ürün.stok} adet
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            ürün.durum === 'aktif' ? 'badge-success' : 'badge-danger'
                          }`}>
                            {ürün.durum}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setDüzenlemeModu(ürün.id)
                                reset({
                                  ...ürün,
                                  görseller: görseller[0] || ''
                                })
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => ürünSil(ürün.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Düzenleme Formu Modal */}
        {düzenlemeModu && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card-modern p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient">Ürün Düzenle</h2>
                <button
                  onClick={() => {
                    setDüzenlemeModu(null)
                    reset()
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form 
                onSubmit={handleSubmit((data) => ürünGüncelle(düzenlemeModu, data))} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ürün Adı *</label>
                    <input
                      {...register('ad', { required: true })}
                      type="text"
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fiyat (₺) *</label>
                    <input
                      {...register('fiyat', { required: true, valueAsNumber: true, min: 0 })}
                      type="number"
                      step="0.01"
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Stok *</label>
                    <input
                      {...register('stok', { required: true, valueAsNumber: true, min: 0 })}
                      type="number"
                      className="input-modern"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Kategori ID</label>
                    <input
                      {...register('kategori_id', { valueAsNumber: true })}
                      type="number"
                      className="input-modern"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Açıklama</label>
                  <textarea
                    {...register('açıklama')}
                    className="input-modern"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Görsel URL</label>
                  <input
                    {...register('görseller')}
                    type="url"
                    className="input-modern"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <CheckIcon className="h-5 w-5" />
                    Güncelle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDüzenlemeModu(null)
                      reset()
                    }}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

