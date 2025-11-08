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
      config.headers["Authorization"] = `Bearer ${token}`; //
    }
    return config;
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada request
    return Promise.reject(error);
  }
);

export default api;