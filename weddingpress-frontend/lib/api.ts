import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

// Ambil URL API dari environment variable
const apiURL = process.env.NEXT_PUBLIC_API_URL;

// Buat instance axios dasar
export const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Axios Request Interceptor
 * * Interceptor ini akan berjalan SEBELUM setiap request dikirim.
 * Kita akan mengambil token dari authStore dan menambahkannya
 * ke header Authorization jika token-nya ada.
 */
api.interceptors.request.use(
  (config) => {
    // Ambil token dari state zustand
    // Kita gunakan .getState() karena kita berada di luar React Component
    const token = useAuthStore.getState().token;

    if (token) {
      // Jika token ada, tambahkan ke header
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada request
    return Promise.reject(error);
  }
);

/**
 * Axios Response Interceptor (BAGIAN BARU)
 * * Interceptor ini berjalan SETELAH menerima respon dari backend.
 * * Kita gunakan untuk menangkap error 401 (Unauthorized) secara global.
 */
api.interceptors.response.use(
  (response) => {
    // Jika request sukses (status 2xx), teruskan respon apa adanya
    return response;
  },
  (error) => {
    // Cek apakah ada response dari server dan statusnya 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Token tidak valid atau kadaluarsa (misal: karena deploy ulang backend).
      // Lakukan logout paksa untuk menghapus state user & token dari localStorage.
      useAuthStore.getState().logout();
      
      // Catatan: Kita tidak perlu melakukan redirect manual (router.replace) di sini
      // karena DashboardLayout Anda sudah memiliki useEffect yang memantau perubahan token.
      // Begitu logout() dijalankan, token menjadi null, dan layout akan otomatis melempar ke login.
    }
    
    // Kembalikan error agar komponen yang memanggil request tetap tahu bahwa request gagal
    // (misal: untuk mematikan loading spinner atau menampilkan pesan error lain)
    return Promise.reject(error);
  }
);

export default api;