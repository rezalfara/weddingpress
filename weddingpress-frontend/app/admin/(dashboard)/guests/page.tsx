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
import { MoreHorizontal, PlusCircle, Copy, Check, User as UserIcon, Edit, Trash2 } from "lucide-react";
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
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton"; // <-- 1. IMPORT

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// ... (Komponen CopyButton tetap sama) ...
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

// Komponen Aksi
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
        
        {/* === 2. PERBAIKAN DI SINI === */}
        <DeleteConfirmButton onConfirm={() => handleDelete(guest.id)}>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DeleteConfirmButton>
        {/* ========================= */}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}


// Komponen Halaman Utama
export default function GuestsPage() {
  const { data: guests, error, mutate } = useSWR<Guest[]>(
    "/admin/guests",
    fetcher
  );

  // --- 3. UBAH FUNGSI HANDLEDELETE ---
  const handleDelete = async (id: number) => {
    // Hapus 'if (!confirm(...))'
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
  // ----------------------------------

  if (error) return <div>Failed to load</div>;
  if (!guests) return <div>Loading guests...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Manajemen Tamu</CardTitle>
              <CardDescription className="mt-2">
                Kelola daftar tamu undangan Anda di sini.
              </CardDescription>
            </div>
            <GuestForm onSuccess={mutate}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Tamu
              </Button>
            </GuestForm>
          </div>
        </CardHeader>

        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nama Tamu</TableHead>
                  <TableHead className="min-w-[150px]">Grup</TableHead>
                  <TableHead className="min-w-[100px]">RSVP</TableHead>
                  <TableHead className="min-w-[150px]">Link Undangan</TableHead>
                  <TableHead className="w-16 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.map((guest) => (
                  <TableRow key={guest.id}>
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
                    <TableCell className="text-right">
                      <DropdownActions guest={guest} mutate={mutate} handleDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Tampilan Mobile (Card List) */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {guests.map((guest) => (
            <Card key={guest.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{guest.name}</CardTitle>
                <DropdownActions guest={guest} mutate={mutate} handleDelete={handleDelete} />
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