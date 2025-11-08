"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Story } from "@/types/models";
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

// Skema Zod berdasarkan StoryInput
const storyFormSchema = z.object({
  title: z.string().min(1, { message: "Judul wajib diisi" }),
  date: z.date(),
  description: z.string(),
  // --- PERUBAHAN 1: Mengganti z.coerce.number() menjadi z.number() ---
  order: z.number().int().min(0, { message: "Urutan harus positif" }),
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

interface StoryFormProps {
  story?: Story | null; // Data story jika mode edit
  onSuccess: () => void; // Fungsi untuk re-fetch data
  children: React.ReactNode; // Tombol trigger
}

export function StoryForm({ story, onSuccess, children }: StoryFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: story?.title || "",
      date: story ? new Date(story.date) : new Date(),
      description: story?.description || "",
      order: story?.order || 0,
    },
  });

  // Reset form saat membuka dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      form.reset({
        title: story?.title || "",
        date: story ? new Date(story.date) : new Date(),
        description: story?.description || "",
        order: story?.order || 0,
      });
    }
    setOpen(isOpen);
  };

  const onSubmit = async (data: StoryFormValues) => {
    try {
      if (story) {
        // Mode Edit
        await api.put(`/admin/story/${story.id}`, data);
      } else {
        // Mode Create
        await api.post("/admin/story", data);
      }
      toast.success("Sukses", {
        description: "Data cerita berhasil disimpan.",
      });
      onSuccess(); // Re-fetch data di halaman utama
      setOpen(false); // Tutup dialog
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menyimpan data cerita.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{story ? "Edit Cerita" : "Tambah Cerita Baru"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    {/* --- PERUBAHAN 2: Menangani value dan onChange secara manual --- */}
                    <Input
                      type="number"
                      ref={field.ref}
                      name={field.name}
                      onBlur={field.onBlur}
                      // Tampilkan string kosong jika nilainya NaN
                      value={isNaN(field.value) ? '' : field.value}
                      onChange={(e) => {
                        // Kirim e.target.valueAsNumber (yang berupa number atau NaN)
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Cerita</FormLabel>
                  <FormControl>
                    <Input placeholder="Pertama Bertemu" {...field} />
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
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
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