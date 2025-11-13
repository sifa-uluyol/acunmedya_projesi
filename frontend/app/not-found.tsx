'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function NotFound() {
  const pathname = usePathname()
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 [404] Sayfa bulunamadı:', pathname)
    }
  }, [pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          Path: {pathname}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}

