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
  FormDescription,
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
// --- IMPORT BARU ---
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Menambahkan Sparkles, Flower2, LayoutTemplate ke import
import { Loader2, LayoutTemplate, Sparkles, Flower2 } from "lucide-react";

// --- UPDATE SKEMA ZOD ---
const formSchema = z.object({
  wedding_title: z.string().min(1, "Judul tidak boleh kosong"),
  cover_image_url: z.string().url("URL tidak valid").or(z.literal("")),
  music_url: z.string().url("URL tidak valid").or(z.literal("")),
  theme_color: z.string().startsWith("#", "Wajib kode hex").or(z.literal("")),
  
  // Field template (Wajib string)
  template: z.string(), 

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
      template: "modern", // Default value
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
        template: weddingData.template || "modern", // Ambil dari DB
        
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
        description: "Pengaturan & Template berhasil diperbarui.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "Gagal memperbarui data.",
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
            {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
          </Button>
        </div>

        <Tabs defaultValue="tampilan" className="w-full">
          <TabsList className="flex flex-wrap justify-start p-1 gap-2 max-w-full h-auto">
            <TabsTrigger value="tampilan">Tampilan & Template</TabsTrigger>
            <TabsTrigger value="mempelai">Data Mempelai</TabsTrigger>
            <TabsTrigger value="fitur">Fitur & Kustomisasi</TabsTrigger>
          </TabsList>

          {/* === TAB 1: TAMPILAN (Template + Umum) === */}
          <TabsContent value="tampilan" className="space-y-4">
             
             {/* BAGIAN PEMILIHAN TEMPLATE */}
             <Card className="border-primary/20 shadow-sm bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5" /> Pilih Template Undangan
                    </CardTitle>
                    <CardDescription>Pilih desain dasar untuk tampilan undangan publik Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="template"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {/* 1. Template Modern */}
                                        <FormItem>
                                            <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5 cursor-pointer">
                                                <FormControl>
                                                    <RadioGroupItem value="modern" className="sr-only" />
                                                </FormControl>
                                                <div className="rounded-md border-2 border-muted p-4 hover:border-primary/50 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="font-semibold text-lg">Modern Fullscreen</div>
                                                        {field.value === 'modern' && <span className="text-primary text-xs font-bold border border-primary px-2 py-0.5 rounded-full">Dipilih</span>}
                                                    </div>
                                                    <div className="aspect-video w-full bg-slate-900 rounded mb-2 flex items-center justify-center text-white text-xs">
                                                        <div className="text-center">
                                                            <div className="text-xl font-bold mb-1">Fulan & Fulanah</div>
                                                            <div className="text-[10px] opacity-70">Background Foto Full</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Tampilan layar penuh dengan foto cover besar.</p>
                                                </div>
                                            </FormLabel>
                                        </FormItem>

                                        {/* 2. Template Classic */}
                                        <FormItem>
                                            <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5 cursor-pointer">
                                                <FormControl>
                                                    <RadioGroupItem value="classic" className="sr-only" />
                                                </FormControl>
                                                <div className="rounded-md border-2 border-muted p-4 hover:border-primary/50 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="font-semibold text-lg font-serif">Classic Elegant</div>
                                                        {field.value === 'classic' && <span className="text-primary text-xs font-bold border border-primary px-2 py-0.5 rounded-full">Dipilih</span>}
                                                    </div>
                                                    <div className="aspect-video w-full bg-[#fdfbf7] border rounded mb-2 flex items-center justify-center text-stone-800 text-xs">
                                                        <div className="text-center p-2 border border-stone-300 bg-white shadow-sm">
                                                            <div className="text-lg font-serif mb-1">Fulan & Fulanah</div>
                                                            <div className="text-[10px] text-stone-500">Undangan Formal</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Desain klasik, kertas bertekstur, dan layout rapi.</p>
                                                </div>
                                            </FormLabel>
                                        </FormItem>

                                        {/* 3. Template Rustic */}
                                        <FormItem>
                                            <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5 cursor-pointer">
                                                <FormControl>
                                                    <RadioGroupItem value="rustic" className="sr-only" />
                                                </FormControl>
                                                <div className="rounded-md border-2 border-muted p-4 hover:border-primary/50 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 font-semibold text-lg text-[#8D7B68]">
                                                            <Flower2 className="w-4 h-4"/> Rustic Nature
                                                        </div>
                                                        {field.value === 'rustic' && <span className="text-primary text-xs font-bold border border-primary px-2 py-0.5 rounded-full">Dipilih</span>}
                                                    </div>
                                                    <div className="aspect-video w-full bg-[#F3EFE4] border rounded mb-2 flex items-center justify-center text-[#5c4b3d] text-xs relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#A4907C] rounded-tl-lg m-2"></div>
                                                        <div className="text-center">
                                                            <div className="text-lg font-serif italic mb-1">Fulan & Fulanah</div>
                                                            <div className="text-[10px] opacity-70">Nuansa Bumi & Bunga</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Nuansa hangat, warna bumi, dan dekorasi floral.</p>
                                                </div>
                                            </FormLabel>
                                        </FormItem>

                                        {/* 4. Template Luxury */}
                                        <FormItem>
                                            <FormLabel className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5 cursor-pointer">
                                                <FormControl>
                                                    <RadioGroupItem value="luxury" className="sr-only" />
                                                </FormControl>
                                                <div className="rounded-md border-2 border-muted p-4 hover:border-primary/50 transition-all">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 font-semibold text-lg text-amber-600">
                                                            <Sparkles className="w-4 h-4"/> Luxury Gold
                                                        </div>
                                                        {field.value === 'luxury' && <span className="text-primary text-xs font-bold border border-primary px-2 py-0.5 rounded-full">Dipilih</span>}
                                                    </div>
                                                    <div className="aspect-video w-full bg-slate-950 border border-amber-500/30 rounded mb-2 flex items-center justify-center text-amber-400 text-xs">
                                                        <div className="text-center p-2 border-double border-2 border-amber-500/50">
                                                            <div className="text-lg font-serif mb-1">Fulan & Fulanah</div>
                                                            <div className="text-[10px] text-amber-200">Elegansi Emas</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">Background gelap, aksen emas, dan animasi mewah.</p>
                                                </div>
                                            </FormLabel>
                                        </FormItem>

                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
             </Card>

            {/* BAGIAN PENGATURAN UMUM */}
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Dasar</CardTitle>
                <CardDescription>Judul, tema warna, dan media utama.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                
                <FormField
                  control={form.control}
                  name="theme_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna Tema Utama</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <Input type="color" {...field} className="h-10 w-16 p-0 cursor-pointer" />
                        </FormControl>
                        <FormControl>
                          <Input {...field} placeholder="#RRGGBB" className="w-40" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto Cover Utama</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value} onChange={field.onChange} /> 
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB 2: DATA MEMPELAI === */}
          <TabsContent value="mempelai">
            <Card>
              <CardHeader>
                <CardTitle>Data Mempelai</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mempelai Pria</h3>
                  <FormField
                    control={form.control}
                    name="groom_bride.groom_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.groom_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio Singkat</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.groom_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto Pria</FormLabel>
                        <FormControl>
                          <ImageUpload value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mempelai Wanita</h3>
                  <FormField
                    control={form.control}
                    name="groom_bride.bride_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.bride_bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio Singkat</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groom_bride.bride_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto Wanita</FormLabel>
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

          {/* === TAB 3: FITUR === */}
          <TabsContent value="fitur">
            <Card>
              <CardHeader><CardTitle>Aktifkan Fitur</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                
                {[
                    { name: "show_events", label: "Acara (Akad/Resepsi)", desc: "Jadwal dan Lokasi" },
                    { name: "show_story", label: "Love Story", desc: "Cerita perjalanan cinta" },
                    { name: "show_gallery", label: "Galeri Foto", desc: "Dokumentasi prewedding" },
                    { name: "show_gifts", label: "Hadiah Digital", desc: "Rekening dan QRIS" },
                    { name: "show_guest_book", label: "Buku Tamu", desc: "Kolom ucapan doa" }
                ].map((item) => (
                    <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">{item.label}</FormLabel>
                            <FormDescription>{item.desc}</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                    />
                ))}

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}