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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // <-- IMPORT SONNER
import { ImageUpload } from "@/components/ImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Skema validasi Zod berdasarkan UpdateWeddingInput di backend
const formSchema = z.object({
  wedding_title: z.string().min(1, "Judul tidak boleh kosong"),
  cover_image_url: z.string().url().or(z.literal("")),
  music_url: z.string().url().or(z.literal("")),
  theme_color: z.string().startsWith("#", "Must be a hex color").or(z.literal("")),
  groom_bride: z.object({
    groom_name: z.string(),
    groom_photo_url: z.string().url().or(z.literal("")),
    groom_bio: z.string(),
    bride_name: z.string(),
    bride_photo_url: z.string().url().or(z.literal("")),
    bride_bio: z.string(),
  }),
});

// Fungsi fetcher untuk SWR
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function WeddingPage() {
  // Fetch data awal
  const { data: weddingData, error, mutate } = useSWR<Wedding>("/admin/wedding", fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wedding_title: "",
      cover_image_url: "",
      music_url: "",
      theme_color: "#000000",
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

  // Isi form dengan data dari SWR
  useEffect(() => {
    if (weddingData) {
      form.reset({
        wedding_title: weddingData.wedding_title || "",
        cover_image_url: weddingData.cover_image_url || "",
        music_url: weddingData.music_url || "",
        theme_color: weddingData.theme_color || "#000000",
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
      // Kirim data ke backend
      await api.put("/admin/wedding", values);
      mutate(); // Re-fetch data
      toast.success("Sukses", {
        description: "Data pernikahan berhasil diperbarui.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "Gagal memperbarui data.",
      });
    }
  };

  if (error) return <div>Failed to load data.</div>;
  if (!weddingData) return <div>Loading...</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pengaturan Wedding</h1>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>

        {/* Pengaturan Umum */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="wedding_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Pernikahan</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="theme_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warna Tema (Hex)</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="music_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Musik (MP3)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pengaturan Mempelai */}
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groom_bride.groom_bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio Pria (Nama orang tua, dll)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groom_bride.bride_bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio Wanita (Nama orang tua, dll)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
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
      </form>
    </Form>
  );
}