'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api"; 
import { GiftAccount } from "@/types/models"; 
import { toast } from "sonner"; // Import toast

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
import { Trash2, Edit as EditIcon, PlusCircle, Loader2, Check } from "lucide-react"; // Import Check & EditIcon
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton"; // Asumsi ada komponen ini
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog"; // Import Dialog components
import { ImageUpload } from "@/components/ImageUpload"; // Asumsi komponen ImageUpload tersedia

// --- Skema Validasi Diperbarui ---
const formSchema = z.object({
  id: z.number().optional(), // Tambahkan ID untuk mode Edit
  bank_name: z.string().min(2, { message: "Nama Bank/E-Wallet wajib diisi." }),
  account_number: z.string().min(3, { message: "Nomor rekening wajib diisi." }),
  account_name: z.string().min(2, { message: "Nama pemilik wajib diisi." }),
  qr_code_url: z.string().optional().nullable(), // QRIS URL kini dikelola form
});

type GiftAccountFormData = z.infer<typeof formSchema>;

interface GiftAccountDialogProps {
  initialData?: GiftAccount; // Data untuk mode Edit
  onSuccess: () => void; // Fungsi refresh data
  children: React.ReactNode; // Trigger button
}

// --- Komponen Dialog Form (Reusable untuk Create/Edit) ---
function GiftAccountDialog({ initialData, onSuccess, children }: GiftAccountDialogProps) {
  const isEdit = !!initialData;
  const [open, setOpen] = useState(false);
  
  const form = useForm<GiftAccountFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id,
      bank_name: initialData?.bank_name || "",
      account_number: initialData?.account_number || "",
      account_name: initialData?.account_name || "",
      qr_code_url: initialData?.qr_code_url || "",
    },
  });

  const onSubmit = async (values: GiftAccountFormData) => {
    try {
      if (isEdit) {
        // Mode EDIT (PUT)
        await api.put(`/admin/gift-account/${values.id}`, values);
        toast.success("Sukses", { description: "Rekening berhasil diperbarui." });
      } else {
        // Mode CREATE (POST)
        await api.post("/admin/gift-account", values);
        toast.success("Sukses", { description: "Rekening baru berhasil ditambahkan." });
      }
      form.reset();
      setOpen(false);
      onSuccess(); // Panggil fetchAccounts untuk refresh
    } catch (err: any) {
      toast.error("Gagal", { description: err.response?.data?.error || "Gagal menyimpan rekening." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Rekening Hadiah" : "Tambah Rekening Baru"}</DialogTitle>
          <CardDescription>
            {isEdit ? "Perbarui detail bank atau e-wallet." : "Masukkan detail bank atau e-wallet baru."}
          </CardDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (<FormItem><FormLabel>Nama Bank / E-Wallet</FormLabel><FormControl><Input placeholder="BCA / GoPay" {...field} /></FormControl><FormMessage /></FormItem>)}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (<FormItem><FormLabel>Nomor Rekening / HP</FormLabel><FormControl><Input placeholder="1234567890" {...field} /></FormControl><FormMessage /></FormItem>)}
            />
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (<FormItem><FormLabel>Atas Nama</FormLabel><FormControl><Input placeholder="Budi Santoso" {...field} /></FormControl><FormMessage /></FormItem>)}
            />
            <FormField
              control={form.control}
              name="qr_code_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto QRIS (Opsional)</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} /> 
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
// --- AKHIR Komponen Dialog Form ---


// --- Komponen Halaman Utama GiftsPage ---
export default function GiftsPage() {
  const [accounts, setAccounts] = useState<GiftAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hapus state file dan isUploading karena sudah ditangani ImageUpload

  // Fungsi untuk mengambil data (Sekarang digunakan sebagai onSuccess handler)
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fungsi hapus rekening (Tidak Berubah)
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekening ini?")) return;
    
    try {
      await api.delete(`/admin/gift-account/${id}`);
      setAccounts(accounts.filter((acc) => acc.id !== id));
      toast.success("Sukses", { description: "Rekening berhasil dihapus." });
    } catch (err) {
      toast.error("Gagal menghapus rekening.");
    }
  };

  // Hapus fungsi uploadFile dan onSubmit lama

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Hadiah</h1>
        
        {/* Tombol Trigger untuk Modal Create */}
        <GiftAccountDialog onSuccess={fetchAccounts}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Rekening
            </Button>
        </GiftAccountDialog>
      </div>

      
      {/* Daftar Rekening yang Sudah Ada */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekening</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-semibold">{acc.bank_name} - {acc.account_number}</p>
                  <p className="text-sm text-gray-600">a.n. {acc.account_name}</p>
                  {acc.qr_code_url && (
                    <a href={acc.qr_code_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-500 flex items-center mt-1">
                      <Check className="h-4 w-4 mr-1" /> QRIS Tersedia
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  
                  {/* --- TOMBOL EDIT BARU --- */}
                  <GiftAccountDialog initialData={acc} onSuccess={fetchAccounts}>
                      <Button variant="outline" size="icon">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                  </GiftAccountDialog>
                  
                  {/* Tombol Hapus */}
                  <DeleteConfirmButton onConfirm={() => handleDelete(acc.id)}>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </DeleteConfirmButton>
                </div>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-center text-muted-foreground">Belum ada rekening yang ditambahkan.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}