"use client";

import { useState } from "react";
import useSWR from "swr";
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
import { MoreHorizontal, PlusCircle, Copy, Check } from "lucide-react";
import { GuestForm } from "./GuestForm";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Fungsi fetcher untuk SWR
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Komponen helper untuk tombol Copy
function CopyButton({ slug }: { slug: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = () => {
    // Dapatkan URL dasar (origin)
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


export default function GuestsPage() {
  const { data: guests, error, mutate } = useSWR<Guest[]>(
    "/admin/guests", //
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tamu ini?")) return;
    try {
      await api.delete(`/admin/guest/${id}`); //
      mutate(); // Re-fetch
      toast.success("Sukses", {
        description: "Tamu berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus tamu. Cek apakah ada Guestbook terkait.",
      });
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!guests) return <div>Loading guests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Tamu</h1>
        <GuestForm onSuccess={mutate}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Tamu
          </Button>
        </GuestForm>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Tamu</TableHead>
                <TableHead>Grup</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Link Undangan</TableHead>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <GuestForm guest={guest} onSuccess={mutate}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Edit
                          </DropdownMenuItem>
                        </GuestForm>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(guest.id)}
                        >
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}