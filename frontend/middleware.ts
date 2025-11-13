import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (process.env.NODE_ENV === 'development' && pathname.includes('%')) {
    console.log(`🔍 [MIDDLEWARE] Encode edilmiş URL: ${pathname}`)
  }
  
  // Admin sayfaları için koruma ve Türkçe karakter desteği
  if (pathname.startsWith('/admin')) {
    // Token kontrolü
    const token = request.cookies.get('token')
    if (!token) {
      return NextResponse.redirect(new URL('/giris', request.url))
    }
    
    // URL'i decode et (Türkçe karakterler için)
    let decodedPath = pathname
    try {
      decodedPath = decodeURIComponent(pathname)
      // Çift encode kontrolü
      if (decodedPath !== pathname) {
        try {
          decodedPath = decodeURIComponent(decodedPath)
        } catch (e) {
          // Zaten decode edilmiş
        }
      }
    } catch (e) {
      // Zaten decode edilmiş veya geçersiz encoding
      decodedPath = pathname
    }
    
    // Trailing slash'i kaldır
    const normalizePath = (path: string) => {
      return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path
    }
    
    const normalizedPath = normalizePath(pathname)
    const normalizedDecoded = normalizePath(decodedPath)
    
    // Türkçe URL'leri İngilizce dosya adlarına yönlendir
    const turkishToEnglishMap: { [key: string]: string } = {
      // Encode edilmiş versiyonlar → İngilizce dosya adları
      '/admin/kullan%C4%B1c%C4%B1lar': '/admin/kullanicilar',
      '/admin/%C3%BCr%C3%BCnler': '/admin/urunler',
      '/admin/sipari%C5%9Fler': '/admin/siparisler',
      // Decode edilmiş versiyonlar → İngilizce dosya adları
      '/admin/kullanıcılar': '/admin/kullanicilar',
      '/admin/ürünler': '/admin/urunler',
      '/admin/siparişler': '/admin/siparisler',
    }
    
    // Önce exact match kontrolü
    const mappedRoute = turkishToEnglishMap[normalizedPath] || turkishToEnglishMap[pathname] || turkishToEnglishMap[normalizedDecoded] || turkishToEnglishMap[decodedPath]
    
    if (mappedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = mappedRoute
      return NextResponse.rewrite(url)
    }
    
    if (normalizedPath !== normalizedDecoded && normalizedDecoded.startsWith('/admin/')) {
      const decodedMapped = turkishToEnglishMap[normalizedDecoded]
      if (decodedMapped) {
        const url = request.nextUrl.clone()
        url.pathname = decodedMapped
        return NextResponse.rewrite(url)
      }
    }
    
    return NextResponse.next()
  }

  if (!pathname.startsWith('/admin') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.startsWith('/icon') && !pathname.startsWith('/favicon')) {
    if (pathname.includes('%')) {
      try {
        let decodedPath = decodeURIComponent(pathname)
        
        if (decodedPath.includes('%')) {
          try {
            decodedPath = decodeURIComponent(decodedPath)
          } catch (e) {
            // Zaten decode edilmiş
          }
        }
        
        if (decodedPath.endsWith('/') && decodedPath.length > 1) {
          decodedPath = decodedPath.slice(0, -1)
        }
        
        const url = request.nextUrl.clone()
        url.pathname = decodedPath
        return NextResponse.rewrite(url)
      } catch (e) {
        // Decode hatası, Next.js'e bırak
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
