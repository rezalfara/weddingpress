"use client";

import useSWR, { KeyedMutator } from "swr";
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { EventForm } from "./EventForm";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton"; // <-- 1. IMPORT KOMPONEN BARU

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Komponen Aksi (Dipakai Ulang)
interface EventActionsProps {
  event: Event;
  mutate: KeyedMutator<Event[]>;
  handleDelete: (id: number) => Promise<void>;
}

function EventActions({ event, mutate, handleDelete }: EventActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EventForm event={event} onSuccess={mutate}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </EventForm>

        {/* === 2. PERBAIKAN DI SINI === */}
        {/* Bungkus DropdownMenuItem "Hapus" dengan DeleteConfirmButton */}
        <DeleteConfirmButton onConfirm={() => handleDelete(event.id)}>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => e.preventDefault()} // Mencegah dropdown tertutup saat dialog terbuka
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
export default function EventsPage() {
  const { data: events, error, mutate } = useSWR<Event[]>(
    "/admin/events",
    fetcher
  );

  // --- 3. UBAH FUNGSI HANDLEDELETE ---
  // Hapus 'if (!confirm(...))'
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/event/${id}`);
      mutate();
      toast.success("Sukses", {
        description: "Event berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus event.",
      });
    }
  };
  // ----------------------------------

  if (error) return <div>Failed to load</div>;
  if (!events) return <div>Loading events...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Manajemen Events</CardTitle>
              <CardDescription className="mt-2">
                Buat, edit, atau hapus acara untuk undangan Anda.
              </CardDescription>
            </div>
            <EventForm onSuccess={mutate}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Event
              </Button>
            </EventForm>
          </div>
        </CardHeader>
        
        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nama Acara</TableHead>
                  <TableHead className="min-w-[150px]">Tanggal</TableHead>
                  <TableHead className="min-w-[150px]">Waktu</TableHead>
                  <TableHead className="min-w-[250px]">Alamat</TableHead>
                  <TableHead className="w-16 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{format(new Date(event.date), "PPP", { locale: id })}</TableCell>
                    <TableCell>{event.start_time} - {event.end_time}</TableCell>
                    <TableCell>{event.address}</TableCell>
                    <TableCell className="text-right">
                      {/* Komponen Aksi yang sudah diperbarui */}
                      <EventActions event={event} mutate={mutate} handleDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Tampilan Mobile (Card List) */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {events.map((event) => (
            <Card key={event.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-medium">{event.name}</CardTitle>
                {/* Komponen Aksi yang sudah diperbarui */}
                <EventActions event={event} mutate={mutate} handleDelete={handleDelete} />
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{format(new Date(event.date), "EEEE, dd MMM yyyy", { locale: id })}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{event.start_time} - {event.end_time}</span>
                </div>
                 <div className="flex items-start">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0 mt-1" />
                  <span>{event.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        
      </Card>
    </div>
  );
}