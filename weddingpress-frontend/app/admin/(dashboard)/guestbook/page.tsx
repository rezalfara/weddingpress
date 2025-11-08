"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { toast } from "sonner"; // <-- IMPORT SONNER
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
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

// Tipe khusus dari handler GetGuestBookAdmin
interface AdminGuestBookResponse {
  id: number;
  guest_id: number;
  guest_name: string;
  message: string;
  status: "pending" | "approved";
  created_at: string;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function GuestbookPage() {
  const { data: guestbooks, error, mutate } = useSWR<AdminGuestBookResponse[]>(
    "/admin/guestbook", //
    fetcher
  );

  const handleUpdateStatus = async (id: number, status: "approved" | "pending") => {
    try {
      await api.put(`/admin/guestbook/${id}`, { status }); //
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
  
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus ucapan ini?")) return;
    try {
      await api.delete(`/admin/guestbook/${id}`); //
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
  
  if (error) return <div>Failed to load</div>;
  if (!guestbooks) return <div>Loading guestbook...</div>;
  
  return (
     <div className="space-y-6">
      <h1 className="text-3xl font-bold">Moderasi Guestbook</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Tamu</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guestbooks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.guest_name}</TableCell>
                  <TableCell>{item.message}</TableCell>
                  <TableCell>{format(new Date(item.created_at), "PPP")}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {item.status === "pending" && (
                      <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item.id, "approved")}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {item.status === "approved" && (
                       <Button variant="outline" size="icon" onClick={() => handleUpdateStatus(item.id, "pending")}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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