'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { adresAPI } from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface Adres {
  id: number
  adres_başlığı: string
  adres: string
  şehir: string
  ilçe: string
  posta_kodu: string
  telefon: string
  varsayılan: boolean
}

export default function AdreslerPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [adresler, setAdresler] = useState<Adres[]>([])
  const [düzenlemeModu, setDüzenlemeModu] = useState<number | null>(null)
  const [yeniAdresFormu, setYeniAdresFormu] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (!kullanıcı) {
      router.push('/giris')
      return
    }
    adresleriYükle()
  }, [kullanıcı, router])

  const adresleriYükle = async () => {
    try {
      const response = await adresAPI.listele()
      setAdresler(response.data.veri)
    } catch (error) {
      toast.error('Adresler yüklenirken hata oluştu')
    }
  }

  const yeniAdresEkle = async (data: any) => {
    try {
      await adresAPI.ekle({ ...data, varsayılan: !adresler.length })
      await adresleriYükle()
      setYeniAdresFormu(false)
      reset()
      toast.success('Adres eklendi')
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Adres eklenirken hata oluştu')
    }
  }

  const adresGüncelle = async (id: number, data: any) => {
    try {
      await adresAPI.güncelle(id, data)
      await adresleriYükle()
      setDüzenlemeModu(null)
      reset()
      toast.success('Adres güncellendi')
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Adres güncellenirken hata oluştu')
    }
  }

  const adresSil = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return

    try {
      await adresAPI.sil(id)
      await adresleriYükle()
      toast.success('Adres silindi')
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Adres silinirken hata oluştu')
    }
  }

  const varsayılanYap = async (id: number) => {
    try {
      const adres = adresler.find(a => a.id === id)
      if (adres) {
        await adresAPI.güncelle(id, { ...adres, varsayılan: true })
        await adresleriYükle()
        toast.success('Varsayılan adres güncellendi')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Adres güncellenirken hata oluştu')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Adreslerim</h1>
        {!yeniAdresFormu && (
          <button
            onClick={() => setYeniAdresFormu(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Yeni Adres Ekle
          </button>
        )}
      </div>

      {/* Yeni Adres Formu */}
      {yeniAdresFormu && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Yeni Adres Ekle</h2>
          <form onSubmit={handleSubmit(yeniAdresEkle)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Adres Başlığı</label>
              <input
                {...register('adres_başlığı', { required: true })}
                type="text"
                placeholder="Ev, İş vb."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Adres</label>
              <textarea
                {...register('adres', { required: true })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Şehir</label>
                <input
                  {...register('şehir', { required: true })}
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">İlçe</label>
                <input
                  {...register('ilçe', { required: true })}
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Posta Kodu</label>
                <input
                  {...register('posta_kodu')}
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  {...register('telefon', { required: true })}
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => {
                  setYeniAdresFormu(false)
                  reset()
                }}
                className="px-4 py-2 border rounded-lg"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adres Listesi */}
      {adresler.length === 0 && !yeniAdresFormu ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Henüz adres eklenmemiş</p>
          <button
            onClick={() => setYeniAdresFormu(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            İlk Adresinizi Ekleyin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adresler.map((adres) => (
            <div
              key={adres.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              {düzenlemeModu === adres.id ? (
                <form
                  onSubmit={handleSubmit((data) => adresGüncelle(adres.id, data))}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">Adres Başlığı</label>
                    <input
                      {...register('adres_başlığı', { required: true })}
                      type="text"
                      defaultValue={adres.adres_başlığı}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Adres</label>
                    <textarea
                      {...register('adres', { required: true })}
                      defaultValue={adres.adres}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Şehir</label>
                      <input
                        {...register('şehir', { required: true })}
                        type="text"
                        defaultValue={adres.şehir}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">İlçe</label>
                      <input
                        {...register('ilçe', { required: true })}
                        type="text"
                        defaultValue={adres.ilçe}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Posta Kodu</label>
                      <input
                        {...register('posta_kodu')}
                        type="text"
                        defaultValue={adres.posta_kodu}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefon</label>
                      <input
                        {...register('telefon', { required: true })}
                        type="text"
                        defaultValue={adres.telefon}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Kaydet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDüzenlemeModu(null)
                        reset()
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{adres.adres_başlığı}</h3>
                      {adres.varsayılan && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Varsayılan
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 mb-4">
                    <p>{adres.adres}</p>
                    <p>
                      {adres.ilçe}, {adres.şehir} {adres.posta_kodu}
                    </p>
                    <p className="mt-2">{adres.telefon}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setDüzenlemeModu(adres.id)
                        reset(adres)
                      }}
                      className="px-3 py-1 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Düzenle
                    </button>
                    {!adres.varsayılan && (
                      <button
                        onClick={() => varsayılanYap(adres.id)}
                        className="px-3 py-1 text-green-600 hover:text-green-700 text-sm"
                      >
                        Varsayılan Yap
                      </button>
                    )}
                    <button
                      onClick={() => adresSil(adres.id)}
                      className="px-3 py-1 text-red-600 hover:text-red-700 text-sm"
                    >
                      Sil
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

