"use client";

import useSWR from "swr";
import Image from "next/image";
import { api } from "@/lib/api";
import { Gallery } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { GalleryForm } from "./GalleryForm";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton"; // <-- 1. IMPORT

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function GalleryPage() {
  const { data: gallery, error, mutate } = useSWR<Gallery[]>(
    "/admin/gallery",
    fetcher
  );

  // --- 2. UBAH FUNGSI HANDLEDELETE ---
  const handleDelete = async (id: number) => {
    // Hapus 'if (!confirm(...))'
    try {
      await api.delete(`/admin/gallery/${id}`);
      mutate();
      toast.success("Sukses", {
        description: "Item galeri berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus item galeri.",
      });
    }
  };
  // ----------------------------------

  if (error) return <div>Failed to load</div>;
  if (!gallery) return <div>Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Manajemen Galeri</CardTitle>
              <CardDescription className="mt-2">
                Upload foto dan video untuk ditampilkan di galeri undangan Anda.
              </CardDescription>
            </div>
            <GalleryForm onSuccess={mutate}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Galeri
              </Button>
            </GalleryForm>
          </div>
        </CardHeader>

        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Preview</TableHead>
                  <TableHead className="min-w-[250px]">Caption</TableHead>
                  <TableHead className="min-w-[100px]">Tipe</TableHead>
                  <TableHead className="w-16 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gallery.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Image
                        src={item.file_url}
                        alt={item.caption || "Gallery item"}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell>{item.caption}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.file_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* === 3. PERBAIKAN DI SINI === */}
                      <DeleteConfirmButton onConfirm={() => handleDelete(item.id)}>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteConfirmButton>
                      {/* ========================= */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Tampilan Mobile (Grid Kartu) */}
        <CardContent className="p-4 block md:hidden">
          <div className="grid grid-cols-2 gap-4">
            {gallery.map((item) => (
              <Card key={item.id} className="shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    src={item.file_url}
                    alt={item.caption || "Gallery item"}
                    width={200}
                    height={200}
                    className="object-cover w-full h-32"
                  />
                </CardContent>
                <CardFooter className="p-3 flex flex-col items-start space-y-2">
                  <Badge variant="secondary" className="mb-1">{item.file_type}</Badge>
                  <p className="text-xs text-muted-foreground truncate w-full">
                    {item.caption || "(Tanpa caption)"}
                  </p>
                  {/* === 3. PERBAIKAN DI SINI === */}
                  <DeleteConfirmButton onConfirm={() => handleDelete(item.id)}>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </Button>
                  </DeleteConfirmButton>
                  {/* ========================= */}
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>

      </Card>
    </div>
  );
}