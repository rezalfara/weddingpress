"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR from "swr";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// --- Skema Validasi Form ---
// Sesuai dengan GuestBookInput
const guestbookFormSchema = z.object({
  message: z.string().min(5, { message: "Pesan minimal 5 karakter." }).max(500, "Pesan maksimal 500 karakter."),
});

// --- Tipe Data untuk List ---
// Sesuai dengan respons GetGuestBook
interface GuestBookResponse {
  guest_name: string;
  message: string;
  created_at: string;
}

// --- Fungsi Fetcher untuk SWR ---
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// --- Komponen Form (Sub-komponen) ---
interface GuestbookFormProps {
  guestId: number;
  onSuccess: () => void; // Untuk me-refresh list
}

function GuestbookForm({ guestId, onSuccess }: GuestbookFormProps) {
  const form = useForm<z.infer<typeof guestbookFormSchema>>({
    resolver: zodResolver(guestbookFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof guestbookFormSchema>) => {
    try {
      // Kirim ucapan ke backend
      await api.post(`/guestbook/${guestId}`, values);
      toast.success("Ucapan Berhasil Dikirim", {
        description: "Terima kasih! Ucapan Anda akan tampil setelah disetujui.", // Sesuai respons backend
      });
      form.reset(); // Kosongkan form
      onSuccess(); // Panggil mutate() dari parent
    } catch (error) {
      toast.error("Gagal Mengirim Ucapan", {
        description: "Terjadi kesalahan, silakan coba lagi.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tulis Ucapan Anda</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis ucapan selamat dan doa restu Anda di sini..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full text-white" 
          style={{ backgroundColor: "var(--theme-color)" }}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Mengirim..." : "Kirim Ucapan"}
        </Button>
      </form>
    </Form>
  );
}

// --- Komponen List (Sub-komponen) ---
interface GuestbookListProps {
  weddingId: number;
}

function GuestbookList({ weddingId }: GuestbookListProps) {
  // Ambil data ucapan yang sudah 'approved'
  const { data: messages, error } = useSWR<GuestBookResponse[]>(
    `/guestbook/${weddingId}`,
    fetcher,
    { refreshInterval: 60000 } // Refresh tiap 1 menit
  );

  if (error) return <div className="text-center text-red-500">Gagal memuat ucapan.</div>;
  if (!messages) return <div className="text-center">Memuat ucapan...</div>;
  if (messages.length === 0) return <div className="text-center text-gray-500">Belum ada ucapan.</div>;

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {messages.map((msg, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-md border">
          <p className="font-semibold" style={{ color: "var(--theme-color)" }}>{msg.guest_name}</p>
          <p className="text-gray-700 mt-1">{msg.message}</p>
          <p className="text-xs text-gray-400 mt-2">
            {format(new Date(msg.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
          </p>
        </div>
      ))}
    </div>
  );
}


// --- Komponen Utama (Gabungan) ---
interface GuestbookProps {
  guestId: number;
  weddingId: number;
}

export function Guestbook({ guestId, weddingId }: GuestbookProps) {
  // Kita perlukan SWR di sini agar bisa di-pass ke Form
  const { mutate } = useSWR(`/guestbook/${weddingId}`);

  return (
    <section className="bg-white p-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold" style={{ color: "var(--theme-color)" }}>
            Buku Tamu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Bagian Form */}
          <GuestbookForm guestId={guestId} onSuccess={() => mutate()} />
          
          <div className="border-t pt-8">
            {/* Bagian List */}
            <GuestbookList weddingId={weddingId} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}