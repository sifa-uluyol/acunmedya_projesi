'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  UserCircleIcon,
  LockClosedIcon,
  MapPinIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function ProfilPage() {
  const router = useRouter()
  const { kullanıcı, profilGüncelle, şifreDeğiştir } = useAuthStore()
  const { register: registerProfil, handleSubmit: handleSubmitProfil } = useForm()
  const { register: registerŞifre, handleSubmit: handleSubmitŞifre, watch } = useForm()

  useEffect(() => {
    if (!kullanıcı) {
      router.push('/giris')
      return
    }
    if (kullanıcı.rol === 'admin') {
      toast.error('Admin kullanıcıları için profil yönetimi admin panelinden yapılır.')
      router.push('/admin')
      return
    }
  }, [kullanıcı, router])

  const onProfilGüncelle = async (data: any) => {
    try {
      await profilGüncelle(data)
      toast.success('Profil başarıyla güncellendi!')
    } catch (error: any) {
      toast.error(error || 'Profil güncellenirken hata oluştu')
    }
  }

  const onŞifreDeğiştir = async (data: any) => {
    if (data.yeniŞifre !== data.yeniŞifreTekrar) {
      toast.error('Şifreler eşleşmiyor!')
      return
    }
    try {
      await şifreDeğiştir(data.eskiŞifre, data.yeniŞifre)
      toast.success('Şifre başarıyla değiştirildi!')
    } catch (error: any) {
      toast.error(error || 'Şifre değiştirilirken hata oluştu')
    }
  }

  if (!kullanıcı) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <UserCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
                Profilim
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Kişisel bilgilerinizi yönetin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profil Bilgileri */}
          <div className="card-modern p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gradient">Kişisel Bilgiler</h2>
            </div>
            <form onSubmit={handleSubmitProfil(onProfilGüncelle)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  E-posta
                </label>
                <input
                  type="email"
                  value={kullanıcı.email}
                  disabled
                  className="input-modern bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  E-posta adresi değiştirilemez
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Ad *</label>
                <input
                  {...registerProfil('ad', { required: true })}
                  defaultValue={kullanıcı.ad}
                  className="input-modern"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Soyad *</label>
                <input
                  {...registerProfil('soyad', { required: true })}
                  defaultValue={kullanıcı.soyad}
                  className="input-modern"
                  placeholder="Soyadınız"
                />
              </div>
              {kullanıcı.telefon && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Telefon</label>
                  <input
                    {...registerProfil('telefon')}
                    defaultValue={kullanıcı.telefon}
                    className="input-modern"
                    placeholder="Telefon numaranız"
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Bilgileri Güncelle
              </button>
            </form>
          </div>

          {/* Şifre Değiştir */}
          <div className="card-modern p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <LockClosedIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gradient">Şifre Değiştir</h2>
            </div>
            <form onSubmit={handleSubmitŞifre(onŞifreDeğiştir)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Mevcut Şifre *</label>
                <input
                  {...registerŞifre('eskiŞifre', { required: true })}
                  type="password"
                  className="input-modern"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Yeni Şifre *</label>
                <input
                  {...registerŞifre('yeniŞifre', { required: true, minLength: 6 })}
                  type="password"
                  className="input-modern"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Yeni Şifre Tekrar *</label>
                <input
                  {...registerŞifre('yeniŞifreTekrar', {
                    required: true,
                    validate: (value) => value === watch('yeniŞifre') || 'Şifreler eşleşmiyor'
                  })}
                  type="password"
                  className="input-modern"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Şifreyi Değiştir
              </button>
            </form>
          </div>
        </div>

        {/* Hızlı Linkler */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/adresler"
            className="card-modern card-hover p-6 animate-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                <MapPinIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Adreslerim</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Teslimat adreslerinizi yönetin
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/siparişler"
            className="card-modern card-hover p-6 animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Siparişlerim</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sipariş geçmişinizi görüntüleyin
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
