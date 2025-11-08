"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Guest } from "@/types/models";
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
import { useState } from "react";

// Skema Zod berdasarkan GuestInput
const guestFormSchema = z.object({
  name: z.string().min(1, { message: "Nama tamu wajib diisi" }),
  group: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
  guest?: Guest | null; // Data tamu jika mode edit
  onSuccess: () => void; // Fungsi untuk re-fetch data
  children: React.ReactNode; // Tombol trigger
}

export function GuestForm({ guest, onSuccess, children }: GuestFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: guest?.name || "",
      group: guest?.group || "",
    },
  });

  // Reset form saat membuka dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        name: guest?.name || "",
        group: guest?.group || "",
      });
    }
    setOpen(isOpen);
  };

  const onSubmit = async (data: GuestFormValues) => {
    try {
      if (guest) {
        // Mode Edit
        await api.put(`/admin/guest/${guest.id}`, data);
      } else {
        // Mode Create
        await api.post("/admin/guest", data);
      }
      toast.success("Sukses", {
        description: "Data tamu berhasil disimpan.",
      });
      onSuccess(); // Re-fetch data di halaman utama
      setOpen(false); // Tutup dialog
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menyimpan data tamu.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{guest ? "Edit Tamu" : "Tambah Tamu Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Tamu</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grup (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Keluarga Mempelai Pria" {...field} />
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