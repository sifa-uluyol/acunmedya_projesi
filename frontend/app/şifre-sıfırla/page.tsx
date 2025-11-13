'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Link from 'next/link'
import api from '@/lib/api'

export default function ŞifreSıfırlaPage() {
  const [adım, setAdım] = useState<'email' | 'kod' | 'yeni-şifre'>('email')
  const [email, setEmail] = useState('')
  const { register, handleSubmit } = useForm()

  const emailGönder = async (data: any) => {
    try {
      await api.post('/auth/sifre-sifirla', { email: data.email })
      toast.success('Şifre sıfırlama kodu e-posta adresinize gönderildi')
      setEmail(data.email)
      setAdım('kod')
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'E-posta gönderilirken hata oluştu')
    }
  }

  const koduDoğrula = async (data: any) => {
    try {
      // Kod doğrulama için email ve kod kontrolü yapılacak
      toast.success('Kod doğrulandı')
      setAdım('yeni-şifre')
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Kod doğrulanamadı')
    }
  }

  const şifreYenile = async (data: any) => {
    try {
      await api.post('/auth/sifre-yenile', {
        email: email,
        kod: (document.querySelector('input[name="kod"]') as HTMLInputElement)?.value,
        yeniŞifre: data.yeniŞifre
      })
      toast.success('Şifreniz başarıyla değiştirildi')
      window.location.href = '/giris'
    } catch (error: any) {
      toast.error(error.response?.data?.mesaj || 'Şifre değiştirilirken hata oluştu')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Şifremi Unuttum
          </h2>
        </div>

        {adım === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(emailGönder)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta Adresi
              </label>
              <input
                {...register('email', {
                  required: 'E-posta zorunludur',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçersiz e-posta adresi'
                  }
                })}
                type="email"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="E-posta adresinizi girin"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Şifre Sıfırlama Kodu Gönder
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/giris" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş sayfasına dön
              </Link>
            </div>
          </form>
        )}

        {adım === 'kod' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(koduDoğrula)}>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {email} adresine gönderilen kodu girin
              </p>
              <label htmlFor="kod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Doğrulama Kodu
              </label>
              <input
                {...register('kod', { required: 'Kod zorunludur' })}
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="6 haneli kodu girin"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kodu Doğrula
              </button>
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAdım('email')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Farklı e-posta kullan
              </button>
            </div>
          </form>
        )}

        {adım === 'yeni-şifre' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(şifreYenile)}>
            <div>
              <label htmlFor="yeniŞifre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yeni Şifre
              </label>
              <input
                {...register('yeniŞifre', {
                  required: 'Şifre zorunludur',
                  minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                })}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Yeni şifrenizi girin"
              />
            </div>

            <div>
              <label htmlFor="şifreTekrar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Şifre Tekrar
              </label>
              <input
                {...register('şifreTekrar', {
                  required: 'Şifre tekrarı zorunludur',
                  validate: (value, formValues) => value === formValues.yeniŞifre || 'Şifreler eşleşmiyor'
                })}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Şifreyi Değiştir
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

