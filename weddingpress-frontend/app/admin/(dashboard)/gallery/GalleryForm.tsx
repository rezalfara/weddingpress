"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- Impor ini sekarang akan berhasil
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
import { ImageUpload } from "@/components/ImageUpload";
import { useState } from "react";

// Skema Zod berdasarkan CreateGalleryInput
const galleryFormSchema = z.object({
  file_url: z.string().url({ message: "File URL wajib diisi. Silakan upload file." }),
  
  // --- PERBAIKAN DI SINI ---
  // Hapus object { required_error: ... } karena sintaksnya salah.
  // z.enum() sudah menyiratkan validasi.
  file_type: z.enum(["image", "video"]),
  
  caption: z.string().optional(),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

interface GalleryFormProps {
  onSuccess: () => void; // Fungsi untuk re-fetch data
  children: React.ReactNode; // Tombol trigger
}

export function GalleryForm({ onSuccess, children }: GalleryFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      file_url: "",
      file_type: "image",
      caption: "",
    },
  });

  // Reset form saat membuka dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        file_url: "",
        file_type: "image",
        caption: "",
      });
    }
    setOpen(isOpen);
  };

  const onSubmit = async (data: GalleryFormValues) => {
    try {
      // Mode Create
      await api.post("/admin/gallery", data);
      toast.success("Sukses", {
        description: "Item galeri berhasil disimpan.",
      });
      onSuccess(); // Re-fetch data di halaman utama
      setOpen(false); // Tutup dialog
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menyimpan item galeri.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Item Galeri</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload File</FormLabel>
                  <FormControl>
                    {/* Komponen ImageUpload kita akan mengisi field.value (URL) */}
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe File</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe file" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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