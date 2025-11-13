'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function GirişPage() {
  const router = useRouter()
  const { girişYap, yükleniyor } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [şifreGörünür, setŞifreGörünür] = useState(false)

  const onSubmit = async (data: any) => {
    try {
      await girişYap(data.email, data.şifre)
      toast.success('Giriş başarılı! Hoş geldiniz! 🎉')
      router.push('/')
    } catch (error: any) {
      toast.error(error || 'Giriş başarısız')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header Card */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-4 shadow-2xl transform hover:rotate-12 transition-transform duration-300">
            <SparklesIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            Hoş Geldiniz
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Hesabınıza giriş yapın ve alışverişe başlayın
          </p>
        </div>

        {/* Form Card */}
        <div className="card-modern p-8 animate-slide-up">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.email.message as string}
                </p>
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
                  {...register('şifre', { required: 'Şifre zorunludur' })}
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
              {errors.şifre && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.şifre.message as string}
                </p>
              )}
            </div>

            {/* Şifremi Unuttum */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Beni hatırla
                </label>
              </div>
              <div className="text-sm">
                <Link href="/şifre-sıfırla" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                  Şifrenizi mi unuttunuz?
                </Link>
              </div>
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
                  Giriş yapılıyor...
                </span>
              ) : (
                'Giriş Yap'
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

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Hesabınız yok mu?{' '}
              <Link href="/kayit" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Giriş yaparak{' '}
            <Link href="/#" className="text-blue-600 hover:underline dark:text-blue-400">
              Kullanım Koşulları
            </Link>
            {' '}ve{' '}
            <Link href="/#" className="text-blue-600 hover:underline dark:text-blue-400">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
