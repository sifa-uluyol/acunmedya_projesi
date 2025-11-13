'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FolderIcon, PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Kategori {
  id: number
  ad: string
  açıklama?: string
  slug?: string
  durum: string
}

export default function AdminKategorilerPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [kategoriler, setKategoriler] = useState<Kategori[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)
  const [yeniKategoriFormu, setYeniKategoriFormu] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const kategorileriYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await api.get('/admin/kategoriler')
      setKategoriler(response.data.veri || [])
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Kategoriler yüklenirken hata:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Kategoriler yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  useEffect(() => {
    if (!kullanıcı || kullanıcı.rol !== 'admin') {
      router.push('/')
      return
    }
    kategorileriYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const yeniKategoriEkle = async (data: any) => {
    try {
      await api.post('/admin/kategoriler', data)
      await kategorileriYükle()
      setYeniKategoriFormu(false)
      reset()
      toast.success('Kategori başarıyla eklendi!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Kategori ekleme hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Kategori eklenirken hata oluştu')
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
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Kategoriler yükleniyor...</p>
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
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <FolderIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Kategori Yönetimi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Kategorileri ekle ve yönet
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
              {!yeniKategoriFormu && (
                <button
                  onClick={() => setYeniKategoriFormu(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Yeni Kategori
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Yeni Kategori Formu */}
        {yeniKategoriFormu && (
          <div className="card-modern p-8 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Yeni Kategori Ekle</h2>
              <button
                onClick={() => {
                  setYeniKategoriFormu(false)
                  reset()
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit(yeniKategoriEkle)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Kategori Adı *</label>
                <input
                  {...register('ad', { required: true })}
                  type="text"
                  className="input-modern"
                  placeholder="Örn: Elektronik"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Açıklama</label>
                <textarea
                  {...register('açıklama')}
                  className="input-modern"
                  rows={3}
                  placeholder="Kategori açıklaması..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Slug (URL)</label>
                <input
                  {...register('slug')}
                  type="text"
                  placeholder="elektronik"
                  className="input-modern"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Boş bırakılırsa otomatik oluşturulur
                </p>
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
                    setYeniKategoriFormu(false)
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

        {/* Kategori Listesi */}
        {kategoriler.length === 0 ? (
          <div className="card-modern p-12 text-center animate-slide-up">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <FolderIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz kategori yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              İlk kategorinizi ekleyerek başlayın!
            </p>
            <button
              onClick={() => setYeniKategoriFormu(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              İlk Kategoriyi Ekle
            </button>
          </div>
        ) : (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Kategori Adı</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Açıklama</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kategoriler.map((kategori) => (
                    <tr 
                      key={kategori.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          #{kategori.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {kategori.ad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {kategori.slug || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {kategori.açıklama || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          kategori.durum === 'aktif' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {kategori.durum}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
