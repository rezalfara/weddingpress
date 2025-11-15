"use client";

import useSWR from "swr";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Guest } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MailWarning, UserCheck, Users } from "lucide-react";

// Tipe untuk data guestbook admin (kita perlukan untuk menghitung 'pending')
interface AdminGuestBookResponse {
  id: number;
  status: "pending" | "approved";
}

// Fetcher SWR
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Komponen Card Statistik
function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  
  // Ambil data tamu untuk statistik
  const { data: guests, error: guestsError } = useSWR<Guest[]>(
    "/admin/guests", //
    fetcher
  );
  
  // Ambil data guestbook untuk statistik
  const { data: guestbooks, error: guestbooksError } = useSWR<AdminGuestBookResponse[]>(
    "/admin/guestbook", //
    fetcher
  );

  // Kalkulasi Statistik
  const totalGuests = guests?.length ?? 0;
  const totalRSVP = guests?.filter(g => g.is_rsvp).length ?? 0;
  const totalAttendance = guests?.reduce((acc, g) => acc + g.total_attendance, 0) ?? 0;
  const pendingGuestbook = guestbooks?.filter(gb => gb.status === 'pending').length ?? 0; //

  const isLoading = !guests && !guestsError && !guestbooks && !guestbooksError;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-lg text-gray-700">
        Selamat datang kembali, <span className="font-semibold">{user?.name}</span>!
      </p>

      {/* Grid Statistik yang Modern */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <p>Memuat statistik...</p>
        ) : (
          <>
            <StatCard 
              title="Total Tamu Undangan" 
              value={totalGuests} 
              icon={Users} 
            />
            <StatCard 
              title="Tamu Konfirmasi (RSVP)" 
              value={totalRSVP} 
              icon={UserCheck} 
            />
            <StatCard 
              title="Total Kehadiran" 
              value={totalAttendance} 
              icon={Heart} 
            />
            <StatCard 
              title="Ucapan Menunggu Persetujuan" 
              value={pendingGuestbook} 
              icon={MailWarning} 
            />
          </>
        )}
      </div>

      {/* Anda bisa tambahkan bagian lain di sini, misal "Aktivitas Terkini" */}
    </div>
  );
}