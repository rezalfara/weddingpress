"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Event } from "@/types/models";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

// Skema Zod berdasarkan EventInput di backend
const eventFormSchema = z.object({
  name: z.string().min(1, { message: "Nama acara wajib diisi" }), // Sintaks modern
  
  // --- PERBAIKAN DI SINI ---
  // Hapus object { required_error: ... } karena menyebabkan error.
  // z.date() secara default sudah "required".
  date: z.date(), 
  
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: "Format harus HH:MM" // Sintaks modern
  }),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format harus HH:MM" // Sintaks modern
  }),
  address: z.string(),
  maps_url: z.string().url({ message: "URL tidak valid" }).or(z.literal("")), // URL dengan pesan
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event | null; // Data event jika mode edit
  onSuccess: () => void; // Fungsi untuk re-fetch data
  children: React.ReactNode; // Tombol trigger
}

export function EventForm({ event, onSuccess, children }: EventFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name || "",
      date: event ? new Date(event.date) : new Date(),
      start_time: event?.start_time || "08:00",
      end_time: event?.end_time || "10:00",
      address: event?.address || "",
      maps_url: event?.maps_url || "",
    },
  });

  // Reset form saat membuka dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        name: event?.name || "",
        date: event ? new Date(event.date) : new Date(),
        start_time: event?.start_time || "08:00",
        end_time: event?.end_time || "10:00",
        address: event?.address || "",
        maps_url: event?.maps_url || "",
      });
    }
    setOpen(isOpen);
  };

  const onSubmit = async (data: EventFormValues) => {
    try {
      if (event) {
        // Mode Edit
        await api.put(`/admin/event/${event.id}`, data);
      } else {
        // Mode Create
        await api.post("/admin/event", data);
      }
      toast.success("Sukses", {
        description: "Data event berhasil disimpan.",
      });
      onSuccess(); // Re-fetch data di halaman utama
      setOpen(false); // Tutup dialog
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menyimpan data event.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Tambah Event Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Acara</FormLabel>
                  <FormControl>
                    <Input placeholder="Akad Nikah" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Mulai (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Selesai (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maps_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Google Maps</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Batal</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}