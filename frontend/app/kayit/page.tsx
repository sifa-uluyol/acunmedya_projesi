'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { 
  UserIcon,
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function KayıtPage() {
  const router = useRouter()
  const { kayıtOl, yükleniyor } = useAuthStore()
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const [şifreGörünür, setŞifreGörünür] = useState(false)
  const [şifreTekrarGörünür, setŞifreTekrarGörünür] = useState(false)

  const şifre = watch('şifre')
  const şifreTekrar = watch('şifreTekrar')

  const onSubmit = async (data: any) => {
    try {
      await kayıtOl(data)
      toast.success('Kayıt başarılı! Hoş geldiniz! 🎉')
      router.push('/')
    } catch (error: any) {
      toast.error(error || 'Kayıt başarısız')
    }
  }

  const şifreGüçlü = (şifre: string) => {
    if (!şifre) return { güç: 0, renk: 'bg-gray-200' }
    let güç = 0
    if (şifre.length >= 6) güç++
    if (şifre.length >= 8) güç++
    if (/[A-Z]/.test(şifre)) güç++
    if (/[0-9]/.test(şifre)) güç++
    if (/[^A-Za-z0-9]/.test(şifre)) güç++
    
    if (güç <= 2) return { güç, renk: 'bg-red-500' }
    if (güç <= 3) return { güç, renk: 'bg-yellow-500' }
    return { güç, renk: 'bg-green-500' }
  }

  const şifreDurumu = şifreGüçlü(şifre || '')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Card */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl mb-4 shadow-2xl transform hover:rotate-12 transition-transform duration-300">
            <SparklesIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Hesap Oluştur
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ücretsiz kayıt olun ve alışverişe başlayın
          </p>
        </div>

        {/* Form Card */}
        <div className="card-modern p-8 animate-slide-up">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Ad Soyad Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ad" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('ad', { required: 'Ad zorunludur' })}
                    type="text"
                    id="ad"
                    className="input-modern pl-12"
                    placeholder="Adınız"
                  />
                </div>
                {errors.ad && (
                  <p className="mt-1 text-sm text-red-600">{errors.ad.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="soyad" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('soyad', { required: 'Soyad zorunludur' })}
                    type="text"
                    id="soyad"
                    className="input-modern pl-12"
                    placeholder="Soyadınız"
                  />
                </div>
                {errors.soyad && (
                  <p className="mt-1 text-sm text-red-600">{errors.soyad.message as string}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'E-posta zorunludur',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçersiz e-posta adresi'
                    }
                  })}
                  type="email"
                  id="email"
                  className="input-modern pl-12"
                  placeholder="ornek@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
              )}
            </div>

            {/* Şifre */}
            <div>
              <label htmlFor="şifre" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('şifre', {
                    required: 'Şifre zorunludur',
                    minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                  })}
                  type={şifreGörünür ? 'text' : 'password'}
                  id="şifre"
                  className="input-modern pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setŞifreGörünür(!şifreGörünür)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {şifreGörünür ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {şifre && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= şifreDurumu.güç ? şifreDurumu.renk : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {şifreDurumu.güç <= 2 && 'Zayıf'}
                    {şifreDurumu.güç === 3 && 'Orta'}
                    {şifreDurumu.güç >= 4 && 'Güçlü'}
                  </p>
                </div>
              )}
              {errors.şifre && (
                <p className="mt-1 text-sm text-red-600">{errors.şifre.message as string}</p>
              )}
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label htmlFor="şifreTekrar" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('şifreTekrar', {
                    required: 'Şifre tekrarı zorunludur',
                    validate: (value) => value === şifre || 'Şifreler eşleşmiyor'
                  })}
                  type={şifreTekrarGörünür ? 'text' : 'password'}
                  id="şifreTekrar"
                  className="input-modern pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setŞifreTekrarGörünür(!şifreTekrarGörünür)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {şifreTekrarGörünür ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {şifreTekrar && şifre === şifreTekrar && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  Şifreler eşleşiyor
                </p>
              )}
              {errors.şifreTekrar && (
                <p className="mt-1 text-sm text-red-600">{errors.şifreTekrar.message as string}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                <Link href="/#" className="text-blue-600 hover:underline dark:text-blue-400">
                  Kullanım Koşulları
                </Link>
                {' '}ve{' '}
                <Link href="/#" className="text-blue-600 hover:underline dark:text-blue-400">
                  Gizlilik Politikası
                </Link>
                'nı kabul ediyorum
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={yükleniyor}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {yükleniyor ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Kayıt yapılıyor...
                </span>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">veya</span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
