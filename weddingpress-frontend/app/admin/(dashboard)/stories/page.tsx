"use client";

import useSWR, { KeyedMutator } from "swr";
import { api } from "@/lib/api";
import { Story } from "@/types/models";
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, Calendar, ListOrdered } from "lucide-react";
import { StoryForm } from "./StoryForm";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton"; // <-- 1. IMPORT

// ... (Fetcher tetap sama) ...
const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Komponen Aksi
interface StoryActionsProps {
  story: Story;
  mutate: KeyedMutator<Story[]>;
  handleDelete: (id: number) => Promise<void>;
}

function StoryActions({ story, mutate, handleDelete }: StoryActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <StoryForm story={story} onSuccess={mutate}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </StoryForm>

        {/* === 2. PERBAIKAN DI SINI === */}
        <DeleteConfirmButton onConfirm={() => handleDelete(story.id)}>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DeleteConfirmButton>
        {/* ========================= */}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Komponen Halaman Utama
export default function StoriesPage() {
  const { data: stories, error, mutate } = useSWR<Story[]>(
    "/admin/stories",
    fetcher
  );

  // --- 3. UBAH FUNGSI HANDLEDELETE ---
  const handleDelete = async (id: number) => {
    // Hapus 'if (!confirm(...))'
    try {
      await api.delete(`/admin/story/${id}`);
      mutate();
      toast.success("Sukses", {
        description: "Cerita berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus cerita.",
      });
    }
  };
  // ----------------------------------

  if (error) return <div>Failed to load</div>;
  if (!stories) return <div>Loading stories...</div>;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Manajemen Cerita</CardTitle>
              <CardDescription className="mt-2">
                Atur *timeline* cerita cinta Anda yang akan tampil di undangan.
              </CardDescription>
            </div>
            <StoryForm onSuccess={mutate}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Cerita
              </Button>
            </StoryForm>
          </div>
        </CardHeader>
        
        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Urutan</TableHead>
                  <TableHead className="min-w-[200px]">Judul</TableHead>
                  <TableHead className="min-w-[150px]">Tanggal</TableHead>
                  <TableHead className="min-w-[250px]">Deskripsi</TableHead>
                  <TableHead className="w-16 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell>{story.order}</TableCell>
                    <TableCell className="font-medium">{story.title}</TableCell>
                    <TableCell>{format(new Date(story.date), "PPP", { locale: id })}</TableCell>
                    <TableCell>{story.description.substring(0, 50)}...</TableCell>
                    <TableCell className="text-right">
                      <StoryActions story={story} mutate={mutate} handleDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Tampilan Mobile (Card List) */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {stories.map((story) => (
            <Card key={story.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-medium">{story.title}</CardTitle>
                <StoryActions story={story} mutate={mutate} handleDelete={handleDelete} />
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ListOrdered className="mr-2 h-4 w-4" />
                  <span>Urutan: {story.order}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{format(new Date(story.date), "dd MMM yyyy", { locale: id })}</span>
                </div>
                <p className="pt-2 text-sm text-foreground">{story.description}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}