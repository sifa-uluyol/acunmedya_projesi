'use client'

import { useEffect } from 'react'
import { useSepetStore } from '@/store/sepetStore'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { 
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function SepetPage() {
  const { sepet, toplam, sepetYükle, adetGüncelle, sepettenÇıkar, sepetiTemizle } = useSepetStore()
  const { kullanıcı } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (kullanıcı?.rol === 'admin') {
      toast.error('Admin kullanıcıları sepet kullanamaz. Lütfen normal kullanıcı hesabı ile giriş yapın.')
      router.push('/admin')
      return
    }
    if (kullanıcı && kullanıcı.rol !== 'admin') {
      sepetYükle()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kullanıcı, router])

  const ödemeyeGit = () => {
    if (!kullanıcı) {
      toast.error('Ödeme için giriş yapmalısınız')
      router.push('/giris')
      return
    }
    router.push('/ödeme')
  }

  if (sepet.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-full mb-6">
              <ShoppingCartIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4 text-gradient">Sepetiniz Boş</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Sepetinize harika ürünler ekleyerek alışverişe başlayın!
            </p>
            <Link href="/ürünler" className="btn-primary inline-flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const kargo = 0
  const finalToplam = toplam + kargo

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCartIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gradient">
              Sepetim
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {sepet.length} ürün sepetinizde
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sepet İçeriği */}
          <div className="lg:col-span-2 space-y-4">
            {sepet.map((öğe, index) => (
              <div
                key={öğe.id}
                className="card-modern p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-6">
                  {/* Ürün Görseli */}
                  {öğe.görseller && öğe.görseller[0] ? (
                    <Link href={`/ürünler/${öğe.ürün_id}`} className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                      <Image
                        src={öğe.görseller[0]}
                        alt={öğe.ürün_ad}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-32 h-32 flex-shrink-0 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <ShoppingCartIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Ürün Bilgileri */}
                  <div className="flex-1">
                    <Link href={`/ürünler/${öğe.ürün_id}`}>
                      <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {öğe.ürün_ad}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {öğe.fiyat.toFixed(2)} ₺
                    </p>
                    
                    {/* Adet Kontrolü */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                        <button
                          onClick={() => adetGüncelle(öğe.id, Math.max(1, öğe.adet - 1))}
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                          {öğe.adet}
                        </span>
                        <button
                          onClick={() => adetGüncelle(öğe.id, öğe.adet + 1)}
                          className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {(öğe.fiyat * öğe.adet).toFixed(2)} ₺
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kaldır Butonu */}
                  <button
                    onClick={() => {
                      sepettenÇıkar(öğe.id)
                      toast.success('Ürün sepetten kaldırıldı')
                    }}
                    className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors self-start"
                    aria-label="Sepetten kaldır"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Sepeti Temizle */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (confirm('Sepeti temizlemek istediğinize emin misiniz?')) {
                    sepetiTemizle()
                    toast.success('Sepet temizlendi')
                  }
                }}
                className="px-6 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <TrashIcon className="h-5 w-5" />
                Sepeti Temizle
              </button>
            </div>
          </div>

          {/* Özet Card */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sipariş Özeti
                </h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Ara Toplam</span>
                  <span className="font-semibold">{toplam.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Kargo</span>
                  <span className="font-semibold text-green-600">
                    {kargo === 0 ? 'Ücretsiz' : `${kargo.toFixed(2)} ₺`}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Toplam</span>
                    <span className="text-2xl font-extrabold text-gradient">
                      {finalToplam.toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={ödemeyeGit}
                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                Ödemeye Geç
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              
              <Link
                href="/ürünler"
                className="block text-center mt-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Alışverişe devam et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
