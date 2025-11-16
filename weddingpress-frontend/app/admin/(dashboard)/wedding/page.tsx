"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR from "swr";
import { api } from "@/lib/api";
import { Wedding } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription, // Digunakan untuk teks deskriptif
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Skema Zod (Tidak Berubah)
const formSchema = z.object({
  wedding_title: z.string().min(1, "Judul tidak boleh kosong"),
  cover_image_url: z.string().url("URL tidak valid").or(z.literal("")),
  music_url: z.string().url("URL tidak valid").or(z.literal("")),
  theme_color: z.string().startsWith("#", "Wajib kode hex").or(z.literal("")),
  
  show_events: z.boolean(),
  show_story: z.boolean(),
  show_gallery: z.boolean(),
  show_gifts: z.boolean(),
  show_guest_book: z.boolean(),

  groom_bride: z.object({
    groom_name: z.string(),
    groom_photo_url: z.string().url().or(z.literal("")),
    groom_bio: z.string(),
    bride_name: z.string(),
    bride_photo_url: z.string().url().or(z.literal("")),
    bride_bio: z.string(),
  }),
});

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function WeddingPage() {
  const { data: weddingData, error, mutate } = useSWR<Wedding>("/admin/wedding", fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wedding_title: "",
      cover_image_url: "",
      music_url: "",
      theme_color: "#000000",
      show_events: true,
      show_story: true,
      show_gallery: true,
      show_gifts: true,
      show_guest_book: true,
      groom_bride: {
        groom_name: "",
        groom_photo_url: "",
        groom_bio: "",
        bride_name: "",
        bride_photo_url: "",
        bride_bio: "",
      },
    },
  });

  useEffect(() => {
    if (weddingData) {
      form.reset({
        wedding_title: weddingData.wedding_title || "",
        cover_image_url: weddingData.cover_image_url || "",
        music_url: weddingData.music_url || "",
        theme_color: weddingData.theme_color || "#000000",
        
        show_events: weddingData.show_events ?? true,
        show_story: weddingData.show_story ?? true,
        show_gallery: weddingData.show_gallery ?? true,
        show_gifts: weddingData.show_gifts ?? true,
        show_guest_book: weddingData.show_guest_book ?? true,
        
        groom_bride: {
          groom_name: weddingData.groom_bride?.groom_name || "",
          groom_photo_url: weddingData.groom_bride?.groom_photo_url || "",
          groom_bio: weddingData.groom_bride?.groom_bio || "",
          bride_name: weddingData.groom_bride?.bride_name || "",
          bride_photo_url: weddingData.groom_bride?.bride_photo_url || "",
          bride_bio: weddingData.groom_bride?.bride_bio || "",
        },
      });
    }
  }, [weddingData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values,
        groom_bride: {
          id: weddingData?.groom_bride?.id, 
          wedding_id: weddingData?.groom_bride?.wedding_id,
          ...values.groom_bride, 
        }
      };

      await api.put("/admin/wedding", payload);
      mutate();
      toast.success("Sukses", {
        description: "Data pernikahan berhasil diperbarui.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "Gagal memperbarui data. Cek format URL Anda.",
      });
    }
  };

  if (error) return <div>Failed to load data.</div>;
  if (!weddingData) return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pengaturan Wedding</h1>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimapan...</> : "Simpan Perubahan"}
          </Button>
        </div>

        <Tabs defaultValue="umum" className="w-full">
          {/* --- MODIFIKASI: TAB SPACING --- */}
          <TabsList className="flex flex-wrap justify-start p-1 gap-2 max-w-full">
            <TabsTrigger value="umum">Pengaturan Umum</TabsTrigger>
            <TabsTrigger value="mempelai">Data Mempelai</TabsTrigger>
            <TabsTrigger value="kustomisasi">Kustomisasi</TabsTrigger>
          </TabsList>
          {/* --- AKHIR MODIFIKASI: TAB SPACING --- */}

          {/* === KONTEN TAB 1: PENGATURAN UMUM (INTERAKTIF) === */}
          <TabsContent value="umum">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Umum</CardTitle>
                <CardDescription>Judul, tema warna, dan media utama undangan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Judul Pernikahan */}
                <FormField
                  control={form.control}
                  name="wedding_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Undangan</FormLabel>
                      <FormControl><Input placeholder="Pernikahan Budi & Ani" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* WARNA TEMA (Interaktif Swatch) */}
                <FormField
                  control={form.control}
                  name="theme_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna Tema (Hex)</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <Input type="color" {...field} className="h-10 w-16 p-0" />
                        </FormControl>
                        <FormControl>
                          <Input {...field} placeholder="#RRGGBB" className="w-40" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL Musik */}
                <FormField
                  control={form.control}
                  name="music_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Musik (MP3/YouTube)</FormLabel>
                      <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                      <FormDescription>Gunakan URL hosting file MP3 atau URL embed YouTube.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* COVER IMAGE (Interactive Upload/Preview) */}
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image Preview & Upload</FormLabel>
                      <FormControl>
                        {/* Hapus properti placeholder yang menyebabkan error */}
                        <ImageUpload 
                            value={field.value} 
                            onChange={field.onChange} 
                        /> 
                      </FormControl>
                      {/* Gabungkan deskripsi untuk pengalaman yang lebih baik */}
                      <FormDescription>Klik atau seret gambar cover ke area di atas. Pastikan gambar beresolusi tinggi dan memiliki rasio yang baik.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* === KONTEN TAB 2: DATA MEMPELAI (Tidak Berubah) === */}
          <TabsContent value="mempelai">
            <Card>
              <CardHeader>
                <CardTitle>Data Mempelai</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                {/* Mempelai Pria */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mempelai Pria</h3>
                  <FormField
                    control={form.control}
                    name="groom_bride.groom_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Mempelai Pria</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.groom_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio Pria</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.groom_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto Mempelai Pria</FormLabel>
                        <FormControl>
                          <ImageUpload value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Mempelai Wanita */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mempelai Wanita</h3>
                  <FormField
                    control={form.control}
                    name="groom_bride.bride_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Mempelai Wanita</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.bride_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio Wanita</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.bride_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto Mempelai Wanita</FormLabel>
                        <FormControl>
                          <ImageUpload value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === KONTEN TAB 3: KUSTOMISASI TAMPILAN (Tidak Berubah) === */}
          <TabsContent value="kustomisasi">
            <Card>
              <CardHeader><CardTitle>Kustomisasi Tampilan Bagian</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                
                {/* Toggle Show Events */}
                <FormField
                  control={form.control}
                  name="show_events"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Tampilkan Acara (Events)</FormLabel>
                        <FormDescription>Perlihatkan bagian detail akad dan resepsi.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {/* Toggle Show Story */}
                <FormField
                  control={form.control}
                  name="show_story"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Tampilkan Cerita (Story)</FormLabel>
                        <FormDescription>Perlihatkan bagian timeline cerita cinta.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {/* Toggle Show Gallery */}
                <FormField
                  control={form.control}
                  name="show_gallery"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Tampilkan Galeri (Gallery)</FormLabel>
                        <FormDescription>Perlihatkan bagian galeri foto dan video.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {/* Toggle Show Gifts */}
                <FormField
                  control={form.control}
                  name="show_gifts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Tampilkan Hadiah (Gifts)</FormLabel>
                        <FormDescription>Perlihatkan bagian amplop digital.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {/* Toggle Show Guestbook */}
                <FormField
                  control={form.control}
                  name="show_guest_book"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel>Tampilkan Buku Tamu</FormLabel>
                        <FormDescription>Izinkan tamu untuk mengirim ucapan.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}