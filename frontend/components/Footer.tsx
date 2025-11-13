'use client'

import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    hızlıLinkler: [
      { href: '/ürünler', label: 'Ürünler' },
      { href: '/giris', label: 'Giriş Yap' },
      { href: '/kayit', label: 'Kayıt Ol' },
      { href: '/sepet', label: 'Sepetim' }
    ],
    hesabım: [
      { href: '/profil', label: 'Profilim' },
      { href: '/siparişler', label: 'Siparişlerim' },
      { href: '/adresler', label: 'Adreslerim' },
      { href: '/şifre-sıfırla', label: 'Şifre Sıfırla' }
    ],
    destek: [
      { href: '/#yardim', label: 'Yardım Merkezi', id: 'yardim' },
      { href: '/#iade', label: 'İade & Değişim', id: 'iade' },
      { href: '/#kargo', label: 'Kargo Takibi', id: 'kargo' },
      { href: '/#sss', label: 'SSS', id: 'sss' }
    ]
  }

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-20">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Acunmedya
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Modern e-ticaret deneyimi için hazırlanmış, güvenli ve hızlı alışveriş platformu. 
              Binlerce ürün, hızlı teslimat ve müşteri memnuniyeti odaklı hizmet.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a
                href="#"
                className="p-3 bg-gray-800 hover:bg-blue-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="p-3 bg-gray-800 hover:bg-cyan-500 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="#"
                className="p-3 bg-gray-800 hover:bg-pink-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Hızlı Linkler
            </h4>
            <ul className="space-y-3">
              {footerLinks.hızlıLinkler.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Hesabım
            </h4>
            <ul className="space-y-3">
              {footerLinks.hesabım.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Destek & İletişim
            </h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.destek.map((link) => (
                <li key={link.id || link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                <a href="mailto:info@acunmedya.com">info@acunmedya.com</a>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <PhoneIcon className="h-5 w-5 text-blue-400" />
                <a href="tel:+902121234567">+90 (212) 123 45 67</a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPinIcon className="h-5 w-5 text-blue-400" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              &copy; {currentYear} Acunmedya. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-red-500 animate-pulse" />
              <span>in Türkiye</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
