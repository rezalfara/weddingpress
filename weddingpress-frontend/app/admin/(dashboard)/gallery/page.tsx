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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { GalleryForm } from "./GalleryForm";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Fungsi fetcher untuk SWR
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function GalleryPage() {
  const { data: gallery, error, mutate } = useSWR<Gallery[]>(
    "/admin/gallery", //
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item galeri ini?")) return;
    try {
      await api.delete(`/admin/gallery/${id}`); //
      mutate(); // Re-fetch
      toast.success("Sukses", {
        description: "Item galeri berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus item galeri.",
      });
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!gallery) return <div>Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Galeri</h1>
        <GalleryForm onSuccess={mutate}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Galeri
          </Button>
        </GalleryForm>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Preview</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Tipe</TableHead>
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
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}