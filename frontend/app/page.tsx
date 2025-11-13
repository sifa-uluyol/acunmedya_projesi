'use client'

import Link from 'next/link'
import { SparklesIcon, ShoppingBagIcon, TruckIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/solid'

export default function Home() {
  const features = [
    {
      icon: ShoppingBagIcon,
      title: 'Geniş Ürün Yelpazesi',
      description: 'Binlerce ürün arasından seçim yapın',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TruckIcon,
      title: 'Hızlı Teslimat',
      description: 'Güvenli ve hızlı kargo seçenekleri',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Güvenli Alışveriş',
      description: '256-bit SSL şifreleme ile korumalı',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: StarIcon,
      title: 'Kalite Garantisi',
      description: 'Orijinal ve garantili ürünler',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Modern E-Ticaret Deneyimi</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="block">Acunmedya ile</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                Alışverişe Başla
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto leading-relaxed">
              Binlerce ürün, hızlı teslimat ve güvenli ödeme seçenekleriyle 
              alışverişin keyfini çıkarın
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/ürünler"
                className="group px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <ShoppingBagIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Ürünleri Keşfet
              </Link>
              <Link
                href="/giris"
                className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
              >
                Hemen Giriş Yap
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              Neden Acunmedya?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Size en iyi alışveriş deneyimini sunmak için her detayı düşündük
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-modern card-hover p-8 text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Hemen Alışverişe Başla!
          </h2>
          <p className="text-xl mb-10 text-gray-100 max-w-2xl mx-auto">
            Binlerce ürün arasından seçim yap, hızlı teslimat ve güvenli ödeme ile alışveriş yap
          </p>
          <Link
            href="/ürünler"
            className="inline-block px-10 py-5 bg-white text-purple-600 font-bold rounded-2xl shadow-2xl hover:shadow-white/50 transform hover:scale-105 transition-all duration-300"
          >
            Ürünleri Görüntüle
          </Link>
        </div>
      </section>
    </main>
  )
}
