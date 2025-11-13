'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { TicketIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Kupon {
  id: number
  kod: string
  tip: string
  değer: number
  başlangıç_tarihi: string
  bitiş_tarihi: string
  durum: string
}

export default function AdminKuponlarPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [kuponlar, setKuponlar] = useState<Kupon[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)
  const [yeniKuponFormu, setYeniKuponFormu] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const kuponlarıYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await api.get('/admin/kuponlar')
      setKuponlar(response.data.veri || [])
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Kuponlar yüklenirken hata:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Kuponlar yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  useEffect(() => {
    if (!kullanıcı || kullanıcı.rol !== 'admin') {
      router.push('/')
      return
    }
    kuponlarıYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const yeniKuponOluştur = async (data: any) => {
    try {
      await api.post('/admin/kuponlar', data)
      await kuponlarıYükle()
      setYeniKuponFormu(false)
      reset()
      toast.success('Kupon başarıyla oluşturuldu!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Kupon oluşturma hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Kupon oluşturulurken hata oluştu')
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
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Kuponlar yükleniyor...</p>
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
              <div className="p-3 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl shadow-lg">
                <TicketIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Kupon Yönetimi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  İndirim kuponları oluştur ve yönet
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
              {!yeniKuponFormu && (
                <button
                  onClick={() => setYeniKuponFormu(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Yeni Kupon
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Yeni Kupon Formu */}
        {yeniKuponFormu && (
          <div className="card-modern p-8 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Yeni Kupon Oluştur</h2>
              <button
                onClick={() => {
                  setYeniKuponFormu(false)
                  reset()
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(yeniKuponOluştur)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Kupon Kodu *</label>
                <input
                  {...register('kod', { required: true })}
                  type="text"
                  placeholder="HOŞGELDİN10"
                  className="input-modern uppercase"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Tip *</label>
                  <select
                    {...register('tip', { required: true })}
                    className="input-modern"
                  >
                    <option value="yüzde">Yüzde (%)</option>
                    <option value="sabit">Sabit Tutar (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Değer *</label>
                  <input
                    {...register('değer', { required: true, valueAsNumber: true, min: 0 })}
                    type="number"
                    step="0.01"
                    className="input-modern"
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Başlangıç Tarihi *</label>
                  <input
                    {...register('başlangıç_tarihi', { required: true })}
                    type="datetime-local"
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Bitiş Tarihi *</label>
                  <input
                    {...register('bitiş_tarihi', { required: true })}
                    type="datetime-local"
                    className="input-modern"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Kullanım Limiti (Opsiyonel)</label>
                <input
                  {...register('kullanım_limiti', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="input-modern"
                  placeholder="Boş bırakılırsa sınırsız"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYeniKuponFormu(false)
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

        {/* Kupon Listesi */}
        {kuponlar.length === 0 ? (
          <div className="card-modern p-12 text-center animate-slide-up">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <TicketIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz kupon yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              İlk kuponunuzu oluşturarak başlayın!
            </p>
            <button
              onClick={() => setYeniKuponFormu(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              İlk Kuponu Oluştur
            </button>
          </div>
        ) : (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-600 to-orange-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Kod</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Tip</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Değer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Başlangıç</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Bitiş</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kuponlar.map((kupon) => {
                    const şimdi = new Date()
                    const başlangıç = new Date(kupon.başlangıç_tarihi)
                    const bitiş = new Date(kupon.bitiş_tarihi)
                    const aktif = şimdi >= başlangıç && şimdi <= bitiş && kupon.durum === 'aktif'
                    
                    return (
                      <tr 
                        key={kupon.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                            {kupon.kod}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            kupon.tip === 'yüzde' ? 'badge-primary' : 'badge-accent'
                          }`}>
                            {kupon.tip === 'yüzde' ? 'Yüzde' : 'Sabit'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xl font-bold text-gradient">
                            {kupon.tip === 'yüzde' ? `%${kupon.değer}` : `${kupon.değer} ₺`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(kupon.başlangıç_tarihi).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(kupon.bitiş_tarihi).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            aktif 
                              ? 'badge-success' 
                              : kupon.durum === 'aktif' 
                                ? 'badge-warning' 
                                : 'badge-danger'
                          }`}>
                            {aktif ? 'Aktif' : kupon.durum}
                          </span>
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
