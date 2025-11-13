import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
})

// Request interceptor - Token ekle
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔵 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    }
    return config
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [API REQUEST ERROR]', error)
    }
    return Promise.reject(error)
  }
)

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      const url = error.config?.url || 'unknown'
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
      const status = error.response?.status || 'NO_RESPONSE'
      const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      
      console.error(`❌ [API ERROR] ${method} ${fullUrl}`, {
        status,
        message: error.response?.data?.mesaj || error.message
      })
    }
    
    if (error.response?.status === 401) {
      Cookies.remove('token')
      if (typeof window !== 'undefined') {
        window.location.href = '/giris'
      }
    }
    
    return Promise.reject(error)
  }
)

// API fonksiyonları
export const authAPI = {
  kayit: (data: { email: string; şifre: string; ad: string; soyad: string }) =>
    api.post('/auth/kayit', data),
  giris: (data: { email: string; şifre: string }) =>
    api.post('/auth/giris', data),
  profil: () => api.get('/auth/profil'),
  profilGüncelle: (data: { ad: string; soyad: string; telefon?: string }) =>
    api.put('/auth/profil', data),
  şifreDeğiştir: (data: { eskiŞifre: string; yeniŞifre: string }) =>
    api.put('/auth/sifre-degistir', data),
  şifreSıfırla: (email: string) => api.post('/auth/sifre-sifirla', { email }),
  şifreYenile: (data: { email: string; kod: string; yeniŞifre: string }) =>
    api.post('/auth/sifre-yenile', data),
  emailDoğrula: () => api.post('/auth/email-dogrula'),
  emailDoğrulaKod: (kod: string) => api.post('/auth/email-dogrula-kod', { kod }),
}

export const ürünAPI = {
  listele: (params?: any) => api.get('/ürünler', { params }),
  detay: (id: string) => api.get(`/ürünler/${id}`),
  ekle: (data: any) => api.post('/ürünler', data),
  güncelle: (id: number, data: any) => api.put(`/ürünler/${id}`, data),
  sil: (id: number) => api.delete(`/ürünler/${id}`),
}

export const sepetAPI = {
  getir: () => api.get('/sepet'),
  ekle: (data: { ürün_id: number; adet?: number; varyant_id?: number }) =>
    api.post('/sepet/ekle', data),
  güncelle: (id: number, adet: number) =>
    api.put(`/sepet/güncelle/${id}`, { adet }),
  çıkar: (id: number) => api.delete(`/sepet/çıkar/${id}`),
  temizle: () => api.delete('/sepet/temizle'),
}

export const siparişAPI = {
  oluştur: (data: any) => api.post('/siparişler', data),
  listele: () => api.get('/siparişler'),
  detay: (id: string) => api.get(`/siparişler/${id}`),
  durumGüncelle: (id: number, durum: string) => api.put(`/siparişler/${id}/durum`, { durum }),
}

export const adresAPI = {
  listele: () => api.get('/adresler'),
  ekle: (data: any) => api.post('/adresler', data),
  güncelle: (id: number, data: any) => api.put(`/adresler/${id}`, data),
  sil: (id: number) => api.delete(`/adresler/${id}`),
}

export const kategoriAPI = {
  listele: () => api.get('/kategoriler'),
  detay: (id: string) => api.get(`/kategoriler/${id}`),
}

export default api
