"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { Event } from "@/types/models";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { EventForm } from "./EventForm";
import { format } from "date-fns";
import { toast } from "sonner"; // <-- IMPORT SONNER
import { Card, CardContent } from "@/components/ui/card";

// Fungsi fetcher untuk SWR
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function EventsPage() {
  const { data: events, error, mutate } = useSWR<Event[]>(
    "/admin/events", //
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) return;
    try {
      await api.delete(`/admin/event/${id}`); //
      mutate(); // Re-fetch
      toast.success("Sukses", {
        description: "Event berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus event.",
      });
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!events) return <div>Loading events...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Events</h1>
        <EventForm onSuccess={mutate}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Event
          </Button>
        </EventForm>
      </div>

      <Card>
        <CardContent className="p-0"> {/* Hapus padding jika tabel menyentuh tepi */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Acara</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                  <TableCell>{event.start_time} - {event.end_time}</TableCell>
                  <TableCell>{event.address}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EventForm event={event} onSuccess={mutate}>
                          {/* Trik agar dialog tetap terbuka saat diklik */}
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Edit
                          </DropdownMenuItem>
                        </EventForm>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(event.id)}
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