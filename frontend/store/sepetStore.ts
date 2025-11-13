import { create } from 'zustand'
import { sepetAPI } from '@/lib/api'
import Cookies from 'js-cookie'

interface SepetÖğesi {
  id: number
  ürün_id: number
  ürün_ad: string
  fiyat: number
  adet: number
  görseller: string[]
}

interface SepetState {
  sepet: SepetÖğesi[]
  toplam: number
  yükleniyor: boolean
  sepetYükleniyor: boolean
  sepetYükle: () => Promise<void>
  sepeteEkle: (ürün_id: number, adet?: number) => Promise<void>
  sepettenÇıkar: (id: number) => Promise<void>
  adetGüncelle: (id: number, adet: number) => Promise<void>
  sepetiTemizle: () => Promise<void>
  localStorageSepetYükle: () => void
  localStorageSepetKaydet: () => void
}

export const useSepetStore = create<SepetState>((set, get) => ({
  sepet: [],
  toplam: 0,
  yükleniyor: false,
  sepetYükleniyor: false,

  sepetYükle: async () => {
    const token = Cookies.get('token')
    if (!token) {
      get().localStorageSepetYükle()
      return
    }

    if (get().sepetYükleniyor) return

    set({ sepetYükleniyor: true, yükleniyor: true })
    try {
      const response = await sepetAPI.getir()
      set({
        sepet: response.data.veri.sepet,
        toplam: parseFloat(response.data.veri.toplam),
        yükleniyor: false,
        sepetYükleniyor: false,
      })
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [SEPET] Hata:', error.message)
      }
      get().localStorageSepetYükle()
      set({ yükleniyor: false, sepetYükleniyor: false })
    }
  },

  sepeteEkle: async (ürün_id: number, adet: number = 1) => {
    const token = Cookies.get('token')
    
    if (!token) {
      // LocalStorage'a ekle
      const mevcutSepet = JSON.parse(localStorage.getItem('sepet') || '[]')
      const mevcutÖğe = mevcutSepet.find((item: any) => item.ürün_id === ürün_id)
      
      if (mevcutÖğe) {
        mevcutÖğe.adet += adet
      } else {
        mevcutSepet.push({ ürün_id, adet })
      }
      
      localStorage.setItem('sepet', JSON.stringify(mevcutSepet))
      get().localStorageSepetYükle()
      return
    }

    set({ yükleniyor: true })
    try {
      await sepetAPI.ekle({ ürün_id, adet })
      await get().sepetYükle()
    } catch (error) {
      set({ yükleniyor: false })
      throw error
    }
  },

  sepettenÇıkar: async (id: number) => {
    const token = Cookies.get('token')
    
    if (!token) {
      const mevcutSepet = JSON.parse(localStorage.getItem('sepet') || '[]')
      const yeniSepet = mevcutSepet.filter((item: any) => item.id !== id)
      localStorage.setItem('sepet', JSON.stringify(yeniSepet))
      get().localStorageSepetYükle()
      return
    }

    set({ yükleniyor: true })
    try {
      await sepetAPI.çıkar(id)
      await get().sepetYükle()
    } catch (error) {
      set({ yükleniyor: false })
    }
  },

  adetGüncelle: async (id: number, adet: number) => {
    const token = Cookies.get('token')
    
    if (!token) {
      const mevcutSepet = JSON.parse(localStorage.getItem('sepet') || '[]')
      const öğe = mevcutSepet.find((item: any) => item.id === id)
      if (öğe) {
        öğe.adet = adet
        localStorage.setItem('sepet', JSON.stringify(mevcutSepet))
        get().localStorageSepetYükle()
      }
      return
    }

    set({ yükleniyor: true })
    try {
      await sepetAPI.güncelle(id, adet)
      await get().sepetYükle()
    } catch (error) {
      set({ yükleniyor: false })
    }
  },

  sepetiTemizle: async () => {
    const token = Cookies.get('token')
    
    if (!token) {
      localStorage.removeItem('sepet')
      set({ sepet: [], toplam: 0 })
      return
    }

    set({ yükleniyor: true })
    try {
      await sepetAPI.temizle()
      set({ sepet: [], toplam: 0, yükleniyor: false })
    } catch (error) {
      set({ yükleniyor: false })
    }
  },

  localStorageSepetYükle: () => {
    if (typeof window === 'undefined') return
    
    const sepet = JSON.parse(localStorage.getItem('sepet') || '[]')
    let toplam = 0
    
    // Ürün bilgilerini API'den çek (basitleştirilmiş)
    // Gerçek uygulamada ürün bilgilerini cache'den alabilirsiniz
    set({ sepet, toplam })
  },

  localStorageSepetKaydet: () => {
    if (typeof window === 'undefined') return
    localStorage.setItem('sepet', JSON.stringify(get().sepet))
  },
}))

