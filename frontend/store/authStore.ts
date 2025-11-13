import { create } from 'zustand'
import Cookies from 'js-cookie'
import { authAPI } from '@/lib/api'

interface Kullanıcı {
  id: number
  email: string
  ad: string
  soyad: string
  rol: string
}

interface AuthState {
  kullanıcı: Kullanıcı | null
  yükleniyor: boolean
  profilYükleniyor: boolean
  girişYap: (email: string, şifre: string) => Promise<void>
  kayıtOl: (data: { email: string; şifre: string; ad: string; soyad: string }) => Promise<void>
  çıkışYap: () => void
  profilYükle: () => Promise<void>
  profilGüncelle: (data: { ad: string; soyad: string; telefon?: string }) => Promise<void>
  şifreDeğiştir: (eskiŞifre: string, yeniŞifre: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  kullanıcı: null,
  yükleniyor: false,
  profilYükleniyor: false,

  girişYap: async (email: string, şifre: string) => {
    set({ yükleniyor: true })
    try {
      const response = await authAPI.giris({ email, şifre })
      const { token, kullanıcı } = response.data.veri
      Cookies.set('token', token, { expires: 7 })
      set({ kullanıcı, yükleniyor: false })
    } catch (error: any) {
      set({ yükleniyor: false })
      throw error.response?.data?.mesaj || 'Giriş başarısız'
    }
  },

  kayıtOl: async (data) => {
    set({ yükleniyor: true })
    try {
      const response = await authAPI.kayit(data)
      const { token, kullanıcı } = response.data.veri
      Cookies.set('token', token, { expires: 7 })
      set({ kullanıcı, yükleniyor: false })
    } catch (error: any) {
      set({ yükleniyor: false })
      throw error.response?.data?.mesaj || 'Kayıt başarısız'
    }
  },

  çıkışYap: () => {
    Cookies.remove('token')
    set({ kullanıcı: null })
  },

  profilYükle: async () => {
    const token = Cookies.get('token')
    if (!token) return
    
    if (get().profilYükleniyor || get().kullanıcı) return

    set({ profilYükleniyor: true })
    try {
      const response = await authAPI.profil()
      set({ kullanıcı: response.data.veri, profilYükleniyor: false })
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [PROFIL] Hata:', error.message)
      }
      Cookies.remove('token')
      set({ kullanıcı: null, profilYükleniyor: false })
    }
  },

  profilGüncelle: async (data) => {
    try {
      await authAPI.profilGüncelle(data)
      // Zorla yeniden yükle
      set({ profilYükleniyor: false, kullanıcı: null })
      await get().profilYükle()
    } catch (error: any) {
      throw error.response?.data?.mesaj || 'Profil güncellenirken hata oluştu'
    }
  },

  şifreDeğiştir: async (eskiŞifre: string, yeniŞifre: string) => {
    try {
      await authAPI.şifreDeğiştir({ eskiŞifre, yeniŞifre })
    } catch (error: any) {
      throw error.response?.data?.mesaj || 'Şifre değiştirilirken hata oluştu'
    }
  },
}))

