import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Tipe untuk data user yang kita simpan
interface UserState {
  id: number;
  name: string;
  email: string;
}

// Tipe untuk state dan action di store kita
interface AuthState {
  user: UserState | null;
  token: string | null;
  login: (token: string, user: UserState) => void;
  logout: () => void;
}

/**
 * Hook custom untuk state management autentikasi.
 * Menggunakan persist middleware untuk menyimpan token dan user
 * di localStorage, sehingga sesi tetap berjalan.
 */
export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      token: null,
      
      /**
       * Aksi untuk login.
       * Menyimpan token dan data user ke state.
       */
      login: (token, user) => {
        set({ token, user });
      },
      
      /**
       * Aksi untuk logout.
       * Menghapus token dan data user dari state.
       */
      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // Nama key di localStorage
      storage: createJSONStorage(() => localStorage), // Gunakan localStorage
    }
  )
);