'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { UsersIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface Kullanıcı {
  id: number
  email: string
  ad: string
  soyad: string
  rol: string
  durum: string
  oluşturulma_tarihi: string
}

export default function AdminKullanıcılarPage() {
  const router = useRouter()
  const { kullanıcı } = useAuthStore()
  const [kullanıcılar, setKullanıcılar] = useState<Kullanıcı[]>([])
  const [yükleniyor, setYükleniyor] = useState(true)

  const kullanıcılarıYükle = async () => {
    setYükleniyor(true)
    try {
      const response = await api.get('/admin/kullanıcılar')
      setKullanıcılar(response.data.veri || [])
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Kullanıcılar yüklenirken hata:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Kullanıcılar yüklenirken hata oluştu')
    } finally {
      setYükleniyor(false)
    }
  }

  useEffect(() => {
    if (!kullanıcı || kullanıcı.rol !== 'admin') {
      router.push('/')
      return
    }
    kullanıcılarıYükle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const rolGüncelle = async (id: number, yeniRol: string) => {
    try {
      await api.put(`/admin/kullanıcılar/${id}/rol`, { rol: yeniRol })
      await kullanıcılarıYükle()
      toast.success('Kullanıcı rolü başarıyla güncellendi!')
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Rol güncelleme hatası:', {
          status: error.response?.status,
          message: error.response?.data?.mesaj || error.message,
        })
      }
      toast.error(error.response?.data?.mesaj || 'Rol güncellenirken hata oluştu')
    }
  }

  const durumGüncelle = async (id: number, yeniDurum: string) => {
    try {
      await api.put(`/admin/kullanıcılar/${id}/durum`, { durum: yeniDurum })
      await kullanıcılarıYükle()
      toast.success('Kullanıcı durumu başarıyla güncellendi!')
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

  if (!kullanıcı || kullanıcı.rol !== 'admin') {
    return null
  }

  if (yükleniyor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Kullanıcılar yükleniyor...</p>
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
              <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                  Kullanıcı Yönetimi
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Kullanıcıları görüntüle, rolleri ve durumları yönet
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

        {kullanıcılar.length === 0 ? (
          <div className="card-modern p-12 text-center animate-slide-up">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <UsersIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Henüz kullanıcı yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Kullanıcılar kayıt olduğunda burada görünecek
            </p>
          </div>
        ) : (
          <div className="card-modern overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-600 to-red-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Ad Soyad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">E-posta</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Kayıt Tarihi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kullanıcılar.map((k) => (
                    <tr 
                      key={k.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          #{k.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {k.rol === 'admin' && (
                            <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {k.ad} {k.soyad}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 dark:text-gray-300">{k.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={k.rol}
                          onChange={(e) => rolGüncelle(k.id, e.target.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                            k.rol === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                          } hover:border-current`}
                        >
                          <option value="user">Kullanıcı</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={k.durum}
                          onChange={(e) => durumGüncelle(k.id, e.target.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                            k.durum === 'aktif' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700' 
                              : k.durum === 'pasif'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700'
                          } hover:border-current`}
                        >
                          <option value="aktif">Aktif</option>
                          <option value="pasif">Pasif</option>
                          <option value="silindi">Silindi</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(k.oluşturulma_tarihi).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
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

