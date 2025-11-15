'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api"; // Asumsi Anda punya API client
import { GiftAccount } from "@/types/models"; // Import tipe

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react"; // Icon hapus

// Skema validasi form
const formSchema = z.object({
  bank_name: z.string().min(2, { message: "Nama Bank/E-Wallet wajib diisi." }),
  account_number: z.string().min(3, { message: "Nomor rekening wajib diisi." }),
  account_name: z.string().min(2, { message: "Nama pemilik wajib diisi." }),
  // qr_code_url: z.string().optional(), // Akan kita tangani terpisah
});

export default function GiftsPage() {
  const [accounts, setAccounts] = useState<GiftAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); // State untuk file QRIS
  const [isUploading, setIsUploading] = useState(false);
  
  const { token } = useAuthStore();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bank_name: "",
      account_number: "",
      account_name: "",
    },
  });

  // Fungsi untuk mengambil data
  const fetchAccounts = async () => {
    try {
      const response = await api.get<GiftAccount[]>("/admin/gift-accounts");
      setAccounts(response.data);
    } catch (err) {
      setError("Gagal mengambil data rekening.");
    } finally {
      setLoading(false);
    }
  };

  // Ambil data saat komponen dimuat
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fungsi upload file (menggunakan /admin/upload Anda)
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file); // 'file' harus cocok dengan handler Go Anda

    const response = await api.post<{ url: string }>("/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  };

  // Fungsi submit form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    let qrCodeUrl = "";

    try {
      // 1. Jika ada file, upload dulu
      if (file) {
        qrCodeUrl = await uploadFile(file);
      }

      // 2. Kirim data ke backend
      const response = await api.post<GiftAccount>("/admin/gift-account", {
        ...values,
        qr_code_url: qrCodeUrl,
      });

      // 3. Update state
      setAccounts([...accounts, response.data]);
      form.reset();
      setFile(null); // Reset file input
      setError(null);
    } catch (err) {
      setError("Gagal menyimpan rekening. Coba lagi.");
    } finally {
      setIsUploading(false);
    }
  }

  // Fungsi hapus rekening
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekening ini?")) return;
    
    try {
      await api.delete(`/admin/gift-account/${id}`);
      setAccounts(accounts.filter((acc) => acc.id !== id));
    } catch (err) {
      setError("Gagal menghapus rekening.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Manajemen Hadiah
      </h1>

      {/* Form Tambah Rekening */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tambah Rekening / E-Wallet</CardTitle>
          <CardDescription>
            Masukkan detail bank atau e-wallet untuk amplop digital.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* ... (FormField untuk bank_name, account_number, account_name) ... */}
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Bank / E-Wallet (Contoh: BCA, GoPay)</FormLabel>
                    <FormControl>
                      <Input placeholder="BCA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Rekening / HP</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atas Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Budi Santoso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Input File untuk QRIS */}
              <FormItem>
                <FormLabel>Upload QRIS (Opsional)</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
              
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
              
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Menyimpan..." : "Simpan Rekening"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Daftar Rekening yang Sudah Ada */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekening</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-semibold">{acc.bank_name} - {acc.account_number}</p>
                    <p className="text-sm text-gray-600">a.n. {acc.account_name}</p>
                    {acc.qr_code_url && (
                      <a href={acc.qr_code_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500">
                        Lihat QRIS
                      </a>
                    )}
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(acc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {accounts.length === 0 && !loading && (
                <p>Belum ada rekening yang ditambahkan.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}