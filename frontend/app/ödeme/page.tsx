'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useSepetStore } from '@/store/sepetStore'
import { adresAPI, siparişAPI } from '@/lib/api'
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

export default function ÖdemePage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const { sepet, toplam, sepetYükle } = useSepetStore()
  const [adresler, setAdresler] = useState<Adres[]>([])
  const [seçiliAdres, setSeçiliAdres] = useState<number | null>(null)
  const [yeniAdresFormu, setYeniAdresFormu] = useState(false)
  const [kuponKodu, setKuponKodu] = useState('')
  const { register, handleSubmit } = useForm()

  useEffect(() => {
    if (!kullanıcı) {
      router.push('/giris')
      return
    }
    // Admin kullanıcıları ödeme sayfasına erişemez
    if (kullanıcı.rol === 'admin') {
      toast.error('Admin kullanıcıları sipariş veremez. Lütfen normal kullanıcı hesabı ile giriş yapın.')
      router.push('/admin')
      return
    }
    adresleriYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router]) // sepetYükle zaten Header'da çağrılıyor

  const adresleriYükle = async () => {
    try {
      const response = await adresAPI.listele()
      setAdresler(response.data.veri)
      const varsayılanAdres = response.data.veri.find((a: Adres) => a.varsayılan)
      if (varsayılanAdres) {
        setSeçiliAdres(varsayılanAdres.id)
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error)
    }
  }

  const yeniAdresEkle = async (data: any) => {
    try {
      await adresAPI.ekle({ ...data, varsayılan: !adresler.length })
      await adresleriYükle()
      setYeniAdresFormu(false)
      toast.success('Adres eklendi')
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Adres eklenirken hata oluştu')
    }
  }

  const siparişOluştur = async () => {
    if (!seçiliAdres) {
      toast.error('Lütfen bir adres seçin')
      return
    }

    if (sepet.length === 0) {
      toast.error('Sepetiniz boş')
      return
    }

    try {
      const response = await siparişAPI.oluştur({
        adres_id: seçiliAdres,
        kupon_kodu: kuponKodu || null,
        ödeme_yöntemi: 'kredi_kartı'
      })

      toast.success('Siparişiniz oluşturuldu!')
      router.push(`/siparişler/${response.data.veri.sipariş_id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Sipariş oluşturulurken hata oluştu')
    }
  }

  if (!kullanıcı || sepet.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sepetiniz boş</h1>
          <button
            onClick={() => router.push('/ürünler')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ödeme</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf - Adres ve Ödeme */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adres Seçimi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Teslimat Adresi</h2>

            {!yeniAdresFormu ? (
              <>
                <div className="space-y-3 mb-4">
                  {adresler.map((adres) => (
                    <label
                      key={adres.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer ${
                        seçiliAdres === adres.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="adres"
                        value={adres.id}
                        checked={seçiliAdres === adres.id}
                        onChange={() => setSeçiliAdres(adres.id)}
                        className="mr-2"
                      />
                      <div>
                        <p className="font-semibold">{adres.adres_başlığı}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {adres.adres}, {adres.ilçe}, {adres.şehir}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {adres.telefon}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setYeniAdresFormu(true)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  + Yeni Adres Ekle
                </button>
              </>
            ) : (
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
                    onClick={() => setYeniAdresFormu(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    İptal
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Ödeme Yöntemi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Ödeme Yöntemi</h2>
            <div className="space-y-2">
              <label className="flex items-center p-4 border-2 border-blue-600 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="ödeme"
                  value="kredi_kartı"
                  defaultChecked
                  className="mr-2"
                />
                <div>
                  <p className="font-semibold">Kredi Kartı</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Test modu - Gerçek ödeme alınmayacak
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Kupon Kodu */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Kupon Kodu</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Kupon kodunuzu girin"
                value={kuponKodu}
                onChange={(e) => setKuponKodu(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Özet */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Ara Toplam</span>
                <span>{toplam.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Kargo</span>
                <span>Ücretsiz</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span>{toplam.toFixed(2)} ₺</span>
                </div>
              </div>
            </div>
            <button
              onClick={siparişOluştur}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Siparişi Tamamla
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

