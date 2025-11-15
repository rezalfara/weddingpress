"use client";

import { useState } from "react";
import useSWR, { KeyedMutator } from "swr";
import { api } from "@/lib/api";
import { Guest } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  PlusCircle, 
  Copy, 
  Check, 
  User as UserIcon, 
  Edit, 
  Trash2,
  Upload // <-- 1. IMPORT ICON 'Upload'
} from "lucide-react";
import { GuestForm } from "./GuestForm";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { GuestImport } from "@/components/admin/GuestImport"; // Import GuestImport (sekarang Modal)
import { Checkbox } from "@/components/ui/checkbox";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// --- Komponen CopyButton ---
function CopyButton({ slug }: { slug: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  const copyToClipboard = () => {
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    toast.success("Link undangan berhasil disalin!");
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copyToClipboard}>
      {hasCopied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      Copy Link
    </Button>
  );
}

// --- Komponen Aksi (Dropdown) ---
interface DropdownActionsProps {
  guest: Guest;
  mutate: KeyedMutator<Guest[]>;
  handleDelete: (id: number) => Promise<void>;
}

function DropdownActions({ guest, mutate, handleDelete }: DropdownActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <GuestForm guest={guest} onSuccess={mutate}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </GuestForm>
        
        <DeleteConfirmButton onConfirm={() => handleDelete(guest.id)}>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DeleteConfirmButton>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}


// --- Komponen Halaman Utama ---
export default function GuestsPage() {
  const { data: guests, error, mutate } = useSWR<Guest[]>(
    "/admin/guests",
    fetcher
  );

  // State untuk melacak tamu yang dipilih
  const [selectedGuestIds, setSelectedGuestIds] = useState<number[]>([]);

  // Fungsi hapus tunggal
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/guest/${id}`);
      mutate(); 
      toast.success("Sukses", {
        description: "Tamu berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus tamu. Cek apakah ada Guestbook terkait.",
      });
    }
  };

  // Fungsi baru untuk hapus massal
  const handleBulkDelete = async () => {
    try {
      await api.delete("/admin/guest/bulk", {
        data: { ids: selectedGuestIds },
      });
      mutate(); 
      setSelectedGuestIds([]); 
      toast.success("Sukses", {
        description: `${selectedGuestIds.length} tamu berhasil dihapus.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus tamu.",
      });
    }
  };

  // Fungsi untuk mengatur seleksi
  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedGuestIds(guests?.map((g) => g.id) || []);
    } else {
      setSelectedGuestIds([]);
    }
  };

  const handleSelectRow = (guestId: number, checked: boolean) => {
    if (checked) {
      setSelectedGuestIds((prev) => [...prev, guestId]);
    } else {
      setSelectedGuestIds((prev) => prev.filter((id) => id !== guestId));
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!guests) return <div>Loading guests...</div>;

  // Status checkbox "Select All"
  const isAllSelected = guests.length > 0 && selectedGuestIds.length === guests.length;
  const isIndeterminate = selectedGuestIds.length > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      
      {/* 2. HAPUS <GuestImport ... /> DARI SINI */}

      {/* Kartu Manajemen Tamu */}
      <Card>
        {/*
          Header Card sekarang memiliki logika kondisional:
        */}
        {selectedGuestIds.length > 0 ? (
          
          // TAMPILAN SAAT TAMU DIPILIH (PANEL AKSI)
          <CardHeader className="bg-muted p-4">
            <div className="flex flex-row justify-between items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedGuestIds.length} tamu terpilih
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedGuestIds([])}
                  className="bg-background" 
                >
                  Batalkan
                </Button>
                <DeleteConfirmButton onConfirm={handleBulkDelete}>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Terpilih
                  </Button>
                </DeleteConfirmButton>
              </div>
            </div>
          </CardHeader>

        ) : (

          // TAMPILAN DEFAULT (HEADER NORMAL)
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Manajemen Tamu</CardTitle>
                <CardDescription className="mt-2">
                  Kelola daftar tamu undangan Anda di sini.
                </CardDescription>
              </div>

              {/* === 3. PERUBAHAN DI SINI === */}
              <div className="flex flex-wrap gap-2">
                {/* Tombol Impor (Pemicu Modal) */}
                <GuestImport onImportSuccess={mutate}>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Impor Tamu
                  </Button>
                </GuestImport>

                {/* Tombol Tambah Tamu (Form) */}
                <GuestForm onSuccess={mutate}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Tamu
                  </Button>
                </GuestForm>
              </div>
              {/* ========================== */}

            </div>
          </CardHeader>

        )}


        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        isAllSelected ? true : isIndeterminate ? "indeterminate" : false
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Nama Tamu</TableHead>
                  <TableHead className="min-w-[150px]">Grup</TableHead>
                  <TableHead className="min-w-[100px]">RSVP</TableHead>
                  <TableHead className="min-w-[150px]">Link Undangan</TableHead>
                  
                  {/* Sembunyikan header "Aksi" jika ada yang dipilih */}
                  {selectedGuestIds.length === 0 && (
                    <TableHead className="w-16 text-right">Aksi</TableHead>
                  )}

                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow 
                    key={guest.id} 
                    data-state={selectedGuestIds.includes(guest.id) ? "selected" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedGuestIds.includes(guest.id)}
                        onCheckedChange={(checked) => handleSelectRow(guest.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{guest.name}</TableCell>
                    <TableCell>{guest.group}</TableCell>
                    <TableCell>
                      {guest.is_rsvp ? (
                        <Badge variant="default">
                          Hadir ({guest.total_attendance})
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Belum</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <CopyButton slug={guest.slug} />
                    </TableCell>

                    {/* Sembunyikan sel "Aksi" jika ada yang dipilih */}
                    {selectedGuestIds.length === 0 && (
                      <TableCell className="text-right">
                        <DropdownActions guest={guest} mutate={mutate} handleDelete={handleDelete} />
                      </TableCell>
                    )}

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Tampilan Mobile (Card List) */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {guests.map((guest) => (
            <Card 
              key={guest.id} 
              className={`shadow-md ${selectedGuestIds.includes(guest.id) ? 'border-primary ring-2 ring-primary' : ''}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                      checked={selectedGuestIds.includes(guest.id)}
                      onCheckedChange={(checked) => handleSelectRow(guest.id, !!checked)}
                  />
                  <CardTitle className="text-lg font-medium">{guest.name}</CardTitle>
                </div>

                {/* Sembunyikan tombol "Aksi" jika ada yang dipilih */}
                {selectedGuestIds.length === 0 && (
                  <DropdownActions guest={guest} mutate={mutate} handleDelete={handleDelete} />
                )}
                
              </CardHeader>
              <CardContent className="space-y-3">
                {guest.group && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{guest.group}</span>
                  </div>
                )}
                <div>
                  {guest.is_rsvp ? (
                    <Badge variant="default">
                      Hadir ({guest.total_attendance})
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Belum RSVP</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <CopyButton slug={guest.slug} />
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}