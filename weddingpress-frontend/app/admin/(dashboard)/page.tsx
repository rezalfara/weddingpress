"use client";

import { useAuthStore } from "@/stores/authStore";

export default function AdminDashboardPage() {
  // Kita bisa dengan aman mengambil data user,
  // karena layout sudah memastikan user terautentikasi
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-lg text-gray-700">
        Selamat datang, <span className="font-semibold">{user?.name}</span>!
      </p>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Mulai Mengatur Undangan Anda</h2>
        <p className="mt-2 text-gray-600">
          Gunakan menu navigasi di samping (yang akan kita buat nanti) untuk
          mengelola data pernikahan, tamu, galeri, dan lainnya.
        </p>
      </div>
    </div>
  );
}