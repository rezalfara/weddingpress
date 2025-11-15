"use client";

import useSWR, { KeyedMutator } from "swr";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, X } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton"; // <-- 1. IMPORT

// ... (Tipe AdminGuestBookResponse tetap sama) ...
interface AdminGuestBookResponse {
  id: number;
  guest_id: number;
  guest_name: string;
  message: string;
  status: "pending" | "approved";
  created_at: string;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Komponen Aksi
interface GuestbookActionsProps {
  item: AdminGuestBookResponse;
  handleUpdateStatus: (id: number, status: "approved" | "pending") => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
}

function GuestbookActions({ item, handleUpdateStatus, handleDelete }: GuestbookActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      {item.status === "pending" && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => handleUpdateStatus(item.id, "approved")}
          aria-label="Setujui"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
      {item.status === "approved" && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleUpdateStatus(item.id, "pending")}
            aria-label="Batalkan Persetujuan"
          >
            <X className="h-4 w-4" />
          </Button>
      )}
      
      {/* === 2. PERBAIKAN DI SINI === */}
      <DeleteConfirmButton onConfirm={() => handleDelete(item.id)}>
        <Button 
          variant="destructive" 
          size="icon" 
          aria-label="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DeleteConfirmButton>
      {/* ========================= */}

    </div>
  );
}


// Komponen Halaman Utama
export default function GuestbookPage() {
  const { data: guestbooks, error, mutate } = useSWR<AdminGuestBookResponse[]>(
    "/admin/guestbook",
    fetcher
  );

  // ... (handleUpdateStatus tetap sama) ...
  const handleUpdateStatus = async (id: number, status: "approved" | "pending") => {
    try {
      await api.put(`/admin/guestbook/${id}`, { status });
      mutate();
      toast.success("Sukses", {
        description: `Status ucapan diubah ke ${status}.`,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal update status.",
      });
    }
  };
  
  // --- 3. UBAH FUNGSI HANDLEDELETE ---
  const handleDelete = async (id: number) => {
    // Hapus 'if (!confirm(...))'
    try {
      await api.delete(`/admin/guestbook/${id}`);
      mutate();
      toast.success("Sukses", {
        description: "Ucapan berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus ucapan.",
      });
    }
  };
  // ----------------------------------
  
  if (error) return <div>Failed to load</div>;
  if (!guestbooks) return <div>Loading guestbook...</div>;
  
  return (
     <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Moderasi Guestbook</CardTitle>
          <CardDescription>
            Setujui atau hapus ucapan yang dikirim oleh tamu Anda.
          </CardDescription>
        </CardHeader>

        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nama Tamu</TableHead>
                  <TableHead className="min-w-[250px]">Pesan</TableHead>
                  <TableHead className="min-w-[150px]">Tanggal</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="w-32 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guestbooks.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.guest_name}</TableCell>
                    <TableCell>{item.message}</TableCell>
                    <TableCell>{format(new Date(item.created_at), "PPP", { locale: id })}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <GuestbookActions 
                        item={item} 
                        handleUpdateStatus={handleUpdateStatus} 
                        handleDelete={handleDelete} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        
        {/* Tampilan Mobile (Card List) */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {guestbooks.map((item) => (
            <Card key={item.id} className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">{item.guest_name}</CardTitle>
                <CardDescription>
                  {format(new Date(item.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{item.message}</p>
                <div>
                  <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <GuestbookActions 
                  item={item} 
                  handleUpdateStatus={handleUpdateStatus} 
                  handleDelete={handleDelete} 
                />
              </CardFooter>
            </Card>
          ))}
        </CardContent>

      </Card>
    </div>
  );
}