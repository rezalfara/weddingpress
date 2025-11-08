"use client";

import useSWR from "swr";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { StoryForm } from "./StoryForm";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// Fungsi fetcher untuk SWR
const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function StoriesPage() {
  const { data: stories, error, mutate } = useSWR<Story[]>(
    "/admin/stories", //
    fetcher
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus cerita ini?")) return;
    try {
      await api.delete(`/admin/story/${id}`); //
      mutate(); // Re-fetch
      toast.success("Sukses", {
        description: "Cerita berhasil dihapus.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus cerita.",
      });
    }
  };

  if (error) return <div>Failed to load</div>;
  if (!stories) return <div>Loading stories...</div>;
  
  // Backend sudah mengurutkan berdasarkan 'order'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Cerita</h1>
        <StoryForm onSuccess={mutate}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Cerita
          </Button>
        </StoryForm>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Urutan</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>{story.order}</TableCell>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{format(new Date(story.date), "PPP")}</TableCell>
                  <TableCell>{story.description.substring(0, 50)}...</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <StoryForm story={story} onSuccess={mutate}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Edit
                          </DropdownMenuItem>
                        </StoryForm>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(story.id)}
                        >
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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