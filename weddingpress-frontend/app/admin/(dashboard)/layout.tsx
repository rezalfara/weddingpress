"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription, // <-- 1. IMPORT TAMBAHAN
  SheetHeader,      // <-- 1. IMPORT TAMBAHAN
  SheetTitle,       // <-- 1. IMPORT TAMBAHAN
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
  Gift, // <-- TAMBAHKAN IMPOR IKON INI
} from "lucide-react";
import { useIsClient } from "@/lib/hooks/useIsClient";

// ... (Komponen NavigationLinks tetap sama) ...
const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/wedding", label: "Wedding", icon: Settings },
  { href: "/admin/events", label: "Events", icon: PartyPopper },
  { href: "/admin/stories", label: "Stories", icon: FileText },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/guests", label: "Guests", icon: Users },
  { href: "/admin/guestbook", label: "Guestbook", icon: Mail },
  { href: "/admin/gifts", label: "Gifts", icon: Gift },
];

function NavigationLinks({ inSheet = false }: { inSheet?: boolean }) {
  const pathname = usePathname();
  const Wrapper = inSheet ? SheetClose : React.Fragment;
  const wrapperProps = inSheet ? { asChild: true } : {};

  return (
    <nav>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Wrapper {...wrapperProps}>
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
            </Wrapper>
          </li>
        ))}
      </ul>
    </nav>
  );
}

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

// --- Layout Utama ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const isClient = useIsClient();

  // ... (useEffect dan Pengecekan 'if (!isClient...)' tetap sama) ...
  useEffect(() => {
    if (isClient && !token) {
      router.replace("/admin/login");
    }
  }, [isClient, token, router]);

  if (!isClient || !token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Desktop */}
      <aside className="sticky top-0 h-screen w-64 border-r bg-white p-4 hidden md:block">
        <div className="mb-6 text-2xl font-bold text-center">WeddingPress</div>
        <NavigationLinks />
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white">
          <div className="container flex h-16 items-center justify-between px-4">
            
            {/* Tombol Menu Mobile */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  {/* === PERBAIKAN DI SINI === */}
                  {/* Ganti <div> dengan <SheetHeader> dan <SheetTitle> */}
                  <SheetHeader>
                    <SheetTitle className="mb-6 text-2xl font-bold text-center">
                      WeddingPress
                    </SheetTitle>
                    {/* Deskripsi ini PENTING untuk screen reader, tapi tersembunyi */}
                    <SheetDescription className="sr-only">
                      Menu navigasi utama
                    </SheetDescription>
                  </SheetHeader>
                  <NavigationLinks inSheet={true} />
                  {/* ========================== */}
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex-1 md:hidden"></div>

            {/* Menu User */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="mr-0 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="p-4 md:p-8 flex-1">{children}</main>
      </div>
      
      <Toaster position="top-right" richColors />
    </div>
  );
}