"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useIsClient } from "@/lib/hooks/useIsClient"; // <-- 1. IMPORT HOOK BARU
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import {
  FileText,
  Home,
  Image,
  LogOut,
  Mail,
  Menu,
  PartyPopper,
  Settings,
  User,
  Users,
} from "lucide-react";

// ... (Komponen LogoutButton tetap sama) ...
function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}

// ... (navItems tetap sama) ...
const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/wedding", label: "Wedding", icon: Settings },
  { href: "/admin/events", label: "Events", icon: PartyPopper },
  { href: "/admin/stories", label: "Stories", icon: FileText },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/guests", label: "Guests", icon: Users },
  { href: "/admin/guestbook", label: "Guestbook", icon: Mail },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const isClient = useIsClient(); // <-- 2. GUNAKAN HOOK-NYA
  const pathname = usePathname();

  useEffect(() => {
    // --- 3. PERBAIKAN LOGIKA ---
    // Hanya jalankan pengecekan redirect JIKA kita sudah di client
    // DAN store sudah ter-hidrasi (isClient true)
    if (isClient && !token) {
      router.replace("/admin/login");
    }
  }, [isClient, token, router]); // Tambahkan isClient ke dependensi

  // --- 4. PERBAIKAN LOGIKA LOADING ---
  // Tampilkan loading jika:
  // 1. Kita belum di client (isClient false)
  // 2. ATAU kita sudah di client TAPI token-nya masih null (proses hidrasi/redirect)
  if (!isClient || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Jika kode sampai di sini, artinya:
  // - isClient = true
  // - token = ada
  // - user = ada
  // Aman untuk me-render layout.
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 border-r bg-white p-4 hidden md:block">
        <div className="mb-6 text-2xl font-bold text-center">WeddingPress</div>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button
                  asChild
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="container flex h-16 items-center justify-between px-4 md:justify-end">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="mr-2 h-4 w-4" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="p-8">{children}</main>
      </div>
      
      {/* Toaster */}
      <Toaster position="top-right" richColors />
    </div>
  );
}