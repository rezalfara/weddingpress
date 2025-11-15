"use client";

import { useState, useEffect } from "react";
import useSWR, { KeyedMutator } from "swr";
import { api } from "@/lib/api";
import { Guest } from "@/types/models";
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
import { 
  MoreHorizontal, 
  PlusCircle, 
  Copy, 
  Check, 
  User as UserIcon, 
  Edit, 
  Trash2,
  Upload,
  Loader2,
  Search
} from "lucide-react";
import { GuestForm } from "./GuestForm";
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
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { GuestImport } from "@/components/admin/GuestImport";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/lib/hooks/useDebounce";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// --- Komponen CopyButton (Tidak Berubah) ---
function CopyButton({ slug }: { slug: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  const copyToClipboard = () => {
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    toast.success("Link undangan berhasil disalin!");
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copyToClipboard}>
      {hasCopied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      Copy Link
    </Button>
  );
}

// --- Komponen Aksi (Dropdown) (Tidak Berubah) ---
interface DropdownActionsProps {
  guest: Guest;
  mutate: KeyedMutator<Guest[]>;
  handleDelete: (id: number) => Promise<void>;
}

function DropdownActions({ guest, mutate, handleDelete }: DropdownActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <GuestForm guest={guest} onSuccess={mutate}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        </GuestForm>
        <DeleteConfirmButton onConfirm={() => handleDelete(guest.id)}>
          <DropdownMenuItem
            className="text-red-600"
            onSelect={(e) => e.preventDefault()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DeleteConfirmButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


// --- Komponen Halaman Utama ---
export default function GuestsPage() {
  // --- State dan Logika (Tidak Berubah) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: groups, isLoading: isLoadingGroups } = useSWR<string[]>(
    "/admin/guests/groups",
    fetcher
  );

  const params = new URLSearchParams();
  if (debouncedSearchTerm) {
    params.append('search', debouncedSearchTerm);
  }
  if (selectedGroup && selectedGroup !== 'all') {
    params.append('group', selectedGroup);
  }
  const queryString = params.toString();
  const guestsSWRKey = `/admin/guests?${queryString}`;

  const { data: guests, error, mutate, isLoading } = useSWR<Guest[]>(
    guestsSWRKey,
    fetcher
  );

  const [selectedGuestIds, setSelectedGuestIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedGuestIds([]);
  }, [debouncedSearchTerm, selectedGroup]);
  
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/guest/${id}`);
      mutate(); 
      toast.success("Sukses", { description: "Tamu berhasil dihapus." });
    } catch (error) {
      toast.error("Error", { description: "Gagal menghapus tamu." });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await api.delete("/admin/guest/bulk", { data: { ids: selectedGuestIds } });
      mutate(); 
      setSelectedGuestIds([]); 
      toast.success("Sukses", { description: `${selectedGuestIds.length} tamu berhasil dihapus.` });
    } catch (error) {
      toast.error("Error", { description: "Gagal menghapus tamu." });
    }
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedGuestIds(guests?.map((g) => g.id) || []);
    } else {
      setSelectedGuestIds([]);
    }
  };

  const handleSelectRow = (guestId: number, checked: boolean) => {
    if (checked) {
      setSelectedGuestIds((prev) => [...prev, guestId]);
    } else {
      setSelectedGuestIds((prev) => prev.filter((id) => id !== guestId));
    }
  };
  
  // --- Akhir State dan Logika ---

  if (error) return <div>Failed to load</div>;

  const isAllSelected = (guests?.length ?? 0) > 0 && selectedGuestIds.length === guests?.length;
  const isIndeterminate = selectedGuestIds.length > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      <Card>
        {/* Header (Tidak Berubah) */}
        {selectedGuestIds.length > 0 ? (
          <CardHeader className="bg-muted p-4">
            <div className="flex flex-row justify-between items-center gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedGuestIds.length} tamu terpilih
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedGuestIds([])} className="bg-background">
                  Batalkan
                </Button>
                <DeleteConfirmButton onConfirm={handleBulkDelete}>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Terpilih
                  </Button>
                </DeleteConfirmButton>
              </div>
            </div>
          </CardHeader>
        ) : (
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Manajemen Tamu</CardTitle>
                <CardDescription className="mt-2">
                  {isLoading ? "Memuat tamu..." : 
                  `Menampilkan ${guests?.length || 0} tamu.`}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <GuestImport onImportSuccess={mutate}>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Impor Tamu
                  </Button>
                </GuestImport>
                <GuestForm onSuccess={mutate}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Tamu
                  </Button>
                </GuestForm>
              </div>
            </div>
          </CardHeader>
        )}

        {/* Area Filter (Tidak Berubah) */}
        <CardContent className="border-t pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari nama tamu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full md:w-auto md:min-w-[200px]">
              <Select
                value={selectedGroup}
                onValueChange={(value) => setSelectedGroup(value)}
                disabled={isLoadingGroups}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter berdasarkan grup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Grup</SelectItem>
                  {(groups || []).map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>

        {/* Tampilan Desktop (Table) */}
        <CardContent className="hidden md:block p-0">
          <div className="overflow-x-auto">
            <Table>
              {/* --- 1. MODIFIKASI DI SINI --- */}
              <TableHeader>
                {/* Tambahkan bg-muted untuk latar belakang abu-abu muda */}
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="w-[50px] pl-6">
                    <Checkbox
                      checked={
                        isAllSelected ? true : isIndeterminate ? "indeterminate" : false
                      }
                      onCheckedChange={handleSelectAll}
                      disabled={isLoading || !guests || guests.length === 0}
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Nama Tamu</TableHead>
                  <TableHead className="min-w-[150px]">Grup</TableHead>
                  <TableHead className="min-w-[100px]">RSVP</TableHead>
                  <TableHead className="min-w-[150px]">Link Undangan</TableHead>
                  {selectedGuestIds.length === 0 && (
                    <TableHead className="w-16 text-right pr-6">Aksi</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              {/* --- AKHIR MODIFIKASI --- */}
              <TableBody>
                {/* (Logika body tabel tidak berubah) */}
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : (guests?.length || 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada tamu ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  guests!.map((guest) => (
                    <TableRow 
                      key={guest.id} 
                      data-state={selectedGuestIds.includes(guest.id) ? "selected" : ""}
                    >
                      <TableCell className="pl-6">
                        <Checkbox
                          checked={selectedGuestIds.includes(guest.id)}
                          onCheckedChange={(checked) => handleSelectRow(guest.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>{guest.group}</TableCell>
                      <TableCell>
                        {guest.is_rsvp ? (
                          <Badge variant="default">
                            Hadir ({guest.total_attendance})
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Belum</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <CopyButton slug={guest.slug} />
                      </TableCell>
                      {selectedGuestIds.length === 0 && (
                        <TableCell className="text-right pr-6">
                          <DropdownActions guest={guest} mutate={mutate} handleDelete={handleDelete} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Tampilan Mobile (Card List) */}
        <CardContent className="p-4 space-y-4 block md:hidden">
          {/* (Logika tampilan mobile tidak berubah) */}
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (guests?.length || 0) === 0 ? (
            <p className="text-center text-muted-foreground">Tidak ada tamu ditemukan.</p>
          ) : (
            guests!.map((guest) => (
              <Card 
                key={guest.id} 
                className={`shadow-md ${selectedGuestIds.includes(guest.id) ? 'border-primary ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                        checked={selectedGuestIds.includes(guest.id)}
                        onCheckedChange={(checked) => handleSelectRow(guest.id, !!checked)}
                    />
                    <CardTitle className="text-lg font-medium">{guest.name}</CardTitle>
                  </div>
                  {selectedGuestIds.length === 0 && (
                    <DropdownActions guest={guest} mutate={mutate} handleDelete={handleDelete} />
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {guest.group && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>{guest.group}</span>
                    </div>
                  )}
                  <div>
                    {guest.is_rsvp ? (
                      <Badge variant="default">
                        Hadir ({guest.total_attendance})
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Belum RSVP</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <CopyButton slug={guest.slug} />
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}